import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { SignJWT } from "jose";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import * as schema from "@/lib/db/schema";
import { parkingSpots, adminUsers } from "@/lib/db/schema";
import { BASE_URL, JWT_SECRET, COOKIE_NAME } from "@/lib/constants";

vi.mock("@/lib/db");

import { getDb } from "@/lib/db";
import { GET } from "./route";

const AUTH_USER = { username: "admin", id: 1 };
const URL = `${BASE_URL}/api/vagas`;

let authedRequest: NextRequest;
let unauthRequest: NextRequest;

describe("GET /api/vagas", () => {
  beforeEach(async () => {
    const sqlite = new Database(":memory:");
    sqlite.pragma("foreign_keys = ON");
    const db = drizzle(sqlite, { schema });
    migrate(db, { migrationsFolder: "./drizzle" });

    db.insert(parkingSpots)
      .values([
        { code: 1, status: "disponivel" },
        { code: 2, status: "ocupada" },
        { code: 3, status: "disponivel" },
      ])
      .run();

    db.insert(adminUsers)
      .values({ username: AUTH_USER.username, passwordHash: "dummy" })
      .run();

    vi.mocked(getDb).mockReturnValue(db);

    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({
      sub: String(AUTH_USER.id),
      username: AUTH_USER.username,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    authedRequest = new NextRequest(URL);
    authedRequest.cookies.set(COOKIE_NAME, token);

    unauthRequest = new NextRequest(URL);
  });

  it("returns 401 without auth cookie", async () => {
    const response = await GET(unauthRequest);

    expect(response.status).toBe(401);

    const body = await response.json();
    expect(body.error).toBe("Nao autorizado");
  });

  it("returns 200 with auth cookie", async () => {
    const response = await GET(authedRequest);

    expect(response.status).toBe(200);
  });

  it("returns all parking spots", async () => {
    const response = await GET(authedRequest);

    const body = await response.json();

    expect(body.total).toBe(3);
    expect(body.spots).toHaveLength(3);
  });

  it("returns available spots correctly", async () => {
    const response = await GET(authedRequest);

    const body = await response.json();

    const availableSpots = body.spots.filter(
      (spot: any) => spot.status === "disponivel",
    );

    expect(availableSpots).toHaveLength(2);
  });

  it("returns occupied spots correctly", async () => {
    const response = await GET(authedRequest);

    const body = await response.json();

    const occupiedSpots = body.spots.filter(
      (spot: any) => spot.status === "ocupada",
    );

    expect(occupiedSpots).toHaveLength(1);
  });

  it("returns expected spot codes", async () => {
    const response = await GET(authedRequest);

    const body = await response.json();

    const codes = body.spots.map((spot: any) => spot.code);

    expect(codes).toContain(1);
    expect(codes).toContain(2);
    expect(codes).toContain(3);
  });
});
