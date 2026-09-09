import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Cheap cookie presence check (the full session is verified server-side in
 * layouts and tRPC procedures). Redirects unauthenticated visitors to /login.
 */
export function proxy(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);

	if (!sessionCookie) {
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
		return NextResponse.redirect(loginUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api/auth|login|_next|favicon.ico).*)"],
};
