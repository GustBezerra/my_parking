import { describe, it, expect, beforeEach, vi } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import * as schema from "@/lib/db/schema";
import { parkingSpots } from "@/lib/db/schema";

vi.mock("@/lib/db");

import { getDb } from "@/lib/db";
import { GET } from "./route";

describe("GET /api/vagas", () => {
  beforeEach(() => {
    const sqlite = new Database(":memory:");

    sqlite.pragma("foreign_keys = ON");

    const db = drizzle(sqlite, {
      schema,
    });

    migrate(db, {
      migrationsFolder: "./drizzle",
    });

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
          status: "disponivel",
        },
      ])
      .run();

    vi.mocked(getDb).mockReturnValue(db);
  });

  it("returns 200", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
  });

  it("returns all parking spots", async () => {
    const response = await GET();

    const body = await response.json();

    expect(body.total).toBe(3);
    expect(body.spots).toHaveLength(3);
  });

  it("returns available spots correctly", async () => {
    const response = await GET();

    const body = await response.json();

    const availableSpots = body.spots.filter(
      (spot: any) => spot.status === "disponivel",
    );

    expect(availableSpots).toHaveLength(2);
  });

  it("returns occupied spots correctly", async () => {
    const response = await GET();

    const body = await response.json();

    const occupiedSpots = body.spots.filter(
      (spot: any) => spot.status === "ocupada",
    );

    expect(occupiedSpots).toHaveLength(1);
  });

  it("returns expected spot codes", async () => {
    const response = await GET();

    const body = await response.json();

    const codes = body.spots.map((spot: any) => spot.code);

    expect(codes).toContain(1);
    expect(codes).toContain(2);
    expect(codes).toContain(3);
  });
});
