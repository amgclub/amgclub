"use client";

import { Button } from "@amgclub/ui/components/button";
import {
	Field,
	FieldContent,
	FieldError,
	FieldLabel,
} from "@amgclub/ui/components/field";
import { Input } from "@amgclub/ui/components/input";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { trpc } from "@/utils/trpc";

const registerSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().min(1, "Email is required").email("Invalid email address"),
	phone: z.string().min(1, "Phone is required"),
});

type RegisterInput = z.infer<typeof registerSchema>;

export default function EventRegisterForm({ eventId }: { eventId: string }) {
	const queryClient = useQueryClient();

	const register = useMutation(
		trpc.events.register.mutationOptions({
			onSuccess: (data) => {
				toast.success(data.message);
				queryClient.invalidateQueries({
					queryKey: trpc.events.publicList.queryKey(),
				});
			},
			onError: (error) => {
				toast.error(error.message);
			},
		}),
	);

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			phone: "",
		},
		validators: {
			onChange: registerSchema,
		},
		onSubmit: async ({ value }: { value: RegisterInput }) => {
			await register.mutateAsync({
				eventId,
				...value,
			});
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="flex flex-col gap-4"
		>
			<form.Field name="name">
				{(field) => (
					<Field>
						<FieldLabel>Name</FieldLabel>
						<FieldContent>
							<Input
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="Your full name"
							/>
							{field.state.meta.errors.map((error) => (
								<FieldError key={error?.message}>{error?.message}</FieldError>
							))}
						</FieldContent>
					</Field>
				)}
			</form.Field>

			<form.Field name="email">
				{(field) => (
					<Field>
						<FieldLabel>Email</FieldLabel>
						<FieldContent>
							<Input
								type="email"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="your@email.com"
							/>
							{field.state.meta.errors.map((error) => (
								<FieldError key={error?.message}>{error?.message}</FieldError>
							))}
						</FieldContent>
					</Field>
				)}
			</form.Field>

			<form.Field name="phone">
				{(field) => (
					<Field>
						<FieldLabel>Phone</FieldLabel>
						<FieldContent>
							<Input
								type="tel"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="+971 50 123 4567"
							/>
							{field.state.meta.errors.map((error) => (
								<FieldError key={error?.message}>{error?.message}</FieldError>
							))}
						</FieldContent>
					</Field>
				)}
			</form.Field>

			<form.Subscribe
				selector={(state) => ({
					canSubmit: state.canSubmit,
					isSubmitting: state.isSubmitting,
				})}
			>
				{({ canSubmit, isSubmitting }) => (
					<Button
						type="submit"
						disabled={!canSubmit || isSubmitting || register.isPending}
						className="w-full"
					>
						{isSubmitting || register.isPending ? "Registering..." : "Register"}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
