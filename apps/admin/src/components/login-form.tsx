"use client";

import { Button } from "@amgclub/ui/components/button";
import { Field, FieldGroup, FieldLabel } from "@amgclub/ui/components/field";
import { Input } from "@amgclub/ui/components/input";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { LoadingOverlay } from "@/components/loading-overlay";
import { authClient } from "@/lib/auth-client";

const loginSchema = z.object({
	email: z.email("Enter a valid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
	/** Where to navigate after a successful sign in (must be app-relative). */
	redirectTo?: string;
	/** Show a notice when the signed-in account is not an admin. */
	forbidden?: boolean;
}

export function LoginForm({ redirectTo, forbidden }: LoginFormProps) {
	const router = useRouter();
	const [submitting, setSubmitting] = useState(false);

	const {
		register,
		handleSubmit,
		setError,
		formState: { errors },
	} = useForm<LoginValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: "", password: "" },
	});

	async function onSubmit(values: LoginValues) {
		setSubmitting(true);
		const { error } = await authClient.signIn.email({
			email: values.email,
			password: values.password,
		});

		if (error) {
			setSubmitting(false);
			setError("root", {
				message: error.message ?? "Unable to sign in. Please try again.",
			});
			return;
		}

		toast.success("Welcome back");
		const target = redirectTo?.startsWith("/") ? redirectTo : "/";
		// Keep the overlay up through the dashboard redirect so the transition
		// doesn't look like a frozen page.
		void router.push(target as Route);
		router.refresh();
	}

	return (
		<>
			{submitting ? <LoadingOverlay label="Signing you in…" /> : null}
			<div className="flex flex-col gap-6">
				<div className="flex flex-col items-center gap-1 text-center">
					<h1 className="font-bold font-sans text-foreground text-headline-lg">
						Login to your account
					</h1>
					<p className="font-sans text-muted-foreground text-sm">
						Enter your email below to login to your account
					</p>
				</div>

				{forbidden ? (
					<p
						role="alert"
						className="border border-destructive/40 bg-surface-weak p-3 font-sans text-caption text-destructive-70"
					>
						This console is restricted to admin accounts.
					</p>
				) : null}

				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor="email">Email</FieldLabel>
							<Input
								id="email"
								type="email"
								placeholder="user@example.com"
								autoComplete="email"
								autoFocus
								aria-invalid={Boolean(errors.email)}
								{...register("email")}
							/>
							{errors.email ? (
								<p className="font-sans text-caption text-destructive-70">
									{errors.email.message}
								</p>
							) : null}
						</Field>
						<Field>
							<FieldLabel htmlFor="password">Password</FieldLabel>
							<Input
								id="password"
								type="password"
								autoComplete="current-password"
								aria-invalid={Boolean(errors.password)}
								{...register("password")}
							/>
							{errors.password ? (
								<p className="font-sans text-caption text-destructive-70">
									{errors.password.message}
								</p>
							) : null}
						</Field>
						{errors.root ? (
							<p
								role="alert"
								className="font-sans text-caption text-destructive-70"
							>
								{errors.root.message}
							</p>
						) : null}
						<Field>
							<Button type="submit" disabled={submitting} className="w-full">
								{submitting ? "Signing in…" : "Sign in"}
							</Button>
						</Field>
					</FieldGroup>
				</form>
			</div>
		</>
	);
}
