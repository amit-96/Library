from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services import planner_service

router = APIRouter(prefix="/ai/study-planner", tags=["AI Study Planner"])

class PlannerRequest(BaseModel):
    exam_name: str
    days_remaining: int
    daily_hours: float = 3.0

@router.post("")
def get_study_plan(req: PlannerRequest):
    """Generates a structured weekly study plan matching target schedules."""
    try:
        data = planner_service.generate_study_plan(req.exam_name, req.days_remaining, req.daily_hours)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
