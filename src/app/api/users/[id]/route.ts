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
  password: z.string().min(8).max(128).optional().or(z.literal("")),
  role: z.enum([
    "SUPER_ADMIN",
    "ADMIN",
    "DOCTOR",
    "LAB_TECHNICIAN",
    "RECEPTIONIST",
    "ACCOUNTANT",
    "NURSE",
    "VIEWER",
  ]),
  departmentId: z.string().nullable().optional(),
  twoFactorEnabled: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const db = await getDb();
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!hasPermission(session.role, "USERS_MANAGE")) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const existing = await db.user.findFirst({ where: { id } });
  if (!existing) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Invalid" }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Mbroj nga eskalim privilegjesh: vetëm SUPER_ADMIN mund të caktojë / ndryshojë në SUPER_ADMIN
  if (body.role === "SUPER_ADMIN" && session.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Vetëm SUPER_ADMIN mund të caktojë rolin SUPER_ADMIN" },
      { status: 403 },
    );
  }
  // Po ashtu mbro nga heqja e SUPER_ADMIN nga dikush që s'është SUPER_ADMIN
  if (existing.role === "SUPER_ADMIN" && body.role !== "SUPER_ADMIN" && session.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Vetëm SUPER_ADMIN mund të heqë rolin SUPER_ADMIN" },
      { status: 403 },
    );
  }

  // Nëse email-i ndryshon, kontrollo unicitetin brenda tenant-it
  const newEmail = body.email.toLowerCase();
  if (newEmail !== existing.email) {
    const dup = await db.user.findFirst({ where: { email: newEmail } });
    if (dup) return NextResponse.json({ error: "Email-i është në përdorim" }, { status: 409 });
  }

  const data: Record<string, unknown> = {
    firstName: body.firstName,
    lastName: body.lastName,
    email: newEmail,
    phone: body.phone || null,
    role: body.role,
    departmentId: body.departmentId || null,
  };
  if (typeof body.twoFactorEnabled === "boolean") data.twoFactorEnabled = body.twoFactorEnabled;
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;

  // Password ndryshohet vetëm nëse jepet
  if (body.password) {
    const strength = evaluatePasswordStrength(body.password);
    if (strength.issues.length > 0) {
      return NextResponse.json(
        { error: `Fjalëkalimi: ${strength.issues.join(", ")}` },
        { status: 400 },
      );
    }
    data.passwordHash = await hashPassword(body.password);
  }

  const user = await db.user.update({ where: { id }, data });

  await audit({
    userId: session.userId,
    action: "UPDATE",
    entityType: "User",
    entityId: user.id,
    metadata: {
      email: user.email,
      role: user.role,
      passwordChanged: Boolean(body.password),
    },
  });

  return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, role: user.role } });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const db = await getDb();
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!hasPermission(session.role, "USERS_MANAGE")) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await ctx.params;
  if (id === session.userId) {
    return NextResponse.json({ error: "Nuk mund të çaktivizoni veten" }, { status: 400 });
  }
  const existing = await db.user.findFirst({ where: { id } });
  if (!existing) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  // Soft-delete: çaktivizo në vend të fshirjes (mban referencat e historive)
  const user = await db.user.update({ where: { id }, data: { isActive: false } });

  await audit({
    userId: session.userId,
    action: "UPDATE",
    entityType: "User",
    entityId: user.id,
    metadata: { email: user.email, deactivated: true },
  });

  return NextResponse.json({ ok: true });
}
