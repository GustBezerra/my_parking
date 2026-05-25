import { eq, and, isNull, desc } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import { entries } from "@/lib/db/schema";
import type { EntriesRepository, Entry, CreateEntryData } from "../entries";
import type * as schema from "@/lib/db/schema";

export class SqliteEntriesRepository implements EntriesRepository {
  private db: BetterSQLite3Database<typeof schema>;

  constructor(database: BetterSQLite3Database<typeof schema>) {
    this.db = database;
  }

  async findByToken(token: string): Promise<Entry | undefined> {
    const rows = await this.db
      .select()
      .from(entries)
      .where(eq(entries.token, token))
      .limit(1);

    return rows[0];
  }

  async create(data: CreateEntryData): Promise<Entry> {
    const rows = await this.db
      .insert(entries)
      .values(data)
      .returning();

    return rows[0];
  }

  async updateExitTime(id: number, exitTime: string): Promise<void> {
    await this.db
      .update(entries)
      .set({ exitTime })
      .where(eq(entries.id, id));
  }

  async findActiveBySpotId(spotId: number): Promise<Entry | undefined> {
    const rows = await this.db
      .select()
      .from(entries)
      .where(
        and(
          eq(entries.spotId, spotId),
          isNull(entries.exitTime),
        ),
      )
      .limit(1);

    return rows[0];
  }

  async findAll(): Promise<Entry[]> {
    const rows = await this.db
      .select()
      .from(entries)
      .orderBy(desc(entries.entryTime));

    return rows;
  }
}
