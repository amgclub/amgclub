"use client";
import { Button } from "@amgclub/ui/components/button";
import { Skeleton } from "@amgclub/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon, ShoppingBagIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageMotion } from "@/components/page-motion";
import { QuantityInput } from "@/components/quantity-input";
import { Year } from "@/components/year";
import { useCart } from "@/contexts/cart";
import { formatAED } from "@/lib/format";
import {
	FMT_DETAIL,
	FMT_INDEX,
	FMT_NAME,
	FOCUS_RING,
	FORMAT_ROW,
	HAIR_SPREAD,
	KICKER,
	LABEL,
	LABEL_SM,
	SPREAD,
	SPREAD_BODY,
	SPREAD_INTRO,
} from "@/lib/styles";
import { trpc } from "@/utils/trpc";

const HEADING =
	"m-0 font-extrabold font-sans uppercase leading-[0.86] tracking-[-0.03em] text-foreground text-[2.7763cqw] max-xl:text-[clamp(40px,7.4vw,96px)] max-xl:break-words max-xl:leading-[0.9] max-xl:tracking-normal";

const META_DECK =
	"mt-4 max-w-[46cqw] font-normal font-sans text-[0.8125rem] uppercase text-on-surface-muted max-xl:mt-4 max-xl:max-w-none max-xl:text-body-sm";

const BACK_LINK = `inline-flex min-h-11 cursor-pointer items-center gap-2 text-on-surface-muted transition-colors hover:text-primary-60 ${LABEL_SM} ${LABEL} ${FOCUS_RING}`;

const THUMB = `flex size-16 shrink-0 cursor-pointer border-[1.5px] transition-colors max-xl:size-14 ${FOCUS_RING}`;

const RAIL_PRICE =
	"m-0 font-extrabold font-sans text-[2.2cqw] text-foreground uppercase leading-none max-xl:text-[34px]";

const CTA = `h-12 w-full text-label-lg uppercase tracking-[0.06em] ${FOCUS_RING}`;

export default function ProductDetailPage() {
	const params = useParams<{ slug: string }>();
	const { addItem, items } = useCart();
	const [quantity, setQuantity] = useState(1);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);

	const { data: product, isLoading } = useQuery(
		trpc.shop.publicGetBySlug.queryOptions({ slug: params.slug }),
	);

	const allImages = product?.images ?? [];

	const alreadyInCart =
		items.find((item) => item.productId === product?.id)?.quantity ?? 0;
	const remaining = (product?.inventory ?? 0) - alreadyInCart;

	useEffect(() => {
		setQuantity((q) => Math.min(q, Math.max(remaining, 1)));
	}, [remaining]);

	function handleAddToCart() {
		if (!product) return;
		addItem({
			productId: product.id,
			name: product.name,
			price: product.price,
			quantity,
			imageUrl: product.images[0]?.url,
			inventory: product.inventory,
		});
		toast.success("Added to cart");
	}

	if (isLoading) {
		return (
			<main className="flex flex-1 flex-col">
				<div className="@container relative bg-background text-foreground max-xl:px-5 md:max-xl:px-12">
					<span
						className="absolute top-0 left-[3.6242cqw] h-full w-px bg-foreground/[0.41] max-xl:hidden"
						aria-hidden="true"
					/>
					<header className="relative pt-[2.2cqw] pb-[1.2cqw] max-xl:pt-6 max-xl:pb-6">
						<span
							className="hair-masthead block h-px w-full bg-foreground/[0.41]"
							aria-hidden="true"
						/>
						<div className={SPREAD_BODY}>
							<div className="py-[1.1cqw] max-xl:py-4">
								<Skeleton className="h-3 w-56" />
							</div>
							<Skeleton className="h-[2.7763cqw] w-2/3 max-xl:h-[clamp(40px,7.4vw,96px)]" />
							<Skeleton className="mt-5 h-4 w-[46cqw] max-xl:max-w-none" />
						</div>
					</header>
					<section className={SPREAD} aria-hidden="true">
						<span className={HAIR_SPREAD} />
						<div className={SPREAD_BODY}>
							<div className="grid max-xl:grid-cols-1 max-xl:gap-y-8 xl:grid-cols-[minmax(0,1fr)_26cqw] xl:gap-x-[3cqw]">
								<div className="min-w-0">
									<Skeleton className="aspect-[1.1] w-full" />
									<Skeleton className="mt-6 h-4 w-3/4 max-xl:mt-5" />
									<ol className="mt-[3.4cqw] list-none border-foreground/[0.41] border-t p-0 max-xl:mt-6">
										{[0, 1, 2].map((row) => (
											<li key={row} className={FORMAT_ROW}>
												<Skeleton className="h-3 w-6" />
												<Skeleton className="h-5 w-32" />
												<Skeleton className="h-3 w-24 justify-self-end max-xl:col-start-2 max-xl:justify-self-start" />
											</li>
										))}
									</ol>
								</div>
								<aside className="border-foreground/[0.41] max-xl:border-t max-xl:border-l-0 max-xl:pt-6 max-xl:pl-0 xl:border-l xl:pl-[2cqw]">
									<Skeleton className="h-8 w-32" />
									<div className="mt-5 flex items-center justify-between gap-3 border-foreground/[0.41] border-t pt-4">
										<Skeleton className="h-4 w-20" />
										<Skeleton className="h-11 w-36" />
									</div>
									<Skeleton className="mt-6 h-12 w-full" />
								</aside>
							</div>
						</div>
					</section>
				</div>
				<PageMotion />
			</main>
		);
	}

	if (!product) {
		return (
			<main className="flex flex-1 flex-col">
				<div className="@container relative bg-background text-foreground max-xl:px-5 md:max-xl:px-12">
					<span
						className="absolute top-0 left-[3.6242cqw] h-full w-px bg-foreground/[0.41] max-xl:hidden"
						aria-hidden="true"
					/>
					<header className="relative pt-[2.2cqw] pb-[1.2cqw] max-xl:pt-6 max-xl:pb-6">
						<span
							className="hair-masthead block h-px w-full bg-foreground/[0.41]"
							aria-hidden="true"
						/>
						<div className={SPREAD_BODY}>
							<div className="flex items-baseline justify-between gap-4 py-[1.1cqw] max-xl:py-4">
								<span className="t-issue font-medium font-sans text-[0.9223cqw] text-primary-60 uppercase leading-none max-xl:text-[clamp(10px,1.6vw,12px)]">
									Season <Year /> · The Stock
								</span>
							</div>
							<h1 className={`h1 ${HEADING}`}>Product not found</h1>
							<span
								className="red-rule mt-3 block h-px w-24 bg-primary"
								aria-hidden="true"
							/>
							<div className="mt-6 flex max-xl:mt-5">
								<Link href={"/shop" as Route} className={BACK_LINK}>
									<ArrowLeftIcon className="size-3.5" aria-hidden="true" />
									Back to shop
								</Link>
							</div>
						</div>
					</header>
				</div>
				<PageMotion />
			</main>
		);
	}

	const stockLine =
		product.inventory > 0 ? `${product.inventory} in stock` : "Out of stock";

	return (
		<main className="flex flex-1 flex-col">
			<div className="@container relative bg-background text-foreground max-xl:px-5 md:max-xl:px-12">
				<span
					className="absolute top-0 left-[3.6242cqw] h-full w-px bg-foreground/[0.41] max-xl:hidden"
					aria-hidden="true"
				/>
				<header className="relative pt-[2.2cqw] pb-[1.2cqw] max-xl:pt-6 max-xl:pb-6">
					<span
						className="hair-masthead block h-px w-full bg-foreground/[0.41]"
						aria-hidden="true"
					/>
					<div className={SPREAD_BODY}>
						<div className="flex items-baseline justify-between gap-4 py-[1.1cqw] max-xl:py-4">
							<span className="t-issue font-medium font-sans text-[0.9223cqw] text-primary-60 uppercase leading-none max-xl:text-[clamp(10px,1.6vw,12px)]">
								Season <Year /> · The Stock
							</span>
							<Link href={"/shop" as Route} className={BACK_LINK}>
								<ArrowLeftIcon className="size-3.5" aria-hidden="true" />
								Back to shop
							</Link>
						</div>
						<h1 className={`h1 ${HEADING}`}>{product.name}</h1>
						<span
							className="red-rule mt-3 block h-px w-24 bg-primary"
							aria-hidden="true"
						/>
						<p className={`detail-meta ${META_DECK}`}>
							{formatAED(product.price)} · {stockLine}
						</p>
					</div>
				</header>

				<section className={SPREAD} aria-label="002: The Piece">
					<span className={HAIR_SPREAD} aria-hidden="true" />
					<p className={`spread-kicker ${KICKER}`}>
						002 /
						<br />
						The Piece
					</p>
					<div className={SPREAD_BODY}>
						<div className="grid max-xl:grid-cols-1 max-xl:gap-y-8 xl:grid-cols-[minmax(0,1fr)_26cqw] xl:gap-x-[3cqw]">
							<div className="min-w-0">
								<figure className="spread-photo relative m-0 aspect-[1.1] overflow-hidden bg-muted">
									{allImages.length > 0 ? (
										<img
											src={allImages[selectedImageIndex]?.url}
											alt={
												allImages[selectedImageIndex]?.altText ?? product.name
											}
											className="block h-full w-full object-cover object-center"
										/>
									) : (
										<span className="absolute inset-0 flex items-center justify-center">
											<ShoppingBagIcon
												className="size-12 text-muted-foreground"
												aria-hidden="true"
											/>
										</span>
									)}
								</figure>
								{allImages.length > 1 && (
									<div className="mt-3 flex flex-wrap gap-2">
										{allImages.map((img, i) => (
											<button
												type="button"
												key={img.id}
												onClick={() => setSelectedImageIndex(i)}
												aria-label={`Show image ${i + 1}`}
												aria-pressed={i === selectedImageIndex}
												className={`${THUMB} ${i === selectedImageIndex ? "border-primary" : "border-foreground/[0.41] hover:border-foreground/70"}`}
											>
												<img
													src={img.url}
													alt=""
													className="block size-full object-cover"
												/>
											</button>
										))}
									</div>
								)}
								{product.description && (
									<p
										className={`spread-intro ${SPREAD_INTRO} mt-[2.4cqw] whitespace-pre-line max-xl:mt-5`}
									>
										{product.description}
									</p>
								)}
								<ol className="mt-[3.4cqw] list-none border-foreground/[0.41] border-t p-0 max-xl:mt-6">
									<li className={`format-row ${FORMAT_ROW}`}>
										<span className={FMT_INDEX} aria-hidden="true">
											01
										</span>
										<span className={FMT_NAME}>Price</span>
										<span className={FMT_DETAIL}>
											{formatAED(product.price)}
											{product.compareAtPrice &&
											product.compareAtPrice > product.price ? (
												<span className="ml-2 line-through opacity-70">
													{formatAED(product.compareAtPrice)}
												</span>
											) : null}
										</span>
									</li>
									<li className={`format-row ${FORMAT_ROW}`}>
										<span className={FMT_INDEX} aria-hidden="true">
											02
										</span>
										<span className={FMT_NAME}>Stock</span>
										<span className={FMT_DETAIL}>{stockLine}</span>
									</li>
									{product.sku && (
										<li className={`format-row ${FORMAT_ROW}`}>
											<span className={FMT_INDEX} aria-hidden="true">
												03
											</span>
											<span className={FMT_NAME}>Reference</span>
											<span className={FMT_DETAIL}>{product.sku}</span>
										</li>
									)}
								</ol>
							</div>
							<aside className="detail-rail border-foreground/[0.41] max-xl:border-t max-xl:border-l-0 max-xl:pt-6 max-xl:pl-0 xl:border-l xl:pl-[2cqw]">
								<div className="flex flex-col gap-5 xl:sticky xl:top-6">
									<p className={RAIL_PRICE}>{formatAED(product.price)}</p>
									<div className="flex flex-col gap-3 border-foreground/[0.41] border-t pt-4">
										<div className="flex items-center justify-between gap-3">
											<span
												className={`text-on-surface-muted ${LABEL_SM} ${LABEL}`}
											>
												Quantity
											</span>
											<QuantityInput
												value={quantity}
												onChange={setQuantity}
												min={1}
												max={remaining}
												decreaseLabel="Decrease quantity"
												increaseLabel="Increase quantity"
											/>
										</div>
										<p
											className={`m-0 ${LABEL} ${LABEL_SM} ${
												product.inventory > 0
													? "text-on-surface-muted"
													: "text-primary-60"
											}`}
										>
											{stockLine}
										</p>
									</div>
									<Button
										onClick={handleAddToCart}
										disabled={remaining <= 0}
										className={CTA}
									>
										Add to cart
									</Button>
								</div>
							</aside>
						</div>
					</div>
				</section>
			</div>
			<PageMotion />
		</main>
	);
}
