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
});

const schema = z.object({
  title: z.string().min(1).max(200),
  patientName: z.string().nullable().optional(),
  patientPhone: z.string().nullable().optional(),
  validFrom: z.string(),
  validUntil: z.string(),
  items: z.array(itemSchema).min(1),
  globalDiscount: z.number().min(0).default(0),
  vatRate: z.number().min(0).default(0),
  notes: z.string().optional().or(z.literal("")),
  terms: z.string().optional().or(z.literal("")),
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

  const subtotal = body.items.reduce((s, i) => s + (i.unitPrice * i.quantity - i.discount), 0);
  const vat = (subtotal * body.vatRate) / 100;
  const total = Math.max(0, subtotal + vat - body.globalDiscount);

  const last = await db.quote.findFirst({ orderBy: { createdAt: "desc" }, select: { code: true } });
  const seq = last?.code ? Number(last.code.split("-")[2] ?? 0) + 1 : 1;

  const quote = await db.quote.create({
    data: {
      code: generateCode("Q", seq),
      title: body.title,
      patientName: body.patientName || null,
      patientPhone: body.patientPhone || null,
      validFrom: new Date(body.validFrom),
      validUntil: new Date(body.validUntil),
      subtotal,
      discount: body.globalDiscount,
      vat,
      total,
      notes: body.notes || null,
      termsAndConditions: body.terms || null,
      preparedById: session.userId,
      items: {
        create: body.items.map((it, idx) => ({
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          discount: it.discount,
          total: it.unitPrice * it.quantity - it.discount,
          sortOrder: idx,
        })),
      },
    },
  });

  await audit({
    userId: session.userId,
    action: "CREATE",
    entityType: "Quote",
    entityId: quote.id,
    metadata: { code: quote.code, total },
  });

  return NextResponse.json({ ok: true, quote }, { status: 201 });
}
