import "server-only";
import { prisma } from "./db";
import { getCurrentSession } from "./auth";

/**
 * Resolve the active tenant for the current request.
 * Order of precedence:
 *   1. Session JWT (user is logged in)
 *   2. Subdomain (e.g. klinika-x.sish.app → tenantCode = "klinika-x")
 *   3. null (anonymous, e.g. signup page)
 */
export async function resolveTenant(host?: string | null): Promise<{
  id: string;
  code: string;
  name: string;
  primaryColor: string | null;
  logoUrl: string | null;
  plan: string;
} | null> {
  // 1. Session-based (logged in user)
  const session = await getCurrentSession();
  if (session?.tenantId) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: session.tenantId },
      select: { id: true, code: true, name: true, primaryColor: true, logoUrl: true, plan: true, isActive: true },
    });
    if (tenant?.isActive) return tenant;
  }

  // 2. Subdomain-based
  if (host) {
    const subdomain = extractSubdomain(host);
    if (subdomain && !["www", "app", "api"].includes(subdomain)) {
      const tenant = await prisma.tenant.findUnique({
        where: { code: subdomain },
        select: { id: true, code: true, name: true, primaryColor: true, logoUrl: true, plan: true, isActive: true },
      });
      if (tenant?.isActive) return tenant;
    }
  }

  return null;
}

export function extractSubdomain(host: string): string | null {
  // Strip port
  const cleaned = host.split(":")[0] ?? "";
  // localhost / IP — no subdomain
  if (cleaned === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(cleaned)) return null;
  // For 127.0.0.1, treat as localhost
  if (cleaned === "127.0.0.1") return null;
  const parts = cleaned.split(".");
  // klinika-x.sish.app → ["klinika-x", "sish", "app"] → return "klinika-x"
  // sish.app → no subdomain
  if (parts.length < 3) return null;
  return parts[0] ?? null;
}

/** Throws if user attempts cross-tenant access. */
export async function assertSameTenant(entityTenantId: string): Promise<void> {
  const session = await getCurrentSession();
  if (!session) throw new Error("UNAUTHORIZED");
  if (session.role === "SUPER_ADMIN") return; // platform admin can access anything
  if (session.tenantId !== entityTenantId) {
    throw new Error("FORBIDDEN_CROSS_TENANT");
  }
}
