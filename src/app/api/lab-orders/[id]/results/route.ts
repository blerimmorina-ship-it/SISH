import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db-context";
import { getCurrentSession, hasPermission } from "@/lib/auth";
import { audit } from "@/lib/audit";

const schema = z.object({
  updates: z.array(
    z.object({
      id: z.string(),
      value: z.string(),
      flag: z.enum(["PENDING", "NORMAL", "ABNORMAL", "CRITICAL"]),
    }),
  ),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = await getDb();
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!hasPermission(session.role, "LAB_EDIT"))
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const { id: orderId } = await params;
  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  const now = new Date();
  await db.$transaction(
    body.updates.map((u) =>
      db.labResult.update({
        where: { id: u.id },
        data: {
          value: u.value,
          flag: u.flag,
          enteredById: session.userId,
          enteredAt: u.value ? now : null,
        },
      }),
    ),
  );

  // If all results have values, mark order as completed
  const remaining = await db.labResult.count({
    where: { orderId, OR: [{ value: "" }, { flag: "PENDING" }] },
  });
  if (remaining === 0) {
    await db.labOrder.update({
      where: { id: orderId },
      data: { status: "COMPLETED", completedAt: now },
    });
  } else {
    await db.labOrder.update({
      where: { id: orderId },
      data: { status: "IN_PROGRESS" },
    });
  }

  await audit({
    userId: session.userId,
    action: "UPDATE",
    entityType: "LabOrder",
    entityId: orderId,
    metadata: { resultsUpdated: body.updates.length },
  });

  return NextResponse.json({ ok: true });
}
