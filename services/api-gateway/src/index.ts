import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';

import { query } from './config/db.js';
import { redis } from './config/redis.js';
import { generateToken } from './middleware/auth.js';

import homepageRouter from './routes/homepage.js';
import cartRouter from './routes/cart.js';
import campaignsRouter from './routes/campaigns.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Standard Middlewares
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// Auth token utility endpoint for testing
app.post('/api/v1/auth/token', (req: Request, res: Response) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, error: 'Missing userId', code: 400 });
  }
  const token = generateToken(userId);
  return res.json({ success: true, token });
});

// Mount routes under /api/v1
app.use('/api/v1', homepageRouter);
app.use('/api/v1', cartRouter);
app.use('/api/v1', campaignsRouter);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Unhandled Error]', err);
  const status = err.status || err.statusCode || 500;
  return res.status(status).json({
    success: false,
    error: err.message || 'Internal Server Error',
    code: status
  });
});

// Startup check for Database & Redis
async function startServer() {
  try {
    // 1. Connect to PostgreSQL
    const dbCheck = await query('SELECT NOW()');
    console.log('[Database] PostgreSQL connected successfully at:', dbCheck.rows[0].now);

    // 2. Connect to Redis
    const redisCheck = await redis.ping();
    console.log('[Redis] Redis ping response:', redisCheck);

    app.listen(PORT, () => {
      console.log(`[Server] API Gateway running on port ${PORT}`);
    });
  } catch (err) {
    console.error('[Server Startup Failure]', err);
    process.exit(1);
  }
}

startServer();
