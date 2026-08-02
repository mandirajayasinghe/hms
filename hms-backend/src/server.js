const app = require("./app");
const env = require("./config/env");
const db = require("./config/db");

async function start() {
  try {
    await db.query("SELECT 1");
    console.log("✅ Connected to PostgreSQL");
    app.listen(env.port, () => {
      console.log(`🚀 HMS backend running on http://localhost:${env.port}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to database:", err.message);
    process.exit(1);
  }
}

start();