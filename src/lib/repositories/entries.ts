export type Entry = {
  id: number;
  spotId: number;
  token: string;
  entryTime: string;
  exitTime: string | null;
};

export type CreateEntryData = {
  spotId: number;
  token: string;
  entryTime: string;
};

export interface EntriesRepository {
  findByToken(token: string): Promise<Entry | undefined>;
  create(data: CreateEntryData): Promise<Entry>;
  updateExitTime(id: number, exitTime: string): Promise<void>;
  findActiveBySpotId(spotId: number): Promise<Entry | undefined>;
  findAll(): Promise<Entry[]>;
}
