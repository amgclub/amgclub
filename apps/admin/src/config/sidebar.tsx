import {
	CalendarDaysIcon,
	HomeIcon,
	LayersIcon,
	PackageIcon,
	SettingsIcon,
	ShoppingBagIcon,
	TagIcon,
	UsersIcon,
} from "lucide-react";
import type { Route } from "next";

export interface NavItem {
	title: string;
	url: Route;
	icon: React.ReactNode;
}

export interface NavGroup {
	title: string;
	items: NavItem[];
}

export const navGroups: NavGroup[] = [
	{
		title: "Dashboard",
		items: [{ title: "Home", url: "/", icon: <HomeIcon /> }],
	},
	{
		title: "Memberships",
		items: [
			{ title: "All Members", url: "/members", icon: <UsersIcon /> },
			{ title: "Requests", url: "/members/requests", icon: <TagIcon /> },
		],
	},
	{
		title: "Events",
		items: [
			{ title: "All Events", url: "/events", icon: <CalendarDaysIcon /> },
		],
	},
	{
		title: "Shop",
		items: [
			{ title: "Products", url: "/shop/products", icon: <PackageIcon /> },
			{ title: "Categories", url: "/shop/categories", icon: <TagIcon /> },
			{ title: "Collections", url: "/shop/collections", icon: <LayersIcon /> },
		],
	},
	{
		title: "Settings",
		items: [
			{ title: "General", url: "/settings/general", icon: <SettingsIcon /> },
			{ title: "Team", url: "/settings/team", icon: <UsersIcon /> },
		],
	},
];

/** All nav items flattened — used for page titles and lookups. */
export const navItems: NavItem[] = navGroups.flatMap((group) => group.items);

/** Resolve the current page title from the pathname (longest prefix wins). */
export function pageTitleFor(pathname: string): string {
	const matches = navItems
		.filter(
			(item) => pathname === item.url || pathname.startsWith(`${item.url}/`),
		)
		.sort((a, b) => b.url.length - a.url.length);
	return matches[0]?.title ?? "Admin";
}

export const shopIcon = <ShoppingBagIcon />;
