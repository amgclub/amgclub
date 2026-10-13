"use client";

import type { MemberDTO } from "@amgclub/api/routers/members";
import { Button } from "@amgclub/ui/components/button";
import { Input } from "@amgclub/ui/components/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import { PlusIcon, SearchIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useDeferredValue, useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { MembersTable } from "@/components/members/members-table";
import type { MembershipStatus } from "@/components/status-badge";
import { queryClient, trpc } from "@/utils/trpc";

// Dialogs are client-only and loaded on demand (code splitting).
const MemberFormDialog = dynamic(
	() =>
		import("@/components/members/member-form-dialog").then(
			(mod) => mod.MemberFormDialog,
		),
	{ ssr: false },
);

const PAGE_SIZE = 20;

const statusFilters: { value: MembershipStatus | "all"; label: string }[] = [
	{ value: "all", label: "All" },
	{ value: "in_review", label: "In review" },
	{ value: "active", label: "Active" },
	{ value: "paused", label: "Paused" },
	{ value: "canceled", label: "Canceled" },
];

export interface MembersViewProps {
	title: string;
	description: string;
	/** Pre-select a status filter (e.g. the Requests page). */
	defaultStatus?: Extract<MembershipStatus, "in_review">;
}

export function MembersView({
	title,
	description,
	defaultStatus,
}: MembersViewProps) {
	const [statusFilter, setStatusFilter] = useState<MembershipStatus | "all">(
		defaultStatus ?? "all",
	);
	const [search, setSearch] = useState("");
	const deferredSearch = useDeferredValue(search);
	const [page, setPage] = useState(1);
	const [formOpen, setFormOpen] = useState(false);
	const [editing, setEditing] = useState<MemberDTO | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<MemberDTO | null>(null);

	const settingsQuery = useQuery(trpc.settings.get.queryOptions());
	const listQuery = useQuery(
		trpc.members.list.queryOptions({
			status: statusFilter === "all" ? undefined : statusFilter,
			search: deferredSearch.trim() ? deferredSearch.trim() : undefined,
			page,
			pageSize: PAGE_SIZE,
		}),
	);

	const statusMutation = useMutation({
		...trpc.members.updateStatus.mutationOptions(),
		onSuccess: (member) => {
			toast.success(`Status updated to ${member.status.replace("_", " ")}`);
			queryClient.invalidateQueries();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const deleteMutation = useMutation({
		...trpc.members.delete.mutationOptions(),
		onSuccess: () => {
			toast.success("Member deleted");
			queryClient.invalidateQueries();
			setDeleteTarget(null);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	function openAdd() {
		setEditing(null);
		setFormOpen(true);
	}

	function openEdit(member: MemberDTO) {
		setEditing(member);
		setFormOpen(true);
	}

	const members = listQuery.data?.items ?? [];
	const total = listQuery.data?.total ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
	const expiringSoonDays = settingsQuery.data?.expiringSoonDays ?? 30;

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="font-extrabold font-sans text-headline-lg">{title}</h1>
					<p className="text-body-sm text-muted-foreground">{description}</p>
				</div>
				<Button onClick={openAdd}>
					<PlusIcon />
					Add member
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
							setPage(1);
						}}
					>
						{filter.label}
					</Button>
				))}
				<div className="relative ml-auto w-full sm:w-64">
					<SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Search name, email, phone, car…"
						className="pl-8"
						value={search}
						onChange={(event) => {
							setSearch(event.target.value);
							setPage(1);
						}}
					/>
				</div>
			</div>

			<div className="border">
				<MembersTable
					members={members}
					loading={listQuery.isPending}
					error={listQuery.error}
					expiringSoonDays={expiringSoonDays}
					hasFilters={Boolean(search.trim()) || statusFilter !== "all"}
					onRetry={() => {
						listQuery.refetch().catch(() => {
							toast.error("Retry failed");
						});
					}}
					onEdit={openEdit}
					onDelete={(member) => {
						setDeleteTarget(member);
					}}
					onStatusChange={(member, status) => {
						statusMutation.mutate({ id: member.id, status });
					}}
				/>
			</div>

			<div className="flex items-center justify-between">
				<p className="text-caption text-muted-foreground">
					{listQuery.isPending
						? "Loading…"
						: `Showing ${members.length} of ${total} member${total === 1 ? "" : "s"}`}
				</p>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						disabled={page <= 1 || listQuery.isPending}
						onClick={() => {
							setPage((current) => Math.max(1, current - 1));
						}}
					>
						Previous
					</Button>
					<span className="text-caption text-muted-foreground">
						Page {page} of {totalPages}
					</span>
					<Button
						variant="outline"
						size="sm"
						disabled={page >= totalPages || listQuery.isPending}
						onClick={() => {
							setPage((current) => Math.min(totalPages, current + 1));
						}}
					>
						Next
					</Button>
				</div>
			</div>

			{formOpen ? (
				<MemberFormDialog
					open={formOpen}
					onOpenChange={setFormOpen}
					member={editing}
					settings={
						settingsQuery.data
							? {
									monthlyPrice: settingsQuery.data.monthlyPrice,
									yearlyPrice: settingsQuery.data.yearlyPrice,
								}
							: null
					}
				/>
			) : null}

			<ConfirmDialog
				open={deleteTarget !== null}
				onOpenChange={(next) => {
					if (!next) {
						setDeleteTarget(null);
					}
				}}
				title="Delete member?"
				description={
					deleteTarget
						? `This permanently removes ${deleteTarget.memberName} (${deleteTarget.email}) and their membership history. This cannot be undone.`
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
