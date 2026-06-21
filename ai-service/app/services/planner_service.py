import math

def generate_study_plan(exam_name: str, days_remaining: int, daily_hours: float):
    """
    Calculates milestone intervals based on days remaining, dividing study guides into
    weekly targets.
    """
    days = int(days_remaining)
    hours = float(daily_hours)
    
    # We will segment the schedule into weeks
    num_weeks = math.ceil(days / 7)
    if num_weeks <= 0:
        num_weeks = 1

    weekly_plan = []
    
    for w in range(1, num_weeks + 1):
        if w == num_weeks:
            focus = "Comprehensive Review & Simulated Practice Exams"
            topics = [
                "Solve final year sample assessment papers under strict timers.",
                "Review bookmarks, highlights, and formula summaries.",
                "Refine answers based on grading marking schemes."
            ]
        elif w == num_weeks - 1 and num_weeks > 2:
            focus = "Weak Area Consolidation & Concept Polish"
            topics = [
                "Re-evaluate challenging segments based on weekly test results.",
                "Discuss complex topics with peers or AI Tutor.",
                "Practice speed-coding or speed-solving problems."
            ]
        else:
            focus = f"Core Foundations: Phase {w} (Intensive Readings)"
            topics = [
                f"Complete detailed chapters in {exam_name} curriculum guidelines.",
                f"Dedicate {hours} hours daily to structured coding/problem sets.",
                "Generate custom flashcards for active recall practice."
            ]
            
        weekly_plan.append({
            "week": w,
            "focusArea": focus,
            "topics": topics
        })

    return {
        "examName": exam_name,
        "daysRemaining": days,
        "dailyHours": hours,
        "weeklyPlan": weekly_plan
    }
