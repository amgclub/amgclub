import * as Cloudflare from "alchemy/Cloudflare";
import * as Redacted from "effect/Redacted";

/**
 * Builds a Hyperdrive connection from `DIRECT_URL`, which both stacks load from
 * their own `.env.production`.
 *
 * Shared by web and admin so the two cannot drift.
 *
 * `id` is Alchemy's logical resource id and `resourceName` is the name Cloudflare
 * actually stores. They are not the same and both matter: Alchemy matches state
 * on the id, while renaming the Cloudflare name on an existing connection would
 * rewrite a live resource. Admin's live connection is id `hyperdrive` / name
 * `amgclub-db`, so that pair must be preserved verbatim.
 *
 * Both must be distinct per stack: Alchemy namespaces ids within a stack, but
 * Cloudflare accounts are flat, so two connections sharing a Cloudflare name
 * would collide.
 *
 * @param id Alchemy resource id.
 * @param resourceName Name Cloudflare stores for this connection.
 */
export function createHyperdrive(id: string, resourceName: string) {
	const directUrl = process.env.DIRECT_URL;
	if (!directUrl) {
		throw new Error(
			"Missing DIRECT_URL in env file. Cannot configure the Hyperdrive origin.",
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

	return Cloudflare.Hyperdrive.Connection(id, {
		name: resourceName,
		origin: {
			scheme: "postgres",
			host: dbHost,
			// The direct database endpoint: Hyperdrive does its own pooling, so
			// the origin must not be a pooler.
			port: dbPort,
			database: dbName,
			user: dbUser,
			password: Redacted.make(dbPassword),
		},
		// Production posture: Hyperdrive query caching MUST stay enabled — with
		// `disabled: true` every query parks forever. Small windows keep
		// session/ban/password propagation to seconds on this internal tool.
		caching: { disabled: false, maxAge: 60, staleWhileRevalidate: 15 },
		// Supabase serves a private CA chain ("Supabase Root 2021 CA"), which fails
		// WebPKI validation under the default `require` mode — worker queries hung
		// until Hyperdrive's 10-minute idle kill. verify-ca checks the chain against
		// the uploaded CA instead (no hostname matching, the conservative choice).
		// CA cert uploaded out-of-band; ID is a non-secret reference to the full
		// chain bundle (packages/infra/certs/xxx.pem),
		// not the root-only file.
		// mtls: {
		// 	caCertificateId: "09ee5502-6d20-435f-88d9-6e623c082ab4",
		// 	sslmode: "verify-ca",
		// },
	});
}
