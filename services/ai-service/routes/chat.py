from fastapi import APIRouter
from models.schemas import ChatRequest, ChatResponse
from rag.pipeline import run_chat_pipeline
import uuid

router = APIRouter()

@router.post('/chat', response_model=ChatResponse)
async def chat(req: ChatRequest):
    reply, suggestions = await run_chat_pipeline(
        messages=req.messages,
        user_id=req.userId,
        child_age_months=req.childAgeMonths
    )
    return ChatResponse(
        reply=reply,
        suggestions=suggestions,
        sessionId=str(uuid.uuid4())
    )
