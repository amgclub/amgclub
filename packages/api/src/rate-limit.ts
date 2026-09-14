import { env } from "@amgclub/env/server";
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { publicProcedure } from "./index";

const UPSTASH_URL = env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = env.UPSTASH_REDIS_REST_TOKEN;

const isRateLimitEnabled =
	typeof UPSTASH_URL === "string" &&
	UPSTASH_URL.length > 0 &&
	typeof UPSTASH_TOKEN === "string" &&
	UPSTASH_TOKEN.length > 0;

let redis: Redis | undefined;
let globalRatelimit: Ratelimit | undefined;

if (isRateLimitEnabled) {
	redis = new Redis({
		url: UPSTASH_URL!,
		token: UPSTASH_TOKEN!,
	});

	globalRatelimit = new Ratelimit({
		redis,
		limiter: Ratelimit.slidingWindow(30, "60 s"),
		analytics: true,
		timeout: 1000,
	});
}

function getClientIp(headers: Headers): string {
	return (
		headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
		headers.get("x-real-ip") ??
		"anonymous"
	);
}

function withRateLimit(
	name: string,
	opts?: {
		limit?: number;
		window?: `${number} ${"ms" | "s" | "m" | "h" | "d"}`;
	},
) {
	return publicProcedure.use(async ({ ctx, next }) => {
		if (!globalRatelimit || !redis) {
			return next({ ctx });
		}

		const reqHeaders =
			(ctx as any).req?.headers ?? (ctx as any).inputHeaders ?? new Headers();
		const ip = getClientIp(reqHeaders);
		const key = `${name}:${ip}`;

		const limiter = opts
			? new Ratelimit({
					redis,
					limiter: Ratelimit.slidingWindow(
						opts.limit ?? 30,
						opts.window ?? "60 s",
					),
					analytics: true,
					timeout: 1000,
				})
			: globalRatelimit;

		const { success, remaining, reset } = await limiter.limit(key);

		if (!success) {
			throw new TRPCError({
				code: "TOO_MANY_REQUESTS",
				message: "Rate limit exceeded. Try again later.",
			});
		}

		return next({
			ctx: {
				...ctx,
				rateLimit: { remaining, reset },
			},
		});
	});
}

export const rateLimitedPublicProcedure = withRateLimit("global");

export const registerRateLimitedProcedure = withRateLimit("register", {
	limit: 10,
	window: "60 s",
});
