import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db-context";
import { getCurrentSession, hasPermission } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { generateCode } from "@/lib/utils";

const patientSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  parentName: z.string().max(80).optional().or(z.literal("")),
  personalId: z.string().max(20).optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "UNSPECIFIED"]).default("UNSPECIFIED"),
  bloodType: z
    .enum(["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG", "UNKNOWN"])
    .default("UNKNOWN"),
  phone: z.string().max(20).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().max(200).optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
  occupation: z.string().max(80).optional().or(z.literal("")),
  emergencyName: z.string().max(80).optional().or(z.literal("")),
  emergencyPhone: z.string().max(20).optional().or(z.literal("")),
  insuranceProvider: z.string().max(80).optional().or(z.literal("")),
  insuranceNumber: z.string().max(40).optional().or(z.literal("")),
  allergies: z.string().max(500).optional().or(z.literal("")),
  chronicDiseases: z.string().max(500).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export async function GET(req: NextRequest) {
  const db = await getDb();
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const take = Math.min(50, Number(searchParams.get("take") ?? 20));
  const skip = Math.max(0, Number(searchParams.get("skip") ?? 0));

  const where = {
    isActive: true,
    ...(q && {
      OR: [
        { firstName: { contains: q } },
        { lastName: { contains: q } },
        { phone: { contains: q } },
        { code: { contains: q } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    db.patient.findMany({ where, take, skip, orderBy: { createdAt: "desc" } }),
    db.patient.count({ where }),
  ]);

  return NextResponse.json({ items, total });
}

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!hasPermission(session.role, "PATIENTS_EDIT")) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const db = await getDb();

  let body: z.infer<typeof patientSchema>;
  try {
    body = patientSchema.parse(await req.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Generate code
  const last = await db.patient.findFirst({
    orderBy: { createdAt: "desc" },
    select: { code: true },
  });
  const nextSeq = last?.code ? Number(last.code.split("-")[2] ?? 0) + 1 : 1;
  const code = generateCode("P", nextSeq);

  const patient = await db.patient.create({
    data: {
      code,
      firstName: body.firstName,
      lastName: body.lastName,
      parentName: body.parentName || null,
      personalId: body.personalId || null,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
      gender: body.gender,
      bloodType: body.bloodType,
      phone: body.phone || null,
      email: body.email || null,
      address: body.address || null,
      city: body.city || null,
      occupation: body.occupation || null,
      emergencyName: body.emergencyName || null,
      emergencyPhone: body.emergencyPhone || null,
      insuranceProvider: body.insuranceProvider || null,
      insuranceNumber: body.insuranceNumber || null,
      allergies: body.allergies || null,
      chronicDiseases: body.chronicDiseases || null,
      notes: body.notes || null,
      createdById: session.userId,
    },
  });

  await audit({
    userId: session.userId,
    action: "CREATE",
    entityType: "Patient",
    entityId: patient.id,
    metadata: { code: patient.code },
    ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: req.headers.get("user-agent"),
  });

  return NextResponse.json({ ok: true, patient }, { status: 201 });
}
