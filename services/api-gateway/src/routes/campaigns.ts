import { Router, Response } from 'express';
import { query, getClient } from '../config/db.js';
import * as redisClient from '../config/redis.js';
import { Campaign } from '../types/index.js';

const router = Router();

// GET /api/v1/campaigns
router.get('/campaigns', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM campaigns ORDER BY created_at DESC');
    return res.json({
      success: true,
      campaigns: result.rows
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/campaigns/active
router.get('/campaigns/active', async (req, res, next) => {
  try {
    const cacheKey = 'campaign:active';
    const cached = await redisClient.get<Campaign>(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        campaign: cached,
        cached: true
      });
    }

    const result = await query('SELECT * FROM campaigns WHERE is_active = true LIMIT 1');
    if (result.rows.length === 0) {
      return res.json({
        success: true,
        campaign: null,
        cached: false
      });
    }

    const campaign = result.rows[0] as Campaign;
    await redisClient.set(cacheKey, campaign, 300); // 300s TTL

    return res.json({
      success: true,
      campaign,
      cached: false
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/campaigns/activate
router.post('/campaigns/activate', async (req, res, next) => {
  try {
    const { campaignId } = req.body;
    if (!campaignId) {
      return res.status(400).json({ success: false, error: 'Missing campaignId', code: 400 });
    }

    const client = await getClient();
    let updatedCampaign: Campaign;
    try {
      await client.query('BEGIN');
      await client.query('UPDATE campaigns SET is_active = false');
      const result = await client.query(
        'UPDATE campaigns SET is_active = true WHERE id = $1 RETURNING *',
        [campaignId]
      );
      if (result.rows.length === 0) {
        throw new Error('Campaign not found');
      }
      updatedCampaign = result.rows[0] as Campaign;
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    // Invalidate campaign active cache
    await redisClient.del('campaign:active');

    // Invalidate all homepage caches matching homepage:*
    const redis = redisClient.redis;
    let cursor = '0';
    do {
      const [newCursor, keys] = await redis.scan(cursor, 'MATCH', 'homepage:*', 'COUNT', 100);
      cursor = newCursor;
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== '0');

    return res.json({
      success: true,
      campaign: updatedCampaign
    });
  } catch (err: any) {
    if (err.message === 'Campaign not found') {
      return res.status(404).json({ success: false, error: 'Campaign not found', code: 404 });
    }
    next(err);
  }
});

export default router;
