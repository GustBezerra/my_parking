import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import type { AdminUsersRepository, AdminUser } from "../admin-users";

export class SqliteAdminUsersRepository implements AdminUsersRepository {
  async findByUsername(username: string): Promise<AdminUser | undefined> {
    const rows = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username))
      .limit(1);

    return rows[0];
  }

}
