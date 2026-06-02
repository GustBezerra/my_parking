import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { parkingSpots } from "@/lib/db/schema";

export async function GET() {
  try {
    const db = getDb();

    const allSpots = db.select().from(parkingSpots).all();

    const availableSpots = db
      .select()
      .from(parkingSpots)
      .where(eq(parkingSpots.status, "disponivel"))
      .all();

    const occupiedSpots = db
      .select()
      .from(parkingSpots)
      .where(eq(parkingSpots.status, "ocupada"))
      .all();

    return NextResponse.json({
      total: allSpots.length,
      disponiveis: availableSpots.length,
      ocupadas: occupiedSpots.length,
      taxaOcupacao:
        allSpots.length === 0
          ? 0
          : Number(((occupiedSpots.length / allSpots.length) * 100).toFixed(2)),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Erro ao calcular estatísticas",
      },
      {
        status: 500,
      },
    );
  }
}
