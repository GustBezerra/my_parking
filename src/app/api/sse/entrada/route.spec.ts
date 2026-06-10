import { describe, it, expect, beforeEach, vi } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "@/lib/db/schema";
import { parkingSpots } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type SendFn = (data: unknown, eventName?: string) => void;

interface Context {
  onClose: (fn: () => void) => void;
}

interface CapturedCall {
  callback: (send: SendFn, close: () => void, context: Context) => void;
  send: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
  context: Context;
}

const capturedCalls: CapturedCall[] = [];

vi.mock("use-next-sse", () => ({
  createSSEHandler: vi.fn(
    (callback: (send: SendFn, close: () => void, context: Context) => void) => {
      const send = vi.fn();
      const close = vi.fn();
      const context = { onClose: vi.fn() };
      capturedCalls.push({ callback, send, close, context });
      return vi.fn();
    },
  ),
}));

vi.mock("@/lib/db");

import { getDb } from "@/lib/db";

describe("GET /api/sse/entrada", () => {
  beforeEach(() => {
    capturedCalls.length = 0;

    const sqlite = new Database(":memory:");
    sqlite.pragma("foreign_keys = ON");
    const db = drizzle(sqlite, { schema });
    migrate(db, { migrationsFolder: "./drizzle" });

    db.insert(parkingSpots).values({ code: 1, status: "disponivel" }).run();

    vi.mocked(getDb).mockReturnValue({ dialect: "sqlite", db });
  });

  it("exports force-dynamic", async () => {
    vi.resetModules();
    const mod = await import("./route");
    expect(mod.dynamic).toBe("force-dynamic");
  });

  it("sends QR data via SSE when spot is available", async () => {
    vi.resetModules();
    await import("./route");

    const { callback, send, close, context } = capturedCalls[capturedCalls.length - 1];

    callback(send as SendFn, close as () => void, context);

    await vi.waitFor(() => {
      expect(send).toHaveBeenCalled();
    });

    const [data, eventName] = send.mock.calls[0];
    expect(eventName).toBe("vaga_ocupada");
    expect(data).toMatchObject({
      spot: { id: 1, code: 1, status: "disponivel" },
      token: expect.any(String),
      qrDataUrl: expect.stringContaining("data:image"),
    });
  });

  it("sends error via SSE when no spots available", async () => {
    const { db } = vi.mocked(getDb)();
    db.update(parkingSpots)
      .set({ status: "ocupada" })
      .where(eq(parkingSpots.id, 1))
      .run();

    vi.resetModules();
    await import("./route");

    const { callback, send, close, context } = capturedCalls[capturedCalls.length - 1];

    callback(send as SendFn, close as () => void, context);

    await vi.waitFor(() => {
      expect(send).toHaveBeenCalled();
    });

    const [data, eventName] = send.mock.calls[0];
    expect(eventName).toBe("error");
    expect(data).toEqual({
      error: "Nao ha vagas disponiveis no momento",
    });
  });
});
