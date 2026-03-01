const bcrypt = require("bcryptjs");
const fs = require("fs");
const { Client } = require("pg");

async function main() {
  const env = fs.readFileSync(".env.local", "utf8");
  const dbUrl = env.match(/DATABASE_URL=(.+)/)?.[1]?.trim();
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const hash = await bcrypt.hash("musteri123", 10);
  await client.query(
    `INSERT INTO customer_users (phone, password_hash, name, email, company) 
     VALUES ($1, $2, $3, $4, $5) ON CONFLICT (phone) DO NOTHING`,
    ["05001234567", hash, "Test Musteri", "musteri@test.com", "Test Sirketi"]
  );
  console.log("Test musteri olusturuldu!");
  console.log("Telefon: 05001234567");
  console.log("Sifre: musteri123");
  await client.end();
}
main().catch(console.error);
