import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import { config } from "dotenv";
import * as Effect from "effect/Effect";

import { commonEnv } from "./shared-env.ts";

config({ path: "./.env" });
config({ path: "../../apps/web/.env.production" });

export const web = Cloudflare.Website.StaticSite("web", {
	name: "web",
	cwd: "../../apps/web",
	command: "pnpm run build:cloudflare",
	memo: false,
	outdir: ".open-next/assets",
	main: "../../apps/web/.open-next/worker.js",
	// NOTE: intentionally no `bundle: false` here — see admin.alchemy.run.ts.
	// The prebuilt path follows pnpm symlinks and uploads ~85 MB (> 64 MiB).
	compatibility: {
		flags: ["nodejs_compat", "global_fetch_strictly_public"],
	},
	env: commonEnv,
	dev: {
		command: "pnpm run dev:bare",
		url: "http://localhost:3001",
	},
});

export type WebEnv = Cloudflare.InferEnv<typeof web>;

export default Alchemy.Stack(
	"amgclub-web",
	{
		providers: Cloudflare.providers(),
		state: Alchemy.localState(),
	},
	Effect.gen(function* () {
		const webWorker = yield* web;

		return {
			web: webWorker.url,
		};
	}),
);
