from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services import interview_service

router = APIRouter(prefix="/ai/interview", tags=["AI Interview Prep"])

class SessionRequest(BaseModel):
    domain: str
    interview_type: str = "Technical"

class FeedbackRequest(BaseModel):
    question: str
    answer: str

@router.post("/session")
def start_interview_session(req: SessionRequest):
    """Starts a mock interview session and returns a question."""
    try:
        data = interview_service.get_question(req.domain, req.interview_type)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/feedback")
def evaluate_response(req: FeedbackRequest):
    """Grades response inputs and returns score suggestions."""
    try:
        data = interview_service.grade_answer(req.question, req.answer)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
