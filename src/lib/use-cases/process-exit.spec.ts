import { describe, it, expect } from "vitest";
import { createTestRepos } from "./test-helper";
import { ProcessExitUseCase, InvalidTokenError } from "./process-exit";
import { parkingSpots, entries } from "@/lib/db/schema";

describe("ProcessExitUseCase", () => {
  it("marks exit time and frees spot", async () => {
    const { db, parkingSpotsRepo, entriesRepo } = createTestRepos();
    await db.insert(parkingSpots).values({ code: 1 });
    await db.insert(entries).values({
      spotId: 1,
      token: "active-token",
      entryTime: new Date().toISOString(),
    });

    const useCase = new ProcessExitUseCase(parkingSpotsRepo, entriesRepo);
    const result = await useCase.execute("active-token");

    expect(result.exitTime).toBeTruthy();
    expect(result.token).toBe("active-token");

    const spots = await parkingSpotsRepo.findAll();
    expect(spots[0].status).toBe("disponivel");
  });

  it("throws InvalidTokenError when token not found", async () => {
    const { parkingSpotsRepo, entriesRepo } = createTestRepos();

    const useCase = new ProcessExitUseCase(parkingSpotsRepo, entriesRepo);

    await expect(useCase.execute("nonexistent")).rejects.toThrow(
      InvalidTokenError,
    );
  });

  it("throws InvalidTokenError when exit already processed", async () => {
    const { db, parkingSpotsRepo, entriesRepo } = createTestRepos();
    await db.insert(parkingSpots).values({ code: 1 });
    await db.insert(entries).values({
      spotId: 1,
      token: "exited-token",
      entryTime: new Date().toISOString(),
      exitTime: new Date().toISOString(),
    });

    const useCase = new ProcessExitUseCase(parkingSpotsRepo, entriesRepo);

    await expect(useCase.execute("exited-token")).rejects.toThrow(
      InvalidTokenError,
    );
  });
});
