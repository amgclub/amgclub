import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import { config } from "dotenv";
import * as Effect from "effect/Effect";

import { commonEnv } from "./shared-env";

config({ path: "./.env" });
config({ path: "../../apps/admin/.env" });

export const admin = Cloudflare.Website.StaticSite("admin", {
	cwd: "../../apps/admin",
	command: "pnpm run build:cloudflare",
	memo: false,
	outdir: ".open-next/assets",
	main: "../../apps/admin/.open-next/worker.js",
	bundle: false,
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
		state: Cloudflare.state(),
	},
	Effect.gen(function* () {
		const adminWorker = yield* admin;

		return {
			admin: adminWorker.url,
		};
	}),
);
