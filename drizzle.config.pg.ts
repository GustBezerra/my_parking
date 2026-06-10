import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema-pg.ts",
  out: "./drizzle-pg",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.SUPABASE_URL!,
  },
});
