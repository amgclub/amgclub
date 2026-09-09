import { createDb } from "@amgclub/db";
import * as schema from "@amgclub/db/schema/auth";
import { env } from "@amgclub/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins/admin";

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

const globalForAuth = globalThis as unknown as {
	__amgclubAuth?: ReturnType<typeof createAuth>;
};

/** Memoized auth instance (reuses one db pool across requests / hot reloads). */
export function getAuth() {
	if (!globalForAuth.__amgclubAuth) {
		globalForAuth.__amgclubAuth = createAuth();
	}
	return globalForAuth.__amgclubAuth;
}
