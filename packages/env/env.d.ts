declare global {
	interface Env {
		DATABASE_URL: string;
		DIRECT_URL?: string;
		BETTER_AUTH_SECRET: string;
		BETTER_AUTH_URL: string;
		SUPABASE_URL?: string;
		SUPABASE_SECRET_KEY?: string;
		SUPABASE_STORAGE_BUCKET?: string;
		STORAGE_PROVIDER?: string;
		AWS_ACCESS_KEY_ID?: string;
		AWS_SECRET_ACCESS_KEY?: string;
		AWS_MEDIA_BUCKET_NAME?: string;
		AWS_MEDIA_CUSTOM_DOMAIN?: string;
		AWS_S3_ENDPOINT_URL?: string;
		AWS_S3_REGION?: string;
	}
}

export {};
