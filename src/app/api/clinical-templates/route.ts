import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db-context";
import { getCurrentSession } from "@/lib/auth";
import { audit } from "@/lib/audit";

const schema = z.object({
  category: z.enum(["SYMPTOM", "EXAM", "DIAGNOSIS", "THERAPY", "ANALYSIS", "ADVICE", "CONTROL", "NOTE"]),
  departmentId: z.string().nullable().optional(),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(5000),
  shortcut: z.string().max(20).nullable().optional(),
  icd10: z.string().max(10).nullable().optional(),
});

export async function POST(req: NextRequest) {
  const db = await getDb();
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Invalid" }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const tpl = await db.clinicalTemplate.create({
    data: {
      category: body.category,
      departmentId: body.departmentId || null,
      title: body.title,
      body: body.body,
      shortcut: body.shortcut || null,
      icd10: body.icd10 || null,
    },
  });

  await audit({
    userId: session.userId,
    action: "CREATE",
    entityType: "ClinicalTemplate",
    entityId: tpl.id,
    metadata: { category: tpl.category },
  });

  return NextResponse.json({ ok: true, template: tpl }, { status: 201 });
}
