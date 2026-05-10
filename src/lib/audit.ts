import { prisma } from "./db";
import { getCurrentSession } from "./auth";
import type { AuditAction } from "@prisma/client";

export interface AuditEntry {
  userId?: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
  /** Override tenantId nëse audit thirret jashtë konteksit të session-it (p.sh. login). */
  tenantId?: string | null;
}

export async function audit(entry: AuditEntry): Promise<void> {
  try {
    // Tenant është i detyrueshëm te skema; nëse s'është dhënë, nxirre nga session-i.
    let tenantId = entry.tenantId ?? null;
    if (!tenantId) {
      const session = await getCurrentSession();
      tenantId = session?.tenantId ?? null;
    }
    if (!tenantId) {
      // Pa tenantId nuk mund të shkruajmë audit (DB-ja e kërkon non-null);
      // log-u mbetet vetëm te console, që mos e thyejmë rrjedhën e kërkesës.
      console.warn(`Audit skipped (no tenantId): ${entry.action} ${entry.entityType}`);
      return;
    }

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: entry.userId ?? null,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId ?? null,
        metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
        ipAddress: entry.ipAddress ?? null,
        userAgent: entry.userAgent ?? null,
      },
    });
  } catch (err) {
    // Never let audit failure break the request
    console.error("Audit log failed:", err);
  }
}
