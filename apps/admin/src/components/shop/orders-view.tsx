"use client";

import type { OrderDTO } from "@amgclub/api/routers/orders";
import { Button } from "@amgclub/ui/components/button";
import { Input } from "@amgclub/ui/components/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import { SearchIcon } from "lucide-react";
import { useDeferredValue, useState } from "react";
import { toast } from "sonner";
import type { OrderStatus } from "@/components/status-badge";
import { queryClient, trpc } from "@/utils/trpc";
import { OrdersTable } from "./orders-table";

const PAGE_SIZE = 50;

const statusFilters: { value: OrderStatus | "all"; label: string }[] = [
	{ value: "all", label: "All" },
	{ value: "pending", label: "Pending" },
	{ value: "confirmed", label: "Confirmed" },
	{ value: "shipped", label: "Shipped" },
	{ value: "delivered", label: "Delivered" },
	{ value: "canceled", label: "Canceled" },
];

export function OrdersView() {
	const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
	const [search, setSearch] = useState("");
	const deferredSearch = useDeferredValue(search);

	const listQuery = useQuery(
		trpc.orders.list.queryOptions({
			status: statusFilter === "all" ? undefined : statusFilter,
			search: deferredSearch.trim() ? deferredSearch.trim() : undefined,
			page: 1,
			pageSize: PAGE_SIZE,
		}),
	);

	const statusMutation = useMutation({
		...trpc.orders.updateStatus.mutationOptions(),
		onSuccess: () => {
			toast.success("Order status updated");
			queryClient.invalidateQueries();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const orders = (listQuery.data?.items ?? []) as OrderDTO[];

	return (
		<div className="flex flex-col gap-6">
			<div>
				<h1 className="font-extrabold font-sans text-headline-lg">Orders</h1>
				<p className="text-body-sm text-muted-foreground">
					Manage customer orders
				</p>
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
						placeholder="Search order #, name, email…"
						className="pl-8"
						value={search}
						onChange={(event) => {
							setSearch(event.target.value);
						}}
					/>
				</div>
			</div>

			<div className="border">
				<OrdersTable
					orders={orders}
					loading={listQuery.isPending}
					error={listQuery.error}
					hasFilters={Boolean(search.trim()) || statusFilter !== "all"}
					onRetry={() => {
						listQuery.refetch().catch(() => {
							toast.error("Retry failed");
						});
					}}
					onStatusChange={(order, status) => {
						statusMutation.mutate({ id: order.id, status });
					}}
				/>
			</div>

			<p className="text-caption text-muted-foreground">
				{listQuery.isPending
					? "Loading…"
					: `Showing ${orders.length} of ${listQuery.data?.total ?? 0} order${(listQuery.data?.total ?? 0) === 1 ? "" : "s"}`}
			</p>
		</div>
	);
}
