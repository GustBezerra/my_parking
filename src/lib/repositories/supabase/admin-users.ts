import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { adminUsers } from "@/lib/db/schema-pg";
import type { AdminUsersRepository, AdminUser } from "../admin-users";
import type * as pgSchema from "@/lib/db/schema-pg";

export class SupabaseAdminUsersRepository implements AdminUsersRepository {
  private db: PostgresJsDatabase<typeof pgSchema>;

  constructor(database: PostgresJsDatabase<typeof pgSchema>) {
    this.db = database;
  }

  async findByUsername(username: string): Promise<AdminUser | undefined> {
    console.log("supabase admin users")
    const rows = await this.db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username))
      .limit(1);

    return rows[0];
  }
}
