import { NextRequest, NextResponse } from "next/server";
import { createProcessExitUseCase } from "@/lib/use-cases/factory";
import { InvalidTokenError } from "@/lib/use-cases/process-exit";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Token é obrigatório" },
      { status: 400 },
    );
  }

  const processExit = createProcessExitUseCase();

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
