"use client";

import type { ProductDTO } from "@amgclub/api/routers/shop";
import { Badge } from "@amgclub/ui/components/badge";
import { Button } from "@amgclub/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@amgclub/ui/components/dropdown-menu";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@amgclub/ui/components/empty";
import { Skeleton } from "@amgclub/ui/components/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@amgclub/ui/components/table";
import {
	EllipsisVerticalIcon,
	ImagesIcon,
	PackageIcon,
	PencilIcon,
	Trash2Icon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { formatAED } from "@/lib/format";

type ProductStatus = "draft" | "active" | "archived";

export interface ProductsTableProps {
	products: ProductDTO[];
	loading: boolean;
	error: { message: string } | null;
	onRetry: () => void;
	onEdit: (product: ProductDTO) => void;
	onDelete: (product: ProductDTO) => void;
	hasFilters: boolean;
}

function ProductStatusBadge({ status }: { status: ProductStatus }) {
	const variant = {
		draft: "subtle",
		active: "default",
		archived: "muted",
	} as const;

	const label = {
		draft: "Draft",
		active: "Active",
		archived: "Archived",
	};

	return <Badge variant={variant[status]}>{label[status]}</Badge>;
}

export function ProductsTable({
	products,
	loading,
	error,
	onRetry,
	onEdit,
	onDelete,
	hasFilters,
}: ProductsTableProps) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Product</TableHead>
					<TableHead>SKU</TableHead>
					<TableHead>Price</TableHead>
					<TableHead>Inventory</TableHead>
					<TableHead>Status</TableHead>
					<TableHead className="text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{loading ? (
					Array.from({ length: 6 }).map((_, index) => (
						<TableRow key={`skeleton-${String(index)}`}>
							{Array.from({ length: 6 }).map((__, cell) => (
								<TableCell key={`skeleton-${String(index)}-${String(cell)}`}>
									<Skeleton className="h-4 w-full" />
								</TableCell>
							))}
						</TableRow>
					))
				) : error ? (
					<TableRow>
						<TableCell colSpan={6}>
							<div className="flex flex-col items-center gap-2 py-8">
								<p className="text-body-sm text-destructive-70">
									Failed to load products: {error.message}
								</p>
								<Button
									variant="outline"
									size="sm"
									className="min-h-11 min-w-11"
									onClick={onRetry}
								>
									Try again
								</Button>
							</div>
						</TableCell>
					</TableRow>
				) : products.length === 0 ? (
					<TableRow>
						<TableCell colSpan={6}>
							<Empty className="border-none">
								<EmptyHeader>
									<EmptyMedia variant="icon">
										<PackageIcon />
									</EmptyMedia>
									<EmptyTitle>No products found</EmptyTitle>
									<EmptyDescription>
										{hasFilters
											? "No products match the current filters."
											: "Create your first shop product."}
									</EmptyDescription>
								</EmptyHeader>
							</Empty>
						</TableCell>
					</TableRow>
				) : (
					products.map((product) => (
						<ProductRow
							key={product.id}
							product={product}
							onEdit={onEdit}
							onDelete={onDelete}
						/>
					))
				)}
			</TableBody>
		</Table>
	);
}

function ProductRow({
	product,
	onEdit,
	onDelete,
}: {
	product: ProductDTO;
	onEdit: (product: ProductDTO) => void;
	onDelete: (product: ProductDTO) => void;
}) {
	return (
		<TableRow>
			<TableCell>
				<div className="flex items-center gap-3">
					{product.images[0] ? (
						<img
							src={product.images[0].url}
							alt=""
							className="size-9 shrink-0 border object-cover"
						/>
					) : (
						<div className="flex size-9 shrink-0 items-center justify-center bg-muted">
							<ImagesIcon className="size-4 text-muted-foreground" />
						</div>
					)}
					<div className="min-w-0">
						<Link
							href={`/shop/products/${product.id}` as Route}
							className="max-w-52 truncate font-medium text-foreground hover:text-primary-70"
						>
							{product.name}
						</Link>
					</div>
				</div>
			</TableCell>
			<TableCell>
				<span className="text-caption text-muted-foreground">
					{product.sku ?? "—"}
				</span>
			</TableCell>
			<TableCell>{formatAED(product.price)}</TableCell>
			<TableCell>{product.inventory}</TableCell>
			<TableCell>
				<ProductStatusBadge status={product.status} />
			</TableCell>
			<TableCell className="text-right">
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button
								variant="ghost"
								size="icon-sm"
								aria-label={`Actions for ${product.name}`}
							/>
						}
					>
						<EllipsisVerticalIcon />
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-40">
						<DropdownMenuItem
							onClick={() => {
								onEdit(product);
							}}
						>
							<PencilIcon />
							Edit
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							variant="destructive"
							onClick={() => {
								onDelete(product);
							}}
						>
							<Trash2Icon />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</TableCell>
		</TableRow>
	);
}
