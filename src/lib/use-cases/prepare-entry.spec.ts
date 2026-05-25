import { describe, it, expect } from "vitest";
import { createTestRepos } from "./test-helper";
import { PrepareEntryUseCase, NoAvailableSpotsError } from "./prepare-entry";
import { parkingSpots } from "@/lib/db/schema";

describe("PrepareEntryUseCase", () => {
  it("returns smallest-code available spot with UUID token", async () => {
    const { db, parkingSpotsRepo } = createTestRepos();
    await db.insert(parkingSpots).values({ code: 5 });
    await db.insert(parkingSpots).values({ code: 1 });

    const useCase = new PrepareEntryUseCase(parkingSpotsRepo);
    const result = await useCase.execute();

    expect(result.spot.code).toBe(1);
    expect(result.spot.status).toBe("disponivel");
    expect(result.token).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it("picks smallest code among multiple available spots", async () => {
    const { db, parkingSpotsRepo } = createTestRepos();
    await db.insert(parkingSpots).values({ code: 3 });
    await db.insert(parkingSpots).values({ code: 1 });
    await db.insert(parkingSpots).values({ code: 5 });

    const useCase = new PrepareEntryUseCase(parkingSpotsRepo);
    const result = await useCase.execute();

    expect(result.spot.code).toBe(1);
  });

  it("throws NoAvailableSpotsError when no spots available", async () => {
    const { parkingSpotsRepo } = createTestRepos();

    const useCase = new PrepareEntryUseCase(parkingSpotsRepo);

    await expect(useCase.execute()).rejects.toThrow(NoAvailableSpotsError);
  });
});
