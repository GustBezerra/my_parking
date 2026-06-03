import { eq, asc, sql } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import { parkingSpots } from "@/lib/db/schema";
import type { ParkingSpotsRepository, ParkingSpot } from "../parking-spots";
import type * as schema from "@/lib/db/schema";

export class SqliteParkingSpotsRepository implements ParkingSpotsRepository {
  private db: BetterSQLite3Database<typeof schema>;

  constructor(database: BetterSQLite3Database<typeof schema>) {
    this.db = database;
  }

  async findAll(): Promise<ParkingSpot[]> {
    const rows = await this.db
      .select()
      .from(parkingSpots)
      .orderBy(asc(parkingSpots.code));

    return rows;
  }

  async findByCode(code: number): Promise<ParkingSpot | undefined> {
    const rows = await this.db
      .select()
      .from(parkingSpots)
      .where(eq(parkingSpots.code, code))
      .limit(1);

    return rows[0];
  }

  async findAvailable(): Promise<ParkingSpot | undefined> {
    const rows = await this.db
      .select()
      .from(parkingSpots)
      .where(eq(parkingSpots.status, "disponivel"))
      .orderBy(asc(parkingSpots.code))
      .limit(1);

    return rows[0];
  }

  async findAllOccupied(): Promise<ParkingSpot[]> {
    const rows = await this.db
      .select()
      .from(parkingSpots)
      .where(eq(parkingSpots.status, "ocupada"))
      .orderBy(asc(parkingSpots.code));

    return rows;
  }

  async count(): Promise<number> {
    const rows = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(parkingSpots);

    return rows[0].count;
  }

  async updateStatus(id: number, status: "disponivel" | "ocupada"): Promise<void> {
    await this.db
      .update(parkingSpots)
      .set({ status })
      .where(eq(parkingSpots.id, id));
  }

}
