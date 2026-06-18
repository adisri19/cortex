import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from routes.chat import router as chat_router
from routes.recommend import router as recommend_router
from routes.embed import router as embed_router

app = FastAPI(
    title="Kiddo AI Service",
    description="Python FastAPI service handling SDUI personalization, RAG chat, and vector embeddings.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(chat_router, tags=["chat"])
app.include_router(recommend_router, tags=["recommendation"])
app.include_router(embed_router, tags=["embeddings"])

@app.get("/health")
def health_check():
    # Verify environment keys are loaded
    openai_ok = os.environ.get("OPENAI_API_KEY") is not None
    pinecone_ok = os.environ.get("PINECONE_API_KEY") is not None
    db_ok = os.environ.get("DATABASE_URL") is not None
    
    return {
        "status": "healthy",
        "checks": {
            "openai_api": openai_ok,
            "pinecone_api": pinecone_ok,
            "database_connection": db_ok
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
