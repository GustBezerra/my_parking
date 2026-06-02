import { describe, it, expect, beforeEach, vi } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import * as schema from "@/lib/db/schema";
import { parkingSpots } from "@/lib/db/schema";

vi.mock("@/lib/db");

import { getDb } from "@/lib/db";
import { GET } from "./route";

describe("GET /api/stats", () => {
  beforeEach(() => {
    const sqlite = new Database(":memory:");

    sqlite.pragma("foreign_keys = ON");

    const db = drizzle(sqlite, { schema });

    migrate(db, {
      migrationsFolder: "./drizzle",
    });

    vi.mocked(getDb).mockReturnValue(db);
  });

  it("returns zero statistics when there are no parking spots", async () => {
    const response = await GET();

    expect(response.status).toBe(200);

    const body = await response.json();

    expect(body.total).toBe(0);
    expect(body.disponiveis).toBe(0);
    expect(body.ocupadas).toBe(0);
    expect(body.taxaOcupacao).toBe(0);
  });

  it("returns correct statistics", async () => {
    const db = vi.mocked(getDb)();

    db.insert(parkingSpots)
      .values([
        {
          code: 1,
          status: "disponivel",
        },
        {
          code: 2,
          status: "ocupada",
        },
        {
          code: 3,
          status: "ocupada",
        },
      ])
      .run();

    const response = await GET();

    expect(response.status).toBe(200);

    const body = await response.json();

    expect(body.total).toBe(3);
    expect(body.disponiveis).toBe(1);
    expect(body.ocupadas).toBe(2);
    expect(body.taxaOcupacao).toBeCloseTo(66.67, 2);
  });
});
