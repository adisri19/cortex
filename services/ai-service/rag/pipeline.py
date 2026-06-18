import os
import re
import json
import psycopg2
from langchain_openai import ChatOpenAI
from langchain.schema import SystemMessage, HumanMessage, AIMessage
from .retriever import retrieve_relevant_products

llm = ChatOpenAI(model='gpt-4o', temperature=0.3)

async def run_chat_pipeline(
    messages: list,
    user_id: str,
    child_age_months: int | None
) -> tuple[str, list]:
    """
    Full RAG pipeline:
    
    1. Extract search intent from last user message
    2. Call retrieve_relevant_products() with query + age filter
    3. Format retrieved products as context string:
       "Available products:\n" + JSON of products
    4. Load system prompt from kiddo_system.txt
    5. Build message chain:
       [SystemMessage(prompt + context), ...history, HumanMessage(last_msg)]
    6. Call GPT-4o
    7. Parse the ```suggestions JSON block from response
    8. Return (clean_reply_text, parsed_suggestions_list)
    
    If parsing suggestions fails, return (full_reply, [])
    Never let pipeline errors reach the user — catch all, return fallback message.
    """
    try:
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
        ai_msg = await llm.ainvoke(langchain_messages)
        reply_text = ai_msg.content

        # 7. Parse the ```suggestions JSON block
        pattern = r"```suggestions\s*(.*?)\s*```"
        match = re.search(pattern, reply_text, re.DOTALL)
        
        parsed_suggestions = []
        clean_reply = reply_text

        if match:
            # Strip suggestions block from reply text so raw JSON isn't rendered in the UI
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
                # Fallback to empty list but keep the reply
                
        return (clean_reply, parsed_suggestions)

    except Exception as e:
        print("[Pipeline] Unhandled pipeline exception:", e)
        return ("I'm sorry, I encountered an issue while searching our store catalog. Please ask again in a moment!", [])
