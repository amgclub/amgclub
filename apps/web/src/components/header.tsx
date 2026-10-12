"use client";
import { ShoppingBagIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useCart } from "@/contexts/cart";
import { JOIN_URL } from "@/lib/data";
import { FOCUS_RING } from "@/lib/styles";

const NAV_LINK = `flex min-h-11 items-center font-medium font-sans text-foreground text-label-md uppercase no-underline transition-colors hover:text-primary-60 ${FOCUS_RING}`;

const JOIN = `t-mcta flex min-h-11 items-center self-stretch whitespace-nowrap pr-4 font-medium font-sans text-[0.9337cqw] text-primary-60 uppercase leading-[1.1] no-underline transition-colors hover:text-primary-70 md:pr-0 ${FOCUS_RING} max-xl:text-[clamp(13px,1.8vw,15px)]`;

export default function Header() {
	const { itemCount } = useCart();

	// The bag glyph is aria-hidden, so without this the link has no accessible
	// name and the count is never announced. Pluralised because "1 items" reads
	// as a bug to a screen reader.
	const cartLabel =
		itemCount === 1
			? "Cart, 1 item"
			: itemCount > 1
				? `Cart, ${itemCount} items`
				: "Cart";

	return (
		<header className="w-full">
			<div className="relative flex min-h-13 flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-3 md:py-0 md:pr-13 md:pl-18">
				<Link
					href="/"
					aria-label="AMG Club UAE, home"
					className={`flex min-h-11 shrink-0 items-center max-lg:order-1 ${FOCUS_RING}`}
				>
					<img
						className="block h-7 w-auto max-w-[45vw] md:h-5"
						src="/logo.webp"
						alt=""
						width={1600}
						height={276}
					/>
				</Link>

				<span className="t-issue whitespace-nowrap font-medium font-sans text-[0.87653cqw] text-primary-60 uppercase leading-none max-lg:order-3 max-lg:w-full max-lg:text-left max-xl:whitespace-normal max-xl:text-right max-xl:text-[clamp(10px,1.6vw,12px)] max-xl:leading-[1.3] xl:absolute xl:top-1/2 xl:left-[20.7317cqw] xl:-translate-y-1/2">
					Season 2026 · Issue 001
				</span>

				{/* Below lg the wrapper dissolves so the nav and the CTA cluster become
				    flex items of the header itself and `order` can put them on their own
				    rows. From lg up it stays a box, which is what keeps them grouped. */}
				<div className="flex shrink-0 items-center gap-x-6 self-stretch max-lg:contents">
					<nav
						className="masthead-nav flex flex-wrap items-center gap-x-5 gap-y-0 max-lg:order-4 max-lg:w-full md:gap-x-6 xl:absolute xl:top-1/2 xl:left-[47cqw] xl:-translate-y-1/2"
						aria-label="Primary"
					>
						<Link className={NAV_LINK} href={"/about" as Route}>
							About
						</Link>
						<Link className={NAV_LINK} href={"/events" as Route}>
							Events
						</Link>
						<Link className={NAV_LINK} href={"/shop" as Route}>
							Shop
						</Link>
						<Link className={NAV_LINK} href={"/contact" as Route}>
							Contact
						</Link>
					</nav>

					{/* The red cart replaces the trailing mark block and keeps its
					    flush-to-hairline position; -mr-5 / md:-mr-13 bleed it to
					    the edge against the header's own px-5 / md:pr-13. */}
					<div className="group/mcta -mr-5 flex shrink-0 items-center gap-4 self-stretch max-lg:order-2 md:-mr-13">
						<a className={JOIN} href={JOIN_URL} aria-label="Join now">
							Join Now
						</a>
						<Link
							href={"/cart" as Route}
							className={`relative flex min-h-11 min-w-11 items-center justify-center self-stretch bg-primary px-5 text-primary-foreground transition-opacity group-hover/mcta:opacity-90 ${FOCUS_RING}`}
							aria-label={cartLabel}
						>
							{/* The badge hangs off the icon rather than the button: anchored
							    to the 20px block it floated over the page edge with nothing
							    behind it, anchored to the glyph it sits on red and reads as
							    part of the mark. */}
							<span className="relative flex">
								<ShoppingBagIcon className="size-5" />
								{itemCount > 0 && (
									<span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-background font-bold text-[10px] text-primary-foreground ring-2 ring-primary">
										{itemCount}
									</span>
								)}
							</span>
						</Link>
					</div>
				</div>
			</div>

			<span
				className="hair-masthead block h-[1.5px] w-full bg-foreground/40"
				aria-hidden="true"
			/>
		</header>
	);
}
