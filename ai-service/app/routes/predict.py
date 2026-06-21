from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services import predict_service

router = APIRouter(prefix="/ai/predict", tags=["Predictive Analytics"])

class PredictionQuery(BaseModel):
    date: str
    time_slot: str

@router.post("/seats")
async def predict_seats(body: PredictionQuery):
    """Predicts expected library occupancy rates for a specific slot."""
    try:
        res = predict_service.predict_occupancy(body.date, body.time_slot)
        return {"status": "success", **res}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
