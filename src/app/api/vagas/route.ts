import { NextResponse } from "next/server";

import { getDb } from "@/lib/db";
import { SqliteParkingSpotsRepository } from "@/lib/repositories/sqlite/parking-spots";
import { GetAllSpotsUseCase } from "@/lib/use-cases/get-all-spots";

export async function GET() {
  try {
    const db = getDb();
    const repo = new SqliteParkingSpotsRepository(db);
    const useCase = new GetAllSpotsUseCase(repo);

    const result = await useCase.execute();

    return NextResponse.json({ success: true, ...result });
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
