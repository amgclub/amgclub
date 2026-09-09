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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";

const teamMemberFormSchema = z.object({
	name: z.string().min(1, "Name is required").max(120),
	email: z.email("Enter a valid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	role: z.enum(["admin", "user"]),
});

type TeamMemberFormValues = z.infer<typeof teamMemberFormSchema>;

export function AddTeamMemberDialog({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [submitting, setSubmitting] = useState(false);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		reset,
		formState: { errors },
	} = useForm<TeamMemberFormValues>({
		resolver: zodResolver(teamMemberFormSchema),
		defaultValues: { name: "", email: "", password: "", role: "user" },
	});

	const role = watch("role");

	async function onSubmit(values: TeamMemberFormValues) {
		setSubmitting(true);
		const { error } = await authClient.admin.createUser({
			name: values.name,
			email: values.email,
			password: values.password,
			role: values.role,
		});
		setSubmitting(false);

		if (error) {
			toast.error(error.message ?? "Failed to create team member");
			return;
		}

		toast.success(`Team member ${values.name} created`);
		reset();
		onOpenChange(false);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add team member</DialogTitle>
					<DialogDescription>
						Backend accounts can sign in to this console. Admins can manage
						members, events, settings and the team.
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
							<FieldLabel htmlFor="team-name">Name</FieldLabel>
							<Input
								id="team-name"
								placeholder="Khalil Ali"
								autoComplete="off"
								aria-invalid={Boolean(errors.name)}
								{...register("name")}
							/>
							{errors.name ? (
								<p className="text-caption text-destructive">
									{errors.name.message}
								</p>
							) : null}
						</Field>
						<Field>
							<FieldLabel htmlFor="team-email">Email</FieldLabel>
							<Input
								id="team-email"
								type="email"
								placeholder="admin@amgclub.ae"
								autoComplete="off"
								aria-invalid={Boolean(errors.email)}
								{...register("email")}
							/>
							{errors.email ? (
								<p className="text-caption text-destructive">
									{errors.email.message}
								</p>
							) : null}
						</Field>
						<Field>
							<FieldLabel htmlFor="team-password">
								Temporary password
							</FieldLabel>
							<Input
								id="team-password"
								type="password"
								placeholder="At least 8 characters"
								autoComplete="new-password"
								aria-invalid={Boolean(errors.password)}
								{...register("password")}
							/>
							{errors.password ? (
								<p className="text-caption text-destructive">
									{errors.password.message}
								</p>
							) : null}
						</Field>
						<Field>
							<FieldLabel>Role</FieldLabel>
							<div
								role="radiogroup"
								aria-label="Team member role"
								className="flex gap-1"
							>
								{(["admin", "user"] as const).map((value) => (
									<Button
										key={value}
										type="button"
										size="sm"
										variant={role === value ? "default" : "outline"}
										aria-pressed={role === value}
										onClick={() => {
											setValue("role", value, { shouldValidate: true });
										}}
									>
										{value === "admin" ? "Admin" : "Staff"}
									</Button>
								))}
							</div>
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
							{submitting ? "Creating…" : "Create account"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
