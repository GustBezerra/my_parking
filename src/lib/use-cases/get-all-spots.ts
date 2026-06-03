import type { ParkingSpot, ParkingSpotsRepository } from "@/lib/repositories/parking-spots";

export type GetAllSpotsOutput = {
  total: number;
  spots: ParkingSpot[];
};

export class GetAllSpotsUseCase {
  constructor(private parkingSpotsRepo: ParkingSpotsRepository) {}

  async execute(): Promise<GetAllSpotsOutput> {
    const spots = await this.parkingSpotsRepo.findAll();

    return { total: spots.length, spots };
  }
}
