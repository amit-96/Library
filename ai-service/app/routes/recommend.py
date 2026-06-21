from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.services import rec_service

router = APIRouter(prefix="/ai", tags=["Search & Recommendation Engine"])

class SemanticSearchQuery(BaseModel):
    query: str
    books: List[Dict[str, Any]]
    top_k: Optional[int] = 5

class RecommendationsQuery(BaseModel):
    user_history: List[Dict[str, Any]]
    all_books: List[Dict[str, Any]]
    top_k: Optional[int] = 4

@router.post("/search/semantic")
async def semantic_search(body: SemanticSearchQuery):
    try:
        results = rec_service.semantic_search_books(body.query, body.books, body.top_k)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommendations")
async def recommendations(body: RecommendationsQuery):
    try:
        results = rec_service.get_recommendations(body.user_history, body.all_books, body.top_k)
        return {"recommendations": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
