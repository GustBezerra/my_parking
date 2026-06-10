import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "@/lib/db/schema";
import { parkingSpots, entries } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { BASE_URL } from "@/lib/constants";

vi.mock("@/lib/db");

import { getDb } from "@/lib/db";
import { GET } from "./route";

describe("GET /api/confirmar", () => {
  beforeEach(() => {
    const sqlite = new Database(":memory:");
    sqlite.pragma("foreign_keys = ON");
    const db = drizzle(sqlite, { schema });
    migrate(db, { migrationsFolder: "./drizzle" });

    db.insert(parkingSpots).values({ code: 1, status: "disponivel" }).run();

    vi.mocked(getDb).mockReturnValue({ dialect: "sqlite", db });
  });

  it("returns 400 when token is missing", async () => {
    const request = new NextRequest(`${BASE_URL}/api/confirmar`);
    const response = await GET(request);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Token é obrigatório");
  });

  it("returns 200 with entry on successful confirmation", async () => {
    const request = new NextRequest(
      new URL("/api/confirmar?token=valid-token", BASE_URL),
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.entry.token).toBe("valid-token");
    expect(body.entry.spotId).toBe(1);
    expect(body.entry.exitTime).toBeNull();
  });

  it("returns 409 when token already used", async () => {
    const { db } = vi.mocked(getDb)();
    db.insert(entries)
      .values({
        spotId: 1,
        token: "used-token",
        entryTime: new Date().toISOString(),
      })
      .run();

    const request = new NextRequest(
      new URL("/api/confirmar?token=used-token", BASE_URL),
    );
    const response = await GET(request);

    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body.error).toBe("Este token ja foi utilizado");
  });

  it("returns 503 when no spots available", async () => {
    const { db } = vi.mocked(getDb)();
    db.update(parkingSpots)
      .set({ status: "ocupada" })
      .where(eq(parkingSpots.id, 1))
      .run();

    const request = new NextRequest(
      new URL("/api/confirmar?token=new-token", BASE_URL),
    );
    const response = await GET(request);

    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.error).toBe("Nenhuma vaga disponivel no momento");
  });
});
