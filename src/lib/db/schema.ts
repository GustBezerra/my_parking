import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const parkingSpots = sqliteTable("parking_spots", {
  id: integer().primaryKey({ autoIncrement: true }),
  code: integer().notNull().unique(),
  status: text({ enum: ["disponivel", "ocupada"] }).notNull().default("disponivel"),
});

export const entries = sqliteTable("entries", {
  id: integer().primaryKey({ autoIncrement: true }),
  spotId: integer("spot_id").notNull().references(() => parkingSpots.id),
  token: text().notNull().unique(),
  entryTime: text("entry_time").notNull(),
  exitTime: text("exit_time"),
});

export const adminUsers = sqliteTable("admin_users", {
  id: integer().primaryKey({ autoIncrement: true }),
  username: text().notNull().unique(),
  passwordHash: text("password_hash").notNull(),
});
