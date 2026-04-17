import random
import copy
from typing import List, Dict, Any

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
THEORY_SLOTS = ["9:00-10:00", "10:00-11:00", "11:00-12:00", "1:00-2:00", "2:00-3:00", "3:00-4:00"]
LAB_SLOT_STARTS = ["9:00-10:00", "10:00-11:00", "1:00-2:00", "2:00-3:00"]
LUNCH_SLOT = "12:00-1:00"

TIME_SLOTS_ORDER = [
    "9:00-10:00", "10:00-11:00", "11:00-12:00", 
    "12:00-1:00", "1:00-2:00", "2:00-3:00", "3:00-4:00"
]

def get_next_slot(slot):
    try:
        idx = TIME_SLOTS_ORDER.index(slot)
        return TIME_SLOTS_ORDER[idx + 1]
    except (ValueError, IndexError):
        return None

class TimetableCSP:
    def __init__(self, subjects, teachers, rooms):
        self.subjects = subjects
        self.teachers = teachers
        self.rooms = rooms
        self.classrooms = [r for r in rooms if r.get("room_type") == "classroom"]
        self.labs = [r for r in rooms if r.get("room_type") == "lab"]
        if not self.classrooms: self.classrooms = rooms
        if not self.labs: self.labs = rooms
        
        self.assignments = self._prepare_assignments()
        self.solutions = []
        self.backtrack_limit = 10000
        self.backtracks = 0
        
    def _prepare_assignments(self):
        assignments = []
        for subject in self.subjects:
            teacher = next((t for t in self.teachers if t["id"] == subject.get("teacher_id")), None)
            if not teacher and self.teachers:
                teacher = random.choice(self.teachers)
            
            stype = subject.get("subject_type", "theory")
            if stype == "practical":
                # Assuming 2 pairs of 2 hours per week
                for _ in range(2):
                    assignments.append({"subject": subject, "teacher": teacher, "length": 2})
            else:
                hours = int(subject.get("credits", 3))
                if hours > 5: hours = 5
                for _ in range(hours):
                    assignments.append({"subject": subject, "teacher": teacher, "length": 1})
        return assignments

    def solve(self, num_solutions=5):
        # We try to generate multiple distinct valid full schedules
        max_attempts = num_solutions * 5
        attempts = 0
        
        while len(self.solutions) < num_solutions and attempts < max_attempts:
            attempts += 1
            self.backtracks = 0
            
            # Shuffle slightly to get variation, but maintain MCV (longest assignments first)
            random.shuffle(self.assignments)
            self.assignments.sort(key=lambda a: a["length"], reverse=True)
            
            state = {
                "timetable": {d: {s: None for s in TIME_SLOTS_ORDER} for d in DAYS},
                "teacher_schedule": {d: {s: set() for s in TIME_SLOTS_ORDER} for d in DAYS},
                "room_schedule": {d: {s: set() for s in TIME_SLOTS_ORDER} for d in DAYS},
                "teacher_daily_hours": {d: {} for d in DAYS},
                "subject_daily_count": {d: {} for d in DAYS}
            }
            # Initialize lunch block permanently
            for d in DAYS:
                state["timetable"][d][LUNCH_SLOT] = {
                    "subject": "Lunch Break", "subject_type": "break", 
                    "teacher": "-", "teacher_id": None, "room": "-"
                }
                
            if self._backtrack(0, state):
                # We found a complete 100% valid schedule
                self.solutions.append(copy.deepcopy(state["timetable"]))
                
        # If we couldn't even find one complete table, fallback to empty (FastAPI will catch it or return empty)
        return self.solutions

    def _backtrack(self, index, state):
        if index >= len(self.assignments):
            return True
        if self.backtracks > self.backtrack_limit:
            return False
            
        assignment = self.assignments[index]
        teacher_id = assignment["teacher"]["id"] if assignment["teacher"] else None
        subject_id = assignment["subject"]["id"]
        length = assignment["length"]
        
        valid_moves = self._get_valid_moves(assignment, state)
        
        # Heuristic: Score moves to prefer adjacency (minimize gaps between classes)
        def score_move(move):
            day, slot, room = move
            score = random.random()
            slot_idx = TIME_SLOTS_ORDER.index(slot)
            
            # Check left adjacency
            if slot_idx > 0 and state["timetable"][day][TIME_SLOTS_ORDER[slot_idx - 1]] is not None:
                score += 10
            # Check right adjacency
            if length == 1 and slot_idx < len(TIME_SLOTS_ORDER)-1 and state["timetable"][day][TIME_SLOTS_ORDER[slot_idx + 1]] is not None:
                score += 10
            if length == 2 and slot_idx < len(TIME_SLOTS_ORDER)-2 and state["timetable"][day][TIME_SLOTS_ORDER[slot_idx + 2]] is not None:
                score += 10
                
            return score
            
        valid_moves.sort(key=score_move, reverse=True)
        
        for move in valid_moves:
            self._apply_move(assignment, move, state)
            if self._backtrack(index + 1, state):
                return True
            self._revert_move(assignment, move, state)
            self.backtracks += 1
            
        return False

    def _get_valid_moves(self, assignment, state):
        moves = []
        teacher_id = assignment["teacher"]["id"] if assignment["teacher"] else None
        subject_id = assignment["subject"]["id"]
        length = assignment["length"]
        req_rooms = self.labs if length == 2 else self.classrooms
        
        for day in DAYS:
            # Check teacher daily limit (Max 6 hours mapping to NEP constraints)
            if teacher_id and state["teacher_daily_hours"][day].get(teacher_id, 0) + length > 6:
                continue
            
            # Prevent more than 1 session of same subject per day
            if state["subject_daily_count"][day].get(subject_id, 0) >= 1:
                continue
                
            slots_to_check = LAB_SLOT_STARTS if length == 2 else THEORY_SLOTS
            
            for slot in slots_to_check:
                if not self._is_slot_free(day, slot, teacher_id, state):
                    continue
                if length == 2:
                    next_s = get_next_slot(slot)
                    if next_s == LUNCH_SLOT or not self._is_slot_free(day, next_s, teacher_id, state):
                        continue
                        
                # Find the first available suitable room
                rooms_shuffled = copy.copy(req_rooms)
                random.shuffle(rooms_shuffled)
                for room in rooms_shuffled:
                    if room["id"] not in state["room_schedule"][day][slot]:
                        if length == 2:
                            next_s = get_next_slot(slot)
                            if room["id"] in state["room_schedule"][day][next_s]:
                                continue
                        moves.append((day, slot, room))
                        break
        return moves
        
    def _is_slot_free(self, day, slot, teacher_id, state):
        if state["timetable"][day][slot] is not None:
            return False
        if teacher_id and teacher_id in state["teacher_schedule"][day][slot]:
            return False
        return True

    def _apply_move(self, assignment, move, state):
        day, slot, room = move
        teacher = assignment["teacher"]
        subject = assignment["subject"]
        teacher_id = teacher["id"] if teacher else None
        subject_id = subject["id"]
        length = assignment["length"]
        
        def commit(s):
            state["timetable"][day][s] = {
                "subject": subject["name"],
                "subject_code": subject["code"],
                "subject_type": subject["subject_type"],
                "credits": subject.get("credits", 3),
                "teacher": teacher["name"] if teacher else "-",
                "teacher_id": teacher_id,
                "room": room["name"]
            }
            if teacher_id: state["teacher_schedule"][day][s].add(teacher_id)
            state["room_schedule"][day][s].add(room["id"])
            
        commit(slot)
        if length == 2: commit(get_next_slot(slot))
        
        if teacher_id: state["teacher_daily_hours"][day][teacher_id] = state["teacher_daily_hours"][day].get(teacher_id, 0) + length
        state["subject_daily_count"][day][subject_id] = state["subject_daily_count"][day].get(subject_id, 0) + 1

    def _revert_move(self, assignment, move, state):
        day, slot, room = move
        teacher = assignment["teacher"]
        teacher_id = teacher["id"] if teacher else None
        subject_id = assignment["subject"]["id"]
        length = assignment["length"]
        
        def uncommit(s):
            state["timetable"][day][s] = None
            if teacher_id: state["teacher_schedule"][day][s].discard(teacher_id)
            state["room_schedule"][day][s].discard(room["id"])
            
        uncommit(slot)
        if length == 2: uncommit(get_next_slot(slot))
            
        if teacher_id: state["teacher_daily_hours"][day][teacher_id] -= length
        state["subject_daily_count"][day][subject_id] -= 1


# ---------- Evaluation Metrics ----------

def score_timetable_gaps_and_nep(timetable, subjects) -> Dict[str, Any]:
    issues = []
    score = 100
    
    total_credits = sum(s.get("credits", 3) for s in subjects)

    for day in DAYS:
        daily_slots = []
        for s in TIME_SLOTS_ORDER:
            entry = timetable[day][s]
            if entry and entry.get("subject_type") != "break":
                daily_slots.append(TIME_SLOTS_ORDER.index(s))
                
        # Gap Penalty calculation
        if daily_slots:
            first_class = min(daily_slots)
            last_class = max(daily_slots)
            classes_count = len(daily_slots)
            span = (last_class - first_class + 1)
            # Subtract 1 for Lunch if lunch falls between first and last
            if first_class < TIME_SLOTS_ORDER.index(LUNCH_SLOT) < last_class:
                span -= 1
            
            gaps = span - classes_count
            if gaps > 0:
                score -= gaps * 5  # Strong penalty for free hours blocking students
                if gaps >= 2:
                    issues.append(f"{day}: Large gap of {gaps} free hours between lectures.")

    # Convert timetable dict to clean nested dict, stripping None
    clean_tt = {}
    for day in DAYS:
        clean_tt[day] = {}
        for s in TIME_SLOTS_ORDER:
            if timetable[day][s] is not None:
                clean_tt[day][s] = timetable[day][s]
                
    return {
        "score": max(score, 0),
        "issues": list(set(issues)),
        "total_credits": total_credits,
        "nep_compliant": len(issues) == 0,
        "clean_tt": clean_tt
    }

def generate_multiple_timetables(subjects, teachers, rooms, count=5) -> List[Dict]:
    csp = TimetableCSP(subjects, teachers, rooms)
    solutions = csp.solve(num_solutions=count)
    
    # If CSP could not find complete solutions, we need to return something
    # but let's assume it found at least some
    
    timetables = []
    for i, tt in enumerate(solutions):
        validation = score_timetable_gaps_and_nep(tt, subjects)
        timetables.append({
            "version": i + 1,
            "timetable": validation["clean_tt"],
            "nep_score": validation["score"],
            "nep_compliant": validation["nep_compliant"],
            "issues": validation["issues"],
            "total_credits": validation["total_credits"]
        })
        
    timetables.sort(key=lambda x: x["nep_score"], reverse=True)
    return timetables