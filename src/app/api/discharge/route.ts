import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db-context";
import { getCurrentSession, hasPermission } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { generateCode } from "@/lib/utils";

const schema = z.object({
  patientId: z.string().min(1),
  visitId: z.string().nullable().optional(),
  admittedAt: z.string().datetime(),
  dischargedAt: z.string().datetime().nullable().optional(),
  primaryDiagnosis: z.string().min(1).max(500),
  secondaryDiagnoses: z.string().max(2000).optional().or(z.literal("")),
  treatmentSummary: z.string().max(5000).optional().or(z.literal("")),
  recommendations: z.string().max(5000).optional().or(z.literal("")),
  followUpDate: z.string().nullable().optional(),
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

  const last = await db.dischargeSheet.findFirst({ orderBy: { createdAt: "desc" }, select: { number: true } });
  const seq = last?.number ? Number(last.number.split("-")[2] ?? 0) + 1 : 1;

  const sheet = await db.dischargeSheet.create({
    data: {
      number: generateCode("DS", seq),
      patientId: body.patientId,
      visitId: body.visitId || null,
      admittedAt: new Date(body.admittedAt),
      dischargedAt: body.dischargedAt ? new Date(body.dischargedAt) : null,
      primaryDiagnosis: body.primaryDiagnosis,
      secondaryDiagnoses: body.secondaryDiagnoses || null,
      treatmentSummary: body.treatmentSummary || null,
      recommendations: body.recommendations || null,
      followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
    },
  });

  await audit({
    userId: session.userId,
    action: "CREATE",
    entityType: "DischargeSheet",
    entityId: sheet.id,
    metadata: { number: sheet.number },
  });

  return NextResponse.json({ ok: true, sheet }, { status: 201 });
}
