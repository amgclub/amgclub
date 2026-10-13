"use client";
import { Skeleton } from "@amgclub/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBagIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { PageMotion } from "@/components/page-motion";
import { Year } from "@/components/year";
import { formatAED } from "@/lib/format";
import {
	FOCUS_RING,
	HAIR_SPREAD,
	LABEL,
	LABEL_SM,
	SPREAD,
	SPREAD_BODY,
} from "@/lib/styles";
import { trpc } from "@/utils/trpc";

// The catalog is a plate grid: four across from xl, two below it, with
// a 24px gutter and 1.1-ratio plates.
const CARDS = "grid grid-cols-2 gap-6 xl:grid-cols-4";

const CARD = `shop-card group flex flex-col no-underline transition-colors hover:bg-muted/50 ${FOCUS_RING}`;

const PLATE =
	"card-media relative block aspect-[1.1] w-full overflow-hidden bg-muted";

const CARD_BODY =
	"flex flex-col gap-1.5 px-4 py-4 xl:gap-[0.6cqw] xl:px-[1.4cqw] xl:py-[1.4cqw]";

const CARD_NAME =
	"font-extrabold font-sans uppercase leading-[1.05] text-foreground text-[clamp(18px,4.4vw,26px)] transition-colors group-hover:text-primary-60 xl:text-[1.5cqw]";

const CARD_PRICE =
	"font-bold font-sans leading-[1.4] text-foreground text-body-md xl:text-[1.1cqw]";

const NOTE_TEXT = `m-0 font-medium font-sans uppercase leading-[1.4] tracking-[0.06em] text-on-surface-muted ${LABEL_SM} ${LABEL}`;

const HEADING =
	"m-0 font-extrabold font-sans uppercase leading-[0.86] tracking-[-0.03em] text-foreground text-[clamp(3.5rem,6.4cqw,10.5rem)] max-xl:text-[clamp(46px,8.6vw,116px)] max-xl:leading-[0.9] max-xl:tracking-normal";

const DECK =
	"mt-4 max-w-[46cqw] font-normal font-sans text-[0.8125rem] uppercase text-on-surface-muted max-xl:mt-4 max-xl:max-w-none max-xl:text-body-sm";

const SKEL_PLATE = "block h-full w-full rounded-none";
const SKEL_NAME = "block h-5 w-3/4 rounded-none";
const SKEL_PRICE = "block h-4 w-1/3 rounded-none";

export default function ShopPage() {
	const { data: productsData, isLoading } = useQuery(
		trpc.shop.publicList.queryOptions({
			page: 1,
			pageSize: 50,
		}),
	);

	const products = productsData?.items ?? [];

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
								Season <Year /> · Club merchandise
							</span>
						</div>

						<h1 className={`h1 ${HEADING}`}>Shop</h1>
						<span
							className="red-rule mt-3 block h-px w-24 bg-primary"
							aria-hidden="true"
						/>
						<p className={DECK}>AMG Club merchandise and accessories</p>
					</div>
				</header>

				<section
					className="spread relative pt-[4cqw] pb-[5.6cqw] max-xl:pt-9 max-xl:pb-9 md:max-xl:pt-14 md:max-xl:pb-14"
					aria-label="001: The Stock"
				>
					<span className={HAIR_SPREAD} aria-hidden="true" />
					<p
						className={`spread-kicker absolute top-[4cqw] left-[5.1448cqw] text-primary-60 max-xl:static max-xl:top-auto max-xl:mb-6 ${LABEL_SM} ${LABEL}`}
					>
						001 /
						<br />
						The Stock
					</p>
					<div className={SPREAD_BODY}>
						{isLoading ? (
							<div className={CARDS} aria-hidden="true">
								{Array.from({ length: 4 }).map((_, i) => (
									<div key={i} className={CARD}>
										<div className={PLATE}>
											<Skeleton className={SKEL_PLATE} />
										</div>
										<div className={CARD_BODY}>
											<Skeleton className={SKEL_NAME} />
											<Skeleton className={SKEL_PRICE} />
										</div>
										<div className="mt-auto block h-12 rounded-none bg-muted" />
									</div>
								))}
							</div>
						) : products.length === 0 ? (
							<div className="border-foreground/[0.41] border-t pt-[2.4cqw] max-xl:pt-6">
								<p className="m-0 font-extrabold font-sans text-[clamp(22px,4cqw,56px)] text-foreground uppercase leading-[1.05]">
									No products found
								</p>
								<p className={`m-0 mt-3 ${NOTE_TEXT}`}>
									Check back soon for new merchandise
								</p>
							</div>
						) : (
							<div className={CARDS}>
								{products.map((product) => (
									<Link
										key={product.id}
										href={`/shop/${product.slug}` as Route}
										className={`shop-card group flex flex-col no-underline transition-colors ${FOCUS_RING}`}
									>
										<span className={PLATE}>
											{product.images[0] ? (
												<img
													src={product.images[0].url}
													alt={product.images[0].altText || product.name}
													className="absolute inset-0 block h-full w-full object-cover object-center transition-[filter] duration-300 group-hover:brightness-125"
												/>
											) : (
												<span className="absolute inset-0 flex items-center justify-center">
													<ShoppingBagIcon
														className="size-8 text-muted-foreground"
														aria-hidden="true"
													/>
												</span>
											)}
										</span>
										<span className={CARD_BODY}>
											<span className={CARD_NAME}>{product.name}</span>
											<span className="flex items-center justify-between gap-3">
												<span
													className={`${CARD_PRICE} flex items-baseline gap-2`}
												>
													{formatAED(product.price)}
													{product.compareAtPrice &&
													product.compareAtPrice > product.price ? (
														<span className="font-medium text-caption text-on-surface-muted line-through">
															{formatAED(product.compareAtPrice)}
														</span>
													) : null}
												</span>
												<span className="flex min-h-11 shrink-0 items-center justify-center bg-primary px-4 text-primary-foreground transition-colors group-hover:bg-primary-60">
													<span className={`${LABEL_SM} ${LABEL}`}>
														Buy now
													</span>
												</span>
											</span>
										</span>
									</Link>
								))}
							</div>
						)}
					</div>
				</section>

				<section className={SPREAD} aria-label="Wear the club">
					<span className={HAIR_SPREAD} aria-hidden="true" />
					<div className={SPREAD_BODY}>
						<p className="statement m-0 font-extrabold font-sans text-[clamp(44px,8.6cqw,150px)] uppercase leading-[0.86] tracking-[-0.03em] max-xl:text-[clamp(40px,11vw,88px)]">
							Wear the
							<br />
							<span className="text-primary">club</span>
						</p>
					</div>
				</section>
			</div>

			<PageMotion />
		</main>
	);
}
