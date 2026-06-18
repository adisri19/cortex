import os
import psycopg2
from openai import OpenAI
from pinecone import Pinecone

def embed_products(product_ids: list[str] | None = None):
    """
    Fetch products from PostgreSQL, generate embeddings via OpenAI,
    upsert into Pinecone with metadata, mark as synced in DB.
    
    Each product is embedded as:
    "Product: {name}. Description: {description}. 
     Category: {category}. Safe for ages {age_min}m to {age_max}m. 
     Price: ₹{price}."
    
    Pinecone metadata stored per vector:
    { id, name, price, category, image_url, age_min_months, age_max_months }
    
    Process in batches of 100. After each batch, mark embedding_synced=true 
    in PostgreSQL.
    """
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        print("[Embedder] Error: DATABASE_URL not set")
        return
        
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()
    
    try:
        if product_ids:
            cursor.execute(
                """SELECT id, name, description, price, category, image_url, age_min_months, age_max_months 
                   FROM products 
                   WHERE id = ANY(%s)""",
                (product_ids,)
            )
        else:
            cursor.execute(
                """SELECT id, name, description, price, category, image_url, age_min_months, age_max_months 
                   FROM products 
                   WHERE embedding_synced = false AND in_stock = true"""
            )
            
        rows = cursor.fetchall()
        if not rows:
            print("[Embedder] No products to embed")
            return
            
        print(f"[Embedder] Found {len(rows)} products to embed")
        
        batch_size = 100
        openai_client = OpenAI(api_key=os.environ['OPENAI_API_KEY'])
        pc = Pinecone(api_key=os.environ['PINECONE_API_KEY'])
        index = pc.Index(os.environ['PINECONE_INDEX_NAME'])
        
        for i in range(0, len(rows), batch_size):
            batch = rows[i:i + batch_size]
            vectors = []
            synced_ids = []
            
            texts = []
            for r in batch:
                p_id, name, desc, price, cat, img, age_min, age_max = r
                price_float = float(price) if price else 0.0
                desc_text = desc if desc else ""
                age_min_val = int(age_min) if age_min is not None else 0
                age_max_val = int(age_max) if age_max is not None else 1200
                
                text = f"Product: {name}. Description: {desc_text}. Category: {cat}. Safe for ages {age_min_val}m to {age_max_val}m. Price: ₹{price_float}."
                texts.append((p_id, text, name, price_float, cat, img, age_min_val, age_max_val))
                
            if not texts:
                continue
                
            # Call OpenAI to generate embeddings
            embeddings_response = openai_client.embeddings.create(
                input=[t[1] for t in texts],
                model="text-embedding-3-small"
            )
            
            # Prepare vectors for Pinecone
            for idx, item in enumerate(embeddings_response.data):
                p_id, text, name, price_float, cat, img, age_min_val, age_max_val = texts[idx]
                vectors.append({
                    "id": p_id,
                    "values": item.embedding,
                    "metadata": {
                        "id": p_id,
                        "name": name,
                        "price": price_float,
                        "category": cat,
                        "image_url": img if img else "",
                        "age_min_months": age_min_val,
                        "age_max_months": age_max_val
                    }
                })
                synced_ids.append(p_id)
                
            # Upsert into Pinecone
            index.upsert(vectors=vectors)
            
            # Mark embedding_synced = true in database
            cursor.execute(
                "UPDATE products SET embedding_synced = true WHERE id = ANY(%s)",
                (synced_ids,)
            )
            conn.commit()
            print(f"[Embedder] Successfully embedded and synced {len(synced_ids)} products")
            
    except Exception as e:
        conn.rollback()
        print("[Embedder] Error occurred during embedding process:", e)
        raise e
    finally:
        cursor.close()
        conn.close()
