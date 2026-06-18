import { UIBlock } from '../types/index.js';
import dotenv from 'dotenv';

dotenv.config();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export async function personalizeBlocks(blocks: UIBlock[], userId: string): Promise<UIBlock[]> {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks, userId }),
      signal: AbortSignal.timeout(2000) // 2 second timeout
    });

    if (!response.ok) throw new Error(`AI service returned status ${response.status}`);

    const data = (await response.json()) as { orderedBlocks: UIBlock[] };
    return data.orderedBlocks;
  } catch (err: any) {
    console.warn('[Personalizer] Falling back to default order:', err.message || err);
    return blocks;
  }
}
