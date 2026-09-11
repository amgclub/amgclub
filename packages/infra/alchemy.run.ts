import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import { config } from "dotenv";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";

config({ path: "./.env" });
config({ path: "../../apps/web/.env" });

export const web = Cloudflare.Website.StaticSite("web", {
	cwd: "../../apps/web",
	command: "pnpm run build:cloudflare",
	// Rebuild shared workspace dependencies until Alchemy has a workspace-aware default memo.
	memo: false,
	outdir: ".open-next/assets",
	main: "../../apps/web/.open-next/worker.js",
	bundle: false,
	compatibility: {
		flags: ["nodejs_compat", "global_fetch_strictly_public"],
	},
	env: {
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
	},
	dev: {
		command: "pnpm run dev:bare",
		url: "http://localhost:3001",
	},
});

export type WebEnv = Cloudflare.InferEnv<typeof web>;

export default Alchemy.Stack(
	"amgclub",
	{
		providers: Cloudflare.providers(),
		state: Cloudflare.state(),
	},
	Effect.gen(function* () {
		const webWorker = yield* web;

		return {
			web: webWorker.url,
		};
	}),
);
