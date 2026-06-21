from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services import ocr_service

router = APIRouter(prefix="/ai/ocr", tags=["OCR Scanner"])

@router.post("/scan")
async def scan_book_page(file: UploadFile = File(...)):
    """Extracts text from uploaded book page images."""
    try:
        content = await file.read()
        text = ocr_service.extract_text_from_image(content)
        return {"status": "success", "text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
