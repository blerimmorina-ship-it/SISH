import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db-context";
import { getCurrentSession, hasPermission } from "@/lib/auth";
import { audit } from "@/lib/audit";

const schema = z.object({
  status: z.enum(["SCHEDULED", "CONFIRMED", "ARRIVED", "IN_VISIT", "COMPLETED", "CANCELLED", "NO_SHOW"]),
});

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const db = await getDb();
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!hasPermission(session.role, "APPOINTMENTS_EDIT")) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const existing = await db.appointment.findFirst({ where: { id } });
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

  const appt = await db.appointment.update({ where: { id }, data: { status: body.status } });

  await audit({
    userId: session.userId,
    action: "UPDATE",
    entityType: "Appointment",
    entityId: appt.id,
    metadata: { code: appt.code, status: appt.status },
  });

  return NextResponse.json({ ok: true, appointment: appt });
}
