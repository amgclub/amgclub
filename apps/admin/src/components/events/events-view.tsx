"use client";

import type { EventDTO } from "@amgclub/api/routers/events";
import { Button } from "@amgclub/ui/components/button";
import { Input } from "@amgclub/ui/components/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CalendarPlusIcon, SearchIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useDeferredValue, useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { EventsTable } from "@/components/events/events-table";
import type { EventStatus } from "@/components/status-badge";
import { queryClient, trpc } from "@/utils/trpc";

const EventFormDialog = dynamic(
	() =>
		import("@/components/events/event-form-dialog").then(
			(mod) => mod.EventFormDialog,
		),
	{ ssr: false },
);

const PAGE_SIZE = 50;

const statusFilters: { value: EventStatus | "all"; label: string }[] = [
	{ value: "all", label: "All" },
	{ value: "active", label: "Active" },
	{ value: "paused", label: "Paused" },
	{ value: "canceled", label: "Canceled" },
];

export function EventsView() {
	const [statusFilter, setStatusFilter] = useState<EventStatus | "all">("all");
	const [search, setSearch] = useState("");
	const deferredSearch = useDeferredValue(search);
	const [formOpen, setFormOpen] = useState(false);
	const [editing, setEditing] = useState<EventDTO | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<EventDTO | null>(null);

	const listQuery = useQuery(
		trpc.events.list.queryOptions({
			status: statusFilter === "all" ? undefined : statusFilter,
			search: deferredSearch.trim() ? deferredSearch.trim() : undefined,
			page: 1,
			pageSize: PAGE_SIZE,
		}),
	);

	const statusMutation = useMutation({
		...trpc.events.updateStatus.mutationOptions(),
		onSuccess: (event) => {
			toast.success(`Event ${event.status}`);
			queryClient.invalidateQueries();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const deleteMutation = useMutation({
		...trpc.events.delete.mutationOptions(),
		onSuccess: () => {
			toast.success("Event deleted");
			queryClient.invalidateQueries();
			setDeleteTarget(null);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const events = listQuery.data?.items ?? [];

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="font-extrabold font-sans text-headline-lg">
						All Events
					</h1>
					<p className="text-body-sm text-muted-foreground">
						Create, pause, cancel and manage club events.
					</p>
				</div>
				<Button
					onClick={() => {
						setEditing(null);
						setFormOpen(true);
					}}
				>
					<CalendarPlusIcon />
					New event
				</Button>
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
					</Button>
				))}
				<div className="relative ml-auto w-full sm:w-64">
					<SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Search title, location…"
						className="pl-8"
						value={search}
						onChange={(event) => {
							setSearch(event.target.value);
						}}
					/>
				</div>
			</div>

			<div className="border">
				<EventsTable
					events={events}
					loading={listQuery.isPending}
					error={listQuery.error}
					hasFilters={Boolean(search.trim()) || statusFilter !== "all"}
					onRetry={() => {
						listQuery.refetch().catch(() => {
							toast.error("Retry failed");
						});
					}}
					onEdit={(event) => {
						setEditing(event);
						setFormOpen(true);
					}}
					onDelete={(event) => {
						setDeleteTarget(event);
					}}
					onStatusChange={(event, status) => {
						statusMutation.mutate({ id: event.id, status });
					}}
				/>
			</div>

			<p className="text-caption text-muted-foreground">
				{listQuery.isPending
					? "Loading…"
					: `Showing ${events.length} of ${listQuery.data?.total ?? 0} event${(listQuery.data?.total ?? 0) === 1 ? "" : "s"}`}
			</p>

			{formOpen ? (
				<EventFormDialog
					open={formOpen}
					onOpenChange={setFormOpen}
					event={editing}
				/>
			) : null}

			<ConfirmDialog
				open={deleteTarget !== null}
				onOpenChange={(next) => {
					if (!next) {
						setDeleteTarget(null);
					}
				}}
				title="Delete event?"
				description={
					deleteTarget
						? `This permanently removes "${deleteTarget.title}". This cannot be undone.`
						: ""
				}
				confirmLabel="Delete"
				loading={deleteMutation.isPending}
				onConfirm={() => {
					if (deleteTarget) {
						deleteMutation.mutate(deleteTarget.id);
					}
				}}
			/>
		</div>
	);
}
