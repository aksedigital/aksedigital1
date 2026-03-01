const { execSync } = require("child_process");
const fs = require("fs");

const envContent = fs.readFileSync(".env.local", "utf8");
const lines = envContent.split("\n").filter(l => l.includes("=") && !l.startsWith("#"));

for (const line of lines) {
    const eqIdx = line.indexOf("=");
    const key = line.substring(0, eqIdx).trim();
    const value = line.substring(eqIdx + 1).trim().replace(/\r/g, "");

    if (!key || !value) {
        console.log(`⏭ Skipping ${key} (empty value)`);
        continue;
    }

    try {
        // Remove existing first
        try {
            execSync(`npx vercel env rm ${key} production -y`, { stdio: "pipe" });
        } catch { /* doesn't exist yet */ }

        // Add new
        execSync(`npx vercel env add ${key} production`, {
            input: value,
            stdio: ["pipe", "pipe", "pipe"],
        });
        console.log(`✓ ${key}`);
    } catch (err) {
        console.log(`✗ ${key}: ${err.message.substring(0, 80)}`);
    }
}

console.log("\n✅ Done! Now redeploy on Vercel.");
