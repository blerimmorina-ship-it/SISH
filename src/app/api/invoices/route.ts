import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db-context";
import { getCurrentSession, hasPermission } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { generateCode } from "@/lib/utils";

const itemSchema = z.object({
  description: z.string().min(1).max(200),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
  discount: z.number().min(0),
  vatRate: z.number().min(0),
});

const schema = z.object({
  patientId: z.string().min(1),
  visitId: z.string().nullable().optional(),
  items: z.array(itemSchema).min(1),
  globalDiscount: z.number().min(0).default(0),
  notes: z.string().max(2000).optional().or(z.literal("")),
  dueDate: z.string().nullable().optional(),
  issueNow: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const db = await getDb();
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!hasPermission(session.role, "BILLING_EDIT"))
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

  // Calculate totals
  let subtotal = 0;
  let vat = 0;
  for (const it of body.items) {
    const lineSub = it.unitPrice * it.quantity - it.discount;
    subtotal += lineSub;
    vat += (lineSub * it.vatRate) / 100;
  }
  const total = Math.max(0, subtotal + vat - body.globalDiscount);

  const last = await db.invoice.findFirst({ orderBy: { createdAt: "desc" }, select: { number: true } });
  const seq = last?.number ? Number(last.number.split("-")[2] ?? 0) + 1 : 1;

  const invoice = await db.invoice.create({
    data: {
      number: generateCode("INV", seq),
      patientId: body.patientId,
      visitId: body.visitId || null,
      status: body.issueNow ? "ISSUED" : "DRAFT",
      issuedAt: body.issueNow ? new Date() : null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      subtotal,
      vat,
      discount: body.globalDiscount,
      total,
      balance: total,
      notes: body.notes || null,
      issuedById: session.userId,
      items: {
        create: body.items.map((it) => ({
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          discount: it.discount,
          vat: ((it.unitPrice * it.quantity - it.discount) * it.vatRate) / 100,
          total: it.unitPrice * it.quantity - it.discount + ((it.unitPrice * it.quantity - it.discount) * it.vatRate) / 100,
        })),
      },
    },
  });

  await audit({
    userId: session.userId,
    action: "CREATE",
    entityType: "Invoice",
    entityId: invoice.id,
    metadata: { number: invoice.number, total },
  });

  return NextResponse.json({ ok: true, invoice }, { status: 201 });
}
