import "server-only";
import { forTenant, prisma } from "./db";
import { getCurrentSession } from "./auth";

/**
 * Returns a Prisma client auto-scoped to the current user's tenant.
 *
 * Usage in server components / API routes:
 *   const db = await getDb();
 *   const patients = await db.patient.findMany(); // filtered by tenantId
 *
 * For SUPER_ADMIN cross-tenant operations, use `prisma` directly.
 */
export async function getDb() {
  const session = await getCurrentSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return forTenant(session.tenantId);
}

/** Cross-tenant client (only for SUPER_ADMIN platform operations). */
export { prisma as platformDb } from "./db";
