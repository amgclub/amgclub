import { getAuth } from "@amgclub/auth";
import type { NextRequest } from "next/server";

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

export async function createContext(req: NextRequest) {
	const session = await getAuth().api.getSession({
		headers: snapshotHeaders(req),
	});
	return {
		session,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
