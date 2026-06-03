import { NextRequest, NextResponse } from "next/server";
import { createConfirmEntryUseCase } from "@/lib/use-cases/factory";
import {
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

  const confirmEntry = createConfirmEntryUseCase();

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
