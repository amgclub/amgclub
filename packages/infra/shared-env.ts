import * as Cloudflare from "alchemy/Cloudflare";
import * as Config from "effect/Config";

/**
 * Narrowest worker-side Hyperdrive binding shape we rely on: the pooled
 * connection string. (The full runtime `Hyperdrive` object also exposes
 * host/port/user/password/database, which we don't need.)
 */
export interface HyperdriveBinding {
	readonly connectionString: string;
}

export interface CloudflareEnv {
	readonly IMAGES: unknown;
	readonly DATABASE_URL: string;
	/** Present only in the Cloudflare worker; absent in Node/local runtimes. */
	readonly HYPERDRIVE?: HyperdriveBinding;
	readonly BETTER_AUTH_SECRET: string;
	readonly BETTER_AUTH_URL: string;
	readonly STORAGE_PROVIDER: string;
	readonly SUPABASE_URL: string;
	readonly SUPABASE_SECRET_KEY: string;
	readonly SUPABASE_STORAGE_BUCKET: string;
	readonly AWS_ACCESS_KEY_ID: string;
	readonly AWS_SECRET_ACCESS_KEY: string;
	readonly AWS_MEDIA_BUCKET_NAME: string;
	readonly AWS_MEDIA_CUSTOM_DOMAIN: string;
	readonly AWS_S3_ENDPOINT_URL: string;
	readonly AWS_S3_REGION: string;
	readonly UPSTASH_REDIS_REST_URL: string;
	readonly UPSTASH_REDIS_REST_TOKEN: string;
	readonly ZIINA_API_TOKEN: string;
	/** Public URL of the web app (used for Ziina payment callback URLs). */
	readonly PUBLIC_APP_URL: string;
	readonly ASSETS: { fetch: typeof globalThis.fetch };
}

export const commonEnv = {
	IMAGES: Cloudflare.Images.Images(),
	DATABASE_URL: Config.redacted("DATABASE_URL"),
	BETTER_AUTH_SECRET: Config.redacted("BETTER_AUTH_SECRET"),
	BETTER_AUTH_URL: Cloudflare.Worker.URL,
	STORAGE_PROVIDER: Config.redacted("STORAGE_PROVIDER"),
	SUPABASE_URL: Config.redacted("SUPABASE_URL"),
	SUPABASE_SECRET_KEY: Config.redacted("SUPABASE_SECRET_KEY"),
	SUPABASE_STORAGE_BUCKET: Config.redacted("SUPABASE_STORAGE_BUCKET"),
	AWS_ACCESS_KEY_ID: Config.redacted("AWS_ACCESS_KEY_ID").pipe(
		Config.withDefault(""),
	),
	AWS_SECRET_ACCESS_KEY: Config.redacted("AWS_SECRET_ACCESS_KEY").pipe(
		Config.withDefault(""),
	),
	AWS_MEDIA_BUCKET_NAME: Config.redacted("AWS_MEDIA_BUCKET_NAME").pipe(
		Config.withDefault(""),
	),
	AWS_MEDIA_CUSTOM_DOMAIN: Config.redacted("AWS_MEDIA_CUSTOM_DOMAIN").pipe(
		Config.withDefault(""),
	),
	AWS_S3_ENDPOINT_URL: Config.redacted("AWS_S3_ENDPOINT_URL").pipe(
		Config.withDefault(""),
	),
	AWS_S3_REGION: Config.redacted("AWS_S3_REGION").pipe(Config.withDefault("")),
	UPSTASH_REDIS_REST_URL: Config.redacted("UPSTASH_REDIS_REST_URL").pipe(
		Config.withDefault(""),
	),
	UPSTASH_REDIS_REST_TOKEN: Config.redacted("UPSTASH_REDIS_REST_TOKEN").pipe(
		Config.withDefault(""),
	),
	ZIINA_API_TOKEN: Config.redacted("ZIINA_API_TOKEN").pipe(
		Config.withDefault(""),
	),
	PUBLIC_APP_URL: Config.redacted("PUBLIC_APP_URL").pipe(
		Config.withDefault("http://localhost:3001"),
	),
};
