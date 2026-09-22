"use client";

import type { CustomerDTO } from "@amgclub/api/routers/customers";
import { Button } from "@amgclub/ui/components/button";
import { Input } from "@amgclub/ui/components/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import { PlusIcon, SearchIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useDeferredValue, useState } from "react";
import { toast } from "sonner";
import { queryClient, trpc } from "@/utils/trpc";
import { CustomersTable } from "./customers-table";

const CustomerFormDialog = dynamic(
	() =>
		import("@/components/shop/customer-form-dialog").then(
			(mod) => mod.CustomerFormDialog,
		),
	{ ssr: false },
);

const PAGE_SIZE = 50;

export function CustomersView() {
	const [search, setSearch] = useState("");
	const deferredSearch = useDeferredValue(search);
	const [formOpen, setFormOpen] = useState(false);
	const [editing, setEditing] = useState<CustomerDTO | null>(null);

	const listQuery = useQuery(
		trpc.customers.list.queryOptions({
			search: deferredSearch.trim() ? deferredSearch.trim() : undefined,
			page: 1,
			pageSize: PAGE_SIZE,
		}),
	);

	const deleteMutation = useMutation({
		...trpc.customers.delete.mutationOptions(),
		onSuccess: () => {
			toast.success("Customer deleted");
			queryClient.invalidateQueries();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const customers = listQuery.data?.items ?? [];

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="font-extrabold font-sans text-headline-lg">
						Customers
					</h1>
					<p className="text-body-sm text-muted-foreground">
						Manage customer accounts and information.
					</p>
				</div>
				<Button
					onClick={() => {
						setEditing(null);
						setFormOpen(true);
					}}
				>
					<PlusIcon />
					New customer
				</Button>
			</div>

			<div className="flex flex-wrap items-center gap-2">
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
				<CustomersTable
					customers={customers}
					loading={listQuery.isPending}
					error={listQuery.error}
					hasFilters={Boolean(search.trim())}
					onRetry={() => {
						listQuery.refetch().catch(() => {
							toast.error("Retry failed");
						});
					}}
					onEdit={(customer) => {
						setEditing(customer);
						setFormOpen(true);
					}}
					onDelete={(customer) => {
						deleteMutation.mutate(customer.id);
					}}
				/>
			</div>

			<p className="text-caption text-muted-foreground">
				{listQuery.isPending
					? "Loading…"
					: `Showing ${customers.length} of ${listQuery.data?.total ?? 0} customer${(listQuery.data?.total ?? 0) === 1 ? "" : "s"}`}
			</p>

			{formOpen ? (
				<CustomerFormDialog
					open={formOpen}
					onOpenChange={setFormOpen}
					customer={editing}
				/>
			) : null}
		</div>
	);
}
