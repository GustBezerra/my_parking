export type ParkingSpot = {
  id: number;
  code: number;
  status: "disponivel" | "ocupada";
};

export interface ParkingSpotsRepository {
  findAll(): Promise<ParkingSpot[]>;
  findByCode(code: number): Promise<ParkingSpot | undefined>;
  findAvailable(): Promise<ParkingSpot | undefined>;
  updateStatus(id: number, status: "disponivel" | "ocupada"): Promise<void>;
}
