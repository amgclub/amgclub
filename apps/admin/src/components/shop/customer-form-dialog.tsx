"use client";

import type { CustomerDTO } from "@amgclub/api/routers/customers";
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
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { queryClient, trpc } from "@/utils/trpc";

const customerFormSchema = z.object({
	name: z.string().min(1, "Name is required").max(200),
	email: z.string().email("Invalid email address").max(200),
	phone: z.string().max(30).optional().or(z.literal("")),
	userId: z.string().max(200).optional().or(z.literal("")),
});

type CustomerFormInput = z.input<typeof customerFormSchema>;
type CustomerFormOutput = z.output<typeof customerFormSchema>;

function FieldErrorText({ message }: { message?: string }) {
	if (!message) {
		return null;
	}
	return <p className="text-caption text-destructive-70">{message}</p>;
}

export function CustomerFormDialog({
	open,
	onOpenChange,
	customer,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	customer?: CustomerDTO | null;
}) {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CustomerFormInput, unknown, CustomerFormOutput>({
		resolver: zodResolver(customerFormSchema),
		defaultValues: customer
			? {
					name: customer.name,
					email: customer.email,
					phone: customer.phone ?? "",
					userId: customer.userId ?? "",
				}
			: {
					name: "",
					email: "",
					phone: "",
					userId: "",
				},
	});

	const createMutation = useMutation({
		...trpc.customers.create.mutationOptions(),
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const updateMutation = useMutation({
		...trpc.customers.update.mutationOptions(),
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const submitting = createMutation.isPending || updateMutation.isPending;

	async function onSubmit(values: CustomerFormOutput) {
		const payload = {
			name: values.name,
			email: values.email,
			phone: values.phone || undefined,
			userId: values.userId || undefined,
		};

		if (customer) {
			await updateMutation.mutateAsync({ id: customer.id, data: payload });
		} else {
			await createMutation.mutateAsync(payload);
		}

		toast.success(customer ? "Customer updated" : "Customer created");
		queryClient.invalidateQueries();
		onOpenChange(false);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						{customer ? "Edit customer" : "Create customer"}
					</DialogTitle>
					<DialogDescription>
						{customer
							? "Update customer information."
							: "Add a new customer to the system."}
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleSubmit(onSubmit)(e);
					}}
					className="flex flex-col gap-4"
				>
					<FieldGroup>
						<Field>
							<FieldLabel>Name</FieldLabel>
							<Input
								id="customer-name"
								placeholder="John Doe"
								aria-invalid={Boolean(errors.name)}
								{...register("name")}
							/>
							<FieldErrorText message={errors.name?.message} />
						</Field>

						<Field>
							<FieldLabel>Email</FieldLabel>
							<Input
								id="customer-email"
								type="email"
								placeholder="john@example.com"
								aria-invalid={Boolean(errors.email)}
								{...register("email")}
							/>
							<FieldErrorText message={errors.email?.message} />
						</Field>

						<div className="grid gap-4 sm:grid-cols-2">
							<Field>
								<FieldLabel>Phone</FieldLabel>
								<Input
									id="customer-phone"
									type="tel"
									placeholder="+971 50 123 4567"
									aria-invalid={Boolean(errors.phone)}
									{...register("phone")}
								/>
								<FieldErrorText message={errors.phone?.message} />
							</Field>
							<Field>
								<FieldLabel>User ID</FieldLabel>
								<Input
									id="customer-user-id"
									placeholder="Optional linked user"
									aria-invalid={Boolean(errors.userId)}
									{...register("userId")}
								/>
								<FieldErrorText message={errors.userId?.message} />
							</Field>
						</div>
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
							{submitting
								? "Saving…"
								: customer
									? "Save changes"
									: "Create customer"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
