import { describe, it, expect } from "vitest";
import { createTestRepos } from "./test-helper";
import { GetAllSpotsUseCase } from "./get-all-spots";
import { parkingSpots } from "@/lib/db/schema";

describe("GetAllSpotsUseCase", () => {
  it("returns total 0 and empty array when no parking spots", async () => {
    const { parkingSpotsRepo } = createTestRepos();
    const useCase = new GetAllSpotsUseCase(parkingSpotsRepo);

    const result = await useCase.execute();

    expect(result.total).toBe(0);
    expect(result.spots).toEqual([]);
  });

  it("returns all spots with correct total", async () => {
    const { db, parkingSpotsRepo } = createTestRepos();

    await db.insert(parkingSpots).values([
      { code: 2 },
      { code: 1 },
      { code: 3 },
    ]);

    const useCase = new GetAllSpotsUseCase(parkingSpotsRepo);

    const result = await useCase.execute();

    expect(result.total).toBe(3);
    expect(result.spots).toHaveLength(3);
  });

  it("returns spots ordered by code ascending", async () => {
    const { db, parkingSpotsRepo } = createTestRepos();

    await db.insert(parkingSpots).values([
      { code: 3 },
      { code: 1 },
      { code: 2 },
    ]);

    const useCase = new GetAllSpotsUseCase(parkingSpotsRepo);

    const result = await useCase.execute();

    expect(result.spots[0].code).toBe(1);
    expect(result.spots[1].code).toBe(2);
    expect(result.spots[2].code).toBe(3);
  });
});
