CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  age_of_child_months INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL,   -- 'snacks', 'toys', 'diapers', 'clothing', 'lunchboxes', 'tickets'
  image_url TEXT,
  age_min_months INTEGER,   -- minimum safe age in months
  age_max_months INTEGER,
  in_stock BOOLEAN DEFAULT true,
  embedding_synced BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE campaigns (
  id TEXT PRIMARY KEY,       -- 'back_to_school', 'summer_playhouse', 'mystery_carnival'
  label TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  theme JSONB NOT NULL,
  overlay JSONB,
  featured_collection JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  added_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  items JSONB NOT NULL,
  total NUMERIC(10,2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_age ON products(age_min_months, age_max_months);
CREATE INDEX idx_cart_user ON cart_items(user_id);
