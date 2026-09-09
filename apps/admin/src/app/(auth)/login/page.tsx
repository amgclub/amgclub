import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/login-form";
import { getServerSession } from "@/lib/auth-server";

export const metadata: Metadata = {
	title: "Sign in",
};

export default async function LoginPage({
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
		<div className="flex min-h-svh items-center justify-center p-4">
			<LoginForm
				redirectTo={params.redirect}
				forbidden={params.error === "forbidden"}
			/>
		</div>
	);
}
