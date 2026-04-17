import random
from typing import List, Dict, Any

# NEP 2020: 5-day week, proper time slots with lunch break
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

TIME_SLOTS = [
    "9:00-10:00",
    "10:00-11:00",
    "11:00-12:00",
    "12:00-1:00",   # Lunch Break - will be skipped
    "1:00-2:00",
    "2:00-3:00",
    "3:00-4:00"
]

LUNCH_SLOT = "12:00-1:00"

# NEP 2020 Credit System
# 1 Credit = 1 hour theory per week
# 1 Credit = 2 hours practical per week
NEP_CREDIT_RULES = {
    "theory":    {"credits": 3, "hours_per_week": 3},
    "practical": {"credits": 2, "hours_per_week": 4},  # 2 continuous x 2 days
    "elective":  {"credits": 3, "hours_per_week": 3},
    "tutorial":  {"credits": 1, "hours_per_week": 1},
}

# NEP 2020: Max credits per semester = 24
# Max theory subjects = 5, Max practicals = 3
NEP_MAX_THEORY_PER_DAY = 2       # No subject overload
NEP_MAX_HOURS_PER_DAY = 6        # Max teaching hours per day
NEP_MAX_CONSECUTIVE_THEORY = 2   # No more than 2 theory classes back to back


def get_theory_slots():
    return [s for s in TIME_SLOTS if s != LUNCH_SLOT]


def get_lab_slot_pairs():
    """Return pairs of continuous slots for lab sessions (NEP 2020: labs must be continuous)"""
    slots = get_theory_slots()
    pairs = []
    for i in range(len(slots) - 1):
        # Skip pairs that cross lunch
        if slots[i] == LUNCH_SLOT or slots[i + 1] == LUNCH_SLOT:
            continue
        # Morning pairs (before lunch)
        if slots[i] in ["9:00-10:00", "10:00-11:00", "11:00-12:00"]:
            if slots[i + 1] in ["9:00-10:00", "10:00-11:00", "11:00-12:00"]:
                pairs.append((slots[i], slots[i + 1]))
        # Afternoon pairs (after lunch)
        if slots[i] in ["1:00-2:00", "2:00-3:00"]:
            if slots[i + 1] in ["2:00-3:00", "3:00-4:00"]:
                pairs.append((slots[i], slots[i + 1]))
    return pairs


def check_consecutive_theory(timetable, day, slot):
    """NEP 2020: Avoid more than 2 consecutive theory classes"""
    slots = get_theory_slots()
    if slot not in slots:
        return False
    idx = slots.index(slot)
    count = 0
    # Check previous slots
    for i in range(max(0, idx - 2), idx):
        if slots[i] in timetable[day]:
            entry = timetable[day][slots[i]]
            if entry.get("subject_type") in ["theory", "elective", "tutorial"]:
                count += 1
    return count >= NEP_MAX_CONSECUTIVE_THEORY


def generate_timetable(subjects, teachers, rooms) -> Dict[str, Any]:
    timetable = {day: {"LUNCH": {"subject": "Lunch Break", "subject_type": "break", "teacher": "-", "room": "-"}} for day in DAYS}
    teacher_schedule = {day: {} for day in DAYS}
    room_schedule = {day: {} for day in DAYS}

    # Track per subject per day (NEP: no overload)
    subject_day_count = {}
    # Track total hours assigned per subject
    subject_total_hours = {}
    # Track teacher daily hours (NEP: max 6 hrs/day)
    teacher_daily_hours = {day: {} for day in DAYS}

    theory_slots = get_theory_slots()
    lab_pairs = get_lab_slot_pairs()

    # Separate subjects by type
    theory_subjects = [s for s in subjects if s.get("subject_type") in ["theory", "elective", "tutorial"]]
    lab_subjects = [s for s in subjects if s.get("subject_type") == "practical"]

    classrooms = [r for r in rooms if r["room_type"] == "classroom"]
    labs = [r for r in rooms if r["room_type"] == "lab"]

    if not classrooms:
        classrooms = rooms
    if not labs:
        labs = rooms

    def is_slot_free(day, slot, teacher_id, room_id):
        if slot == LUNCH_SLOT:
            return False
        teacher_busy = teacher_schedule[day].get(slot)
        room_busy = room_schedule[day].get(slot)
        # NEP: teacher max hours per day
        t_hours = teacher_daily_hours[day].get(teacher_id, 0)
        if t_hours >= NEP_MAX_HOURS_PER_DAY:
            return False
        return teacher_busy != teacher_id and room_busy != room_id

    def assign_slot(day, slot, subject, teacher, room):
        timetable[day][slot] = {
            "subject": subject["name"],
            "subject_code": subject["code"],
            "subject_type": subject["subject_type"],
            "credits": subject.get("credits", 3),
            "teacher": teacher["name"],
            "teacher_id": teacher["id"],
            "room": room["name"]
        }
        teacher_schedule[day][slot] = teacher["id"]
        room_schedule[day][slot] = room["id"]
        teacher_daily_hours[day][teacher["id"]] = teacher_daily_hours[day].get(teacher["id"], 0) + 1
        subject_total_hours[subject["id"]] = subject_total_hours.get(subject["id"], 0) + 1

    def get_teacher_for_subject(subject):
        teacher = next((t for t in teachers if t["id"] == subject.get("teacher_id")), None)
        if not teacher and teachers:
            teacher = random.choice(teachers)
        return teacher

    # ---- Schedule Theory / Elective / Tutorial Subjects ----
    # NEP 2020: Distribute evenly across the week
    for subject in theory_subjects:
        hours = NEP_CREDIT_RULES.get(subject.get("subject_type", "theory"), {}).get("hours_per_week", subject.get("hours_per_week", 3))
        assigned = 0
        attempts = 0

        days_shuffled = DAYS.copy()
        random.shuffle(days_shuffled)

        while assigned < hours and attempts < 200:
            attempts += 1
            day = days_shuffled[assigned % len(days_shuffled)]
            slot = random.choice(theory_slots)

            if slot == LUNCH_SLOT:
                continue

            # NEP: Max 1 class per subject per day
            day_key = f"{subject['id']}_{day}"
            if subject_day_count.get(day_key, 0) >= 1:
                continue

            # NEP: No slot already taken
            if slot in timetable[day]:
                continue

            # NEP: No more than 2 consecutive theory
            if check_consecutive_theory(timetable, day, slot):
                continue

            teacher = get_teacher_for_subject(subject)
            if not teacher:
                continue

            room = random.choice(classrooms)

            if is_slot_free(day, slot, teacher["id"], room["id"]):
                assign_slot(day, slot, subject, teacher, room)
                subject_day_count[day_key] = subject_day_count.get(day_key, 0) + 1
                assigned += 1

    # ---- Schedule Lab / Practical Subjects ----
    # NEP 2020: Labs must be 2 continuous hours, preferably same session (morning/afternoon)
    for subject in lab_subjects:
        hours_needed = NEP_CREDIT_RULES["practical"]["hours_per_week"]  # 4 hrs = 2 pairs
        pairs_assigned = 0
        attempts = 0
        target_pairs = hours_needed // 2  # 2 pairs of 2 hours

        days_shuffled = DAYS.copy()
        random.shuffle(days_shuffled)

        while pairs_assigned < target_pairs and attempts < 200:
            attempts += 1
            day = days_shuffled[pairs_assigned % len(days_shuffled)]

            if not lab_pairs:
                break

            slot1, slot2 = random.choice(lab_pairs)

            if slot1 in timetable[day] or slot2 in timetable[day]:
                continue

            teacher = get_teacher_for_subject(subject)
            if not teacher:
                continue

            room = random.choice(labs)

            if (is_slot_free(day, slot1, teacher["id"], room["id"]) and
                    is_slot_free(day, slot2, teacher["id"], room["id"])):
                assign_slot(day, slot1, subject, teacher, room)
                assign_slot(day, slot2, subject, teacher, room)
                pairs_assigned += 1

    return timetable


def validate_nep_constraints(timetable, subjects) -> Dict[str, Any]:
    """Validate generated timetable against NEP 2020 rules"""
    issues = []
    score = 100

    total_credits = sum(s.get("credits", 3) for s in subjects)

    # NEP: Max 24 credits per semester
    if total_credits > 24:
        issues.append(f"Total credits ({total_credits}) exceed NEP 2020 limit of 24")
        score -= 20

    # Check no slot has more than 2 consecutive theory
    for day in DAYS:
        slots = get_theory_slots()
        consecutive = 0
        for slot in slots:
            entry = timetable[day].get(slot)
            if entry and entry.get("subject_type") in ["theory", "elective"]:
                consecutive += 1
                if consecutive > NEP_MAX_CONSECUTIVE_THEORY:
                    issues.append(f"{day}: More than {NEP_MAX_CONSECUTIVE_THEORY} consecutive theory classes")
                    score -= 10
                    break
            else:
                consecutive = 0

    # Check lunch break exists
    for day in DAYS:
        if "LUNCH" not in timetable[day]:
            issues.append(f"{day}: Missing lunch break (NEP 2020 requires break)")
            score -= 5

    return {
        "score": max(score, 0),
        "issues": issues,
        "total_credits": total_credits,
        "nep_compliant": len(issues) == 0
    }


def generate_multiple_timetables(subjects, teachers, rooms, count=5) -> List[Dict]:
    """Generate 5 timetables with NEP 2020 validation scores"""
    timetables = []
    for i in range(count):
        tt = generate_timetable(subjects, teachers, rooms)
        validation = validate_nep_constraints(tt, subjects)
        timetables.append({
            "version": i + 1,
            "timetable": tt,
            "nep_score": validation["score"],
            "nep_compliant": validation["nep_compliant"],
            "issues": validation["issues"],
            "total_credits": validation["total_credits"]
        })

    # Sort by NEP score (best first)
    timetables.sort(key=lambda x: x["nep_score"], reverse=True)
    return timetables