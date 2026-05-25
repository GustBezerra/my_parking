import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

let db: BetterSQLite3Database<typeof schema> | undefined;

export function getDb(): BetterSQLite3Database<typeof schema> {
  if (!db) {
    const sqlite = new Database("./data/my_parking.db");
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    db = drizzle(sqlite, { schema });
  }
  return db;
}
