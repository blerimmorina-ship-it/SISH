import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db-context";
import { getCurrentSession, hasPermission } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { generateCode } from "@/lib/utils";

const schema = z.object({
  patientId: z.string().min(1),
  departmentId: z.string().min(1),
  visitId: z.string().nullable().optional(),
  priority: z.enum(["normal", "urgent", "stat"]).default("normal"),
  clinicalInfo: z.string().max(2000).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
  templateIds: z.array(z.string()).min(1),
});

export async function POST(req: NextRequest) {
  const db = await getDb();
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!hasPermission(session.role, "LAB_EDIT"))
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

  const last = await db.labOrder.findFirst({ orderBy: { createdAt: "desc" }, select: { code: true } });
  const seq = last?.code ? Number(last.code.split("-")[2] ?? 0) + 1 : 1;

  // Pre-create result records for each parameter
  const templates = await db.labTestTemplate.findMany({
    where: { id: { in: body.templateIds } },
    include: { parameters: true },
  });
  const allParams = templates.flatMap((t) => t.parameters);

  const order = await db.labOrder.create({
    data: {
      code: generateCode("L", seq),
      patientId: body.patientId,
      departmentId: body.departmentId,
      visitId: body.visitId || null,
      requestedById: session.userId,
      priority: body.priority,
      clinicalInfo: body.clinicalInfo || null,
      notes: body.notes || null,
      results: {
        create: allParams.map((p) => ({
          parameterId: p.id,
          value: "",
          flag: "PENDING",
        })),
      },
    },
  });

  await audit({
    userId: session.userId,
    action: "CREATE",
    entityType: "LabOrder",
    entityId: order.id,
    metadata: { code: order.code, parameters: allParams.length },
  });

  return NextResponse.json({ ok: true, order }, { status: 201 });
}
