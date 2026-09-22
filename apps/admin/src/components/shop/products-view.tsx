"use client";

import type { ProductDTO } from "@amgclub/api/routers/shop";
import { Button } from "@amgclub/ui/components/button";
import { Input } from "@amgclub/ui/components/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import { PackagePlusIcon, SearchIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useDeferredValue, useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { queryClient, trpc } from "@/utils/trpc";
import { ProductsTable } from "./products-table";

const ProductFormDialog = dynamic(
	() => import("./product-form-dialog").then((mod) => mod.ProductFormDialog),
	{ ssr: false },
);

const PAGE_SIZE = 50;

const statusFilters: { value: string; label: string }[] = [
	{ value: "all", label: "All" },
	{ value: "draft", label: "Draft" },
	{ value: "active", label: "Active" },
	{ value: "archived", label: "Archived" },
];

export function ProductsView() {
	const [search, setSearch] = useState("");
	const deferredSearch = useDeferredValue(search);
	const [statusFilter, setStatusFilter] = useState("all");
	const [formOpen, setFormOpen] = useState(false);
	const [editing, setEditing] = useState<ProductDTO | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<ProductDTO | null>(null);

	const listQuery = useQuery(
		trpc.shop.list.queryOptions({
			status:
				statusFilter === "all"
					? undefined
					: (statusFilter as "draft" | "active" | "archived"),
			search: deferredSearch.trim() ? deferredSearch.trim() : undefined,
			page: 1,
			pageSize: PAGE_SIZE,
		}),
	);

	const deleteMutation = useMutation({
		...trpc.shop.delete.mutationOptions(),
		onSuccess: () => {
			toast.success("Product deleted");
			queryClient.invalidateQueries();
			setDeleteTarget(null);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const products = listQuery.data?.items ?? [];

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="font-extrabold font-sans text-headline-lg">
						Products
					</h1>
					<p className="text-body-sm text-muted-foreground">
						Manage shop products and inventory
					</p>
				</div>
				<Button
					onClick={() => {
						setEditing(null);
						setFormOpen(true);
					}}
				>
					<PackagePlusIcon />
					New product
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
						placeholder="Search name, SKU…"
						className="pl-8"
						value={search}
						onChange={(event) => {
							setSearch(event.target.value);
						}}
					/>
				</div>
			</div>

			<div className="border">
				<ProductsTable
					products={products}
					loading={listQuery.isPending}
					error={listQuery.error}
					hasFilters={Boolean(search.trim()) || statusFilter !== "all"}
					onRetry={() => {
						listQuery.refetch().catch(() => {
							toast.error("Retry failed");
						});
					}}
					onEdit={(product) => {
						setEditing(product);
						setFormOpen(true);
					}}
					onDelete={(product) => {
						setDeleteTarget(product);
					}}
				/>
			</div>

			<p className="text-caption text-muted-foreground">
				{listQuery.isPending
					? "Loading…"
					: `Showing ${products.length} of ${listQuery.data?.total ?? 0} product${(listQuery.data?.total ?? 0) === 1 ? "" : "s"}`}
			</p>

			{formOpen ? (
				<ProductFormDialog
					open={formOpen}
					onOpenChange={setFormOpen}
					product={editing}
				/>
			) : null}

			<ConfirmDialog
				open={deleteTarget !== null}
				onOpenChange={(next) => {
					if (!next) {
						setDeleteTarget(null);
					}
				}}
				title="Delete product?"
				description={
					deleteTarget
						? `This permanently removes "${deleteTarget.name}". This cannot be undone.`
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
