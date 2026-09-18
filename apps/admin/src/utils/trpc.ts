import type { AppRouter } from "@amgclub/api/routers/index";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { toast } from "sonner";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// Dashboard data is read-mostly. A 30s staleTime means data is served
			// from cache on remount/route-change within that window (no spinner
			// flash), and only refetched when it actually goes stale. gcTime keeps
			// recently-used queries cached for 5min. Window-focus refetches are
			// disabled — a background tab regaining focus shouldn't hammer the
			// edge (mutations invalidate + refetch explicitly).
			staleTime: 30_000,
			gcTime: 300_000,
			refetchOnWindowFocus: false,
		},
	},
	queryCache: new QueryCache({
		onError: (error, query) => {
			toast.error(error.message, {
				action: {
					label: "retry",
					onClick: () => {
						query.invalidate();
					},
				},
			});
		},
	}),
});

const trpcClient = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: "/api/trpc",
			fetch(url, options) {
				return fetch(url, {
					...options,
					credentials: "include",
				});
			},
		}),
	],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
	client: trpcClient,
	queryClient,
});
