import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import * as redisClient from '../config/redis.js';
import { buildHomepagePayload } from '../sdui/builder.js';
import { SDUIPayload } from '../types/index.js';

const router = Router();

router.get('/homepage', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.userId!;
    const cacheKey = `homepage:${userId}`;

    // Redis cache check
    const cached = await redisClient.get<SDUIPayload>(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true
      });
    }

    // Cache miss
    const payload = await buildHomepagePayload(userId);
    await redisClient.set(cacheKey, payload, 60); // TTL 60 seconds

    return res.json({
      success: true,
      data: payload,
      cached: false
    });
  } catch (err) {
    next(err);
  }
});

export default router;
