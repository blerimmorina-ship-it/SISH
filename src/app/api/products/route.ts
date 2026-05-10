import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db-context";
import { getCurrentSession } from "@/lib/auth";
import { audit } from "@/lib/audit";

const schema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  unit: z.string().default("copë"),
  barcode: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  buyPrice: z.number().min(0),
  sellPrice: z.number().min(0),
  vatRate: z.number().min(0),
  minStock: z.number().int().min(0),
  description: z.string().nullable().optional(),
  warehouseId: z.string().nullable().optional(),
  initialStock: z.number().min(0).default(0),
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

  const exists = await db.product.findUnique({ where: { code: body.code } });
  if (exists) return NextResponse.json({ error: "Kodi është në përdorim" }, { status: 409 });

  const product = await db.product.create({
    data: {
      code: body.code,
      name: body.name,
      unit: body.unit,
      barcode: body.barcode || null,
      categoryId: body.categoryId || null,
      buyPrice: body.buyPrice,
      sellPrice: body.sellPrice,
      vatRate: body.vatRate,
      minStock: body.minStock,
      description: body.description || null,
    },
  });

  if (body.warehouseId && body.initialStock > 0) {
    await db.stockLevel.create({
      data: {
        productId: product.id,
        warehouseId: body.warehouseId,
        quantity: body.initialStock,
      },
    });
  }

  await audit({
    userId: session.userId,
    action: "CREATE",
    entityType: "Product",
    entityId: product.id,
    metadata: { code: product.code },
  });

  return NextResponse.json({ ok: true, product }, { status: 201 });
}
