"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
} from "@amgclub/ui/components/card";
import { Skeleton } from "@amgclub/ui/components/skeleton";

interface StatCardProps {
	label: string;
	value: string;
	sub?: string;
	/** Highlight the value in brand red (attention metrics). */
	emphasis?: boolean;
}

export function StatCard({ label, value, sub, emphasis }: StatCardProps) {
	return (
		<Card size="sm" className="ring-tertiary">
			<CardHeader>
				<CardDescription className="font-medium font-sans text-label-sm">
					{label}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div
					className={
						emphasis
							? "font-extrabold font-sans text-headline-md text-primary"
							: "font-extrabold font-sans text-headline-md"
					}
				>
					{value}
				</div>
				{sub ? (
					<p className="mt-1 text-caption text-muted-foreground">{sub}</p>
				) : null}
			</CardContent>
		</Card>
	);
}

export function StatCardSkeleton() {
	return (
		<Card size="sm">
			<CardHeader>
				<Skeleton className="h-3 w-24" />
			</CardHeader>
			<CardContent>
				<Skeleton className="h-7 w-20" />
				<Skeleton className="mt-2 h-3 w-28" />
			</CardContent>
		</Card>
	);
}
