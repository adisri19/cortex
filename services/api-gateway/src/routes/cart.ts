import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { query } from '../config/db.js';
import * as redisClient from '../config/redis.js';

const router = Router();

async function getCartCount(userId: string): Promise<number> {
  const result = await query('SELECT SUM(quantity) as count FROM cart_items WHERE user_id = $1', [userId]);
  return parseInt(result.rows[0].count || '0', 10);
}

// GET /api/v1/cart
router.get('/cart', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.userId!;
    const result = await query(
      `SELECT ci.id, ci.product_id, ci.quantity, ci.added_at, 
              p.name, p.price, p.image_url, p.category
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1`,
      [userId]
    );

    const items = result.rows.map(row => ({
      ...row,
      price: parseFloat(row.price)
    }));

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return res.json({
      success: true,
      items,
      total: parseFloat(total.toFixed(2))
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/cart/add
router.post('/cart/add', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.userId!;
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, error: 'Missing productId', code: 400 });
    }

    const qty = quantity !== undefined ? parseInt(quantity, 10) : 1;
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid quantity', code: 400 });
    }

    // Check if item already in cart
    const existing = await query(
      'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );

    if (existing.rows.length > 0) {
      const newQty = existing.rows[0].quantity + qty;
      await query('UPDATE cart_items SET quantity = $1 WHERE id = $2', [newQty, existing.rows[0].id]);
    } else {
      await query(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3)',
        [userId, productId, qty]
      );
    }

    // Invalidate user homepage cache
    await redisClient.del(`homepage:${userId}`);

    const cartCount = await getCartCount(userId);

    return res.json({
      success: true,
      cartCount
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/cart/remove
router.delete('/cart/remove', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.userId!;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, error: 'Missing productId', code: 400 });
    }

    await query('DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2', [userId, productId]);

    // Invalidate user homepage cache
    await redisClient.del(`homepage:${userId}`);

    const cartCount = await getCartCount(userId);

    return res.json({
      success: true,
      cartCount
    });
  } catch (err) {
    next(err);
  }
});

export default router;
