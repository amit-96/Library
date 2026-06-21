from fastapi import APIRouter, HTTPException
from app.services import cctv_service

router = APIRouter(prefix="/ai/cctv", tags=["Smart CCTV Analytics"])

@router.get("/status")
def get_cctv_status():
    """Gets real-time seat availability grids and crowd security alerts."""
    try:
        data = cctv_service.get_cctv_status()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
