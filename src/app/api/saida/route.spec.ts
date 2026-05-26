import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "@/lib/db/schema";
import { parkingSpots, entries } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

vi.mock("@/lib/db");

import { getDb } from "@/lib/db";
import { SqliteParkingSpotsRepository } from "@/lib/repositories/sqlite/parking-spots";
import { GET } from "./route";

describe("GET /api/saida", () => {
  beforeEach(() => {
    const sqlite = new Database(":memory:");
    sqlite.pragma("foreign_keys = ON");
    const db = drizzle(sqlite, { schema });
    migrate(db, { migrationsFolder: "./drizzle" });

    db.insert(parkingSpots).values({ code: 1, status: "ocupada" }).run();
    db.insert(entries)
      .values({
        spotId: 1,
        token: "active-token",
        entryTime: new Date().toISOString(),
      })
      .run();

    vi.mocked(getDb).mockReturnValue(db);
  });

  it("returns 400 when token is missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/saida");
    const response = await GET(request);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Token é obrigatório");
  });

  it("returns 200 with exit data on success", async () => {
    const request = new NextRequest(
      new URL("http://localhost:3000/api/saida?token=active-token"),
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.entry.token).toBe("active-token");
    expect(body.entry.exitTime).not.toBeNull();
    expect(body.entry.exitTime).toBeTypeOf("string");
  });

  it("frees the spot after successful exit", async () => {
    const db = vi.mocked(getDb)();
    const repo = new SqliteParkingSpotsRepository(db);

    const request = new NextRequest(
      new URL("http://localhost:3000/api/saida?token=active-token"),
    );
    await GET(request);

    const spot = await repo.findByCode(1);
    expect(spot?.status).toBe("disponivel");
  });

  it("returns 404 for nonexistent token", async () => {
    const request = new NextRequest(
      new URL("http://localhost:3000/api/saida?token=nonexistent"),
    );
    const response = await GET(request);

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe("Token invalido ou saida ja processada");
  });

  it("returns 404 for already exited token", async () => {
    const db = vi.mocked(getDb)();
    db.update(entries)
      .set({ exitTime: new Date().toISOString() })
      .where(eq(entries.token, "active-token"))
      .run();

    const request = new NextRequest(
      new URL("http://localhost:3000/api/saida?token=active-token"),
    );
    const response = await GET(request);

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe("Token invalido ou saida ja processada");
  });
});
