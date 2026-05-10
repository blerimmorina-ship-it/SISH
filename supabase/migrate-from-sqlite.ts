/**
 * SISH — Migrim i të dhënave nga SQLite (zhvillim) në Postgres (Supabase, prodhim)
 *
 * Përdorim:
 *   1. Sigurohu që DATABASE_URL te .env tregon në Supabase Postgres
 *   2. Run: npx prisma migrate deploy   (krijon skemat te Postgres)
 *   3. Run: npx tsx supabase/migrate-from-sqlite.ts
 *   4. Aplikon RLS: psql $DATABASE_URL -f supabase/rls-policies.sql
 *   5. Aplikon extensions: psql $DATABASE_URL -f supabase/extensions.sql
 */
import { PrismaClient as SqliteClient } from "@prisma/client";
import { PrismaClient as PostgresClient } from "@prisma/client";

// Dy Prisma clients me URL të ndryshme
const sqlite = new SqliteClient({
  datasources: { db: { url: "file:./prisma/sish.db" } },
});

const postgres = new PostgresClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

// Renditja e migrim-it RESPEKTON foreign keys
const MIGRATION_ORDER = [
  // Niveli 0: tenant root
  "tenant",
  // Niveli 1: entitete kryesore
  "department",
  "user",
  "service",
  "supplier",
  "warehouse",
  "productCategory",
  "operatingRoom",
  "clinicalTemplate",
  "workflow",
  "setting",
  // Niveli 2: junction + dependents
  "labTestTemplate",
  "labTestParameter",
  "product",
  "stockLevel",
  "patient",
  // Niveli 3: transactional
  "session",
  "visit",
  "visitService",
  "appointment",
  "labOrder",
  "labResult",
  "prescription",
  "prescriptionItem",
  "invoice",
  "invoiceItem",
  "payment",
  "quote",
  "quoteItem",
  "purchase",
  "purchaseItem",
  "surgery",
  "cashboxSession",
  "dischargeSheet",
  "document",
  // I fundit: audit log (mund të jetë i madh)
  "auditLog",
];

async function migrateModel(name: string): Promise<number> {
  const sourceModel = (sqlite as never)[name];
  const destModel = (postgres as never)[name];
  if (!sourceModel || !destModel) {
    console.warn(`  ⏭  ${name}: model nuk u gjet, anashkalim`);
    return 0;
  }

  const total = await sourceModel.count();
  if (total === 0) {
    console.log(`  ✓  ${name}: bosh`);
    return 0;
  }

  // Migrim me batches për tabela të mëdha
  const BATCH = 1000;
  let migrated = 0;

  for (let skip = 0; skip < total; skip += BATCH) {
    const batch = await sourceModel.findMany({ skip, take: BATCH });
    if (batch.length === 0) break;

    // Përdor createMany për shpejtësi (skipDuplicates për idempotency)
    await destModel.createMany({ data: batch, skipDuplicates: true });
    migrated += batch.length;
    process.stdout.write(`\r  → ${name}: ${migrated}/${total}`);
  }

  console.log(`\r  ✓  ${name}: ${migrated} rreshta migruar  `);
  return migrated;
}

async function verifyMigration(): Promise<void> {
  console.log("\n🔍 Verifikim integrity...");
  let allMatch = true;

  for (const name of MIGRATION_ORDER) {
    const sourceModel = (sqlite as never)[name];
    const destModel = (postgres as never)[name];
    if (!sourceModel || !destModel) continue;

    const [src, dst] = await Promise.all([sourceModel.count(), destModel.count()]);
    const status = src === dst ? "✅" : "❌";
    console.log(`  ${status}  ${name.padEnd(20)} SQLite=${src.toString().padStart(8)}  Postgres=${dst.toString().padStart(8)}`);
    if (src !== dst) allMatch = false;
  }

  if (allMatch) {
    console.log("\n🎉 Të gjitha tabelat u migruan me sukses!");
  } else {
    console.error("\n⚠️  Disa tabela kanë mospërputhje — verifiko manuel");
    process.exit(1);
  }
}

async function main() {
  console.log("🚀 SISH migration: SQLite → Supabase Postgres\n");

  // Reset destination (KUJDES — bën truncate në target!)
  if (process.env.MIGRATION_RESET === "true") {
    console.log("⚠️  Reset i caktuar — duke truncate tabelat e Postgres...");
    for (const name of [...MIGRATION_ORDER].reverse()) {
      const destModel = (postgres as never)[name];
      if (destModel) await destModel.deleteMany({});
    }
    console.log("✓  Reset kompletuar\n");
  }

  let totalRows = 0;
  for (const name of MIGRATION_ORDER) {
    totalRows += await migrateModel(name);
  }

  console.log(`\n✅ Migrim total: ${totalRows.toLocaleString()} rreshta\n`);

  await verifyMigration();
}

main()
  .catch((e) => {
    console.error("\n💥 Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await sqlite.$disconnect();
    await postgres.$disconnect();
  });
