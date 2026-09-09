"use client";

import { Button } from "@amgclub/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@amgclub/ui/components/card";
import { Skeleton } from "@amgclub/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";

import {
	QueryErrorCard,
	RecentMembersList,
	UpcomingEventsList,
} from "@/components/home/home-lists";
import { StatCard, StatCardSkeleton } from "@/components/stat-card";
import { formatAED, formatPercent } from "@/lib/format";
import { trpc } from "@/utils/trpc";

export function HomeView() {
	const overviewQuery = useQuery(trpc.analytics.overview.queryOptions());

	if (overviewQuery.isError) {
		return (
			<QueryErrorCard
				onRetry={() => {
					overviewQuery.refetch().catch(() => {
						toast.error("Retry failed");
					});
				}}
			/>
		);
	}

	const data = overviewQuery.data;

	if (!data) {
		return (
			<div className="flex flex-col gap-6">
				<div>
					<h1 className="font-extrabold font-sans text-headline-lg">Home</h1>
					<p className="text-body-sm text-muted-foreground">
						Club performance at a glance
					</p>
				</div>
				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
					<StatCardSkeleton />
					<StatCardSkeleton />
					<StatCardSkeleton />
					<StatCardSkeleton />
					<StatCardSkeleton />
					<StatCardSkeleton />
				</div>
				<div className="grid gap-4 lg:grid-cols-2">
					<Card>
						<CardContent>
							<div className="flex flex-col gap-3 py-2">
								<Skeleton className="h-12 w-full" />
								<Skeleton className="h-12 w-full" />
								<Skeleton className="h-12 w-full" />
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent>
							<div className="flex flex-col gap-3 py-2">
								<Skeleton className="h-12 w-full" />
								<Skeleton className="h-12 w-full" />
								<Skeleton className="h-12 w-full" />
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<div>
				<h1 className="font-extrabold font-sans text-headline-lg">Home</h1>
				<p className="text-body-sm text-muted-foreground">
					Club performance at a glance
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{overviewQuery.isPending ? (
					<>
						<StatCardSkeleton />
						<StatCardSkeleton />
						<StatCardSkeleton />
						<StatCardSkeleton />
						<StatCardSkeleton />
						<StatCardSkeleton />
					</>
				) : (
					<>
						<StatCard
							label="Total memberships"
							value={String(data.memberships.total)}
							sub={`${data.memberships.active} active · ${data.memberships.inReview} in review`}
						/>
						<StatCard
							label="Total revenue"
							value={formatAED(data.memberships.totalRevenue)}
							sub="All-time memberships billed"
						/>
						<StatCard
							label="Monthly recurring revenue"
							value={formatAED(data.memberships.mrr)}
							sub="Active memberships, normalized monthly"
						/>
						<StatCard
							label="Churn rate"
							value={formatPercent(data.memberships.churnRate)}
							sub={`${data.memberships.canceled} canceled ÷ ${data.memberships.active + data.memberships.canceled} ended+active`}
						/>
						<StatCard
							label="Expiring soon"
							value={String(data.memberships.expiringSoon)}
							sub={`Active memberships ending within ${data.expiringSoonDays} days`}
							emphasis={data.memberships.expiringSoon > 0}
						/>
						<StatCard
							label="Active & upcoming events"
							value={String(data.events.upcoming)}
							sub={`${data.events.total} total · ${data.events.totalAttendees} attendees upcoming`}
						/>
					</>
				)}
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="font-normal font-sans text-headline-sm">
							Active & upcoming events
						</CardTitle>
						<CardDescription>
							The next five events on the calendar
						</CardDescription>
						<CardAction>
							<Button
								variant="link"
								size="sm"
								nativeButton={false}
								render={<Link href="/events" />}
							>
								View all
							</Button>
						</CardAction>
					</CardHeader>
					<CardContent>
						{overviewQuery.isPending ? (
							<div className="flex flex-col gap-3">
								<Skeleton className="h-12 w-full" />
								<Skeleton className="h-12 w-full" />
								<Skeleton className="h-12 w-full" />
							</div>
						) : (
							<UpcomingEventsList events={data.upcomingEvents} />
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="font-normal font-sans text-headline-sm">
							Recent members
						</CardTitle>
						<CardDescription>Latest membership applications</CardDescription>
						<CardAction>
							<Button
								variant="link"
								size="sm"
								nativeButton={false}
								render={<Link href="/members" />}
							>
								View all
							</Button>
						</CardAction>
					</CardHeader>
					<CardContent>
						{overviewQuery.isPending ? (
							<div className="flex flex-col gap-3">
								<Skeleton className="h-12 w-full" />
								<Skeleton className="h-12 w-full" />
								<Skeleton className="h-12 w-full" />
							</div>
						) : (
							<RecentMembersList members={data.recentMembers} />
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
