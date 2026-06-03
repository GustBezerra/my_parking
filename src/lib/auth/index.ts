import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { JWT_SECRET, COOKIE_NAME } from "@/lib/constants";

export async function protectRoute(request: NextRequest): Promise<NextResponse | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return unauthorizedResponse();
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    await jwtVerify(token, secret);
    return null;
  } catch {
    return unauthorizedResponse();
  }
}

function unauthorizedResponse(): NextResponse {
  return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
}
