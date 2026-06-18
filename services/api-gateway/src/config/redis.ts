import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl);

redis.on('error', (err) => {
  console.error('[Redis Error]', err);
});

export async function get<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return data as unknown as T;
    }
  } catch (err) {
    console.error(`[Redis Get Error] Key: ${key}`, err);
    return null;
  }
}

export async function set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await redis.set(key, stringValue, 'EX', ttlSeconds);
  } catch (err) {
    console.error(`[Redis Set Error] Key: ${key}`, err);
  }
}

export async function del(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (err) {
    console.error(`[Redis Del Error] Key: ${key}`, err);
  }
}
