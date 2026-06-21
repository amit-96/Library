import os
import shutil
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from app.services import rag_service

router = APIRouter(prefix="/ai/pdf", tags=["RAG / PDF Assistant"])

# Directory to store physical PDFs temporarily
PDF_STORE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploaded_pdfs")
os.makedirs(PDF_STORE, exist_ok=True)

class ChatQuery(BaseModel):
    query: str
    index_key: str

class NotesQuery(BaseModel):
    index_key: str
    note_type: str = "short"  # short, long, exam, revision

class MCQQuery(BaseModel):
    index_key: str
    quantity: int = 10
    difficulty: str = "medium"  # easy, medium, hard

@router.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    doc_id: str = Form(...),
    index_key: str = Form(...)
):
    # Save file locally
    file_path = os.path.join(PDF_STORE, f"{index_key}.pdf")
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to write file to disk: {str(e)}")

    # Index file in FAISS vector database
    success = rag_service.build_index(file_path, index_key)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to build vector index for PDF.")

    return {"status": "success", "message": "PDF processed and indexed successfully", "doc_id": doc_id}

@router.post("/chat")
async def chat_pdf(body: ChatQuery):
    try:
        answer = rag_service.query_rag(body.query, body.index_key)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/notes")
async def notes_pdf(body: NotesQuery):
    try:
        notes = rag_service.generate_notes(body.index_key, body.note_type)
        return {"notes": notes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/mcq")
async def mcq_pdf(body: MCQQuery):
    try:
        mcqs = rag_service.generate_mcqs(body.index_key, body.quantity, body.difficulty)
        return {"mcqs": mcqs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
