import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db-context";
import { getCurrentSession, hasPermission } from "@/lib/auth";
import { audit } from "@/lib/audit";

const openSchema = z.object({
  action: z.literal("open"),
  openingFloat: z.number().nonnegative().default(0),
  notes: z.string().max(500).optional().or(z.literal("")),
});

const closeSchema = z.object({
  action: z.literal("close"),
  sessionId: z.string().min(1),
  closingCash: z.number().nonnegative(),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  const db = await getDb();
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!hasPermission(session.role, "CASHBOX_EDIT")) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const baseAction = (payload as { action?: string })?.action;

  if (baseAction === "open") {
    const body = openSchema.parse(payload);

    // Verifiko që nuk ka sesion tjetër të hapur
    const existing = await db.cashboxSession.findFirst({ where: { closedAt: null } });
    if (existing) {
      return NextResponse.json(
        { error: "Ka tashmë një sesion të hapur. Mbylle atë para se të hapësh të ri." },
        { status: 409 },
      );
    }

    const cashSession = await db.cashboxSession.create({
      data: {
        openedById: session.userId,
        openingFloat: body.openingFloat,
        notes: body.notes || null,
      },
    });

    await audit({
      userId: session.userId,
      action: "CREATE",
      entityType: "CashboxSession",
      entityId: cashSession.id,
      metadata: { openingFloat: body.openingFloat },
    });

    return NextResponse.json({ ok: true, session: cashSession }, { status: 201 });
  }

  if (baseAction === "close") {
    const body = closeSchema.parse(payload);

    const existing = await db.cashboxSession.findFirst({
      where: { id: body.sessionId, closedAt: null },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Sesioni nuk u gjet ose është mbyllur tashmë" },
        { status: 404 },
      );
    }

    // Llogarit expectedCash bazuar te pagesa cash gjatë sesionit
    const cashSum = await db.payment.aggregate({
      where: {
        method: "CASH",
        createdAt: { gte: existing.openedAt },
      },
      _sum: { amount: true },
    });
    const expectedCash =
      Number(existing.openingFloat) + Number(cashSum._sum.amount ?? 0);
    const variance = body.closingCash - expectedCash;

    const closed = await db.cashboxSession.update({
      where: { id: body.sessionId },
      data: {
        closedById: session.userId,
        closedAt: new Date(),
        closingCash: body.closingCash,
        expectedCash,
        variance,
        notes: body.notes || existing.notes || null,
      },
    });

    await audit({
      userId: session.userId,
      action: "UPDATE",
      entityType: "CashboxSession",
      entityId: closed.id,
      metadata: { closingCash: body.closingCash, expectedCash, variance },
    });

    return NextResponse.json({ ok: true, session: closed });
  }

  return NextResponse.json({ error: "Action duhet të jetë 'open' ose 'close'" }, { status: 400 });
}
