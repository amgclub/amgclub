import { env } from "@amgclub/env/server";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { cache } from "react";

import * as schema from "./schema";

export * from "./schema";
export * from "./schema/auth";

export function createDb() {
	// Hyperdrive's worker connection string carries `?sslmode=disable`.
	// postgres.js manages origin TLS through Hyperdrive itself, so the URL is
	// used as-is. The DATABASE_URL fallback keeps its own params for
	// local runtimes.
	const connectionString = env.HYPERDRIVE?.connectionString || env.DATABASE_URL;
	const sql = postgres(connectionString, {
		// prepare:false is required when connecting through Hyperdrive / the
		// Supabase pooler: server-side prepared statements cannot survive the
		// connection handoff and cause queries to silently hang. postgres.js
		// defaults to prepare:true, so it must be disabled explicitly.
		prepare: false,
		// A single client per request. Cloudflare Workers do not allow a
		// connection pool to be shared across request contexts — reusing a
		// socket made in another request trips the runtime's cross-request
		// promise guard and the isolate hangs.
		max: 1,
		// Bound acquisition: a queued query fails loudly after 10s instead of
		// parking forever (parked promises with no I/O trip the Workers
		// hang detector within milliseconds).
		connect_timeout: 10,
		// Bound execution: a stuck query dies and frees its slot after 30s.
		idle_timeout: 30,
	});

	return drizzle(sql, { schema });
}

/**
 * Per-request db client.
 *
 * In the Workers runtime, a DB pool must NOT be shared across requests —
 * reusing a connection created inside another request's context causes the
 * socket's promises to resolve in a foreign context and the isolate to hang.
 * `cache()` dedupes to a single client within one request (server components
 * may call this several times) while guaranteeing a fresh client per request.
 */
export const getDb = cache(createDb);
