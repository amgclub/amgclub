import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import { config } from "dotenv";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";

import { commonEnv } from "./shared-env.ts";

config({ path: "./.env" });
config({ path: "../../apps/admin/.env.production" });

const directUrl = process.env.DIRECT_URL;
if (!directUrl) {
	throw new Error(
		"Missing DIRECT_URL (packages/infra/.env or apps/admin/.env.production). Cannot configure the Hyperdrive origin.",
	);
}

let dbHost: string;
let dbPort: number;
let dbUser: string;
let dbName: string;
let dbPassword: string;
try {
	const parsed = new URL(directUrl);
	dbHost = parsed.hostname;
	dbPort = parsed.port ? Number(parsed.port) : 5432;
	dbUser = decodeURIComponent(parsed.username);
	// Strip the leading "/" from the path to get the database name.
	dbName = parsed.pathname.replace(/^\//, "");
	dbPassword = decodeURIComponent(parsed.password);
} catch {
	throw new Error(
		"DIRECT_URL is not a parseable URL. Cannot configure the Hyperdrive origin.",
	);
}
if (!dbHost || !dbPort || !dbUser || !dbName || !dbPassword) {
	throw new Error(
		"DIRECT_URL is missing host, port, user, database, or password. Cannot configure the Hyperdrive origin.",
	);
}

export const hyperdriveDb = Cloudflare.Hyperdrive.Connection("hyperdrive", {
	name: "amgclub-db",
	origin: {
		scheme: "postgres",
		host: dbHost,
		// Supabase direct database endpoint (db.*.supabase.co:5432) — Hyperdrive
		// does its own pooling, so the origin must not be the Supavisor pooler.
		port: dbPort,
		database: dbName,
		user: dbUser,
		password: Redacted.make(dbPassword),
	},
	// Production posture: Hyperdrive query caching MUST stay enabled — with
	// `disabled: true` every query parks forever. Small windows keep
	// session/ban/password propagation to seconds on this internal tool.
	caching: { disabled: false, maxAge: 10, staleWhileRevalidate: 5 },
	// Supabase serves a private CA chain ("Supabase Root 2021 CA"), which fails
	// WebPKI validation under the default `require` mode — worker queries hung
	// until Hyperdrive's 10-minute idle kill. verify-ca checks the chain against
	// the uploaded CA instead (no hostname matching, the conservative choice).
	// CA cert uploaded out-of-band; ID is a non-secret reference to the full
	// chain bundle (packages/infra/certs/supabase-chain-2021-ca.pem),
	// not the root-only file.
	mtls: {
		caCertificateId: "09ee5502-6d20-435f-88d9-6e623c082ab4",
		sslmode: "verify-ca",
	},
});

export const admin = Cloudflare.Website.StaticSite("admin", {
	name: "admin",
	cwd: "../../apps/admin",
	command: "pnpm run build:cloudflare",
	memo: false,
	outdir: ".open-next/assets",
	main: "../../apps/admin/.open-next/worker.js",
	// NOTE: intentionally no `bundle: false` here. The prebuilt path uploads
	// .open-next byte-for-byte and fast-glob follows pnpm's symlinked dirs,
	// uploading node_modules 2-3x (~85 MB > 64 MiB limit). Letting alchemy
	// bundle with rolldown dedupes by realpath, like stock `wrangler deploy`.
	compatibility: {
		flags: ["nodejs_compat", "global_fetch_strictly_public"],
	},
	// Smart Placement: run the Worker in the Cloudflare PoP closest to the
	// DB origin (and to the admin user) to cut the worker↔database round-trip
	// latency that dominates dashboard request wall-time.
	placement: {
		mode: "smart",
	},
	env: {
		...commonEnv,
		HYPERDRIVE: hyperdriveDb,
	},
	dev: {
		command: "pnpm run dev:bare",
		url: "http://localhost:3002",
	},
});

export type WebEnv = Cloudflare.InferEnv<typeof admin>;

export default Alchemy.Stack(
	"amgclub-admin",
	{
		providers: Cloudflare.providers(),
		state: Alchemy.localState(),
	},
	Effect.gen(function* () {
		const adminWorker = yield* admin;

		return {
			admin: adminWorker.url,
		};
	}),
);
