"use client";

import { Badge } from "@amgclub/ui/components/badge";
import { Button } from "@amgclub/ui/components/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@amgclub/ui/components/empty";
import { Skeleton } from "@amgclub/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon, PencilIcon, TagIcon } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";

import { formatAED, formatDateTime } from "@/lib/format";
import { trpc } from "@/utils/trpc";

const ProductFormDialog = dynamic(
	() => import("./product-form-dialog").then((mod) => mod.ProductFormDialog),
	{ ssr: false },
);

type ProductStatus = "draft" | "active" | "archived";

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

export function ProductDetailView({ productId }: { productId: string }) {
	const [formOpen, setFormOpen] = useState(false);

	const productQuery = useQuery(trpc.shop.getById.queryOptions(productId));

	const product = productQuery.data;

	if (productQuery.isPending) {
		return (
			<div className="flex flex-col gap-6">
				<Skeleton className="h-8 w-48" />
				<div className="grid gap-6 lg:grid-cols-3">
					<div className="flex flex-col gap-4 lg:col-span-2">
						<Skeleton className="h-64 w-full" />
						<Skeleton className="h-32 w-full" />
					</div>
					<Skeleton className="h-48 w-full" />
				</div>
			</div>
		);
	}

	if (productQuery.error || !product) {
		return (
			<Empty className="border">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<TagIcon />
					</EmptyMedia>
					<EmptyTitle>Product not found</EmptyTitle>
					<EmptyDescription>
						{productQuery.error?.message ??
							"This product may have been deleted."}
					</EmptyDescription>
				</EmptyHeader>
				<Link href="/shop/products">
					<Button variant="outline">
						<ArrowLeftIcon />
						Back to products
					</Button>
				</Link>
			</Empty>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<Link href="/shop/products">
						<Button variant="ghost" size="icon-sm">
							<ArrowLeftIcon />
						</Button>
					</Link>
					<div>
						<h1 className="font-extrabold font-sans text-headline-lg">
							{product.name}
						</h1>
						<p className="text-body-sm text-muted-foreground">
							{product.sku ? `SKU: ${product.sku}` : product.slug}
						</p>
					</div>
				</div>
				<Button onClick={() => setFormOpen(true)}>
					<PencilIcon />
					Edit
				</Button>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				{/* Main content */}
				<div className="flex flex-col gap-4 lg:col-span-2">
					{product.images[0] ? (
						<img
							src={product.images[0].url}
							alt={product.images[0].altText || product.name}
							className="w-full border object-cover"
						/>
					) : null}

					{product.description ? (
						<div className="border p-4">
							<h2 className="mb-2 font-medium text-label-lg">Description</h2>
							<p className="whitespace-pre-wrap text-body-md text-muted-foreground">
								{product.description}
							</p>
						</div>
					) : null}

					{/* Images gallery */}
					{product.images.length > 0 ? (
						<div className="border p-4">
							<h2 className="mb-2 font-medium text-label-lg">
								Images ({product.images.length})
							</h2>
							<div className="flex flex-wrap gap-2">
								{product.images.map((img) => (
									<img
										key={img.id}
										src={img.url}
										alt={img.altText ?? ""}
										className="size-20 border object-cover"
									/>
								))}
							</div>
						</div>
					) : null}
				</div>

				{/* Sidebar */}
				<div className="flex flex-col gap-4">
					<div className="border p-4">
						<h2 className="mb-3 font-medium text-label-lg">Details</h2>
						<dl className="flex flex-col gap-3 text-body-sm">
							<div className="flex justify-between">
								<dt className="text-muted-foreground">Status</dt>
								<dd>
									<ProductStatusBadge status={product.status} />
								</dd>
							</div>
							<div className="flex justify-between">
								<dt className="text-muted-foreground">Price</dt>
								<dd className="font-medium text-foreground">
									{formatAED(product.price)}
								</dd>
							</div>
							{product.compareAtPrice ? (
								<div className="flex justify-between">
									<dt className="text-muted-foreground">Compare at</dt>
									<dd className="text-muted-foreground line-through">
										{formatAED(product.compareAtPrice)}
									</dd>
								</div>
							) : null}
							<div className="flex justify-between">
								<dt className="text-muted-foreground">Inventory</dt>
								<dd className="font-medium text-foreground">
									{product.inventory}
								</dd>
							</div>
							{product.weight ? (
								<div className="flex justify-between">
									<dt className="text-muted-foreground">Weight</dt>
									<dd className="font-medium text-foreground">
										{product.weight} kg
									</dd>
								</div>
							) : null}
							<div className="flex justify-between">
								<dt className="text-muted-foreground">Created</dt>
								<dd className="text-muted-foreground">
									{formatDateTime(product.createdAt)}
								</dd>
							</div>
							<div className="flex justify-between">
								<dt className="text-muted-foreground">Updated</dt>
								<dd className="text-muted-foreground">
									{formatDateTime(product.updatedAt)}
								</dd>
							</div>
						</dl>
					</div>
				</div>
			</div>

			{formOpen ? (
				<ProductFormDialog
					open={formOpen}
					onOpenChange={setFormOpen}
					product={product}
				/>
			) : null}
		</div>
	);
}
