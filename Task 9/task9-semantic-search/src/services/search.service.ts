import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";
import { getEmbedding } from "./embedding.service";

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL!, { maxRetriesPerRequest: 2 });
redis.on("error", (e) => console.error("Redis error:", e.message));

const CACHE_TTL_SECONDS = 3600;

export async function semanticSearch(query: string, limit = 5) {
  const normalized = query.toLowerCase().trim().replace(/\s+/g, " ");
  const cacheKey = `search:${limit}:${normalized}`;

  // 1. Redis first (skip embedding entirely on a hit)
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return { results: JSON.parse(cached), cached: true };
    }
  } catch (e) {
    console.error("Cache read failed, falling back to DB");
  }

  // 2. Embed the query
  const queryEmbedding = await getEmbedding(normalized);
  const vectorString = `[${queryEmbedding.join(",")}]`;

  // 3. Cosine similarity via pgvector (parameterized)
  const results = await prisma.$queryRawUnsafe(
    `
    SELECT id, name, description, price,
           1 - (embedding <=> $1::vector) AS similarity
    FROM "Product"
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> $1::vector
    LIMIT $2
    `,
    vectorString,
    limit
  );

  // 4. Cache with TTL
  try {
    await redis.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(results));
  } catch (e) {
    console.error("Cache write failed");
  }

  return { results, cached: false };
}