import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db-context";
import { getCurrentSession, hasPermission } from "@/lib/auth";
import { audit } from "@/lib/audit";

const schema = z.object({
  patientId: z.string().min(1),
  departmentId: z.string().min(1),
  doctorId: z.string().nullable().optional(),
  scheduledAt: z.string().datetime(),
  reason: z.string().max(500).optional().or(z.literal("")),
  diagnosis: z.string().max(500).optional().or(z.literal("")),
  symptoms: z.string().max(2000).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
  serviceIds: z.array(z.string()).default([]),
  status: z
    .enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"])
    .optional(),
});

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const db = await getDb();
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await ctx.params;
  const visit = await db.visit.findUnique({
    where: { id },
    include: {
      patient: true,
      services: { include: { service: true } },
    },
  });
  if (!visit) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ visit });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const db = await getDb();
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!hasPermission(session.role, "VISITS_EDIT")) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const existing = await db.visit.findUnique({ where: { id } });
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

  // Ringarko shërbimet e reja dhe llogarit total-in
  const services = body.serviceIds.length
    ? await db.service.findMany({ where: { id: { in: body.serviceIds } } })
    : [];
  const totalAmount = services.reduce((s, x) => s + Number(x.price), 0);

  const visit = await db.visit.update({
    where: { id },
    data: {
      patientId: body.patientId,
      departmentId: body.departmentId,
      doctorId: body.doctorId || null,
      scheduledAt: new Date(body.scheduledAt),
      reason: body.reason || null,
      diagnosis: body.diagnosis || null,
      symptoms: body.symptoms || null,
      notes: body.notes || null,
      totalAmount,
      ...(body.status ? { status: body.status } : {}),
      services: {
        deleteMany: {}, // pastron të gjitha shërbimet e mëparshme
        create: services.map((s) => ({
          serviceId: s.id,
          quantity: 1,
          unitPrice: s.price,
          total: s.price,
        })),
      },
    },
  });

  await audit({
    userId: session.userId,
    action: "UPDATE",
    entityType: "Visit",
    entityId: visit.id,
    metadata: { code: visit.code },
  });

  return NextResponse.json({ ok: true, visit });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const db = await getDb();
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!hasPermission(session.role, "VISITS_EDIT")) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const existing = await db.visit.findUnique({ where: { id }, select: { id: true, code: true, invoiceId: true } });
  if (!existing) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (existing.invoiceId) {
    return NextResponse.json(
      { error: "Vizita ka faturë të lidhur — fshini më parë faturën." },
      { status: 400 },
    );
  }

  await db.visit.delete({ where: { id } });
  await audit({
    userId: session.userId,
    action: "DELETE",
    entityType: "Visit",
    entityId: id,
    metadata: { code: existing.code },
  });
  return NextResponse.json({ ok: true });
}
