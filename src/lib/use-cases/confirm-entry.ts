import type { EntriesRepository, Entry } from "@/lib/repositories/entries";
import type { ParkingSpotsRepository } from "@/lib/repositories/parking-spots";

export class DuplicateTokenError extends Error {
  constructor() {
    super("Este token ja foi utilizado");
    this.name = "DuplicateTokenError";
  }
}

export class NoAvailableSpotsError extends Error {
  constructor() {
    super("Nenhuma vaga disponivel no momento");
    this.name = "NoAvailableSpotsError";
  }
}

export class ConfirmEntryUseCase {
  constructor(
    private parkingSpotsRepo: ParkingSpotsRepository,
    private entriesRepo: EntriesRepository,
  ) {}

  async execute(token: string): Promise<Entry> {
    const existing = await this.entriesRepo.findByToken(token);
    if (existing) {
      throw new DuplicateTokenError();
    }

    const spot = await this.parkingSpotsRepo.findAvailable();
    if (!spot) {
      throw new NoAvailableSpotsError();
    }

    const entryTime = new Date().toISOString();

    const entry = await this.entriesRepo.create({
      spotId: spot.id,
      token,
      entryTime,
    });

    await this.parkingSpotsRepo.updateStatus(spot.id, "ocupada");

    return entry;
  }
}
