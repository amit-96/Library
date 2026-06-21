from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services import resume_service

router = APIRouter(prefix="/ai/resume", tags=["AI Resume Analyzer"])

class ResumeRequest(BaseModel):
    resume_text: str

@router.post("/analyze")
def analyze_resume(req: ResumeRequest):
    """Calculates ATS scores and provides feedback on resume structures."""
    try:
        data = resume_service.analyze_resume_text(req.resume_text)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
