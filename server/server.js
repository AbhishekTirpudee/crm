import "./config/env.js";
import app from "./app.js";
import { db } from "./db/index.js";
import { sql } from "drizzle-orm";

const startServer = async () => {
  try {
    // Test the database connection
    await db.execute(sql`SELECT 1`);
    console.log("✅ Database connected successfully!");

    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Backend running on port ${process.env.PORT || 5000}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
