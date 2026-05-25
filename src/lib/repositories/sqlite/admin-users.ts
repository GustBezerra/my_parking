import { eq } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import { adminUsers } from "@/lib/db/schema";
import type { AdminUsersRepository, AdminUser } from "../admin-users";
import type * as schema from "@/lib/db/schema";

export class SqliteAdminUsersRepository implements AdminUsersRepository {
  private db: BetterSQLite3Database<typeof schema>;

  constructor(database: BetterSQLite3Database<typeof schema>) {
    this.db = database;
  }

  async findByUsername(username: string): Promise<AdminUser | undefined> {
    const rows = await this.db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username))
      .limit(1);

    return rows[0];
  }

}
