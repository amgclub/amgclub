import { createDb } from "@amgclub/db";
import * as schema from "@amgclub/db/schema/auth";
import { env } from "@amgclub/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins/admin";
import { cache } from "react";

export function createAuth() {
	const db = createDb();

	return betterAuth({
		database: drizzleAdapter(db, {
			provider: "pg",

			schema: schema,
		}),
		trustedOrigins: [env.BETTER_AUTH_URL],
		emailAndPassword: {
			enabled: true,
		},
		secret: env.BETTER_AUTH_SECRET,
		baseURL: env.BETTER_AUTH_URL,
		plugins: [admin(), nextCookies()],
	});
}

/**
 * Per-request auth instance.
 *
 * In the Workers runtime, the underlying DB pool must not be shared across
 * requests — reusing a connection created inside another request's context
 * trips the runtime's cross-request promise guard and the isolate hangs.
 * `cache()` dedupes to a single auth + pool per request while guaranteeing a
 * fresh instance for every request.
 */
export const getAuth = cache(createAuth);
