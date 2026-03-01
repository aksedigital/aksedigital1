-- =============================================
-- FİNANS YÖNETİM SİSTEMİ - Supabase SQL
-- =============================================

-- 1. Gelir/Gider Kategorileri
CREATE TABLE IF NOT EXISTS finance_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'Tag',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Gelir/Gider İşlemleri
CREATE TABLE IF NOT EXISTS finance_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category_id UUID REFERENCES finance_categories(id) ON DELETE SET NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  customer_name TEXT,
  invoice_no TEXT,
  payment_method TEXT DEFAULT 'havale' CHECK (payment_method IN ('nakit', 'havale', 'kart', 'cek', 'diger')),
  status TEXT DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'overdue')),
  recurring BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Stok Takibi
CREATE TABLE IF NOT EXISTS finance_stock (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT,
  category TEXT,
  quantity INTEGER DEFAULT 0,
  unit TEXT DEFAULT 'adet',
  buy_price DECIMAL(12,2) DEFAULT 0,
  sell_price DECIMAL(12,2) DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  supplier TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Politikaları
ALTER TABLE finance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_stock ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated" ON finance_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON finance_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON finance_stock FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Service role full access
CREATE POLICY "Service role full access" ON finance_categories FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON finance_transactions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON finance_stock FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Varsayılan Kategoriler
INSERT INTO finance_categories (name, type, color, icon) VALUES
  ('Web Tasarım', 'income', '#6366f1', 'Globe'),
  ('SEO Hizmeti', 'income', '#8b5cf6', 'Search'),
  ('Sosyal Medya', 'income', '#ec4899', 'Share2'),
  ('Danışmanlık', 'income', '#14b8a6', 'MessageSquare'),
  ('Hosting/Domain', 'income', '#f59e0b', 'Server'),
  ('Diğer Gelir', 'income', '#22c55e', 'Plus'),
  ('Maaş', 'expense', '#ef4444', 'Users'),
  ('Ofis Gideri', 'expense', '#f97316', 'Building'),
  ('Yazılım Lisans', 'expense', '#3b82f6', 'Key'),
  ('Reklam', 'expense', '#a855f7', 'Megaphone'),
  ('Vergi', 'expense', '#dc2626', 'FileText'),
  ('Diğer Gider', 'expense', '#6b7280', 'Minus');
