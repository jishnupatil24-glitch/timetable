from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import auth
import json
import os
from datetime import datetime
from timetable_generator import generate_multiple_timetables
import google.generativeai as genai
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

router = APIRouter(prefix="/timetable", tags=["Timetable"])


class GenerateRequest(BaseModel):
    department_id: int
    semester: int


def format_timetable_for_gemini(timetable_data: dict) -> str:
    """Format timetable into readable text for Gemini"""
    text = ""
    for version_data in timetable_data:
        text += f"\n=== Timetable Version {version_data['version']} ===\n"
        text += f"NEP Score: {version_data['nep_score']}/100\n"
        text += f"NEP Compliant: {version_data['nep_compliant']}\n"
        text += f"Total Credits: {version_data['total_credits']}\n"
        if version_data['issues']:
            text += f"Issues: {', '.join(version_data['issues'])}\n"
        text += "\n"
        for day, slots in version_data['timetable'].items():
            text += f"{day}:\n"
            for slot, entry in slots.items():
                if entry.get("subject_type") == "break":
                    text += f"  {slot}: LUNCH BREAK\n"
                else:
                    text += f"  {slot}: {entry.get('subject','?')} ({entry.get('subject_type','?')}) | Teacher: {entry.get('teacher','?')} | Room: {entry.get('room','?')}\n"
        text += "\n"
    return text


@router.post("/generate")
def generate_timetable(
    request: GenerateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_admin)
):
    # Fetch subjects for this department and semester
    subjects_db = db.query(models.Subject).filter(
        models.Subject.department_id == request.department_id,
        models.Subject.semester == request.semester
    ).all()

    if not subjects_db:
        raise HTTPException(status_code=400, detail="No subjects found for this department and semester")

    # Fetch teachers
    teachers_db = db.query(models.Teacher).filter(
        models.Teacher.department_id == request.department_id
    ).all()

    if not teachers_db:
        raise HTTPException(status_code=400, detail="No teachers found for this department")

    # Fetch rooms
    rooms_db = db.query(models.Room).all()
    if not rooms_db:
        raise HTTPException(status_code=400, detail="No rooms found")

    # Convert to dicts
    subjects = [
        {
            "id": s.id,
            "name": s.name,
            "code": s.code,
            "credits": s.credits,
            "subject_type": s.subject_type,
            "hours_per_week": s.hours_per_week,
            "teacher_id": s.teacher_id
        }
        for s in subjects_db
    ]

    teachers = [
        {
            "id": t.id,
            "name": t.name,
            "email": t.email,
            "max_hours_per_week": t.max_hours_per_week
        }
        for t in teachers_db
    ]

    rooms = [
        {
            "id": r.id,
            "name": r.name,
            "capacity": r.capacity,
            "room_type": r.room_type
        }
        for r in rooms_db
    ]

    # Generate 5 timetables
    timetables = generate_multiple_timetables(subjects, teachers, rooms, count=5)

    # Send to Gemini for best selection
    ai_explanation = "AI analysis unavailable"
    best_timetable = timetables[0]  # default to highest NEP score

    try:
        formatted = format_timetable_for_gemini(timetables)
        prompt = f"""
You are an expert academic scheduler following NEP 2020 (National Education Policy 2020) guidelines.

Here are 5 generated college timetables:

{formatted}

Please analyze all 5 timetables and:
1. Select the BEST timetable (by version number)
2. Explain WHY it is the best based on:
   - NEP 2020 compliance (credit distribution, no overload)
   - Teacher workload balance
   - No consecutive theory overload
   - Proper lunch breaks
   - Lab sessions are continuous
   - Subject distribution across the week

Respond in this exact format:
BEST_VERSION: [version number]
REASON: [your detailed explanation]
"""
        model = genai.GenerativeModel("gemini-flash-latest")
        response = model.generate_content(prompt)
        ai_text = response.text

        # Parse Gemini response
        best_version = 1
        for line in ai_text.split("\n"):
            if line.startswith("BEST_VERSION:"):
                try:
                    best_version = int(line.split(":")[1].strip())
                except:
                    best_version = 1

        best_timetable = next(
            (t for t in timetables if t["version"] == best_version),
            timetables[0]
        )
        ai_explanation = ai_text

    except Exception as e:
        ai_explanation = f"Gemini API error: {str(e)}. Using highest NEP score timetable."

    # Save best timetable to database
    # Deactivate previous timetables for same dept/semester
    db.query(models.Timetable).filter(
        models.Timetable.department_id == request.department_id,
        models.Timetable.semester == request.semester
    ).update({"is_active": False})

    new_timetable = models.Timetable(
        department_id=request.department_id,
        semester=request.semester,
        schedule_json=json.dumps(best_timetable["timetable"]),
        ai_explanation=ai_explanation,
        is_active=True,
        created_at=datetime.now().isoformat()
    )
    db.add(new_timetable)
    db.commit()
    db.refresh(new_timetable)

    return {
        "message": "Timetable generated successfully",
        "timetable_id": new_timetable.id,
        "best_version": best_timetable["version"],
        "nep_score": best_timetable["nep_score"],
        "nep_compliant": best_timetable["nep_compliant"],
        "timetable": best_timetable["timetable"],
        "all_versions": timetables,
        "ai_explanation": ai_explanation
    }


@router.get("/department/{department_id}/semester/{semester}")
def get_timetable(
    department_id: int,
    semester: int,
    db: Session = Depends(get_db)
):
    timetable = db.query(models.Timetable).filter(
        models.Timetable.department_id == department_id,
        models.Timetable.semester == semester,
        models.Timetable.is_active == True
    ).first()

    if not timetable:
        raise HTTPException(status_code=404, detail="No active timetable found")

    return {
        "id": timetable.id,
        "department_id": timetable.department_id,
        "semester": timetable.semester,
        "timetable": json.loads(timetable.schedule_json),
        "ai_explanation": timetable.ai_explanation,
        "created_at": timetable.created_at
    }


@router.get("/teacher/{teacher_id}")
def get_teacher_timetable(
    teacher_id: int,
    db: Session = Depends(get_db)
):
    active_timetables = db.query(models.Timetable).filter(
        models.Timetable.is_active == True
    ).all()
    
    # We will consolidate their daily schedule across all departments/semesters
    my_schedule = {day: {} for day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]}
    has_classes = False

    for tt in active_timetables:
        schedule = json.loads(tt.schedule_json)
        for day, slots in schedule.items():
            for slot, entry in slots.items():
                if entry.get("subject_type") != "break" and entry.get("teacher_id") == teacher_id:
                    entry_copy = entry.copy()
                    entry_copy["department_id"] = tt.department_id
                    entry_copy["semester"] = tt.semester
                    my_schedule[day][slot] = entry_copy
                    has_classes = True

    if not has_classes:
        raise HTTPException(status_code=404, detail="No active classes scheduled for this teacher yet.")

    return {
        "teacher_id": teacher_id,
        "timetable": my_schedule
    }



@router.get("/all")
def get_all_timetables(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    timetables = db.query(models.Timetable).filter(
        models.Timetable.is_active == True
    ).all()

    return [
        {
            "id": t.id,
            "department_id": t.department_id,
            "semester": t.semester,
            "timetable": json.loads(t.schedule_json),
            "ai_explanation": t.ai_explanation,
            "created_at": t.created_at
        }
        for t in timetables
    ]