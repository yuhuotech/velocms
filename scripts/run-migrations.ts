import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { migrate as postgresMigrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import Database from "better-sqlite3";
import { db } from "@/db/client";

async function runMigrations() {
  try {
    const dbType = process.env.DATABASE_TYPE || "sqlite";

    if (dbType === "sqlite") {
      await db.initialize();
      const adapter = db.getAdapter();

      if (adapter.constructor.name === "SqliteAdapter") {
        const sqlite = Database(
          process.env.DATABASE_PATH || "./data/velocms.db",
        ) as any;
        await migrate(sqlite, {
          migrationsFolder: "./packages/db/drizzle/migrations/sqlite",
        });
        console.log("SQLite migrations completed successfully");
        process.exit(0);
      }
    } else if (dbType === "vercel") {
      const client = postgres(process.env.POSTGRES_URL || "");
      const pg = drizzle(client);
      await postgresMigrate(pg, {
        migrationsFolder: "./packages/db/drizzle/migrations/postgres",
      });
      console.log("Postgres migrations completed successfully");
      await client.end();
      process.exit(0);
    } else if (dbType === "mysql") {
      await db.initialize();
      const adapter = db.getAdapter();

      if (adapter.constructor.name === "MySQLAdapter") {
        console.log("MySQL migrations should be applied manually");
        process.exit(0);
      }
    }
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigrations();
