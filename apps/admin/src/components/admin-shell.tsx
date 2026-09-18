"use client";

import { AppSidebar } from "@amgclub/ui/components/app-sidebar";
import { Separator } from "@amgclub/ui/components/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@amgclub/ui/components/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { LoadingOverlay } from "@/components/loading-overlay";
import { navGroups, pageTitleFor } from "@/config/sidebar";
import { authClient } from "@/lib/auth-client";

export interface AdminUser {
	name: string;
	email: string;
	role: string;
}

export function AdminShell({
	user,
	children,
}: {
	user: AdminUser;
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const router = useRouter();
	const [signingOut, setSigningOut] = useState(false);

	async function handleSignOut() {
		setSigningOut(true);
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					// Keep the overlay up through the redirect to /login so the
					// transition doesn't look like a frozen page.
					router.push("/login");
					router.refresh();
				},
			},
		});
	}

	return (
		<>
			{signingOut ? <LoadingOverlay label="Signing out…" /> : null}
			<SidebarProvider>
				<AppSidebar
					user={user}
					groups={navGroups}
					logo="/logo.webp"
					onSignOut={handleSignOut}
				/>
				<SidebarInset>
					<header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
						<SidebarTrigger />
						<Separator orientation="vertical" className="mr-1 h-4" />
						<span className="font-medium font-sans text-label-lg">
							{pageTitleFor(pathname)}
						</span>
						<div className="ml-auto flex items-center gap-2">
							<span className="text-caption text-muted-foreground">
								{user.email}
							</span>
						</div>
					</header>
					<main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
						{children}
					</main>
				</SidebarInset>
			</SidebarProvider>
		</>
	);
}
