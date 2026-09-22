"use client";
import { Button } from "@amgclub/ui/components/button";
import { Skeleton } from "@amgclub/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import {
	ArrowLeftIcon,
	MinusIcon,
	PlusIcon,
	ShoppingBagIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/contexts/cart";
import { formatAED } from "@/lib/format";
import { trpc } from "@/utils/trpc";

export default function ProductDetailPage() {
	const params = useParams<{ slug: string }>();
	const { addItem } = useCart();
	const [quantity, setQuantity] = useState(1);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);

	const { data: product, isLoading } = useQuery(
		trpc.shop.publicGetBySlug.queryOptions({ slug: params.slug }),
	);

	const allImages = product?.images ?? [];

	function handleAddToCart() {
		if (!product) return;
		addItem({
			productId: product.id,
			name: product.name,
			price: product.price,
			quantity,
			imageUrl: product.images[0]?.url,
		});
		toast.success("Added to cart");
	}

	if (isLoading) {
		return (
			<div className="mx-auto max-w-4xl px-4 py-8">
				<Skeleton className="mb-4 h-6 w-32" />
				<div className="grid gap-8 md:grid-cols-2">
					<Skeleton className="aspect-square w-full" />
					<div className="flex flex-col gap-4">
						<Skeleton className="h-8 w-3/4" />
						<Skeleton className="h-6 w-1/4" />
						<Skeleton className="h-24 w-full" />
					</div>
				</div>
			</div>
		);
	}

	if (!product) {
		return (
			<div className="mx-auto max-w-4xl px-4 py-8 text-center">
				<h1 className="font-bold font-sans text-headline-md">
					Product not found
				</h1>
				<Link
					href={"/shop" as Route}
					className="mt-4 inline-block text-primary underline"
				>
					Back to shop
				</Link>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-4xl px-4 py-8">
			<Link
				href={"/shop" as Route}
				className="mb-6 inline-flex items-center gap-1 text-body-sm text-muted-foreground hover:text-foreground"
			>
				<ArrowLeftIcon className="size-4" /> Back to shop
			</Link>

			<div className="grid gap-8 md:grid-cols-2">
				<div>
					{allImages.length > 0 ? (
						<>
							<img
								src={allImages[selectedImageIndex]?.url}
								alt={allImages[selectedImageIndex]?.altText ?? product.name}
								className="aspect-square w-full object-cover"
							/>
							{allImages.length > 1 && (
								<div className="mt-2 flex gap-2">
									{allImages.map((img, i) => (
										<button
											type="button"
											key={img.id}
											onClick={() => setSelectedImageIndex(i)}
											className={`size-16 border ${i === selectedImageIndex ? "border-primary" : ""}`}
										>
											<img
												src={img.url}
												alt=""
												className="size-full object-cover"
											/>
										</button>
									))}
								</div>
							)}
						</>
					) : (
						<div className="flex aspect-square w-full items-center justify-center bg-muted">
							<ShoppingBagIcon className="size-12 text-muted-foreground" />
						</div>
					)}
				</div>

				<div className="flex flex-col gap-4">
					<h1 className="font-extrabold font-sans text-foreground text-headline-lg">
						{product.name}
					</h1>
					<div className="flex items-baseline gap-3">
						<span className="font-bold font-sans text-foreground text-headline-md">
							{formatAED(product.price)}
						</span>
						{product.compareAtPrice &&
							product.compareAtPrice > product.price && (
								<span className="text-body-sm text-muted-foreground line-through">
									{formatAED(product.compareAtPrice)}
								</span>
							)}
					</div>

					{product.description && (
						<p className="whitespace-pre-line font-sans text-body-md text-muted-foreground">
							{product.description}
						</p>
					)}

					<div className="flex items-center gap-3">
						<span className="font-medium font-sans text-body-sm">
							Quantity:
						</span>
						<Button
							variant="outline"
							size="icon-sm"
							onClick={() => setQuantity((q) => Math.max(1, q - 1))}
							disabled={quantity <= 1}
						>
							<MinusIcon className="size-3" />
						</Button>
						<span className="w-8 text-center font-sans text-body-md">
							{quantity}
						</span>
						<Button
							variant="outline"
							size="icon-sm"
							onClick={() =>
								setQuantity((q) => Math.min(product.inventory, q + 1))
							}
							disabled={quantity >= product.inventory}
						>
							<PlusIcon className="size-3" />
						</Button>
					</div>

					<p className="text-caption text-muted-foreground">
						{product.inventory > 0
							? `${product.inventory} in stock`
							: "Out of stock"}
					</p>

					<Button
						onClick={handleAddToCart}
						disabled={product.inventory <= 0}
						className="w-full"
					>
						<ShoppingBagIcon /> Add to cart
					</Button>
				</div>
			</div>
		</div>
	);
}
