import { getAuth } from "@amgclub/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
	const session = await getAuth().api.getSession({ headers: request.headers });

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
	matcher: ["/(dashboard)/:path*", "/api/trpc/:path*"],
};
