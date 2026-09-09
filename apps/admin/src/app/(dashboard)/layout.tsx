import type { Metadata } from "next";

import { AdminShell } from "@/components/admin-shell";
import { requireAdminSession } from "@/lib/auth-server";

export const metadata: Metadata = {
	title: {
		default: "Dashboard",
		template: "%s — AMG Club UAE Admin",
	},
};

export default async function DashboardLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const session = await requireAdminSession();

	return (
		<AdminShell
			user={{
				name: session.user.name,
				email: session.user.email,
				role: session.user.role ?? "user",
			}}
		>
			{children}
		</AdminShell>
	);
}
