from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import auth
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/admin", tags=["Admin"])

# ----------- DEPARTMENT SCHEMAS -----------
class DepartmentCreate(BaseModel):
    name: str
    code: str

# ----------- TEACHER SCHEMAS -----------
class TeacherCreate(BaseModel):
    name: str
    email: str
    password: str
    department_id: int
    specialization: Optional[str] = None
    max_hours_per_week: Optional[int] = 20

# ----------- ROOM SCHEMAS -----------
class RoomCreate(BaseModel):
    name: str
    capacity: Optional[int] = 60
    room_type: Optional[str] = "classroom"

# ----------- SUBJECT SCHEMAS -----------
class SubjectCreate(BaseModel):
    name: str
    code: str
    credits: Optional[int] = 3
    subject_type: Optional[str] = "theory"
    hours_per_week: Optional[int] = 3
    department_id: int
    semester: Optional[int] = 1
    teacher_id: Optional[int] = None

# ----------- STUDENT SCHEMAS -----------
class StudentCreate(BaseModel):
    name: str
    email: str
    password: str
    roll_number: str
    department_id: int
    semester: Optional[int] = 1


# =================== DEPARTMENTS ===================
@router.post("/departments")
def create_department(data: DepartmentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.require_admin)):
    existing = db.query(models.Department).filter(models.Department.code == data.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department code already exists")
    dept = models.Department(name=data.name, code=data.code)
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept

@router.get("/departments")
def get_departments(db: Session = Depends(get_db)):
    return db.query(models.Department).all()

@router.delete("/departments/{dept_id}")
def delete_department(dept_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.require_admin)):
    dept = db.query(models.Department).filter(models.Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    db.delete(dept)
    db.commit()
    return {"message": "Department deleted"}


# =================== TEACHERS ===================
@router.post("/teachers")
def create_teacher(data: TeacherCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.require_admin)):
    # Check if email already used
    existing_user = db.query(models.User).filter(models.User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create teacher record
    teacher = models.Teacher(
        name=data.name,
        email=data.email,
        department_id=data.department_id,
        specialization=data.specialization,
        max_hours_per_week=data.max_hours_per_week
    )
    db.add(teacher)
    db.commit()
    db.refresh(teacher)

    # Create login account for teacher
    user = models.User(
        name=data.name,
        email=data.email,
        hashed_password=auth.hash_password(data.password),
        role="teacher"
    )
    db.add(user)
    db.commit()

    return teacher

@router.get("/teachers")
def get_teachers(db: Session = Depends(get_db)):
    return db.query(models.Teacher).all()

@router.delete("/teachers/{teacher_id}")
def delete_teacher(teacher_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.require_admin)):
    teacher = db.query(models.Teacher).filter(models.Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    # Also delete the user account
    user = db.query(models.User).filter(models.User.email == teacher.email).first()
    if user:
        db.delete(user)
    db.delete(teacher)
    db.commit()
    return {"message": "Teacher deleted"}


# =================== ROOMS ===================
@router.post("/rooms")
def create_room(data: RoomCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.require_admin)):
    room = models.Room(**data.dict())
    db.add(room)
    db.commit()
    db.refresh(room)
    return room

@router.get("/rooms")
def get_rooms(db: Session = Depends(get_db)):
    return db.query(models.Room).all()

@router.delete("/rooms/{room_id}")
def delete_room(room_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.require_admin)):
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    db.delete(room)
    db.commit()
    return {"message": "Room deleted"}


# =================== SUBJECTS ===================
@router.post("/subjects")
def create_subject(data: SubjectCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.require_admin)):
    subject = models.Subject(**data.dict())
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return subject

@router.get("/subjects")
def get_subjects(db: Session = Depends(get_db)):
    return db.query(models.Subject).all()

@router.delete("/subjects/{subject_id}")
def delete_subject(subject_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.require_admin)):
    subject = db.query(models.Subject).filter(models.Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    db.delete(subject)
    db.commit()
    return {"message": "Subject deleted"}


# =================== STUDENTS ===================
@router.post("/students")
def create_student(data: StudentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.require_admin)):
    existing_user = db.query(models.User).filter(models.User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    student = models.Student(
        name=data.name,
        email=data.email,
        roll_number=data.roll_number,
        department_id=data.department_id,
        semester=data.semester
    )
    db.add(student)
    db.commit()
    db.refresh(student)

    # Create login account for student
    user = models.User(
        name=data.name,
        email=data.email,
        hashed_password=auth.hash_password(data.password),
        role="student"
    )
    db.add(user)
    db.commit()

    return student

@router.get("/students")
def get_students(db: Session = Depends(get_db)):
    return db.query(models.Student).all()

@router.delete("/students/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.require_admin)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    # Also delete the user account
    user = db.query(models.User).filter(models.User.email == student.email).first()
    if user:
        db.delete(user)
    db.delete(student)
    db.commit()
    return {"message": "Student deleted"}