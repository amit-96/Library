import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load env variables (if any)
load_dotenv()

# Initialize FastAPI App
app = FastAPI(
    title="LibraAI - AI Microservice API",
    description="Python FastAPI service handling RAG, FAISS Vector Indexing, OpenCV Face Recognition and Collaborative Recommendations.",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permit React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and Register APIRouters
from app.routes import rag, face, recommend, ocr, predict, cctv, career, interview, resume, planner

app.include_router(rag.router)
app.include_router(face.router)
app.include_router(recommend.router)
app.include_router(ocr.router)
app.include_router(predict.router)
app.include_router(cctv.router)
app.include_router(career.router)
app.include_router(interview.router)
app.include_router(resume.router)
app.include_router(planner.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "LibraAI Python Microservice",
        "features": [
            "RAG (PDF Learning Assistant)",
            "Face Recognition Attendance Webhook",
            "Semantic Catalog Search",
            "Personalized Interest Recommendations"
        ],
        "dlib_active": face.face_service.HAS_FACE_REC
    }

if __name__ == "__main__":
    import uvicorn
    # Read port from env or default to 8000
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="127.0.0.1", port=port, reload=False)
