import { describe, it, expect } from "vitest";
import { createTestRepos } from "./test-helper";
import {
  ConfirmEntryUseCase,
  DuplicateTokenError,
  NoAvailableSpotsError,
} from "./confirm-entry";
import { parkingSpots, entries } from "@/lib/db/schema";

describe("ConfirmEntryUseCase", () => {
  it("creates entry and marks spot as occupied", async () => {
    const { db, parkingSpotsRepo, entriesRepo } = createTestRepos();
    await db.insert(parkingSpots).values({ code: 1 });

    const useCase = new ConfirmEntryUseCase(parkingSpotsRepo, entriesRepo);
    const result = await useCase.execute("token-uuid-abc");

    expect(result.token).toBe("token-uuid-abc");
    expect(result.spotId).toBe(1);
    expect(result.entryTime).toBeTruthy();
    expect(result.exitTime).toBeNull();

    const spots = await parkingSpotsRepo.findAll();
    expect(spots[0].status).toBe("ocupada");
  });

  it("takes smallest-code available spot", async () => {
    const { db, parkingSpotsRepo, entriesRepo } = createTestRepos();
    await db.insert(parkingSpots).values({ code: 5 });
    await db.insert(parkingSpots).values({ code: 1 });

    const spotWithCode1 = await parkingSpotsRepo.findByCode(1);

    const useCase = new ConfirmEntryUseCase(parkingSpotsRepo, entriesRepo);
    const result = await useCase.execute("token-uuid-abc");

    expect(result.spotId).toBe(spotWithCode1!.id);
  });

  it("throws DuplicateTokenError when token already used", async () => {
    const { db, parkingSpotsRepo, entriesRepo } = createTestRepos();
    await db.insert(parkingSpots).values({ code: 1 });
    await db.insert(entries).values({
      spotId: 1,
      token: "existing-token",
      entryTime: new Date().toISOString(),
    });

    const useCase = new ConfirmEntryUseCase(parkingSpotsRepo, entriesRepo);

    await expect(useCase.execute("existing-token")).rejects.toThrow(
      DuplicateTokenError,
    );
  });

  it("throws NoAvailableSpotsError when no spots free", async () => {
    const { parkingSpotsRepo, entriesRepo } = createTestRepos();

    const useCase = new ConfirmEntryUseCase(parkingSpotsRepo, entriesRepo);

    await expect(useCase.execute("token-uuid")).rejects.toThrow(
      NoAvailableSpotsError,
    );
  });
});
