import type { Metadata } from "next";
import { redirect } from "next/navigation";

import LoginPage from "@/components/login-page";
import { getServerSession } from "@/lib/auth-server";

export const metadata: Metadata = {
	title: "Sign in",
};

export default async function AdminLoginRoute({
	searchParams,
}: {
	searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
	const params = await searchParams;
	const session = await getServerSession();

	if (session?.user.role === "admin") {
		redirect("/");
	}

	return (
		<LoginPage
			redirectTo={params.redirect}
			forbidden={params.error === "forbidden"}
		/>
	);
}
