// Theme
export interface ThemeConfig {
  primary: string;
  background: string;
  accent?: string;
  text?: string;
}

// Actions — discriminated union
export type ActionSchema =
  | { type: 'ADD_TO_CART'; payload: { id: string; name: string } }
  | { type: 'DEEP_LINK'; payload: { url: string } }
  | { type: 'APPLY_MYSTERY_GIFT_COUPON'; payload: { coupon_code: string } }
  | { type: 'BOOK_EVENT'; payload: { event_id: string; event_name: string } };

// Products
export interface ProductItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  action: ActionSchema;
}

export interface CollectionItem extends ProductItem {
  badge?: string;  // e.g. "BESTSELLER", "NEW"
}

// UI Blocks — discriminated union
export interface BannerHeroBlock {
  type: 'BANNER_HERO';
  id: string;
  image_url: string;
  title: string;
  subtitle?: string;
  action: ActionSchema;
}

export interface ProductGrid2x2Block {
  type: 'PRODUCT_GRID_2X2';
  id: string;
  title: string;
  products: ProductItem[];
}

export interface DynamicCollectionBlock {
  type: 'DYNAMIC_COLLECTION';
  id: string;
  theme_label: string;
  items: CollectionItem[];
}

export interface FullScreenOverlayBlock {
  type: 'FULL_SCREEN_OVERLAY';
  id: string;
  animation_url: string;
}

export type UIBlock = 
  | BannerHeroBlock 
  | ProductGrid2x2Block 
  | DynamicCollectionBlock 
  | FullScreenOverlayBlock;

// SDUI Payload
export interface SDUIPayload {
  theme: ThemeConfig;
  campaign: string | null;
  overlay: FullScreenOverlayBlock | null;
  blocks: UIBlock[];
}

// Cart
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (product: ProductItem) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

// Chat
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: ProductSuggestion[];
  timestamp: Date;
}

export interface ProductSuggestion {
  id: string;
  name: string;
  price: number;
  image_url: string;
  reason: string;
}
