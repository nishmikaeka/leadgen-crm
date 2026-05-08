import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // Middleware is intentionally minimal. Auth state lives in localStorage via
    // Zustand persist, so we cannot read it in Edge middleware. Client-side
    // guards (useEffect redirects) handle unauthenticated access per page.
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
