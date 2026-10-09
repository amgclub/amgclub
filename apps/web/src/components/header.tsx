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

	return (
		<header className="w-full">
			<div className="relative flex min-h-13 flex-wrap items-center justify-between gap-x-6 gap-y-0 px-5 py-3 md:py-0 md:pr-13 md:pl-18">
				<Link
					href="/"
					aria-label="AMG Club UAE, home"
					className={`flex min-h-11 shrink-0 items-center ${FOCUS_RING}`}
				>
					<img
						className="block h-7 w-auto max-w-[45vw] md:h-5"
						src="/logo.webp"
						alt=""
						width={1600}
						height={276}
					/>
				</Link>

				<span className="t-issue whitespace-nowrap font-medium font-sans text-[0.9223cqw] text-foreground uppercase leading-none max-xl:whitespace-normal max-xl:text-right max-xl:text-[clamp(10px,1.6vw,12px)] max-xl:leading-[1.3] xl:absolute xl:top-1/2 xl:left-[20.7317cqw] xl:-translate-y-1/2">
					Season 2026 · Issue 001
				</span>

				<div className="flex shrink-0 items-center gap-x-6 self-stretch max-lg:flex-col-reverse max-lg:items-start">
					<nav
						className="masthead-nav flex flex-wrap items-center gap-x-5 gap-y-0 md:gap-x-6 xl:absolute xl:top-1/2 xl:left-[47cqw] xl:-translate-y-1/2"
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

					<div className="group/mcta -mr-5 flex shrink-0 items-center gap-0 self-stretch md:-mr-13">
						<a className={JOIN} href={JOIN_URL} aria-label="Join now">
							Join Now
						</a>
						<Link
							href={"/cart" as Route}
							className={`relative flex min-h-11 min-w-11 items-center justify-center self-stretch px-3 md:px-4 ${FOCUS_RING}`}
							aria-label="Cart"
						>
							<ShoppingBagIcon className="size-5" />
							{itemCount > 0 && (
								<span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary font-bold text-[10px] text-primary-foreground">
									{itemCount}
								</span>
							)}
						</Link>
						<span
							className="mcta-mark pointer-events-none w-[2.716cqw] min-w-[42px] shrink-0 self-stretch bg-primary transition-opacity group-hover/mcta:opacity-90"
							aria-hidden="true"
						/>
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
