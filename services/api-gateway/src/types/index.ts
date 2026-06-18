export interface User {
  id: string;
  name: string;
  email: string;
  age_of_child_months: number | null;
  created_at: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  age_min_months: number | null;
  age_max_months: number | null;
  in_stock: boolean;
  embedding_synced: boolean;
  created_at: Date;
}

export interface Campaign {
  id: string;
  label: string;
  is_active: boolean;
  theme: {
    primary: string;
    background: string;
    accent: string;
    text: string;
  };
  overlay: {
    type: string;
    animation_url: string;
  } | null;
  featured_collection: {
    type: string;
    id: string;
    theme_label: string;
    category?: string;
  } | null;
  created_at: Date;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  added_at: Date;
  name?: string;
  price?: number;
  image_url?: string | null;
}

export interface UIBlock {
  type: string;
  id: string;
  [key: string]: any;
}

export interface SDUIPayload {
  theme: {
    primary: string;
    background: string;
    accent: string;
    text: string;
  };
  campaign: string | null;
  overlay: any | null;
  blocks: UIBlock[];
}
