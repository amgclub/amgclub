"use client";

import { Button } from "@amgclub/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@amgclub/ui/components/dialog";
import { Field, FieldGroup, FieldLabel } from "@amgclub/ui/components/field";
import { Input } from "@amgclub/ui/components/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";

const changePasswordFormSchema = z
	.object({
		newPassword: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z
			.string()
			.min(8, "Password must be at least 8 characters"),
	})
	.refine((values) => values.newPassword === values.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;

export function ChangePasswordDialog({
	open,
	onOpenChange,
	user,
	onSuccess,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: { id: string; name: string; email: string } | null;
	onSuccess: () => void;
}) {
	const [submitting, setSubmitting] = useState(false);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<ChangePasswordFormValues>({
		resolver: zodResolver(changePasswordFormSchema),
		defaultValues: { newPassword: "", confirmPassword: "" },
	});

	useEffect(() => {
		if (!open) {
			reset();
		}
	}, [open, reset]);

	async function onSubmit(values: ChangePasswordFormValues) {
		if (!user) {
			return;
		}
		setSubmitting(true);
		const { error } = await authClient.admin.setUserPassword({
			userId: user.id,
			newPassword: values.newPassword,
		});
		setSubmitting(false);

		if (error) {
			toast.error(error.message ?? "Failed to update password");
			return;
		}

		toast.success("Password updated");
		reset();
		onOpenChange(false);
		onSuccess();
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Change password</DialogTitle>
					<DialogDescription>
						{user
							? `Set a new password for ${user.name} (${user.email}).`
							: "Set a new password for this team member."}
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(event) => {
						event.preventDefault();
						handleSubmit(onSubmit)(event);
					}}
					className="flex flex-col gap-4"
				>
					<FieldGroup>
						<Field>
							<FieldLabel
								htmlFor="change-password-new"
								className="font-medium font-sans text-label-md"
							>
								New password
							</FieldLabel>
							<Input
								id="change-password-new"
								type="password"
								placeholder="At least 8 characters"
								autoComplete="new-password"
								aria-invalid={Boolean(errors.newPassword)}
								{...register("newPassword")}
							/>
							{errors.newPassword ? (
								<p className="font-sans text-caption text-destructive">
									{errors.newPassword.message}
								</p>
							) : null}
						</Field>
						<Field>
							<FieldLabel
								htmlFor="change-password-confirm"
								className="font-medium font-sans text-label-md"
							>
								Confirm password
							</FieldLabel>
							<Input
								id="change-password-confirm"
								type="password"
								placeholder="Repeat the new password"
								autoComplete="new-password"
								aria-invalid={Boolean(errors.confirmPassword)}
								{...register("confirmPassword")}
							/>
							{errors.confirmPassword ? (
								<p className="font-sans text-caption text-destructive">
									{errors.confirmPassword.message}
								</p>
							) : null}
						</Field>
					</FieldGroup>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								onOpenChange(false);
							}}
							disabled={submitting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={submitting}>
							{submitting ? "Updating…" : "Update password"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
