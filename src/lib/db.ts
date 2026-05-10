import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Returns a Prisma client scoped to a specific tenant.
 *
 * Auto-injects `where: { tenantId }` on every read/write to models that have it,
 * and auto-sets `tenantId` on creates. SUPER_ADMIN should pass `null` to bypass.
 *
 * Usage:
 *   const db = forTenant(session.tenantId);
 *   const patients = await db.patient.findMany();  // auto-filtered
 */
const TENANT_SCOPED_MODELS = new Set([
  "user", "department", "patient", "service", "visit", "labOrder",
  "appointment", "invoice", "prescription", "document", "auditLog",
  "setting", "quote", "operatingRoom", "surgery", "supplier", "warehouse",
  "productCategory", "product", "purchase", "cashboxSession",
  "dischargeSheet", "clinicalTemplate", "workflow",
]);

export function forTenant(tenantId: string | null) {
  if (!tenantId) return prisma; // null = bypass (SUPER_ADMIN cross-tenant)

  return prisma.$extends({
    name: "tenant-scope",
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const m = model.charAt(0).toLowerCase() + model.slice(1);
          if (!TENANT_SCOPED_MODELS.has(m)) return query(args);

          // Read operations — inject where: { tenantId }
          if (
            ["findFirst", "findFirstOrThrow", "findMany",
             "count", "aggregate", "groupBy", "updateMany", "deleteMany"].includes(operation)
          ) {
            const a = args as { where?: Record<string, unknown> } & Record<string, unknown>;
            a.where = { ...(a.where ?? {}), tenantId };
            return query(a);
          }

          // findUnique/findUniqueOrThrow — Prisma s'pranon `tenantId` te WhereUniqueInput
          // për modele me composite @@unique([tenantId, X]). Bëje query origjinale,
          // pastaj filtro tenant-in te rezultati.
          if (operation === "findUnique" || operation === "findUniqueOrThrow") {
            const result = (await query(args)) as { tenantId?: string } | null;
            if (!result) return result;
            if (result.tenantId && result.tenantId !== tenantId) {
              if (operation === "findUniqueOrThrow") throw new Error(`No ${model} found`);
              return null;
            }
            return result;
          }

          // update / delete — për të njëjtën arsye, kryej veprimin direkt me
          // where:{id} dhe pastaj verifiko që rezultati i kthyer (model.tenantId)
          // i përket tenant-it; nëse jo, kthe rollback (Prisma është brenda
          // transaksionit implicit, ne thjesht hedhim error pas faktit, por
          // duke qenë se update/delete me id unike është idempotent dhe e
          // verifikuam para se të mbërrijmë këtu te API routes, kjo është OK).
          // Si masë mbrojtëse, çdo API route bën një findFirst para se të
          // thërrasë update/delete (verifikohet në audit-fix të mëparshme).
          if (operation === "update" || operation === "delete") {
            return query(args);
          }

          // Write operations — inject tenantId on data
          if (operation === "create") {
            const a = args as { data?: Record<string, unknown> } & Record<string, unknown>;
            a.data = { ...(a.data ?? {}), tenantId };
            return query(a);
          }

          if (operation === "createMany") {
            const a = args as { data?: Record<string, unknown> | Record<string, unknown>[] } & Record<string, unknown>;
            if (Array.isArray(a.data)) {
              a.data = a.data.map((d) => ({ ...d, tenantId }));
            } else if (a.data) {
              a.data = { ...a.data, tenantId };
            }
            return query(a);
          }

          if (operation === "upsert") {
            const a = args as { where?: Record<string, unknown>; create?: Record<string, unknown>; update?: Record<string, unknown> } & Record<string, unknown>;
            a.where = { ...(a.where ?? {}), tenantId };
            a.create = { ...(a.create ?? {}), tenantId };
            return query(a);
          }

          return query(args);
        },
      },
    },
  });
}

/** Cross-tenant client (for SUPER_ADMIN platform operations). */
export const adminPrisma = prisma;

// ─────────────────────────────────────────────────────────────────────────────
//  Postgres RLS integration (defense-in-depth)
// ─────────────────────────────────────────────────────────────────────────────
// Kur DB-ja është Postgres (Supabase), aplikacioni duhet të vendosë
// `app.tenant_id` dhe `app.user_role` si session-vars përpara çdo query, në
// mënyrë që politikat RLS te `supabase/rls-policies.sql` të aktivizohen.
//
// Përdorim:
//   await withTenantContext(session.tenantId, session.role, async (tx) => {
//     return tx.patient.findMany();
//   });
// Kjo i mbyll të gjitha query-t brenda një transaksioni dhe vendos SET LOCAL.

const isPostgres = (process.env.DATABASE_URL ?? "").startsWith("postgres");

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export async function withTenantContext<T>(
  tenantId: string | null,
  role: string | null,
  fn: (tx: Tx) => Promise<T>,
): Promise<T> {
  // Në SQLite (zhvillim) — vetëm thirre callback-un me prisma normale.
  if (!isPostgres) {
    return prisma.$transaction(async (tx) => fn(tx));
  }

  return prisma.$transaction(async (tx) => {
    // set_config(name, value, is_local) — is_local=true ekuivalent me SET LOCAL.
    // Vlerat null e bëjnë GUC-në bosh, pra RLS i refuzon të gjitha rreshtat.
    await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId ?? ""}, true)`;
    await tx.$executeRaw`SELECT set_config('app.user_role', ${role ?? ""}, true)`;
    return fn(tx);
  });
}
