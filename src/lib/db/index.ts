import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import Database from "better-sqlite3";
import postgres from "postgres";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as sqliteSchema from "./schema";
import * as pgSchema from "./schema-pg";

type SqliteDb = {
  dialect: "sqlite";
  db: BetterSQLite3Database<typeof sqliteSchema>;
};

type PgDb = {
  dialect: "postgresql";
  db: PostgresJsDatabase<typeof pgSchema>;
};

type Database = SqliteDb | PgDb;

let instance: Database | undefined;

export function getDb(): Database {
  if (instance) return instance;

  if (process.env.NODE_ENV === "production") {
    const client = postgres(process.env.SUPABASE_URL!);
    instance = {
      dialect: "postgresql",
      db: drizzlePg(client, { schema: pgSchema }),
    };
  } else {
    const sqlite = new Database("./data/my_parking.db");
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    instance = {
      dialect: "sqlite",
      db: drizzleSqlite(sqlite, { schema: sqliteSchema }),
    };
  }

  return instance;
}
