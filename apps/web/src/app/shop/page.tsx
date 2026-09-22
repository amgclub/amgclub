"use client";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@amgclub/ui/components/card";
import { Skeleton } from "@amgclub/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBagIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { formatAED } from "@/lib/format";
import { trpc } from "@/utils/trpc";

export default function ShopPage() {
	const { data: productsData, isLoading } = useQuery(
		trpc.shop.publicList.queryOptions({
			page: 1,
			pageSize: 50,
		}),
	);

	const products = productsData?.items ?? [];

	return (
		<div className="mx-auto max-w-6xl px-4 py-8">
			<div className="mb-8">
				<h1 className="font-extrabold font-sans text-foreground text-headline-lg">
					Shop
				</h1>
				<p className="mt-2 font-sans text-body-md text-muted-foreground">
					AMG Club merchandise and accessories
				</p>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
					{Array.from({ length: 8 }).map((_, i) => (
						<Skeleton key={i} className="aspect-square w-full" />
					))}
				</div>
			) : products.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<h2 className="font-bold font-sans text-foreground text-headline-md">
						No products found
					</h2>
					<p className="mt-2 font-sans text-body-sm text-muted-foreground">
						Check back soon for new merchandise
					</p>
				</div>
			) : (
				<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
					{products.map((product) => (
						<Link key={product.id} href={`/shop/${product.slug}` as Route}>
							<Card className="cursor-pointer transition-colors hover:bg-muted/50">
								{product.images[0] ? (
									<img
										src={product.images[0].url}
										alt={product.images[0].altText || product.name}
										className="aspect-square w-full object-cover"
									/>
								) : (
									<div className="flex aspect-square w-full items-center justify-center bg-muted">
										<ShoppingBagIcon className="size-8 text-muted-foreground" />
									</div>
								)}
								<CardContent className="p-4">
									<CardHeader className="p-0">
										<CardTitle className="font-medium font-sans text-body-md text-foreground">
											{product.name}
										</CardTitle>
									</CardHeader>
									<div className="mt-2 flex items-center gap-2">
										<span className="font-bold font-sans text-body-md text-foreground">
											{formatAED(product.price)}
										</span>
										{product.compareAtPrice &&
											product.compareAtPrice > product.price && (
												<span className="text-caption text-muted-foreground line-through">
													{formatAED(product.compareAtPrice)}
												</span>
											)}
									</div>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
