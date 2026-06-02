import { NextResponse } from "next/server";

import { getDb } from "@/lib/db";
import { SqliteParkingSpotsRepository } from "@/lib/repositories/sqlite/parking-spots";

export async function GET() {
  try {
    const db = getDb();

    const parkingSpotsRepo = new SqliteParkingSpotsRepository(db);

    const spots = await parkingSpotsRepo.findAll();

    return NextResponse.json({
      success: true,
      total: spots.length,
      spots,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Erro ao buscar vagas",
      },
      {
        status: 500,
      },
    );
  }
}
