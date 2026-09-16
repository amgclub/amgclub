import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import { config } from "dotenv";
import * as Effect from "effect/Effect";

import { commonEnv } from "./shared-env.ts";

config({ path: "./.env" });
config({ path: "../../apps/admin/.env.production" });

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
	env: commonEnv,
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
