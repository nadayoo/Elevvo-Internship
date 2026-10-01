# Backend Development Tasks: Elevvo Internship

This repository contains my solutions for four backend tasks from the Elevvo internship program.

| Task | Level | Topic | Folder |
|------|-------|-------|--------|
| 1 | Level 1 | Web Request Inspector & Raw HTTP Server | `task1-http-server/` |
| 2 | Level 1 | Fault-Tolerant Async Data Engine | `task2-async-engine/` |
| 3 | Level 2 | Observability & Modular Express API | `task3-express-api/` |
| 9 | Industry | AI-Powered Semantic Search & Vector Embedding Pipeline | `task9-semantic-search/` |

> **Prerequisites for all tasks:** Node.js 20+ and npm. Each task is a separate project, so run `npm install` inside the task folder before anything else.

---

## Task 1: Web Request Inspector & Raw HTTP Server

A web server built with only Node's built-in `http` module (no Express or other frameworks).

### Features
- `GET /` returns a JSON welcome payload (`200 OK`)
- `GET /api/users` returns a JSON list of users (`200 OK`)
- Any unknown route returns a JSON error (`404 Not Found`)
- All responses send `Content-Type: application/json`
- **Bonus:** `GET /api/health` returns server uptime, OS platform and an ISO timestamp

### Run

```bash
cd task1-http-server
npm install
npm start
```

The server listens on `http://localhost:3000`.

### Try it

```bash
curl http://localhost:3000/
curl http://localhost:3000/api/users
curl http://localhost:3000/api/health
curl -i http://localhost:3000/does-not-exist   # 404
```

### Inspecting requests
Open browser DevTools → **Network** tab (or use Postman) to inspect request headers, methods, status codes and the `Content-Type` header on each response.

### Topics covered
HTTP lifecycle, client-server architecture, status codes, JSON payloads, native Node routing.

---

## Task 2: Fault-Tolerant Async Data Engine

A TypeScript data engine that queries several public APIs at the same time. One failing endpoint never stops the others.

### Features
- Strict `tsconfig.json` (`noImplicitAny: true`, `strictNullChecks: true`)
- Parallel requests with `Promise.allSettled()` using native `fetch`
- Raw API responses are mapped into typed domain interfaces, with no `any`
- Failed requests are isolated and logged, and the engine still returns the processed data from the successful ones
- **Bonus:** run with `UV_THREADPOOL_SIZE=8` and compare execution times

### Run

```bash
cd task2-async-engine
npm install
npm start
```

### Bonus: thread pool comparison

```bash
# Windows (PowerShell)
$env:UV_THREADPOOL_SIZE=8; npm start

# macOS / Linux
UV_THREADPOOL_SIZE=8 npm start
```

| Run | `UV_THREADPOOL_SIZE` | Execution time |
|-----|----------------------|----------------|
| Default | 4 | _fill in_ ms |
| Bonus | 8 | _fill in_ ms |

### Topics covered
V8 and libuv architecture, strict TypeScript, `Promise.allSettled`, domain interfaces, asynchronous error isolation.

---

## Task 3: Observability & Modular Express API

A TypeScript Express API with a clean separation of concerns.

### Architecture

```
src/
├── routes/        # URL → controller mapping
├── controllers/   # HTTP layer: parse request, send response
├── services/      # Business logic and data access
├── middleware/    # Observability logger, API key check
└── index.ts       # App entry point
```

### Features
- **Observability middleware:** logs every request with ISO timestamp, HTTP method, URL path and processing time in ms
- **CRUD on `/api/users`** with `express.json()` body parsing
- **Bonus:** `requireAPIKey` middleware checks the `x-api-key` header and returns a `401 Unauthorized` JSON error if it is missing or wrong

### Environment variables
Create a `.env` file (see `.env.example`):

```dotenv
PORT=3000
API_KEY=your-secret-key
```

### Run

```bash
cd task3-express-api
npm install
npm run dev
```

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get one user |
| POST | `/api/users` | Create a user |
| PUT | `/api/users/:id` | Update a user |
| DELETE | `/api/users/:id` | Delete a user |

### Try it

```bash
curl -H "x-api-key: your-secret-key" http://localhost:3000/api/users

curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-key" \
  -d '{"name":"Nada","email":"nada@example.com"}'

# Missing key → 401
curl -i http://localhost:3000/api/users
```

Sample log line from the observability middleware:

```
[2026-10-01T10:15:30.123Z] GET /api/users 4ms
```

### Topics covered
Express framework, modular routing, custom middleware pipelines, controller-service pattern, observability logging.

---

## Task 9: AI-Powered Semantic Search & Vector Embedding Pipeline

A product search API that understands **meaning** instead of matching keywords. Searching for "warm lightweight jacket for winter hiking" returns jackets and hiking boots even if those exact words never appear in the product text. It also works across **Arabic and English**.

### How it works

```
Query ──► Redis cache ──hit──► return results
              │ miss
              ▼
   Sentence Transformer (384-dim embedding)
              │
              ▼
   PostgreSQL + pgvector (cosine similarity)
              │
              ▼
   Cache results in Redis (TTL 1 hour) ──► return results
```

1. Product name and description are converted into **384-dimensional vectors** with a multilingual sentence-transformer model and stored in PostgreSQL using the `pgvector` extension.
2. A search query is embedded with the same model.
3. pgvector finds the closest products using cosine distance (`<=>`).
4. Results are cached in Redis with a TTL, so repeated queries skip the embedding and the database entirely.

### Tech stack

| Layer | Technology |
|-------|------------|
| Language / server | TypeScript, Express.js |
| Embeddings | `@huggingface/transformers` with `Xenova/paraphrase-multilingual-MiniLM-L12-v2` |
| Vector storage | PostgreSQL + `pgvector` (hosted on Neon) |
| ORM / client | Prisma (raw SQL for vector operations) |
| Cache | Redis (hosted on Upstash, TLS via `rediss://`) |

### Why this model?
- **Free and local:** runs in Node.js with no API key or billing, unlike OpenAI embeddings.
- **Multilingual:** Arabic and English text land in the same vector space, so the bonus requirement works with no translation step. The model never translates. It compares meaning directly.
- **Small:** 384 dimensions and about 100 MB, which keeps embedding and storage fast.

### Project structure

```
task9-semantic-search/
├── src/
│   ├── index.ts                    # Express app, model warm-up, search UI at /
│   ├── seed.ts                     # Embeds and inserts sample products
│   ├── services/
│   │   ├── embedding.service.ts    # Local embedding model
│   │   └── search.service.ts       # Cache-aside + pgvector search
│   └── routes/
│       └── products.routes.ts      # GET /api/products/search
├── prisma/
│   └── schema.prisma
├── .env.example
└── package.json
```

### Setup

**1. Install dependencies**

```bash
cd task9-semantic-search
npm install
```

**2. Configure environment variables**

Copy `.env.example` to `.env` and fill in your values (save the file as **UTF-8**):

```dotenv
# Neon pooled connection (hostname contains "-pooler"), used by the app
DATABASE_URL="postgresql://USER:PASSWORD@HOST-pooler/neondb?sslmode=require"

# Neon direct connection (no "-pooler"), used by Prisma for schema changes
DIRECT_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"

# Upstash Redis, must start with rediss:// (TLS)
REDIS_URL="rediss://default:PASSWORD@HOST:6379"

PORT=3000
```

> `REDIS_URL` must contain only the URL, not a full `redis-cli` command.

**3. Enable pgvector on Neon**

Run once in the Neon SQL Editor:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

**4. Create the table**

```bash
npx prisma db push
npx prisma generate
```

The embedding column is `vector(384)`, which must match the model's output size.

**5. Seed sample products**

```bash
npx ts-node --transpile-only src/seed.ts
```

This inserts 15 products (English and Arabic). The first run downloads the model (about 100 MB), which is then cached.

**6. Start the server**

```bash
npx ts-node --transpile-only src/index.ts
```

The model is loaded at startup, so the first search is not slowed down by it.

### API

#### `GET /api/products/search?q=<query>`

| Parameter | Description |
|-----------|-------------|
| `q` | Natural-language query in English or Arabic (required) |

Example response:

```json
{
  "query": "warm lightweight jacket for winter hiking",
  "cached": false,
  "took_ms": 3005,
  "results": [
    {
      "id": "7cf296ac-6489-415b-8168-cc89ed52f7a0",
      "name": "Warm Lightweight Jacket",
      "description": "Perfect for winter hiking, waterproof and breathable",
      "price": 89.99,
      "similarity": 0.908
    }
  ]
}
```

- `cached`: `true` when the result came from Redis
- `took_ms`: server-side processing time
- `similarity`: cosine similarity (closer to 1 means more relevant)

#### `GET /health`
Returns `{ "status": "ok" }`.

A simple search page is also served at `http://localhost:3000/` for quick manual testing.

### Example queries

```bash
# English
curl "http://localhost:3000/api/products/search?q=warm%20lightweight%20jacket%20for%20winter%20hiking"

# Arabic: "warm jacket for winter"
curl "http://localhost:3000/api/products/search?q=%D8%AC%D8%A7%D9%83%D9%8A%D8%AA%20%D8%AF%D8%A7%D9%81%D8%A6%20%D9%84%D9%84%D8%B4%D8%AA%D8%A7%D8%A1"

# Meaning-based, no matching keywords
curl "http://localhost:3000/api/products/search?q=something%20to%20listen%20to%20music"
```

### Performance and caching

| Request | `cached` | `took_ms` |
|---------|----------|-----------|
| First query (cold: wakes Neon, opens TLS connections, embeds the query) | `false` | ~3000 ms |
| Same query again (warm) | `true` | _fill in_ ms |

- Cache keys are built from the normalized query (lowercased, trimmed, whitespace collapsed).
- On a cache hit the embedding model and database are never touched.
- Results are cached for 1 hour (`CACHE_TTL_SECONDS` in `search.service.ts`).
- If Redis is unavailable, the API falls back to querying PostgreSQL directly.

> **Note on the 100 ms target:** the database (Neon, `us-east-2`) and Redis (Upstash) are hosted remotely, so network round-trip time is included in `took_ms`. Latency depends on the distance between the server and the cache region.

### Bonus: multilingual support
Arabic and English queries are handled by the multilingual model with no translation layer. An Arabic query can match English products and the other way around, because both languages map to the same vector space. Cross-language similarity scores are naturally a bit lower than same-language ones, but the ranking stays correct.

### Security notes
- Never commit `.env`. It is listed in `.gitignore`.
- Rotate database and Redis credentials if they are ever exposed.

### Topics covered
Vector search, semantic retrieval, sentence transformers, embedding pipelines, high-performance vector caching.

---

## Author

**Nada Wael** Elevvo Backend Development Internship
