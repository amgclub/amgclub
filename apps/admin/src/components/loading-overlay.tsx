"use client";

import { Spinner } from "@amgclub/ui/components/spinner";
import { cn } from "@amgclub/ui/lib/utils";

/**
 * Full-screen loading overlay shown during auth transitions (login → dashboard,
 * signout → login). Dims the background so the page doesn't feel stuck while
 * the redirect resolves.
 */
export function LoadingOverlay({ label = "Loading" }: { label?: string }) {
	return (
		<div
			className={cn(
				"fixed inset-0 z-50 flex flex-col items-center justify-center gap-3",
				"bg-background/80 backdrop-blur-sm",
			)}
			role="status"
			aria-live="polite"
		>
			<Spinner className="size-8 text-foreground" />
			<span className="font-sans text-caption text-muted-foreground">
				{label}
			</span>
		</div>
	);
}
