import { pgTable, serial, integer, text } from "drizzle-orm/pg-core";

export const parkingSpots = pgTable("parking_spots", {
  id: serial().primaryKey(),
  code: integer().notNull().unique(),
  status: text({ enum: ["disponivel", "ocupada"] }).notNull().default("disponivel"),
});

export const entries = pgTable("entries", {
  id: serial().primaryKey(),
  spotId: integer("spot_id").notNull().references(() => parkingSpots.id),
  token: text().notNull().unique(),
  entryTime: text("entry_time").notNull(),
  exitTime: text("exit_time"),
});

export const adminUsers = pgTable("admin_users", {
  id: serial().primaryKey(),
  username: text().notNull().unique(),
  passwordHash: text("password_hash").notNull(),
});
