# Kiddo App Monorepo

Welcome to the **Kiddo** workspace. This repository contains the complete codebase for the Kiddo ecosystem: a Server-Driven UI (SDUI) React Native (Expo) app, an Express API Gateway, a Python FastAPI AI RAG Service, and database definitions.

---

## Architecture Diagram

```
+-----------------------------------------------------------------+
|                          Mobile Client                          |
|                       (React Native + Expo)                     |
+-------------------------------+---------------------------------+
                                |
             HTTP (SDUI JSON)   |    HTTP (Chat RAG)
             & Cart Actions     |    & Recommendations
                                v
+-----------------------------------------------------------------+
|                           API Gateway                           |
|                        (Node.js + Express)                      |
+-------+-----------------------+-----------------------+---------+
        |                       |                       |
        v                       v                       v
+-------+----+            +-----+-----+           +-----+-----+
| PostgreSQL |            |   Redis   |           | AI Service|
|  Database  |            |   Cache   |           | (FastAPI) |
+------------+            +-----------+           +-----+-----+
                                                        |
                                          +-------------+-------------+
                                          |                           |
                                          v                           v
                                    +-----+------+              +-----+-----+
                                    | OpenAI API |              |  Pinecone |
                                    | (Embed/LLM)|              | Vector DB |
                                    +------------+              +-----------+
```

---

## Core System Flows

### 1. Server-Driven UI (SDUI) Flow
1. **Request**: The Mobile Client requests the current layout configuration from `GET /api/v1/homepage`.
2. **Context Assembly**: The API Gateway fetches the active campaign details and the requesting user's profile metadata (e.g. child age) from PostgreSQL.
3. **Age & Theme Filtering**: The Gateway builds a list of UI blocks (Banners, Diapers, Toys, Tickets, etc.). It filters products based on child age appropriateness (e.g. only showing toys suitable for a 10-month-old child). If a campaign is active, the campaign's custom styling is dynamically injected.
4. **AI Personalization Hook**: The Gateway posts the assembled list of UI blocks to the Python AI Service `POST /recommend`. The AI Service checks the user's past purchase history and boosts block rows containing preferred categories to the top (while ensuring hero banners remain first and unknown blocks last).
5. **Response & Render**: The final ordered list of blocks, along with the active campaign theme tokens and full-screen overlay animations, is returned to the client. The client uses a strict, hashmap-based component registry to resolve block types to components (BannerHero, ProductGrid2x2, DynamicCollection, etc.) and render them with zero-flicker performance.

### 2. Conversational RAG Pipeline
1. **Message Input**: The parent asks the assistant a question (e.g. "Suggest some snacks for my 10m old baby") inside `ChatScreen`.
2. **Query Embedding**: The message history and query are posted to the FastAPI service at `POST /chat`. The service uses OpenAI's `text-embedding-3-small` model to embed the user query.
3. **Vector Database Retrieval**: The embedding is queried against Pinecone. If a child age limit is set, a Pinecone metadata range query filter (`age_min_months <= childAge <= age_max_months`) is applied to fetch only age-appropriate products.
4. **Context Injection**: The top 5 matching product catalogs are serialized to JSON and injected into the LLM system prompt along with safety constraints (allergen checks, word counts, and formatting templates).
5. **GPT-4o Execution**: The LLM compiles the dialogue response and outputs the product IDs inside a custom JSON block: ````suggestions ... ````.
6. **Hydration & Output**: The Python service parses the suggestions list, queries PostgreSQL to hydrate product details (`name`, `price`, `image_url`), strips the raw JSON block from the conversation dialogue to avoid rendering issues, and returns a clean chat reply with suggested product cards.

---

## Setup & Running Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.11.0 or higher
- **Docker**: Desktop or CLI
- **API Keys**: OpenAI API Key and Pinecone Vector Database index credentials

---

### 2. Startup Steps

#### Step 1: Start Database Services
Spin up PostgreSQL and Redis instances in the background:
```bash
docker-compose -f services/api-gateway/docker-compose.yml up -d
```

#### Step 2: Initialize Database Schema and Seeds
Inject tables and 50 realistic product catalog seeds into Postgres:
```bash
# Set PG password env or pass directly
psql -h localhost -U kiddo_user -d kiddo < database/schema.sql
psql -h localhost -U kiddo_user -d kiddo < database/seed.sql
```

#### Step 3: Run API Gateway
Initialize environment variables, install packages and start the dev server:
```bash
cd services/api-gateway
cp .env.example .env
npm install
npm run dev
```

#### Step 4: Run AI Service
Configure keys, setup dependencies, and launch FastAPI:
```bash
cd services/ai-service
cp .env.example .env
# Set your OPENAI_API_KEY, PINECONE_API_KEY and PINECONE_INDEX_NAME inside .env
pip install -r requirements.txt
uvicorn main:app --port 8000 --reload
```

#### Step 5: Generate Product Embeddings
Bootstrap the vector database index by generating and syncing embeddings for all products:
```bash
curl -X POST http://localhost:8000/embed/products -H "Content-Type: application/json" -d "{}"
```

#### Step 6: Run Mobile Client
Start the Expo packager and load the client in an emulator or the Expo Go mobile app:
```bash
cd apps/mobile
cp .env.example .env
npm install
npx expo start
```
