export type ParkingSpot = {
  id: number;
  code: number;
  status: "disponivel" | "ocupada";
};

export interface ParkingSpotsRepository {
  findAll(): Promise<ParkingSpot[]>;
  findByCode(code: number): Promise<ParkingSpot | undefined>;
  findAvailable(): Promise<ParkingSpot | undefined>;
  findAllOccupied(): Promise<ParkingSpot[]>;
  count(): Promise<number>;
  updateStatus(id: number, status: "disponivel" | "ocupada"): Promise<void>;
}
