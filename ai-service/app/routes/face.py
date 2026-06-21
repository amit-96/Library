import json
import requests
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services import face_service

router = APIRouter(prefix="/ai/face", tags=["Face Recognition Attendance"])

# Node.js backend endpoint mapping
BACKEND_URL = "http://127.0.0.1:5000"

@router.post("/register")
async def register_face(file: UploadFile = File(...)):
    """Receives a webcam snapshot, detects face, and returns its 128D embedding vector."""
    try:
        content = await file.read()
        img = face_service.decode_image(content)
        embedding = face_service.get_face_embedding(img)
        
        if embedding is None:
            raise HTTPException(status_code=400, detail="No face detected in the uploaded frame. Please try again.")

        return {
            "status": "success",
            "message": "Face detected and embedded successfully",
            "embedding": embedding
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify")
async def verify_face(
    file: UploadFile = File(...),
    students_db_json: str = Form(...) # JSON string containing active student list
):
    """Detects face, matches against database student embeddings, and checks in the student on success."""
    try:
        content = await file.read()
        img = face_service.decode_image(content)
        embedding = face_service.get_face_embedding(img)

        if embedding is None:
            raise HTTPException(status_code=400, detail="No face detected in the image.")

        # Parse student database profiles
        try:
            students = json.loads(students_db_json)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid students database JSON format.")

        # Match face embedding
        match = face_service.match_face(embedding, students)
        if not match:
            return {
                "status": "fail",
                "message": "Face not recognized. Access denied."
            }

        # Face matched! Trigger Node.js backend check-in API
        try:
            res = requests.post(
                f"{BACKEND_URL}/api/attendance/face-checkin",
                json={"studentMongoId": match["id"]},
                headers={"Content-Type": "application/json"}
            )
            
            if res.status_code in [200, 201]:
                res_data = res.json()
                return {
                    "status": "success",
                    "message": f"Welcome back, {match['name']}! Check-in recorded.",
                    "student": match,
                    "attendanceRecord": res_data.get("data")
                }
            else:
                return {
                    "status": "success",
                    "message": f"Face recognized as {match['name']}, but backend check-in failed: {res.text}",
                    "student": match
                }
        except Exception as backend_err:
            return {
                "status": "success",
                "message": f"Face recognized as {match['name']}, but couldn't contact attendance backend: {str(backend_err)}",
                "student": match
            }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
