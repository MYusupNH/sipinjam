
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_ALLOWED_PATHS = [
  "/admin",
  "/admin/peminjaman",
  "/admin/persetujuan",
  "/admin/pengembalian",
];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get("BRAMASTRA_session")?.value;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret || secret.length < 32) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    const role = String(payload.role || "");

    if (role !== "super_admin" && role !== "admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (role === "admin") {
      const allowed = ADMIN_ALLOWED_PATHS.some(
        (path) =>
          path === "/admin"
            ? pathname === "/admin"
            : pathname === path || pathname.startsWith(path + "/")
      );

      if (!allowed) {
        return NextResponse.redirect(
          new URL("/admin", request.url)
        );
      }
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", pathname);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/admin"],
};
