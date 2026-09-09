"use client";

import { NavMain, type NavMainGroup } from "@amgclub/ui/components/nav-main";
import { NavUser } from "@amgclub/ui/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@amgclub/ui/components/sidebar";
import type * as React from "react";

export interface SidebarUser {
	name: string;
	email: string;
	avatar?: string;
}

export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
	user: SidebarUser;
	groups: NavMainGroup[];
	onSignOut?: () => Promise<void> | void;
}

export function AppSidebar({
	user,
	groups,
	onSignOut,
	...props
}: AppSidebarProps) {
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" className="pointer-events-none">
							<div className="flex size-8 shrink-0 items-center justify-center bg-primary text-primary-foreground">
								<span className="font-extrabold text-sm tracking-tight">A</span>
							</div>
							<div className="grid flex-1 text-left leading-tight">
								<span className="truncate font-semibold text-sm">
									AMG Club UAE
								</span>
								<span className="truncate text-muted-foreground text-xs">
									Admin Console
								</span>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain groups={groups} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={user} onSignOut={onSignOut} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
