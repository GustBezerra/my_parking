import { getDb } from "@/lib/db";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type * as pgSchema from "@/lib/db/schema-pg";
import type * as sqliteSchema from "@/lib/db/schema";

import { SqliteParkingSpotsRepository } from "@/lib/repositories/sqlite/parking-spots";
import { SqliteEntriesRepository } from "@/lib/repositories/sqlite/entries";
import { SqliteAdminUsersRepository } from "@/lib/repositories/sqlite/admin-users";
import { SupabaseParkingSpotsRepository } from "@/lib/repositories/supabase/parking-spots";
import { SupabaseEntriesRepository } from "@/lib/repositories/supabase/entries";
import { SupabaseAdminUsersRepository } from "@/lib/repositories/supabase/admin-users";
import { GetAllSpotsUseCase } from "./get-all-spots";
import { PrepareEntryUseCase } from "./prepare-entry";
import { ConfirmEntryUseCase } from "./confirm-entry";
import { ProcessExitUseCase } from "./process-exit";
import { AdminLoginUseCase } from "./admin-login";

function createRepos() {
  const { dialect, db } = getDb();
  if (dialect === "postgresql") {
    const pg = db as PostgresJsDatabase<typeof pgSchema>;
    return {
      parkingSpots: new SupabaseParkingSpotsRepository(pg),
      entries: new SupabaseEntriesRepository(pg),
      adminUsers: new SupabaseAdminUsersRepository(pg),
    };
  }
  const sqlite = db as BetterSQLite3Database<typeof sqliteSchema>;
  return {
    parkingSpots: new SqliteParkingSpotsRepository(sqlite),
    entries: new SqliteEntriesRepository(sqlite),
    adminUsers: new SqliteAdminUsersRepository(sqlite),
  };
}

export function createGetAllSpotsUseCase() {
  return new GetAllSpotsUseCase(createRepos().parkingSpots);
}

export function createPrepareEntryUseCase() {
  return new PrepareEntryUseCase(createRepos().parkingSpots);
}

export function createConfirmEntryUseCase() {
  const { parkingSpots, entries } = createRepos();
  return new ConfirmEntryUseCase(parkingSpots, entries);
}

export function createProcessExitUseCase() {
  const { parkingSpots, entries } = createRepos();
  return new ProcessExitUseCase(parkingSpots, entries);
}

export function createAdminLoginUseCase() {
  return new AdminLoginUseCase(createRepos().adminUsers);
}
