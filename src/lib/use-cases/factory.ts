import { getDb } from "@/lib/db";
import { SqliteParkingSpotsRepository } from "@/lib/repositories/sqlite/parking-spots";
import { SqliteEntriesRepository } from "@/lib/repositories/sqlite/entries";
import { SqliteAdminUsersRepository } from "@/lib/repositories/sqlite/admin-users";
import { GetAllSpotsUseCase } from "./get-all-spots";
import { PrepareEntryUseCase } from "./prepare-entry";
import { ConfirmEntryUseCase } from "./confirm-entry";
import { ProcessExitUseCase } from "./process-exit";
import { AdminLoginUseCase } from "./admin-login";

export function createGetAllSpotsUseCase() {
  return new GetAllSpotsUseCase(new SqliteParkingSpotsRepository(getDb()));
}

export function createPrepareEntryUseCase() {
  return new PrepareEntryUseCase(new SqliteParkingSpotsRepository(getDb()));
}

export function createConfirmEntryUseCase() {
  const db = getDb();
  return new ConfirmEntryUseCase(
    new SqliteParkingSpotsRepository(db),
    new SqliteEntriesRepository(db),
  );
}

export function createProcessExitUseCase() {
  const db = getDb();
  return new ProcessExitUseCase(
    new SqliteParkingSpotsRepository(db),
    new SqliteEntriesRepository(db),
  );
}

export function createAdminLoginUseCase() {
  return new AdminLoginUseCase(new SqliteAdminUsersRepository(getDb()));
}
