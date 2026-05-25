import type { ParkingSpot } from "@/lib/repositories/parking-spots";
import type { ParkingSpotsRepository } from "@/lib/repositories/parking-spots";

export class NoAvailableSpotsError extends Error {
  constructor() {
    super("Nenhuma vaga disponivel no momento");
    this.name = "NoAvailableSpotsError";
  }
}

export type PrepareEntryOutput = {
  spot: ParkingSpot;
  token: string;
};

export class PrepareEntryUseCase {
  constructor(private parkingSpotsRepo: ParkingSpotsRepository) {}

  async execute(): Promise<PrepareEntryOutput> {
    const spot = await this.parkingSpotsRepo.findAvailable();
    if (!spot) {
      throw new NoAvailableSpotsError();
    }
    const token = crypto.randomUUID();
    return { spot, token };
  }
}
