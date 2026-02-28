-- ============================================
-- Akse Digital — Supabase Database Setup
-- Supabase SQL Editor'de çalıştırın
-- ============================================

-- 1. Contacts (İletişim Formu Mesajları)
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Customers (Müşteriler)
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  tax_no TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Settings (Site Ayarları)
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access
CREATE POLICY "Authenticated full access" ON contacts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON customers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON settings FOR ALL USING (auth.role() = 'authenticated');

-- Allow anonymous inserts for contact form
CREATE POLICY "Anon can insert contacts" ON contacts FOR INSERT WITH CHECK (true);

-- Allow anonymous reads for public settings
CREATE POLICY "Anon can read settings" ON settings FOR SELECT USING (true);
