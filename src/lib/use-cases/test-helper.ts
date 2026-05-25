import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "@/lib/db/schema";

import { SqliteParkingSpotsRepository } from "@/lib/repositories/sqlite/parking-spots";
import { SqliteEntriesRepository } from "@/lib/repositories/sqlite/entries";
import { SqliteAdminUsersRepository } from "@/lib/repositories/sqlite/admin-users";

export function createTestRepos() {
  const sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");

  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: "./drizzle" });

  return {
    db,
    parkingSpotsRepo: new SqliteParkingSpotsRepository(db),
    entriesRepo: new SqliteEntriesRepository(db),
    adminUsersRepo: new SqliteAdminUsersRepository(db),
  };
}
