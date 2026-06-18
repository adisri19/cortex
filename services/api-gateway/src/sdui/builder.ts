import { query } from '../config/db.js';
import * as redisClient from '../config/redis.js';
import { Campaign, SDUIPayload, UIBlock } from '../types/index.js';
import { personalizeBlocks } from './personalizer.js';

export async function getActiveCampaign(): Promise<Campaign | null> {
  const cacheKey = 'campaign:active';
  const cached = await redisClient.get<Campaign>(cacheKey);
  if (cached) {
    return cached;
  }

  const result = await query('SELECT * FROM campaigns WHERE is_active = true LIMIT 1');
  if (result.rows.length === 0) {
    return null;
  }

  const campaign = result.rows[0] as Campaign;
  await redisClient.set(cacheKey, campaign, 300); // 300s TTL
  return campaign;
}

export async function getUserById(userId: string) {
  const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function getProductsByCategory(category: string, ageMonths?: number | null) {
  let dbCategory = category;
  if (category === 'event tickets') {
    dbCategory = 'tickets';
  }

  let baseSql = 'SELECT * FROM products WHERE category = $1 AND in_stock = true';
  const params: any[] = [dbCategory];

  if (ageMonths !== undefined && ageMonths !== null) {
    const ageSql = baseSql + ' AND age_min_months <= $2 AND age_max_months >= $2 ORDER BY created_at DESC';
    const ageResult = await query(ageSql, [...params, ageMonths]);
    if (ageResult.rows.length > 0) {
      return ageResult.rows;
    }
  }

  const sql = baseSql + ' ORDER BY created_at DESC';
  const result = await query(sql, params);
  return result.rows;
}

function productToCollectionItem(p: any) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: typeof p.price === 'number' ? p.price : parseFloat(p.price),
    category: p.category,
    image_url: p.image_url,
    age_min_months: p.age_min_months,
    age_max_months: p.age_max_months,
    in_stock: p.in_stock
  };
}

function productToGridItem(p: any) {
  return productToCollectionItem(p);
}

export async function buildHomepagePayload(userId: string): Promise<SDUIPayload> {
  // 1. Fetch active campaign
  const campaign = await getActiveCampaign();

  // 2. Fetch user profile
  const user = await getUserById(userId);
  const childAgeMonths = user ? user.age_of_child_months : null;

  // 3. Build base blocks
  const blocks: UIBlock[] = [];

  // Block 1: BANNER_HERO
  blocks.push({
    type: 'BANNER_HERO',
    id: 'hero_main',
    image_url: (campaign as any)?.banner_url ?? (campaign ? `https://picsum.photos/seed/campaign_${campaign.id}/800/400` : 'https://picsum.photos/seed/kiddo/800/400'),
    title: campaign?.label ?? 'Welcome to Kiddo',
    subtitle: 'The best for your kiddo, delivered in minutes',
    action: { type: 'DEEP_LINK', payload: { url: '/campaign/' + (campaign?.id ?? 'none') } }
  });

  // Block 2: DYNAMIC_COLLECTION - snacks
  const snacks = await getProductsByCategory('snacks', childAgeMonths);
  blocks.push({
    type: 'DYNAMIC_COLLECTION',
    id: 'snacks_row',
    theme_label: 'Snacks for Kids',
    items: snacks.slice(0, 10).map(productToCollectionItem)
  });

  // Block 3: PRODUCT_GRID_2X2 - diapers
  const diapers = await getProductsByCategory('diapers');
  blocks.push({
    type: 'PRODUCT_GRID_2X2',
    id: 'diapers_grid',
    title: 'Diaper Essentials',
    products: diapers.slice(0, 4).map(productToGridItem)
  });

  // Block 4: Campaign featured collection
  if (campaign?.featured_collection) {
    let fcCategory = (campaign.featured_collection as any).category;
    if (!fcCategory) {
      if (campaign.id === 'back_to_school') fcCategory = 'lunchboxes';
      else if (campaign.id === 'summer_playhouse') fcCategory = 'tickets';
      else if (campaign.id === 'mystery_carnival') fcCategory = 'toys';
      else fcCategory = 'toys';
    }

    const featuredProducts = await getProductsByCategory(fcCategory);
    blocks.push({
      type: campaign.featured_collection.type,
      id: campaign.featured_collection.id,
      theme_label: campaign.featured_collection.theme_label,
      items: featuredProducts.slice(0, 8).map(productToCollectionItem)
    });
  }

  // Block 5: PRODUCT_GRID_2X2 - toys
  const toys = await getProductsByCategory('toys', childAgeMonths);
  blocks.push({
    type: 'PRODUCT_GRID_2X2',
    id: 'toys_grid',
    title: "Toys They'll Love",
    products: toys.slice(0, 4).map(productToGridItem)
  });

  // Block 6: DYNAMIC_COLLECTION - event tickets
  const events = await getProductsByCategory('event tickets');
  blocks.push({
    type: 'DYNAMIC_COLLECTION',
    id: 'events_row',
    theme_label: 'Weekend Activities',
    items: events.map(productToCollectionItem)
  });

  // Block 7: Intentional unknown block
  blocks.push({
    type: 'NEW_COMPONENT_V2',
    id: 'unknown_test_block',
    data: {}
  });

  // 4. Personalize block order
  const personalizedBlocks = await personalizeBlocks(blocks, userId);

  return {
    theme: campaign?.theme ?? { primary: '#FF9933', background: '#FFF5E6', accent: '#FFCC99', text: '#1A1A1A' },
    campaign: campaign?.id ?? null,
    overlay: campaign?.overlay ?? null,
    blocks: personalizedBlocks
  };
}
