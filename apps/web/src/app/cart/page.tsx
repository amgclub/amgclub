"use client";
import { Button } from "@amgclub/ui/components/button";
import { Skeleton } from "@amgclub/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBagIcon, Trash2Icon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useMemo } from "react";
import { PageMotion } from "@/components/page-motion";
import { QuantityInput } from "@/components/quantity-input";
import { Year } from "@/components/year";
import { useCart } from "@/contexts/cart";
import { formatAED } from "@/lib/format";
import {
	FOCUS_RING,
	HAIR_SPREAD,
	LABEL,
	LABEL_SM,
	SPREAD_BODY,
} from "@/lib/styles";
import { trpc } from "@/utils/trpc";

const HEADING =
	"m-0 font-extrabold font-sans uppercase leading-[0.86] tracking-[-0.03em] text-foreground text-[clamp(3.5rem,6.4cqw,10.5rem)] max-xl:text-[clamp(46px,8.6vw,116px)] max-xl:leading-[0.9] max-xl:tracking-normal";

const DECK =
	"mt-4 max-w-[46cqw] font-normal font-sans text-[0.8125rem] uppercase text-on-surface-muted max-xl:mt-4 max-xl:max-w-none max-xl:text-body-sm";

const SECTION =
	"spread relative pt-[4cqw] pb-[5.6cqw] max-xl:pt-9 max-xl:pb-9 md:max-xl:pt-14 md:max-xl:pb-14";

const KICKER = `absolute left-[5.1448cqw] top-[4cqw] text-primary-60 max-xl:static max-xl:mb-6 ${LABEL_SM} ${LABEL}`;

const LEDGER = "m-0 list-none border-t border-foreground/[0.41] p-0";

const ROW =
	"grid grid-cols-[5.6cqw_minmax(0,1fr)_auto] items-center gap-x-[1.6cqw] border-b border-foreground/[0.41] py-[1.5cqw] max-xl:grid-cols-[44px_1fr] max-xl:gap-y-2 max-xl:py-4";

const ROW_INDEX =
	"font-medium font-sans tracking-[0.06em] text-[0.87653cqw] text-primary-60 max-xl:text-label-sm";

const ROW_NAME =
	"text-[1.35cqw] leading-[1.1] font-extrabold font-sans uppercase max-xl:text-[clamp(16px,3.6vw,22px)]";

const ROW_NAME_TEXT = "min-w-0 line-clamp-2";

const ROW_META = `text-on-surface-muted ${LABEL_SM} ${LABEL}`;

const PLATE =
	"relative block aspect-[1.1] w-[4.4cqw] shrink-0 overflow-hidden bg-muted max-xl:w-16";

const CONTROLS =
	"flex items-center justify-end gap-[1.2cqw] max-xl:col-start-2 max-xl:mt-1 max-xl:gap-3";

const REMOVE = `flex size-11 shrink-0 cursor-pointer select-none items-center justify-center text-on-surface-muted transition-colors hover:text-primary-60 ${FOCUS_RING}`;

const LINE_TOTAL =
	"min-w-[6cqw] text-right font-bold font-sans tabular-nums text-foreground text-body-md xl:text-[1.1cqw] max-xl:min-w-0";

const RAIL_LABEL = `m-0 text-on-surface-muted ${LABEL_SM} ${LABEL}`;

const RAIL_ROW = "flex items-baseline justify-between gap-3 text-body-sm";

const RAIL_VALUE = "font-sans tabular-nums text-foreground";

const TOTAL_LABEL = `font-bold font-sans uppercase text-foreground text-body-md ${LABEL_SM}`;

const TOTAL_VALUE =
	"m-0 font-extrabold font-sans tabular-nums text-foreground text-[2.2cqw] uppercase leading-none max-xl:text-[34px]";

const CTA = `h-12 w-full text-label-lg uppercase tracking-[0.06em] ${FOCUS_RING}`;

const TEXT_ACTION = `inline-flex min-h-11 items-center text-on-surface-muted transition-colors hover:text-primary-60 ${LABEL_SM} ${LABEL} ${FOCUS_RING}`;

const EMPTY_TITLE =
	"m-0 font-extrabold font-sans uppercase leading-[1.05] text-foreground text-[clamp(22px,4cqw,56px)]";

const NOTE_TEXT = `m-0 font-medium font-sans uppercase leading-[1.4] tracking-[0.06em] text-on-surface-muted ${LABEL_SM} ${LABEL}`;

// Every skeleton is a hairline-height bar at the row's own geometry, never a
// rounded block.
const SKEL_INDEX = "block h-3 w-6";
const SKEL_PLATE = "block h-full w-full";
const SKEL_NAME = "block h-5 w-1/2";
const SKEL_META = "block h-3 w-32";
const SKEL_TOTAL = "ml-auto block h-4 w-20";
const SKEL_RAIL = "block h-4 w-full";

export default function CartPage() {
	const {
		items,
		updateQuantity,
		removeItem,
		clearCart,
		total,
		itemCount,
		hydrated,
	} = useCart();

	const ids = useMemo(
		() => [...new Set(items.map((item) => item.productId))].sort(),
		[items],
	);

	const inventoryQuery = useQuery(
		trpc.shop.publicGetByIds.queryOptions(
			{ ids },
			{ enabled: hydrated && items.length > 0 },
		),
	);

	const inventoryById = useMemo(() => {
		const map = new Map<string, number>();
		for (const product of inventoryQuery.data?.items ?? []) {
			map.set(product.id, product.inventory);
		}
		return map;
	}, [inventoryQuery.data]);

	const isEmpty = hydrated && items.length === 0;
	const deck = isEmpty
		? "Nothing reserved yet"
		: "Review quantities and total before checkout";

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
								Season <Year /> · The manifest
							</span>
						</div>

						<h1 className={`h1 ${HEADING}`}>Cart</h1>
						<span
							className="red-rule mt-3 block h-px w-24 bg-primary"
							aria-hidden="true"
						/>
						<p className={DECK}>{deck}</p>
					</div>
				</header>

				<section className={SECTION} aria-label="001: The manifest">
					<span className={HAIR_SPREAD} aria-hidden="true" />
					<p className={`spread-kicker ${KICKER}`}>
						001 /
						<br />
						The manifest
					</p>
					<div className={SPREAD_BODY}>
						{!hydrated ? (
							<div
								className="grid max-xl:grid-cols-1 max-xl:gap-y-8 xl:grid-cols-[minmax(0,1fr)_26cqw] xl:gap-x-[3cqw]"
								aria-hidden="true"
							>
								<div className={LEDGER}>
									{[0, 1, 2].map((row) => (
										<div key={row} className={`format-row ${ROW}`}>
											<span className={ROW_INDEX}>
												<Skeleton className={SKEL_INDEX} />
											</span>
											<span className="flex min-w-0 items-center gap-[1.6cqw] max-xl:gap-3">
												<span className={PLATE}>
													<Skeleton className={SKEL_PLATE} />
												</span>
												<span className="flex min-w-0 flex-col gap-1.5">
													<Skeleton className={SKEL_NAME} />
													<Skeleton className={SKEL_META} />
												</span>
											</span>
											<span className={CONTROLS}>
												<Skeleton className="block h-11 w-36" />
												<Skeleton className={SKEL_TOTAL} />
											</span>
										</div>
									))}
								</div>
								<div className="flex flex-col gap-4 xl:sticky xl:top-6">
									<p className={RAIL_LABEL}>Order summary</p>
									<div className="flex flex-col gap-3 border-foreground/[0.41] border-t pt-4">
										<Skeleton className={SKEL_RAIL} />
										<Skeleton className={SKEL_RAIL} />
									</div>
									<div className="flex items-baseline justify-between gap-3 border-foreground/[0.41] border-t pt-4">
										<Skeleton className="block h-4 w-16" />
										<Skeleton className="block h-6 w-24" />
									</div>
									<Skeleton className="block h-12 w-full" />
								</div>
								<span className="sr-only" role="status">
									Loading cart
								</span>
							</div>
						) : isEmpty ? (
							<div className="border-foreground/[0.41] border-t pt-[2.4cqw] max-xl:pt-6">
								<p className={EMPTY_TITLE}>Your cart is empty</p>
								<p className={`mt-3 ${NOTE_TEXT}`}>
									Browse the shop and add some items
								</p>
								<Link href={"/shop" as Route} className="mt-6 inline-block">
									<Button
										className={`h-12 px-6 text-label-lg uppercase tracking-[0.06em] ${FOCUS_RING}`}
									>
										Browse the shop
									</Button>
								</Link>
							</div>
						) : (
							<div className="grid max-xl:grid-cols-1 max-xl:gap-y-8 xl:grid-cols-[minmax(0,1fr)_26cqw] xl:gap-x-[3cqw]">
								<ol className={LEDGER}>
									{items.map((item, position) => {
										const maxQty = inventoryById.get(item.productId);
										return (
											<li key={item.productId} className={`format-row ${ROW}`}>
												<span className={ROW_INDEX}>
													{String(position + 1).padStart(2, "0")}
												</span>
												<span className="flex min-w-0 items-center gap-[1.6cqw] max-xl:gap-3">
													<span className={PLATE}>
														{item.imageUrl ? (
															<img
																src={item.imageUrl}
																alt=""
																className="absolute inset-0 block h-full w-full object-cover object-center"
															/>
														) : (
															<span className="absolute inset-0 flex items-center justify-center">
																<ShoppingBagIcon
																	className="size-5 text-muted-foreground"
																	aria-hidden="true"
																/>
															</span>
														)}
													</span>
													<span className="flex min-w-0 flex-col gap-1.5">
														<span
															className={`${ROW_NAME} ${ROW_NAME_TEXT}`}
															title={item.name}
														>
															{item.name}
														</span>
														<span className="flex min-w-0 items-center justify-between gap-3">
															<span className={ROW_META}>
																{formatAED(item.price)} each
															</span>
															<button
																type="button"
																className={REMOVE}
																onClick={() => removeItem(item.productId)}
																aria-label={`Remove ${item.name} from cart`}
															>
																<Trash2Icon
																	className="size-4"
																	aria-hidden="true"
																/>
															</button>
														</span>
													</span>
												</span>
												<span className={CONTROLS}>
													<QuantityInput
														value={item.quantity}
														onChange={(next) =>
															updateQuantity(item.productId, next)
														}
														min={1}
														max={
															maxQty === undefined
																? Number.POSITIVE_INFINITY
																: maxQty
														}
														decreaseLabel={`Decrease quantity of ${item.name}`}
														increaseLabel={`Increase quantity of ${item.name}`}
													/>
													<span className={LINE_TOTAL}>
														{formatAED(item.price * item.quantity)}
													</span>
												</span>
											</li>
										);
									})}
								</ol>

								<aside className="flex flex-col items-start gap-4 xl:sticky xl:top-6">
									<p className={RAIL_LABEL}>Order summary</p>
									<div className="flex w-full flex-col gap-2.5 border-foreground/[0.41] border-t pt-4">
										<div className={RAIL_ROW}>
											<span className="text-on-surface-muted">
												Subtotal ({itemCount}{" "}
												{itemCount === 1 ? "item" : "items"})
											</span>
											<span className={RAIL_VALUE}>{formatAED(total)}</span>
										</div>
										<div className={RAIL_ROW}>
											<span className="text-on-surface-muted">Shipping</span>
											<span className={RAIL_VALUE}>Free</span>
										</div>
									</div>
									<div className="flex w-full items-baseline justify-between gap-3 border-foreground/[0.41] border-t pt-4">
										<span className={TOTAL_LABEL}>Total</span>
										<span className={TOTAL_VALUE}>{formatAED(total)}</span>
									</div>
									<Link href={"/checkout" as Route} className="block w-full">
										<Button className={CTA}>Proceed to checkout</Button>
									</Link>
									<Link href={"/shop" as Route} className={TEXT_ACTION}>
										Continue shopping
									</Link>
									<button
										type="button"
										className={`${TEXT_ACTION} cursor-pointer`}
										onClick={clearCart}
									>
										Clear cart
									</button>
								</aside>
							</div>
						)}
					</div>
				</section>
			</div>

			<PageMotion />
		</main>
	);
}
