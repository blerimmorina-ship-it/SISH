import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db-context";
import { getCurrentSession, hasPermission } from "@/lib/auth";
import { audit } from "@/lib/audit";

const schema = z.object({
  status: z.enum(["DRAFT", "SENT", "APPROVED", "REJECTED", "EXPIRED", "CONVERTED"]),
});

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const db = await getDb();
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!hasPermission(session.role, "QUOTES_EDIT")) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const existing = await db.quote.findFirst({ where: { id } });
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

  const now = new Date();
  const data: Record<string, unknown> = { status: body.status };
  if (body.status === "APPROVED" && !existing.approvedAt) data.approvedAt = now;

  const quote = await db.quote.update({ where: { id }, data });

  await audit({
    userId: session.userId,
    action: "UPDATE",
    entityType: "Quote",
    entityId: quote.id,
    metadata: { code: quote.code, status: quote.status },
  });

  return NextResponse.json({ ok: true, quote });
}
