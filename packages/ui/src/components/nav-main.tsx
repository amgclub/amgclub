"use client";

import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@amgclub/ui/components/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavMainItem {
	title: string;
	url: string;
	icon?: React.ReactNode;
}

// `href` on `next/link` is narrowed by an app's generated typed-routes types; a
// shared UI package must stay portable across apps, so resolve the href type
// from Link itself rather than hard-coding `Route`.
type HrefType = React.ComponentProps<typeof Link>["href"];

export interface NavMainGroup {
	title: string;
	items: NavMainItem[];
}

/**
 * Flat, label-grouped nav (no collapsibles). Each group renders a label and a
 * list of link buttons, following the NavProjects pattern.
 */
export function NavMain({ groups }: { groups: NavMainGroup[] }) {
	const pathname = usePathname();
	const { isMobile, setOpenMobile } = useSidebar();

	return (
		<>
			{groups.map((group) => (
				<SidebarGroup key={group.title}>
					<SidebarGroupLabel>{group.title}</SidebarGroupLabel>
					<SidebarMenu>
						{group.items.map((item) => (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton
									tooltip={item.title}
									isActive={
										pathname === item.url ||
										(item.url !== "/" && pathname.startsWith(item.url))
									}
									render={<Link href={item.url as HrefType} />}
									onClick={() => {
										if (isMobile) {
											setOpenMobile(false);
										}
									}}
								>
									{item.icon}
									<span>{item.title}</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarGroup>
			))}
		</>
	);
}
