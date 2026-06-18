import os
from pinecone import Pinecone
from openai import OpenAI

def retrieve_relevant_products(
    query: str, 
    child_age_months: int | None = None,
    top_k: int = 5
) -> list[dict]:
    """
    1. Embed the user query using text-embedding-3-small
    2. Query Pinecone with the embedding
    3. If child_age_months provided, apply metadata filter:
       { age_min_months: { $lte: child_age_months },
         age_max_months: { $gte: child_age_months } }
    4. Return top_k results with full metadata
    """
    try:
        openai_client = OpenAI(api_key=os.environ['OPENAI_API_KEY'])
        embeddings_response = openai_client.embeddings.create(
            input=[query],
            model="text-embedding-3-small"
        )
        query_embedding = embeddings_response.data[0].embedding
        
        pc = Pinecone(api_key=os.environ['PINECONE_API_KEY'])
        index = pc.Index(os.environ['PINECONE_INDEX_NAME'])
        
        # Build filter conditions
        filter_dict = {}
        if child_age_months is not None:
            # Match products suitable for this child age
            filter_dict = {
                "age_min_months": {"$lte": child_age_months},
                "age_max_months": {"$gte": child_age_months}
            }
            
        results = index.query(
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True,
            filter=filter_dict if filter_dict else None
        )
        
        products = []
        for match in results.matches:
            if match.metadata:
                products.append(match.metadata)
        return products
    except Exception as e:
        print("[Retriever] Error during retrieval:", e)
        return []
