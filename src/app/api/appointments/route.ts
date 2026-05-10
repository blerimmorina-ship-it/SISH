import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db-context";
import { getCurrentSession, hasPermission } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { generateCode } from "@/lib/utils";

const schema = z.object({
  patientId: z.string().nullable().optional(),
  newPatient: z
    .object({
      firstName: z.string().min(1).max(80),
      lastName: z.string().min(1).max(80),
      phone: z.string().max(20).optional().or(z.literal("")),
      dateOfBirth: z.string().optional().or(z.literal("")),
    })
    .nullable()
    .optional(),
  doctorId: z.string().min(1),
  scheduledAt: z.string().datetime(),
  durationMin: z.number().int().min(5).max(480),
  reason: z.string().max(500).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  const db = await getDb();
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!hasPermission(session.role, "VISITS_EDIT"))
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

  // Resolve or create patient
  let patientId = body.patientId ?? "";
  if (!patientId && body.newPatient) {
    const last = await db.patient.findFirst({ orderBy: { createdAt: "desc" }, select: { code: true } });
    const seq = last?.code ? Number(last.code.split("-")[2] ?? 0) + 1 : 1;
    const newPat = await db.patient.create({
      data: {
        code: generateCode("P", seq),
        firstName: body.newPatient.firstName,
        lastName: body.newPatient.lastName,
        phone: body.newPatient.phone || null,
        dateOfBirth: body.newPatient.dateOfBirth ? new Date(body.newPatient.dateOfBirth) : null,
        createdById: session.userId,
      },
    });
    patientId = newPat.id;
  }
  if (!patientId) {
    return NextResponse.json({ error: "Pacienti i kërkuar" }, { status: 400 });
  }

  const last = await db.appointment.findFirst({ orderBy: { createdAt: "desc" }, select: { code: true } });
  const seq = last?.code ? Number(last.code.split("-")[2] ?? 0) + 1 : 1;

  const appt = await db.appointment.create({
    data: {
      code: generateCode("A", seq),
      patientId,
      doctorId: body.doctorId,
      scheduledAt: new Date(body.scheduledAt),
      durationMin: body.durationMin,
      reason: body.reason || null,
      notes: body.notes || null,
    },
  });

  await audit({
    userId: session.userId,
    action: "CREATE",
    entityType: "Appointment",
    entityId: appt.id,
    metadata: { code: appt.code },
  });

  return NextResponse.json({ ok: true, appointment: appt }, { status: 201 });
}
