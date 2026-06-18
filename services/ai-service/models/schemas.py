from pydantic import BaseModel
from typing import Optional, List, Any, Dict

class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    userId: str
    childAgeMonths: Optional[int] = None

class ProductSuggestion(BaseModel):
    id: str
    name: str
    price: float
    image_url: str
    reason: str  # Why this product was suggested

class ChatResponse(BaseModel):
    reply: str
    suggestions: List[ProductSuggestion]
    sessionId: str

class RecommendRequest(BaseModel):
    blocks: List[Dict[str, Any]]
    userId: str

class RecommendResponse(BaseModel):
    orderedBlocks: List[Dict[str, Any]]

class EmbedRequest(BaseModel):
    productIds: Optional[List[str]] = None  # None = embed all unsynced
