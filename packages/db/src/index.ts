import { env } from "@amgclub/env/server";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

export * from "./schema";
export * from "./schema/auth";

export function createDb() {
	const client = postgres(env.DATABASE_URL, { max: 1 });

	return drizzle({ client, schema });
}

const globalForDb = globalThis as unknown as {
	__amgclubDb?: ReturnType<typeof createDb>;
};

/** Memoized db instance so hot reloads / per-request calls reuse one pool. */
export function getDb() {
	if (!globalForDb.__amgclubDb) {
		globalForDb.__amgclubDb = createDb();
	}
	return globalForDb.__amgclubDb;
}
