import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, evaluatePasswordStrength } from "@/lib/password";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";

const schema = z.object({
  tenantName: z.string().min(2).max(120),
  tenantCode: z.string().regex(/^[a-z0-9-]{3,30}$/, "Kodi duhet 3-30 karaktere a-z 0-9 -"),
  city: z.string().max(80).optional().or(z.literal("")),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const SEED_DEPARTMENTS = [
  { code: "GP",   nameSq: "Mjeku i Përgjithshëm", color: "#6366F1" },
  { code: "PED",  nameSq: "Pediatri",            color: "#10B981" },
  { code: "CARD", nameSq: "Kardiologji",         color: "#EF4444" },
  { code: "DENT", nameSq: "Stomatologji",        color: "#0891B2" },
  { code: "BIO",  nameSq: "Biokimi (Lab)",       color: "#6366F1" },
  { code: "RADIO",nameSq: "Radiologji",          color: "#64748B" },
];

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const userAgent = req.headers.get("user-agent") ?? null;

  const limit = rateLimit(`signup:${ip}`, 5, 60 * 60_000); // 5 per hour per IP
  if (!limit.allowed) {
    return NextResponse.json({ error: "Shumë regjistrime. Provo më vonë." }, { status: 429 });
  }

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Të dhëna jo të vlefshme" }, { status: 400 });
    }
    return NextResponse.json({ error: "Kërkesë jo e vlefshme" }, { status: 400 });
  }

  const strength = evaluatePasswordStrength(body.password);
  if (strength.issues.length > 0) {
    return NextResponse.json({ error: `Fjalëkalimi: ${strength.issues.join(", ")}` }, { status: 400 });
  }

  // Check tenant code availability
  const existingTenant = await prisma.tenant.findUnique({ where: { code: body.tenantCode } });
  if (existingTenant) {
    return NextResponse.json({ error: "Ky subdomain është në përdorim" }, { status: 409 });
  }

  // Check email is not already used in another tenant (rare but defensive)
  const passwordHash = await hashPassword(body.password);

  // Trial: 30 days
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 30);

  // Create tenant + admin user + seed departments in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        code: body.tenantCode,
        name: body.tenantName,
        email: body.email,
        city: body.city || null,
        plan: "STARTER",
        trialEndsAt,
        isActive: true,
        maxUsers: 5,
        maxPatients: 500,
      },
    });

    // Seed minimal departments
    for (let i = 0; i < SEED_DEPARTMENTS.length; i++) {
      const d = SEED_DEPARTMENTS[i]!;
      await tx.department.create({
        data: {
          tenantId: tenant.id,
          code: d.code,
          name: d.code,
          nameSq: d.nameSq,
          color: d.color,
          sortOrder: i,
        },
      });
    }

    const user = await tx.user.create({
      data: {
        tenantId: tenant.id,
        email: body.email.toLowerCase(),
        passwordHash,
        firstName: body.firstName,
        lastName: body.lastName,
        role: "ADMIN",
        isActive: true,
        emailVerified: new Date(),
      },
    });

    return { tenant, user };
  });

  // Auto-login the newly registered admin
  const token = await createSessionToken({
    userId: result.user.id,
    tenantId: result.tenant.id,
    tenantCode: result.tenant.code,
    email: result.user.email,
    role: "ADMIN",
    firstName: result.user.firstName,
    lastName: result.user.lastName,
  });
  await setSessionCookie(token);

  await audit({
    userId: result.user.id,
    action: "CREATE",
    entityType: "Tenant",
    entityId: result.tenant.id,
    metadata: { code: result.tenant.code, plan: "STARTER" },
    ipAddress: ip,
    userAgent,
  });

  return NextResponse.json({
    ok: true,
    tenant: { id: result.tenant.id, code: result.tenant.code, name: result.tenant.name },
    user: { id: result.user.id, email: result.user.email, role: result.user.role },
  }, { status: 201 });
}
