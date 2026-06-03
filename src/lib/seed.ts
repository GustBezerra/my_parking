/*
 * HOW TO USE:
  * If you haven't already, run `npx drizzle-kit migrate`
  * Then, run `npm run seed`
*/

import { getDb } from "@/lib/db";
import { parkingSpots, entries, adminUsers } from "@/lib/db/schema";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";

const TOTAL_SPOTS = 10;

function seedLog(msg: string) {
  console.log(`[seed] ${msg}`);
}

async function main() {
  const db = getDb();

  const existingSpots = await db.select().from(parkingSpots).limit(1);
  if (existingSpots.length > 0) {
    seedLog("DB ja tem dados. Nada feito.");
    return;
  }

  seedLog(`Inserindo ${TOTAL_SPOTS} vagas...`);
  await db.insert(parkingSpots).values(
    Array.from({ length: TOTAL_SPOTS }, (_, i) => ({
      code: i + 1,
      status: "disponivel" as const,
    })),
  );

  const passwordHash = await hash("admin123", 12);
  await db.insert(adminUsers).values({
    username: "admin",
    passwordHash,
  });
  seedLog("Admin criado: admin / admin123");

  const agora = new Date();
  const ms = (h: number) => h * 60 * 60 * 1000;

  const entriesData = [
    {
      spotCode: 1,
      token: crypto.randomUUID(),
      entryTime: new Date(agora.getTime() - ms(5)).toISOString(),
      exitTime: new Date(agora.getTime() - ms(1)).toISOString(),
    },
    {
      spotCode: 2,
      token: crypto.randomUUID(),
      entryTime: new Date(agora.getTime() - ms(24)).toISOString(),
      exitTime: new Date(agora.getTime() - ms(2)).toISOString(),
    },
    {
      spotCode: 3,
      token: crypto.randomUUID(),
      entryTime: new Date(agora.getTime() - ms(48)).toISOString(),
      exitTime: new Date(agora.getTime() - ms(20)).toISOString(),
    },
    {
      spotCode: 4,
      token: crypto.randomUUID(),
      entryTime: new Date(agora.getTime() - ms(3)).toISOString(),
      exitTime: null,
    },
    {
      spotCode: 5,
      token: crypto.randomUUID(),
      entryTime: new Date(agora.getTime() - ms(1)).toISOString(),
      exitTime: null,
    },
  ];

  const allSpots = await db.select().from(parkingSpots);

  for (const e of entriesData) {
    const spot = allSpots.find((s) => s.code === e.spotCode)!;
    await db
      .insert(entries)
      .values({
        spotId: spot.id,
        token: e.token,
        entryTime: e.entryTime,
        exitTime: e.exitTime,
      })

    seedLog(
      `Entry spot=${e.spotCode} token=${e.token.slice(0, 8)}... entrada=${e.entryTime} saida=${e.exitTime ?? "ativa"}`,
    );

    if (e.exitTime === null) {
      await db
        .update(parkingSpots)
        .set({ status: "ocupada" })
        .where(eq(parkingSpots.id, spot.id));
    }
  }

  const disponiveis = (await db.select().from(parkingSpots)).filter(
    (s) => s.status === "disponivel",
  ).length;
  seedLog(`Pronto. ${disponiveis} vagas disponiveis, ${TOTAL_SPOTS - disponiveis} ocupadas.`);
}

main().catch((err) => {
  console.error("[seed] Erro:", err);
  process.exit(1);
});
