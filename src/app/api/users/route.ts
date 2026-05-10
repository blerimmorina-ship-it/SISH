import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db-context";
import { hashPassword, evaluatePasswordStrength } from "@/lib/password";
import { getCurrentSession, hasPermission } from "@/lib/auth";
import { audit } from "@/lib/audit";

const schema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email(),
  phone: z.string().max(20).optional().or(z.literal("")),
  password: z.string().min(8).max(128),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "DOCTOR", "LAB_TECHNICIAN", "RECEPTIONIST", "ACCOUNTANT", "NURSE", "VIEWER"]),
  departmentId: z.string().nullable().optional(),
  twoFactorEnabled: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const db = await getDb();
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!hasPermission(session.role, "USERS_MANAGE"))
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Invalid" }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // SIGURI: Vetëm një SUPER_ADMIN tjetër mund të krijojë SUPER_ADMIN.
  // Pa këtë check, çdo ADMIN i çdo tenanti do të mund të bënte
  // privilege-eskalim cross-tenant duke krijuar përdorues SUPER_ADMIN.
  if (body.role === "SUPER_ADMIN" && session.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Vetëm SUPER_ADMIN mund të caktojë rolin SUPER_ADMIN" },
      { status: 403 },
    );
  }

  const strength = evaluatePasswordStrength(body.password);
  if (strength.issues.length > 0) {
    return NextResponse.json({ error: `Fjalëkalimi: ${strength.issues.join(", ")}` }, { status: 400 });
  }

  // User është @@unique([tenantId, email]) — gjej brenda tenant-it (auto-injected)
  const existing = await db.user.findFirst({ where: { email: body.email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "Email-i është në përdorim" }, { status: 409 });
  }

  const passwordHash = await hashPassword(body.password);

  const user = await db.user.create({
    data: {
      email: body.email.toLowerCase(),
      passwordHash,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone || null,
      role: body.role,
      departmentId: body.departmentId || null,
      twoFactorEnabled: body.twoFactorEnabled,
    },
  });

  await audit({
    userId: session.userId,
    action: "CREATE",
    entityType: "User",
    entityId: user.id,
    metadata: { email: user.email, role: user.role },
  });

  return NextResponse.json({ ok: true, user: { id: user.id, email: user.email } }, { status: 201 });
}
