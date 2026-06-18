import os
import json
import psycopg2
from fastapi import APIRouter
from models.schemas import RecommendRequest, RecommendResponse

router = APIRouter()

def get_block_category(block: dict) -> str | None:
    b_id = str(block.get("id", "")).lower()
    b_type = str(block.get("type", "")).lower()
    
    if "snacks" in b_id:
        return "snacks"
    if "diaper" in b_id or "diapers" in b_id:
        return "diapers"
    if "toy" in b_id or "toys" in b_id:
        return "toys"
    if "event" in b_id or "tickets" in b_id or "zoo" in b_id:
        return "tickets"
    if "lunchbox" in b_id or "lunchboxes" in b_id or "bts" in b_id:
        return "lunchboxes"
    if "clothing" in b_id or "wear" in b_id:
        return "clothing"
        
    # Check block type strings
    if "snacks" in b_type:
        return "snacks"
    if "diaper" in b_type:
        return "diapers"
    if "toy" in b_type:
        return "toys"
        
    return None

@router.post('/recommend', response_model=RecommendResponse)
async def recommend(req: RecommendRequest):
    blocks = req.blocks
    user_id = req.userId
    
    try:
        db_url = os.environ.get('DATABASE_URL')
        if not db_url:
            return RecommendResponse(orderedBlocks=blocks)
            
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        # 1. Fetch user's past orders
        cursor.execute("SELECT items FROM orders WHERE user_id = %s", (user_id,))
        orders = cursor.fetchall()
        
        # 2. Extract product IDs and count category preferences
        product_ids = []
        for row in orders:
            try:
                items_list = row[0]
                if isinstance(items_list, str):
                    items_list = json.loads(items_list)
                for item in items_list:
                    p_id = item.get("productId") or item.get("product_id")
                    if p_id:
                        product_ids.append(p_id)
            except Exception:
                pass
                
        preferred_categories = []
        if product_ids:
            cursor.execute(
                "SELECT category, COUNT(*) as count FROM products WHERE id = ANY(%s) GROUP BY category ORDER BY count DESC",
                (product_ids,)
            )
            cat_rows = cursor.fetchall()
            preferred_categories = [row[0] for row in cat_rows]
            
        cursor.close()
        conn.close()
        
        # 3. Partition blocks
        # BANNER_HERO first, Unknown last, standard blocks in middle
        first_blocks = []
        middle_blocks = []
        last_blocks = []
        
        known_types = {"banner_hero", "dynamic_collection", "product_grid_2x2"}
        
        for block in blocks:
            b_type = str(block.get("type", "")).lower()
            if b_type == "banner_hero":
                first_blocks.append(block)
            elif b_type in known_types:
                middle_blocks.append(block)
            else:
                last_blocks.append(block)
                
        # Sort middle blocks by preferred categories
        # Blocks matching categories higher in preferred_categories come first
        def get_sort_key(b):
            cat = get_block_category(b)
            if not cat:
                return 999  # Put uncategorized middle blocks at the end of middle section
            try:
                return preferred_categories.index(cat)
            except ValueError:
                return 100 + len(preferred_categories)
                
        middle_blocks_sorted = sorted(middle_blocks, key=get_sort_key)
        
        ordered_blocks = first_blocks + middle_blocks_sorted + last_blocks
        return RecommendResponse(orderedBlocks=ordered_blocks)
        
    except Exception as e:
        print("[Recommend] Error during recommendation, falling back to default order:", e)
        return RecommendResponse(orderedBlocks=blocks)
