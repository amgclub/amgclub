"use client";

import type { EventAttendeeDTO } from "@amgclub/api/routers/events";
import { Badge } from "@amgclub/ui/components/badge";
import { Button } from "@amgclub/ui/components/button";
import { Card } from "@amgclub/ui/components/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@amgclub/ui/components/dropdown-menu";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@amgclub/ui/components/empty";
import { Input } from "@amgclub/ui/components/input";
import { Skeleton } from "@amgclub/ui/components/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@amgclub/ui/components/table";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	ArrowLeftIcon,
	CalendarIcon,
	CircleCheckIcon,
	CircleXIcon,
	MoreHorizontalIcon,
	SearchIcon,
	UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { toast } from "sonner";

import { formatDate, formatTime } from "@/lib/format";
import { queryClient, trpc } from "@/utils/trpc";

type AttendeeStatus = "attending" | "canceled";

const statusFilters: { value: AttendeeStatus | "all"; label: string }[] = [
	{ value: "all", label: "All" },
	{ value: "attending", label: "Attending" },
	{ value: "canceled", label: "Canceled" },
];

function AttendeeStatusBadge({ status }: { status: AttendeeStatus }) {
	const variant = {
		attending: "default" as const,
		canceled: "destructive" as const,
	};
	const label = {
		attending: "Attending",
		canceled: "Canceled",
	};
	return <Badge variant={variant[status]}>{label[status]}</Badge>;
}

export function EventAttendeesView({ eventId }: { eventId: string }) {
	const [statusFilter, setStatusFilter] = useState<AttendeeStatus | "all">(
		"all",
	);
	const [search, setSearch] = useState("");
	const deferredSearch = useDeferredValue(search);

	const eventQuery = useQuery(trpc.events.getById.queryOptions(eventId));

	const event = eventQuery.data;

	const attendeesQuery = useQuery(
		trpc.events.listAttendees.queryOptions({
			eventId,
			status: statusFilter,
			search: deferredSearch.trim() ? deferredSearch.trim() : undefined,
		}),
	);

	const statusMutation = useMutation({
		...trpc.events.updateAttendeeStatus.mutationOptions(),
		onSuccess: () => {
			toast.success("Attendee status updated");
			queryClient.invalidateQueries();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const attendees = attendeesQuery.data?.items ?? [];
	const counts = attendeesQuery.data?.counts ?? {
		attending: 0,
		canceled: 0,
		total: 0,
	};

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="flex items-center gap-3">
					<Button
						variant="outline"
						size="sm"
						nativeButton={false}
						render={<Link href="/events" />}
					>
						<ArrowLeftIcon />
						Back
					</Button>
					<div>
						<h1 className="font-extrabold font-sans text-headline-lg">
							{eventQuery.isPending
								? "Event Attendees"
								: (event?.title ?? "Event Attendees")}
						</h1>
						{event ? (
							<p className="flex items-center gap-2 text-body-sm text-muted-foreground">
								<CalendarIcon className="size-3.5" />
								{formatDate(event.eventDate)}
								{event.startTime ? ` at ${formatTime(event.startTime)}` : ""}
								{event.location ? ` · ${event.location}` : ""}
							</p>
						) : eventQuery.isPending ? (
							<div className="flex items-center gap-2">
								<Skeleton className="h-4 w-48" />
							</div>
						) : null}
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Card size="sm" className="px-3 py-2">
						<div className="flex items-center gap-2">
							<UsersIcon className="size-4 text-muted-foreground" />
							<span className="font-bold font-sans text-body-lg">
								{attendeesQuery.isPending ? (
									<Skeleton className="inline-block h-4 w-8" />
								) : (
									counts.total
								)}
							</span>
							<span className="text-caption text-muted-foreground">total</span>
						</div>
					</Card>
				</div>
			</div>

			<div className="flex flex-wrap items-center gap-2">
				{statusFilters.map((filter) => (
					<Button
						key={filter.value}
						size="sm"
						variant={statusFilter === filter.value ? "default" : "outline"}
						aria-pressed={statusFilter === filter.value}
						onClick={() => {
							setStatusFilter(filter.value);
						}}
					>
						{filter.label}
						{filter.value !== "all" && !attendeesQuery.isPending ? (
							<Badge variant="muted" className="ml-1">
								{filter.value === "attending"
									? counts.attending
									: counts.canceled}
							</Badge>
						) : null}
					</Button>
				))}
				<div className="relative ml-auto w-full sm:w-64">
					<SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Search name, email, phone…"
						className="pl-8"
						value={search}
						onChange={(event) => {
							setSearch(event.target.value);
						}}
					/>
				</div>
			</div>

			<div className="border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Phone</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Registered</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{attendeesQuery.isPending ? (
							Array.from({ length: 6 }).map((_, index) => (
								<TableRow key={`skeleton-${String(index)}`}>
									{Array.from({ length: 6 }).map((__, cell) => (
										<TableCell
											key={`skeleton-${String(index)}-${String(cell)}`}
										>
											<Skeleton className="h-4 w-full" />
										</TableCell>
									))}
								</TableRow>
							))
						) : attendeesQuery.error ? (
							<TableRow>
								<TableCell colSpan={6}>
									<div className="flex flex-col items-center gap-2 py-8">
										<p className="text-body-sm text-destructive">
											Failed to load attendees: {attendeesQuery.error.message}
										</p>
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												attendeesQuery.refetch().catch(() => {
													toast.error("Retry failed");
												});
											}}
										>
											Try again
										</Button>
									</div>
								</TableCell>
							</TableRow>
						) : attendees.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6}>
									<Empty className="border-none">
										<EmptyHeader>
											<EmptyMedia variant="icon">
												<UsersIcon />
											</EmptyMedia>
											<EmptyTitle>No attendees found</EmptyTitle>
											<EmptyDescription>
												{statusFilter !== "all" || search.trim()
													? "No attendees match the current filters."
													: "No one has registered for this event yet."}
											</EmptyDescription>
										</EmptyHeader>
									</Empty>
								</TableCell>
							</TableRow>
						) : (
							attendees.map((attendee) => (
								<AttendeeRow
									key={attendee.id}
									attendee={attendee}
									onStatusChange={(status) => {
										statusMutation.mutate({
											attendeeId: attendee.id,
											status,
										});
									}}
									isUpdating={statusMutation.isPending}
								/>
							))
						)}
					</TableBody>
				</Table>
			</div>

			<p className="text-caption text-muted-foreground">
				{attendeesQuery.isPending
					? "Loading…"
					: `Showing ${attendees.length} of ${counts.total} attendee${counts.total === 1 ? "" : "s"}`}
			</p>
		</div>
	);
}

function AttendeeRow({
	attendee,
	onStatusChange,
	isUpdating,
}: {
	attendee: EventAttendeeDTO;
	onStatusChange: (status: AttendeeStatus) => void;
	isUpdating: boolean;
}) {
	return (
		<TableRow>
			<TableCell>
				<span className="font-medium font-sans text-body-sm">
					{attendee.name}
				</span>
			</TableCell>
			<TableCell>
				<span className="text-body-sm text-muted-foreground">
					{attendee.email}
				</span>
			</TableCell>
			<TableCell>
				<span className="text-body-sm text-muted-foreground">
					{attendee.phone}
				</span>
			</TableCell>
			<TableCell>
				<AttendeeStatusBadge status={attendee.status} />
			</TableCell>
			<TableCell>
				<span className="text-caption text-muted-foreground">
					{formatDate(attendee.createdAt)}
				</span>
			</TableCell>
			<TableCell className="text-right">
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button variant="outline" size="sm" disabled={isUpdating}>
								<MoreHorizontalIcon className="size-4" />
							</Button>
						}
					/>
					<DropdownMenuContent align="end">
						{attendee.status !== "attending" ? (
							<DropdownMenuItem
								onClick={() => {
									onStatusChange("attending");
								}}
							>
								<CircleCheckIcon />
								Mark attending
							</DropdownMenuItem>
						) : null}
						{attendee.status !== "canceled" ? (
							<DropdownMenuItem
								variant="destructive"
								onClick={() => {
									onStatusChange("canceled");
								}}
							>
								<CircleXIcon />
								Mark canceled
							</DropdownMenuItem>
						) : null}
					</DropdownMenuContent>
				</DropdownMenu>
			</TableCell>
		</TableRow>
	);
}
