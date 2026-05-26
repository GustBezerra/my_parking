import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { SqliteParkingSpotsRepository } from "@/lib/repositories/sqlite/parking-spots";
import { SqliteEntriesRepository } from "@/lib/repositories/sqlite/entries";
import {
  ConfirmEntryUseCase,
  DuplicateTokenError,
  NoAvailableSpotsError,
} from "@/lib/use-cases/confirm-entry";
import { entradaEventEmitter, ENTRADA_EVENT } from "@/lib/sse/entrada-emitter";

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
  const confirmEntry = new ConfirmEntryUseCase(parkingSpotsRepo, entriesRepo);

  try {
    const entry = await confirmEntry.execute(token);

    entradaEventEmitter.emit(ENTRADA_EVENT);

    return NextResponse.json({ entry });
  } catch (error) {
    if (error instanceof DuplicateTokenError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error instanceof NoAvailableSpotsError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    throw error;
  }
}
