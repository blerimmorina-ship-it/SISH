import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db-context";
import { getCurrentSession, hasPermission } from "@/lib/auth";
import { audit } from "@/lib/audit";

const schema = z.object({
  amount: z.number().min(0.01),
  method: z.enum(["CASH", "CARD", "BANK_TRANSFER", "INSURANCE", "MIXED"]),
  reference: z.string().max(80).optional().or(z.literal("")),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = await getDb();
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!hasPermission(session.role, "BILLING_EDIT"))
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const { id: invoiceId } = await params;
  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Invalid" }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const invoice = await db.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const balance = Number(invoice.total) - Number(invoice.paidAmount);
  if (body.amount > balance + 0.01) {
    return NextResponse.json({ error: `Shuma tejkalon bilancin (${balance})` }, { status: 400 });
  }

  await db.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        invoiceId,
        amount: body.amount,
        method: body.method,
        reference: body.reference || null,
      },
    });
    const newPaid = Number(invoice.paidAmount) + body.amount;
    const newBalance = Number(invoice.total) - newPaid;
    await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount: newPaid,
        balance: newBalance,
        status: newBalance <= 0.01 ? "PAID" : "PARTIALLY_PAID",
      },
    });
  });

  await audit({
    userId: session.userId,
    action: "CREATE",
    entityType: "Payment",
    entityId: invoiceId,
    metadata: { amount: body.amount, method: body.method },
  });

  return NextResponse.json({ ok: true });
}
