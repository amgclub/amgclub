import { env } from "@amgclub/env/server";
import { Redis } from "@upstash/redis";

const UPSTASH_URL = env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = env.UPSTASH_REDIS_REST_TOKEN;

const isEnabled =
	typeof UPSTASH_URL === "string" &&
	UPSTASH_URL.length > 0 &&
	typeof UPSTASH_TOKEN === "string" &&
	UPSTASH_TOKEN.length > 0;

let redis: Redis | undefined;

if (isEnabled) {
	redis = new Redis({
		url: UPSTASH_URL,
		token: UPSTASH_TOKEN,
	});
}

/**
 * Fetch data with Redis caching.
 * Returns the cached value on hit, or calls `fetcher`, stores the result, and returns it.
 */
export async function cached<T>(
	key: string,
	ttlSeconds: number,
	fetcher: () => Promise<T>,
): Promise<T> {
	if (!redis) return fetcher();

	const cached = await redis.get<T>(key);
	if (cached !== null) return cached;

	const data = await fetcher();

	// Fire-and-forget write — don't block the response on a slow Redis write.
	redis.set(key, JSON.stringify(data), { ex: ttlSeconds }).catch(() => {});

	return data;
}

/**
 * Invalidate one or more cache keys (pattern or exact).
 */
export async function invalidateCache(...patterns: string[]): Promise<void> {
	if (!redis) return;

	for (const pattern of patterns) {
		if (pattern.includes("*")) {
			const keys = await redis.keys(pattern);
			if (keys.length > 0) {
				await redis.del(...keys);
			}
		} else {
			await redis.del(pattern);
		}
	}
}

// ---------------------------------------------------------------------------
// Shop-specific cache keys
// ---------------------------------------------------------------------------

export const shopCache = {
	/** Fetch data with Redis caching, or call fetcher on miss. */
	cache: cached,
	productList: (filters: string) => `shop:products:list:${filters}`,
	productBySlug: (slug: string) => `shop:product:${slug}`,
	productById: (id: string) => `shop:product:id:${id}`,

	/** TTL seconds per key type */
	ttl: {
		productList: 120,
		product: 300,
	},

	/** Invalidate product-related caches after a mutation. */
	async invalidateProduct(slug?: string) {
		const keys = ["shop:products:list:*"];
		if (slug) keys.push(`shop:product:${slug}`);
		await invalidateCache(...keys);
	},
};
