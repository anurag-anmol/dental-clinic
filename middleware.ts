import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicPaths = ["/", "/login", "/api/appointment-requests"] // Added "/" and "/api/appointment-requests"
const protectedPaths = [
  "/dashboard",
  "/patients",
  "/appointments",
  "/billing",
  "/inventory",
  "/staff",
  "/reports",
  "/treatments",
] // Added "/treatments"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionId = request.cookies.get("session")?.value

  // Allow public paths
  if (publicPaths.includes(pathname)) {
    // If user is already logged in and tries to access login or root, redirect to dashboard
    if (sessionId && (pathname === "/login" || pathname === "/")) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    return NextResponse.next()
  }

  // Check if user is authenticated for protected paths
  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    if (!sessionId) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // For now, we'll trust the session exists - the API routes will validate it
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
