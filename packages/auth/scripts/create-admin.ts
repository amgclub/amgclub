/**
 * Bootstrap script: create the first admin user for the AMG Club admin console.
 *
 * Usage (from the repo root):
 *   pnpm admin:create <email> <password> [name] [role]
 *   pnpm admin:create:prod <email> <password> [name] [role]
 *
 * Set ENV_FILE (relative to the repo root) to target another environment,
 * e.g. `pnpm admin:create:prod` loads apps/admin/.env.production (live DB).
 *
 * The admin console has no public sign-up — accounts are created here or from
 * the dashboard (Settings → Team) once an admin exists.
 */
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import * as authSchema from "@amgclub/db/schema/auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { config as dotenvConfig } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const here = path.dirname(fileURLToPath(import.meta.url));
// packages/auth/scripts → repo root is three levels up.
const repoRoot = path.resolve(here, "../../..");

// Admin app env first (it owns BETTER_AUTH_URL for the console), web as fallback.
// Override with ENV_FILE (relative to the repo root) for another environment.
if (process.env.ENV_FILE) {
	dotenvConfig({ path: path.resolve(repoRoot, process.env.ENV_FILE) });
} else {
	dotenvConfig({ path: path.join(repoRoot, "apps/admin/.env") });
	dotenvConfig({ path: path.join(repoRoot, "apps/web/.env") });
}

const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3002";

if (!process.env.BETTER_AUTH_SECRET || !process.env.DATABASE_URL) {
	console.error(
		"Missing BETTER_AUTH_SECRET or DATABASE_URL. Ensure apps/admin/.env exists (or the file set via ENV_FILE).",
	);
	process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, {
	// prepare:false required when talking to the Supabase pooler directly —
	// server-side prepared statements are dropped across the pooler's
	// connection handoff and queries hang.
	prepare: false,
	max: 3,
	connect_timeout: 10,
	idle_timeout: 30,
});

const db = drizzle(sql, { schema: authSchema });

const auth = betterAuth({
	database: drizzleAdapter(db, { provider: "pg", schema: authSchema }),
	baseURL,
	trustedOrigins: [baseURL],
	emailAndPassword: { enabled: true },
	secret: process.env.BETTER_AUTH_SECRET,
});

const [emailArg, passwordArg, nameArg, roleArg] = process.argv.slice(2);

if (!emailArg || !passwordArg) {
	console.error(
		"Usage: pnpm admin:create <email> <password> [name] [role]\n" +
			"Example: pnpm admin:create admin@amgclub.ae 's3cret-Passw0rd' 'Khalil' admin",
	);
	process.exit(1);
}

if (passwordArg.length < 8) {
	console.error("Password must be at least 8 characters.");
	process.exit(1);
}

const email: string = emailArg;
const password: string = passwordArg;
const name: string | undefined = nameArg ?? emailArg.split("@")[0];
const role: "admin" | "user" = roleArg === "user" ? "user" : "admin";

async function main() {
	const existing = await db
		.select({ id: authSchema.user.id })
		.from(authSchema.user)
		.where(eq(authSchema.user.email, email))
		.limit(1);

	if (existing.length > 0) {
		console.error(`A user with email ${email} already exists.`);
		process.exit(1);
	}

	const result = await auth.api.signUpEmail({
		body: { email, password, name: name as string },
	});

	if (!result) {
		console.error("Failed to create user via better-auth.");
		process.exit(1);
	}

	await db
		.update(authSchema.user)
		.set({ role })
		.where(eq(authSchema.user.email, email));

	console.log(`✔ Created ${role} account: ${email}`);
	process.exit(0);
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
});
