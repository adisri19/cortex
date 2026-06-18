from fastapi import APIRouter, HTTPException
from models.schemas import EmbedRequest
from rag.embedder import embed_products

router = APIRouter()

@router.post('/embed/products')
async def embed_products_endpoint(req: EmbedRequest):
    try:
        # Run synchronous embedding pipeline
        embed_products(product_ids=req.productIds)
        return {
            "success": True,
            "message": "Product embeddings synchronized successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to synchronize embeddings: {str(e)}"
        )
