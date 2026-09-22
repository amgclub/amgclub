"use client";
import { ShoppingBagIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useCart } from "@/contexts/cart";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
	const { itemCount } = useCart();

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
