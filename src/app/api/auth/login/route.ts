import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";

const schema = z.object({
  email: z.string().email("Emaili nuk është i vlefshëm"),
  password: z.string().min(1, "Fjalëkalimi është i kërkuar"),
  tenantCode: z.string().optional(), // optional — login can match across tenants by email
  remember: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const userAgent = req.headers.get("user-agent") ?? null;

  const limit = rateLimit(`login:${ip}`, 10, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Shumë përpjekje. Provo më vonë." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  let body: z.infer<typeof schema>;
  try {
    const json = await req.json();
    body = schema.parse(json);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Të dhëna jo të vlefshme" }, { status: 400 });
    }
    return NextResponse.json({ error: "Kërkesë jo e vlefshme" }, { status: 400 });
  }

  // If tenant code provided, scope the lookup to that tenant
  let tenantId: string | undefined;
  if (body.tenantCode) {
    const tenant = await prisma.tenant.findUnique({ where: { code: body.tenantCode } });
    if (!tenant?.isActive) {
      return NextResponse.json({ error: "Klinika nuk ekziston ose është joaktive" }, { status: 404 });
    }
    tenantId = tenant.id;
  }

  // Try to find user by tenantId+email (composite unique) or fallback to first match
  const user = tenantId
    ? await prisma.user.findUnique({
        where: { tenantId_email: { tenantId, email: body.email.toLowerCase() } },
        include: { tenant: true },
      })
    : await prisma.user.findFirst({
        where: { email: body.email.toLowerCase() },
        include: { tenant: true },
      });

  if (!user || !user.isActive || !user.tenant.isActive) {
    if (tenantId) {
      await audit({
        action: "LOGIN_FAILED",
        entityType: "User",
        metadata: { email: body.email },
        ipAddress: ip,
        userAgent,
        tenantId,
      });
    }
    return NextResponse.json({ error: "Email ose fjalëkalim i pasaktë" }, { status: 401 });
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return NextResponse.json(
      { error: "Llogaria është e bllokuar përkohësisht. Provo më vonë." },
      { status: 423 },
    );
  }

  const ok = await verifyPassword(user.passwordHash, body.password);
  if (!ok) {
    const failed = user.failedAttempts + 1;
    const lockedUntil = failed >= 5 ? new Date(Date.now() + 15 * 60_000) : null;
    await prisma.user.update({
      where: { id: user.id },
      data: { failedAttempts: failed, lockedUntil },
    });
    await audit({
      userId: user.id,
      action: "LOGIN_FAILED",
      entityType: "User",
      entityId: user.id,
      ipAddress: ip,
      userAgent,
      tenantId: user.tenantId,
    });
    return NextResponse.json({ error: "Email ose fjalëkalim i pasaktë" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
  });

  const token = await createSessionToken({
    userId: user.id,
    tenantId: user.tenantId,
    tenantCode: user.tenant.code,
    email: user.email,
    role: user.role as never,
    firstName: user.firstName,
    lastName: user.lastName,
  });
  await setSessionCookie(token);

  await audit({
    userId: user.id,
    action: "LOGIN",
    entityType: "User",
    entityId: user.id,
    ipAddress: ip,
    userAgent,
    tenantId: user.tenantId,
  });

  return NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email, role: user.role },
    tenant: { id: user.tenantId, code: user.tenant.code, name: user.tenant.name },
  });
}
