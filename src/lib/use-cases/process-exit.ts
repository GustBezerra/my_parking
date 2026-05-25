import type { EntriesRepository, Entry } from "@/lib/repositories/entries";
import type { ParkingSpotsRepository } from "@/lib/repositories/parking-spots";

export class InvalidTokenError extends Error {
  constructor() {
    super("Token invalido ou saida ja processada");
    this.name = "InvalidTokenError";
  }
}

export class ProcessExitUseCase {
  constructor(
    private parkingSpotsRepo: ParkingSpotsRepository,
    private entriesRepo: EntriesRepository,
  ) {}

  async execute(token: string): Promise<Entry> {
    const entry = await this.entriesRepo.findByToken(token);

    if (!entry || entry.exitTime !== null) {
      throw new InvalidTokenError();
    }

    const exitTime = new Date().toISOString();
    await this.entriesRepo.updateExitTime(entry.id, exitTime);
    await this.parkingSpotsRepo.updateStatus(entry.spotId, "disponivel");

    return {
      ...entry,
      exitTime,
    };
  }
}
