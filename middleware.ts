import { auth } from "@/lib/auth/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default auth((req: any) => {
  const { auth: session, nextUrl } = req

  // Protect admin routes
  if (nextUrl.pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/giris?callbackUrl=/admin", nextUrl))
    }

    const userRole = session.user?.role
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*"],
}
