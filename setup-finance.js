const fs = require("fs");

async function main() {
  const env = fs.readFileSync(".env.local", "utf8");
  const dbUrl = env.match(/DATABASE_URL=(.+)/)?.[1]?.trim();
  const Client = require("pg").Client;
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log("Connected!");

  const queries = [
    `CREATE TABLE IF NOT EXISTS admin_users (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      phone TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT DEFAULT '',
      email TEXT DEFAULT '',
      avatar_url TEXT DEFAULT '',
      role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
      created_at TIMESTAMPTZ DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS customer_users (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      phone TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT DEFAULT '',
      email TEXT DEFAULT '',
      company TEXT DEFAULT '',
      avatar_url TEXT DEFAULT '',
      customer_id UUID,
      created_at TIMESTAMPTZ DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS shared_files (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      customer_user_id UUID REFERENCES customer_users(id) ON DELETE CASCADE,
      file_name TEXT NOT NULL,
      drive_file_id TEXT NOT NULL,
      drive_url TEXT,
      shared_at TIMESTAMPTZ DEFAULT now()
    )`,
    `ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE customer_users ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE shared_files ENABLE ROW LEVEL SECURITY`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='admin_users' AND policyname='Service admin_users') THEN CREATE POLICY "Service admin_users" ON admin_users FOR ALL TO service_role USING (true) WITH CHECK (true); END IF; END $$`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='customer_users' AND policyname='Service customer_users') THEN CREATE POLICY "Service customer_users" ON customer_users FOR ALL TO service_role USING (true) WITH CHECK (true); END IF; END $$`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='shared_files' AND policyname='Service shared_files') THEN CREATE POLICY "Service shared_files" ON shared_files FOR ALL TO service_role USING (true) WITH CHECK (true); END IF; END $$`,
  ];

  for (const q of queries) {
    try {
      await client.query(q);
      console.log("✓", q.substring(0, 55).replace(/\n/g, " ").trim());
    } catch (err) {
      console.log("✗", err.message.substring(0, 100));
    }
  }

  // Create default admin user (phone: 05551234567, password: admin123)
  const bcrypt = require("bcryptjs");
  const hash = await bcrypt.hash("admin123", 10);
  try {
    await client.query(
      `INSERT INTO admin_users (phone, password_hash, name, email, role) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (phone) DO NOTHING`,
      ["05551234567", hash, "Admin", "info@aksedigital.com", "super_admin"]
    );
    console.log("✓ Default admin user created (05551234567 / admin123)");
  } catch (err) {
    console.log("✗ Admin user:", err.message.substring(0, 100));
  }

  await client.end();
  console.log("\n✅ Auth tables created!");
}

main().catch(console.error);
