import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import { config } from "dotenv";
import * as Effect from "effect/Effect";

import { createHyperdrive } from "./hyperdrive.ts";
import { commonEnv } from "./shared-env.ts";

config({ path: "./.env" });
config({ path: "../../apps/web/.env.production" });

export const hyperdriveDb = createHyperdrive(
	"web-hyperdrive",
	"amgclub-web-db",
);

export const web = Cloudflare.Website.StaticSite("web", {
	name: "web",
	cwd: "../../apps/web",
	command: "pnpm run build:cloudflare",
	memo: false,
	outdir: ".open-next/assets",
	main: "../../apps/web/.open-next/worker.js",
	compatibility: {
		flags: ["nodejs_compat", "global_fetch_strictly_public"],
	},
	placement: {
		mode: "smart",
	},
	env: {
		...commonEnv,
		HYPERDRIVE: hyperdriveDb,
	},
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
