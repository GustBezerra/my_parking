import { NextRequest, NextResponse } from "next/server";
import { createGetAllSpotsUseCase } from "@/lib/use-cases/factory";
import { protectRoute } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authResponse = await protectRoute(request);
  if (authResponse) return authResponse;

  try {
    const useCase = createGetAllSpotsUseCase();
    const result = await useCase.execute();

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, error: "Erro ao buscar vagas" },
      { status: 500 },
    );
  }
}
