import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Allow all requests to pass through for now
  return NextResponse.next()
}

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
}