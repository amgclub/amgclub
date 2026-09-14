import * as Cloudflare from "alchemy/Cloudflare";
import * as Config from "effect/Config";

export interface CloudflareEnv {
	readonly IMAGES: unknown;
	readonly DATABASE_URL: string;
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
	AWS_ACCESS_KEY_ID: Config.redacted("AWS_ACCESS_KEY_ID"),
	AWS_SECRET_ACCESS_KEY: Config.redacted("AWS_SECRET_ACCESS_KEY"),
	AWS_MEDIA_BUCKET_NAME: Config.redacted("AWS_MEDIA_BUCKET_NAME"),
	AWS_MEDIA_CUSTOM_DOMAIN: Config.redacted("AWS_MEDIA_CUSTOM_DOMAIN"),
	AWS_S3_ENDPOINT_URL: Config.redacted("AWS_S3_ENDPOINT_URL"),
	AWS_S3_REGION: Config.redacted("AWS_S3_REGION"),
	UPSTASH_REDIS_REST_URL: Config.redacted("UPSTASH_REDIS_REST_URL"),
	UPSTASH_REDIS_REST_TOKEN: Config.redacted("UPSTASH_REDIS_REST_TOKEN"),
};
