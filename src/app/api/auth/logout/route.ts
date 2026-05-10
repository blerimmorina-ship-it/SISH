import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, getCurrentSession } from "@/lib/auth";
import { audit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  await clearSessionCookie();
  if (session) {
    await audit({
      userId: session.userId,
      action: "LOGOUT",
      entityType: "User",
      entityId: session.userId,
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      userAgent: req.headers.get("user-agent"),
    });
  }
  return NextResponse.json({ ok: true });
}
