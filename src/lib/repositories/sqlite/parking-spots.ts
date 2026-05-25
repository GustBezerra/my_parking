import { eq, asc } from "drizzle-orm";

import { db } from "@/lib/db";
import { parkingSpots } from "@/lib/db/schema";
import type { ParkingSpotsRepository, ParkingSpot } from "../parking-spots";

export class SqliteParkingSpotsRepository implements ParkingSpotsRepository {
  async findAll(): Promise<ParkingSpot[]> {
    const rows = await db
      .select()
      .from(parkingSpots)
      .orderBy(asc(parkingSpots.code));

    return rows;
  }

  async findByCode(code: number): Promise<ParkingSpot | undefined> {
    const rows = await db
      .select()
      .from(parkingSpots)
      .where(eq(parkingSpots.code, code))
      .limit(1);

    return rows[0];
  }

  async findAvailable(): Promise<ParkingSpot | undefined> {
    const rows = await db
      .select()
      .from(parkingSpots)
      .where(eq(parkingSpots.status, "disponivel"))
      .orderBy(asc(parkingSpots.code))
      .limit(1);

    return rows[0];
  }

  async updateStatus(id: number, status: "disponivel" | "ocupada"): Promise<void> {
    await db
      .update(parkingSpots)
      .set({ status })
      .where(eq(parkingSpots.id, id));
  }

}
