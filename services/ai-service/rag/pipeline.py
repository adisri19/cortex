import os
import re
import json
import psycopg2
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from .retriever import retrieve_relevant_products

_llm = None

def get_llm():
    global _llm
    if _llm is None:
        _llm = ChatOpenAI(model='gpt-4o', temperature=0.3)
    return _llm


async def get_mock_response(messages: list, child_age_months: int | None) -> tuple[str, list]:
    """
    Intelligent local fallback responder.
    Queries PostgreSQL for actual seed database products based on user intent keywords.
    Returns correct clickable products suited to child age.
    """
    if not messages:
        return ("Hello! How can I help you and your kiddo today?", [])
        
    last_msg = messages[-1]
    last_content = last_msg.content if hasattr(last_msg, "content") else last_msg["content"]
    last_content_lower = last_content.lower()

    # Detect product categories based on user keywords
    category = None
    if any(k in last_content_lower for k in ["snack", "eat", "food", "strawberry", "puff", "ragi"]):
        category = "snacks"
    elif any(k in last_content_lower for k in ["diaper", "pant", "pampers", "huggies", "dry"]):
        category = "diapers"
    elif any(k in last_content_lower for k in ["toy", "block", "play", "game", "puzzle", "teether"]):
        category = "toys"
    elif any(k in last_content_lower for k in ["lunch", "bag", "tiffin", "box", "sipper", "backpack"]):
        category = "lunchboxes"
    elif any(k in last_content_lower for k in ["cloth", "wear", "dress", "romper", "suit"]):
        category = "clothing"
    elif any(k in last_content_lower for k in ["ticket", "zoo", "class", "event", "gym"]):
        category = "tickets"

    db_url = os.environ.get('DATABASE_URL')
    suggestions = []
    
    if db_url:
        try:
            conn = psycopg2.connect(db_url)
            cursor = conn.cursor()
            
            # Query matching products from PostgreSQL
            if category:
                query_str = "SELECT id, name, price, image_url FROM products WHERE category = %s"
                params = [category]
                if child_age_months is not None:
                    query_str += " AND age_min_months <= %s AND age_max_months >= %s"
                    params.extend([child_age_months, child_age_months])
                query_str += " LIMIT 3"
                cursor.execute(query_str, tuple(params))
            else:
                # search query string
                cursor.execute(
                    "SELECT id, name, price, image_url FROM products WHERE name ILIKE %s OR description ILIKE %s LIMIT 3",
                    (f"%{last_content}%", f"%{last_content}%")
                )
                
            rows = cursor.fetchall()
            
            # Fallback to random popular products if search is empty
            if not rows:
                cursor.execute("SELECT id, name, price, image_url FROM products LIMIT 3")
                rows = cursor.fetchall()
                
            for row in rows:
                suggestions.append({
                    "id": row[0],
                    "name": row[1],
                    "price": float(row[2]) if row[2] is not None else 0.0,
                    "image_url": row[3] if row[3] else "",
                    "reason": "Top-rated age-appropriate option" if category else "Popular choice for toddlers"
                })
                
            cursor.close()
            conn.close()
        except Exception as e:
            print("[MockChat] DB query failed:", e)

    # Custom responses
    if category == "snacks":
        reply = "Here are some nutritious, organic snacks perfect for toddlers and children. They are low in sugar and easy to eat:"
    elif category == "diapers":
        reply = "I recommend these comfortable, highly absorbent diapers to keep your baby clean and dry:"
    elif category == "toys":
        reply = "Here are some eco-friendly wooden toys and activities to boost motor and cognitive skills:"
    elif category == "lunchboxes":
        reply = "Here are leak-proof steel tiffins, bottles, and school bags suitable for children:"
    elif category == "clothing":
        reply = "Here is some comfortable cotton clothing, dungarees, and sunhat sets:"
    elif category == "tickets":
        reply = "Here are entry tickets to interactive petting zoos, music classes, and playground events:"
    else:
        reply = "I can help you find baby essentials, healthy snacks, organic toys, and ticket bookings! Try asking about 'snacks', 'toys', or 'diapers' to see matching products!"

    return (reply, suggestions)


async def run_chat_pipeline(
    messages: list,
    user_id: str,
    child_age_months: int | None
) -> tuple[str, list]:
    """
    Full RAG pipeline with instant local mock fallback for API key resilience.
    """
    try:
        # Check if OpenAI credentials are set up
        openai_key = os.environ.get("OPENAI_API_KEY", "")
        if not openai_key or openai_key.startswith("sk-..."):
            # Redirect immediately to functional mock responder
            return await get_mock_response(messages, child_age_months)

        if not messages:
            return ("Hello! How can I help you and your kiddo today?", [])

        # 1. Extract search intent
        last_msg = messages[-1]
        last_content = last_msg.content if hasattr(last_msg, "content") else last_msg["content"]

        # 2. Retrieve relevant products with metadata filtering by age
        retrieved_products = retrieve_relevant_products(
            query=last_content,
            child_age_months=child_age_months,
            top_k=5
        )

        # 3. Format context string
        context_str = "\nAvailable products in our catalog:\n" + json.dumps(retrieved_products, indent=2)

        # 4. Load system prompt
        prompt_path = os.path.join(os.path.dirname(__file__), "..", "prompts", "kiddo_system.txt")
        with open(prompt_path, "r", encoding="utf-8") as f:
            system_prompt_content = f.read()

        system_message_text = system_prompt_content + context_str

        # 5. Build message chain
        langchain_messages = [SystemMessage(content=system_message_text)]

        # Map conversation history
        for msg in messages[:-1]:
            role = msg.role if hasattr(msg, "role") else msg["role"]
            content = msg.content if hasattr(msg, "content") else msg["content"]
            if role == "user":
                langchain_messages.append(HumanMessage(content=content))
            else:
                langchain_messages.append(AIMessage(content=content))

        # Add the final human message
        langchain_messages.append(HumanMessage(content=last_content))

        # 6. Call GPT-4o
        llm = get_llm()
        ai_msg = await llm.ainvoke(langchain_messages)
        reply_text = ai_msg.content

        # 7. Parse the ```suggestions JSON block
        pattern = r"```suggestions\s*(.*?)\s*```"
        match = re.search(pattern, reply_text, re.DOTALL)
        
        parsed_suggestions = []
        clean_reply = reply_text

        if match:
            # Strip suggestions block from reply text
            clean_reply = re.sub(pattern, "", reply_text, flags=re.DOTALL).strip()
            
            json_str = match.group(1).strip()
            try:
                raw_suggestions = json.loads(json_str)
                
                # Resolve full product details from PostgreSQL
                db_url = os.environ.get('DATABASE_URL')
                if db_url and raw_suggestions:
                    conn = psycopg2.connect(db_url)
                    cursor = conn.cursor()
                    
                    for item in raw_suggestions:
                        p_id = item.get("id")
                        reason = item.get("reason", "")
                        if p_id:
                            cursor.execute("SELECT name, price, image_url FROM products WHERE id = %s", (p_id,))
                            row = cursor.fetchone()
                            if row:
                                parsed_suggestions.append({
                                    "id": p_id,
                                    "name": row[0],
                                    "price": float(row[1]) if row[1] is not None else 0.0,
                                    "image_url": row[2] if row[2] else "",
                                    "reason": reason
                                })
                    cursor.close()
                    conn.close()
            except Exception as e:
                print("[Pipeline] Error parsing suggestions block:", e)
                
        return (clean_reply, parsed_suggestions)

    except Exception as e:
        print("[Pipeline] Unhandled pipeline exception, falling back to mock:", e)
        # Fallback to local database search responder
        return await get_mock_response(messages, child_age_months)
