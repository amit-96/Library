from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services import career_service

router = APIRouter(prefix="/ai/career", tags=["AI Career Mentor"])

class CareerRequest(BaseModel):
    goal: str
    current_skills: list = []

@router.post("/mentor")
def get_career_advice(req: CareerRequest):
    """Generates roadmap, outlines skill gaps, and recommends learning materials."""
    try:
        data = career_service.generate_roadmap(req.goal, req.current_skills)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
