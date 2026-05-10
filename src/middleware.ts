import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/api/auth/login",
  "/api/auth/signup",
  "/api/health",
  "/_next",
  "/favicon.ico",
  "/icon.svg",
];

function isPublic(path: string): boolean {
  return PUBLIC_PATHS.some((p) => path === p || path.startsWith(p));
}

function getSecretKey(): Uint8Array | null {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) return null;
  return new TextEncoder().encode(secret);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Pass through public paths
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("sish_session")?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  const key = getSecretKey();
  if (!key) {
    return NextResponse.next();
  }

  try {
    const { payload } = await jwtVerify(token, key);

    // Reject legacy tokens that lack tenantId (from before multi-tenant migration)
    if (!payload.tenantId || typeof payload.tenantId !== "string") {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("from", pathname);
      const res = NextResponse.redirect(url);
      res.cookies.delete("sish_session");
      return res;
    }

    // Forward tenant info via headers
    const res = NextResponse.next();
    res.headers.set("x-tenant-id", payload.tenantId);
    if (payload.tenantCode && typeof payload.tenantCode === "string") {
      res.headers.set("x-tenant-code", payload.tenantCode);
    }
    return res;
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    const res = NextResponse.redirect(url);
    res.cookies.delete("sish_session");
    return res;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
