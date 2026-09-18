import { Skeleton } from "@amgclub/ui/components/skeleton";

export default function DashboardLoading() {
	return (
		<div className="flex flex-col gap-6" aria-busy="true">
			<div>
				<Skeleton className="h-7 w-40" />
				<Skeleton className="mt-2 h-4 w-64" />
			</div>
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				<Skeleton className="h-28 w-full" />
				<Skeleton className="h-28 w-full" />
				<Skeleton className="h-28 w-full" />
				<Skeleton className="h-28 w-full" />
				<Skeleton className="h-28 w-full" />
				<Skeleton className="h-28 w-full" />
			</div>
			<div className="grid gap-4 lg:grid-cols-2">
				<Skeleton className="h-52 w-full" />
				<Skeleton className="h-52 w-full" />
			</div>
		</div>
	);
}
