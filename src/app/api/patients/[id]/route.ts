import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db-context";
import { getCurrentSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = await getDb();
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { id } = await params;
  const patient = await db.patient.findUnique({ where: { id } });
  if (!patient) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ patient });
}
