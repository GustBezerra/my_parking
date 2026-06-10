import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { hashSync } from "bcryptjs";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "@/lib/db/schema";
import { adminUsers } from "@/lib/db/schema";
import { BASE_URL } from "@/lib/constants";

vi.mock("@/lib/db");

import { getDb } from "@/lib/db";
import { POST } from "./route";

const URL = `${BASE_URL}/api/admin/login`;

describe("POST /api/admin/login", () => {
  const username = "admin";
  const password = "123456";

  beforeEach(() => {
    const sqlite = new Database(":memory:");
    sqlite.pragma("foreign_keys = ON");
    const db = drizzle(sqlite, { schema });
    migrate(db, { migrationsFolder: "./drizzle" });

    const passwordHash = hashSync(password, 10);
    db.insert(adminUsers).values({ username, passwordHash }).run();

    vi.mocked(getDb).mockReturnValue({ dialect: "sqlite", db });
  });

  it("returns 200 with auth cookie on valid credentials", async () => {
    const request = new NextRequest(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const response = await POST(request);

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);

    const setCookie = response.headers.get("set-cookie");
    expect(setCookie).toContain("auth_token=");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("Path=/");
  });

  it("returns 400 when username is missing", async () => {
    const request = new NextRequest(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const response = await POST(request);

    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toBe("Username e senha sao obrigatorios");
  });

  it("returns 400 when password is missing", async () => {
    const request = new NextRequest(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const response = await POST(request);

    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toBe("Username e senha sao obrigatorios");
  });

  it("returns 401 on invalid credentials", async () => {
    const request = new NextRequest(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password: "wrong-password" }),
    });
    const response = await POST(request);

    expect(response.status).toBe(401);

    const body = await response.json();
    expect(body.error).toBe("Credenciais invalidas");
  });

  it("returns 400 on malformed body", async () => {
    const request = new NextRequest(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });
    const response = await POST(request);

    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toBe("Corpo da requisicao invalido");
  });
});
