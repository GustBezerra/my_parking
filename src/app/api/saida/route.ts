import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { SqliteParkingSpotsRepository } from "@/lib/repositories/sqlite/parking-spots";
import { SqliteEntriesRepository } from "@/lib/repositories/sqlite/entries";
import {
  ProcessExitUseCase,
  InvalidTokenError,
} from "@/lib/use-cases/process-exit";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Token é obrigatório" },
      { status: 400 },
    );
  }

  const db = getDb();
  const parkingSpotsRepo = new SqliteParkingSpotsRepository(db);
  const entriesRepo = new SqliteEntriesRepository(db);
  const processExit = new ProcessExitUseCase(parkingSpotsRepo, entriesRepo);

  try {
    const entry = await processExit.execute(token);
    return NextResponse.json({ entry });
  } catch (error) {
    if (error instanceof InvalidTokenError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    throw error;
  }
}
