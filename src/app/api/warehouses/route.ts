import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db-context";
import { getCurrentSession } from "@/lib/auth";
import { audit } from "@/lib/audit";

const schema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(50),
  address: z.string().nullable().optional(),
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

  const exists = await db.warehouse.findUnique({ where: { code: body.code } });
  if (exists) return NextResponse.json({ error: "Kodi është në përdorim" }, { status: 409 });

  const warehouse = await db.warehouse.create({
    data: { name: body.name, code: body.code, address: body.address || null },
  });

  await audit({
    userId: session.userId,
    action: "CREATE",
    entityType: "Warehouse",
    entityId: warehouse.id,
    metadata: { name: warehouse.name },
  });

  return NextResponse.json({ ok: true, warehouse }, { status: 201 });
}
