import { eq, asc, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { parkingSpots } from "@/lib/db/schema-pg";
import type { ParkingSpotsRepository, ParkingSpot } from "../parking-spots";
import type * as pgSchema from "@/lib/db/schema-pg";

export class SupabaseParkingSpotsRepository implements ParkingSpotsRepository {
  private db: PostgresJsDatabase<typeof pgSchema>;

  constructor(database: PostgresJsDatabase<typeof pgSchema>) {
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
