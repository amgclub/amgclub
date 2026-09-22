import { getAuth } from "@amgclub/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Snapshot request headers eagerly: in the Workers runtime, lazily reading the
// live NextRequest headers view from downstream code can throw, while a
// static copy is always safe. Falls back to cookie-only if copying fails.
function snapshotHeaders(req: NextRequest): Headers {
	try {
		return new Headers(req.headers);
	} catch {
		const cookie = req.headers.get("cookie") ?? "";
		return new Headers(cookie ? { cookie } : {});
	}
}

export async function proxy(request: NextRequest) {
	const session = await getAuth().api.getSession({
		headers: snapshotHeaders(request),
	});

	if (!session) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	if (session.user.role !== "admin") {
		return NextResponse.redirect(
			new URL("/login?error=forbidden", request.url),
		);
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/",
		"/members/:path*",
		"/events/:path*",
		"/settings/:path*",
		"/shop/:path*",
		// /api/trpc routes are excluded: the tRPC context + protectedProcedure
		// middleware already verify the session. Running the proxy here would
		// duplicate the auth DB round-trip on every API call.
	],
};
