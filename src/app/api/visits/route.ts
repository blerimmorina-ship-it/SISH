import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db-context";
import { getCurrentSession, hasPermission } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { generateCode } from "@/lib/utils";

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
});

export async function POST(req: NextRequest) {
  const db = await getDb();
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!hasPermission(session.role, "VISITS_EDIT")) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Invalid" }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Generate visit code
  const last = await db.visit.findFirst({ orderBy: { createdAt: "desc" }, select: { code: true } });
  const nextSeq = last?.code ? Number(last.code.split("-")[2] ?? 0) + 1 : 1;
  const code = generateCode("V", nextSeq);

  // Resolve services and total
  const services = body.serviceIds.length
    ? await db.service.findMany({ where: { id: { in: body.serviceIds } } })
    : [];
  const totalAmount = services.reduce((s, x) => s + Number(x.price), 0);

  const visit = await db.visit.create({
    data: {
      code,
      patientId: body.patientId,
      departmentId: body.departmentId,
      doctorId: body.doctorId || null,
      scheduledAt: new Date(body.scheduledAt),
      reason: body.reason || null,
      diagnosis: body.diagnosis || null,
      symptoms: body.symptoms || null,
      notes: body.notes || null,
      totalAmount,
      createdById: session.userId,
      services: {
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
    action: "CREATE",
    entityType: "Visit",
    entityId: visit.id,
    metadata: { code: visit.code },
  });

  return NextResponse.json({ ok: true, visit }, { status: 201 });
}
