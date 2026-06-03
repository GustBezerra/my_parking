import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { createAdminLoginUseCase } from "@/lib/use-cases/factory";
import { InvalidCredentialsError } from "@/lib/use-cases/admin-login";
import { JWT_SECRET, JWT_EXPIRES_IN, COOKIE_NAME } from "@/lib/constants";

export async function POST(request: NextRequest) {
  let body: { username?: string; password?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisicao invalido" },
      { status: 400 },
    );
  }

  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username e senha sao obrigatorios" },
      { status: 400 },
    );
  }

  const adminLogin = createAdminLoginUseCase();

  try {
    const { admin } = await adminLogin.execute(username, password);

    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({ sub: String(admin.id), username: admin.username })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(JWT_EXPIRES_IN)
      .sign(secret);

    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    throw error;
  }
}
