"use client";
import { ShoppingBagIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/contexts/cart";
import { JOIN_URL } from "@/lib/data";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export function Masthead() {
	return (
		<header className="pointer-events-none absolute inset-0 z-[3] max-xl:static max-xl:-order-1 max-xl:flex max-xl:flex-wrap max-xl:items-center max-xl:gap-4 max-xl:py-3.5 md:max-xl:py-5">
			<div className="r-masthead-wordmark absolute top-0 left-0 h-[10%] w-1/5 max-xl:static max-xl:h-auto max-xl:w-auto">
				<Link
					href="/"
					className="pointer-events-auto absolute top-[1.4364cqw] left-[20.6936cqw] block h-[0.6746cqw] w-[5.9832cqw] max-xl:static max-xl:flex max-xl:h-auto max-xl:min-h-11 max-xl:w-[clamp(132px,30vw,200px)] max-xl:items-center"
					aria-label="AMG Club UAE, home"
				>
					<img
						className="block h-full w-full max-xl:h-auto max-xl:w-auto"
						src="/logo.webp"
						alt=""
						width={1600}
						height={276}
					/>
				</Link>
			</div>
			<div className="r-masthead-issue absolute top-[8.15%] left-[44.13%] h-[1.83%] w-[12.35%] max-xl:static max-xl:ml-auto max-xl:h-auto max-xl:w-auto">
				<span className="t-issue absolute top-[-3.2519cqw] left-[2.6296cqw] whitespace-nowrap font-medium font-sans text-[0.9223cqw] text-foreground uppercase leading-none max-xl:static max-xl:whitespace-normal max-xl:text-right max-xl:text-[clamp(10px,1.6vw,12px)] max-xl:leading-[1.3]">
					Season 2026 · Issue 001
				</span>
			</div>
			<nav
				className="masthead-nav absolute top-[1.26cqw] right-[20.5%] flex gap-[14px] whitespace-nowrap max-xl:static max-xl:order-5 max-xl:w-full max-xl:flex-wrap max-xl:gap-x-5 max-xl:gap-y-1 max-xl:pt-0.5"
				aria-label="Primary"
			>
				<a
					className="pointer-events-auto font-medium font-sans text-foreground text-label-md uppercase no-underline transition-colors hover:text-primary-60 focus-visible:outline-2 focus-visible:outline-primary-70 focus-visible:outline-solid focus-visible:outline-offset-[3px] max-xl:flex max-xl:min-h-11 max-xl:items-center"
					href="#about"
				>
					About
				</a>
				<Link
					className="pointer-events-auto font-medium font-sans text-foreground text-label-md uppercase no-underline transition-colors hover:text-primary-60 focus-visible:outline-2 focus-visible:outline-primary-70 focus-visible:outline-solid focus-visible:outline-offset-[3px] max-xl:flex max-xl:min-h-11 max-xl:items-center"
					href={"/events" as Route}
				>
					Events
				</Link>
				<Link
					className="pointer-events-auto font-medium font-sans text-foreground text-label-md uppercase no-underline transition-colors hover:text-primary-60 focus-visible:outline-2 focus-visible:outline-primary-70 focus-visible:outline-solid focus-visible:outline-offset-[3px] max-xl:flex max-xl:min-h-11 max-xl:items-center"
					href={"/shop" as Route}
				>
					Shop
				</Link>
				<a
					className="pointer-events-auto font-medium font-sans text-foreground text-label-md uppercase no-underline transition-colors hover:text-primary-60 focus-visible:outline-2 focus-visible:outline-primary-70 focus-visible:outline-solid focus-visible:outline-offset-[3px] max-xl:flex max-xl:min-h-11 max-xl:items-center"
					href="#contact"
				>
					Contact
				</a>
			</nav>
			<div className="r-masthead-cta group/mcta absolute top-0 right-0 flex h-13 items-center gap-[1.4cqw] max-xl:static max-xl:order-2 max-xl:h-11 max-xl:w-auto max-xl:shrink-0">
				<a
					className="t-mcta pointer-events-auto whitespace-nowrap font-medium font-sans text-[0.9337cqw] text-primary-60 uppercase leading-[1.1] no-underline transition-colors hover:text-primary-70 focus-visible:outline-2 focus-visible:outline-primary-70 focus-visible:outline-solid focus-visible:outline-offset-[3px] max-xl:flex max-xl:min-h-11 max-xl:items-center max-xl:text-[clamp(13px,1.8vw,15px)]"
					href={JOIN_URL}
					aria-label="Join now"
				>
					Join Now
				</a>
				<span
					className="mcta-mark pointer-events-none h-full w-[2.716cqw] shrink-0 self-stretch bg-primary transition-opacity group-hover/mcta:opacity-90 max-xl:h-11 max-xl:w-[clamp(112px,26vw,172px)]"
					aria-hidden="true"
				/>
			</div>
			<div
				className="r-masthead-rule absolute top-0 left-0 h-[10%] w-full max-xl:hidden"
				aria-hidden="true"
			>
				<span className="hair-masthead absolute top-[3.6033cqw] left-0 h-[0.0591cqw] w-full bg-foreground/45" />
			</div>
		</header>
	);
}

export default function Header() {
	const pathname = usePathname();
	const { itemCount } = useCart();

	if (pathname === "/") {
		return null;
	}

	const links = [
		{ to: "/" as Route, label: "Home" },
		{ to: "/events" as Route, label: "Events" },
		{ to: "/shop" as Route, label: "Shop" },
		{ to: "/dashboard" as Route, label: "Dashboard" },
	] as const;

	return (
		<div>
			<div className="flex flex-row items-center justify-between px-2 py-1">
				<nav className="flex gap-4 text-lg">
					{links.map(({ to, label }) => {
						return (
							<Link key={to} href={to}>
								{label}
							</Link>
						);
					})}
				</nav>
				<div className="flex items-center gap-2">
					<Link href={"/cart" as Route} className="relative p-2">
						<ShoppingBagIcon className="size-5" />
						{itemCount > 0 && (
							<span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary font-bold text-[10px] text-primary-foreground">
								{itemCount}
							</span>
						)}
					</Link>
					<ModeToggle />
					<UserMenu />
				</div>
			</div>
			<hr />
		</div>
	);
}
