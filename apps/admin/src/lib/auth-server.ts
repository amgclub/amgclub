import { getAuth } from "@amgclub/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

/**
 * Full session (with user) for server components / route handlers.
 *
 * `cache()` dedupes the underlying session lookup (a DB query) to a single call
 * per request — if the layout and a page/server component both resolve the
 * session in one render, only one query runs instead of one per call site.
 */
export const getServerSession = cache(async () => {
	const requestHeaders = await headers();
	return getAuth().api.getSession({ headers: requestHeaders });
});

/**
 * Guard for dashboard pages: redirects to /login when unauthenticated and
 * rejects non-admin users. Returns the session on success.
 */
export async function requireAdminSession() {
	const session = await getServerSession();
	if (!session) {
		redirect("/login");
	}
	if (session.user.role !== "admin") {
		redirect("/login?error=forbidden");
	}
	return session;
}
