import "dotenv/config";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";

async function main() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const envPath = path.resolve(__dirname, "../../.env");
  
  import('dotenv').then(async ({ config }) => {
    config({ path: envPath });
    
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is missing");
    }

    const pool = mysql.createPool(process.env.DATABASE_URL);
    try {
      await pool.query("SET FOREIGN_KEY_CHECKS = 0;");
      const [rows] = await pool.query("SHOW TABLES");
      
      const dbNameMatch = process.env.DATABASE_URL.match(/\/([^?]+)(\?|$)/);
      const dbName = dbNameMatch ? dbNameMatch[1] : null;
      
      for (const row of rows as any[]) {
        const tableName = Object.values(row)[0];
        console.log(`Dropping table ${tableName}...`);
        await pool.query(`DROP TABLE IF EXISTS \`${tableName}\`;`);
      }
      
      await pool.query("SET FOREIGN_KEY_CHECKS = 1;");
      console.log("Dropped all tables successfully.");
    } catch (error) {
      console.error("Failed to drop tables:", error);
    } finally {
      await pool.end();
    }
  });
}

main();
