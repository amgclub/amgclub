import { getAuth } from "@amgclub/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/** Full session (with user) for server components / route handlers. */
export async function getServerSession() {
	const requestHeaders = await headers();
	return getAuth().api.getSession({ headers: requestHeaders });
}

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
