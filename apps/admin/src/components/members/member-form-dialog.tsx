"use client";

import type { MemberDTO } from "@amgclub/api/routers/members";
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
import { Textarea } from "@amgclub/ui/components/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { computeEndDate, todayISO } from "@/lib/format";
import { queryClient, trpc } from "@/utils/trpc";

const memberFormSchema = z.object({
	memberName: z.string().min(1, "Name is required").max(120),
	email: z.email("Enter a valid email address"),
	phone: z.string().min(5, "Phone is required").max(32),
	plan: z.enum(["monthly", "yearly"]),
	status: z.enum(["in_review", "active", "paused", "canceled"]),
	price: z.coerce.number().min(0, "Price must be zero or more").max(1_000_000),
	startDate: z
		.string()
		.min(1, "Start date is required")
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
	endDate: z
		.string()
		.min(1, "End date is required")
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
	carModel: z
		.string()
		.trim()
		.max(120, "Model must be 120 characters or less")
		.optional(),
	notes: z.string().max(2000).optional(),
});

type MemberFormInput = z.input<typeof memberFormSchema>;
type MemberFormOutput = z.output<typeof memberFormSchema>;

const statusOptions = [
	{ value: "in_review", label: "In review" },
	{ value: "active", label: "Active" },
	{ value: "paused", label: "Paused" },
	{ value: "canceled", label: "Canceled" },
] as const;

interface MemberFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** When set the dialog edits this member instead of creating a new one. */
	member?: MemberDTO | null;
	settings: { monthlyPrice: number; yearlyPrice: number } | null;
}

function FieldErrorText({ message }: { message?: string }) {
	if (!message) {
		return null;
	}
	return <p className="text-caption text-destructive-70">{message}</p>;
}

export function MemberFormDialog({
	open,
	onOpenChange,
	member,
	settings,
}: MemberFormDialogProps) {
	const monthlyPrice = settings?.monthlyPrice ?? 0;

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		getFieldState,
		formState: { errors },
	} = useForm<MemberFormInput, unknown, MemberFormOutput>({
		resolver: zodResolver(memberFormSchema),

		defaultValues: member
			? {
					memberName: member.memberName,
					email: member.email,
					phone: member.phone,
					plan: member.plan,
					status: member.status,
					price: member.price,
					startDate: member.startDate,
					endDate: member.endDate,
					carModel: member.carModel ?? "",
					notes: member.notes ?? "",
				}
			: {
					memberName: "",
					email: "",
					phone: "",
					plan: "monthly",
					status: "in_review",
					price: monthlyPrice,
					startDate: todayISO(),
					endDate: computeEndDate(todayISO(), "monthly"),
					carModel: "",
					notes: "",
				},
	});

	const plan = watch("plan");
	const status = watch("status");
	const startDate = watch("startDate");

	// Keep the end date in sync with plan + start date until the admin
	// explicitly edits the end date field.
	useEffect(() => {
		if (!open || !startDate) {
			return;
		}
		if (!getFieldState("endDate").isDirty) {
			setValue("endDate", computeEndDate(startDate, plan));
		}
	}, [open, startDate, plan, getFieldState, setValue]);

	const createMutation = useMutation({
		...trpc.members.create.mutationOptions(),
		onSuccess: () => {
			toast.success("Member added");
			queryClient.invalidateQueries();
			onOpenChange(false);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const updateMutation = useMutation({
		...trpc.members.update.mutationOptions(),
		onSuccess: () => {
			toast.success("Member updated");
			queryClient.invalidateQueries();
			onOpenChange(false);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const submitting = createMutation.isPending || updateMutation.isPending;

	async function onSubmit(values: MemberFormOutput) {
		if (member) {
			await updateMutation.mutateAsync({ id: member.id, data: values });
		} else {
			await createMutation.mutateAsync(values);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>
						{member ? "Edit member" : "Add member manually"}
					</DialogTitle>
					<DialogDescription>
						{member
							? "Update the membership record."
							: "Members added here are marked as manual and never went through the website form."}
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
						<div className="grid gap-4 sm:grid-cols-2">
							<Field>
								<FieldLabel htmlFor="memberName">Name</FieldLabel>
								<Input
									id="memberName"
									placeholder="Khalil Ali"
									aria-invalid={Boolean(errors.memberName)}
									{...register("memberName")}
								/>
								<FieldErrorText message={errors.memberName?.message} />
							</Field>
							<Field>
								<FieldLabel htmlFor="member-email">Email</FieldLabel>
								<Input
									id="member-email"
									type="email"
									placeholder="member@example.com"
									aria-invalid={Boolean(errors.email)}
									{...register("email")}
								/>
								<FieldErrorText message={errors.email?.message} />
							</Field>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<Field>
								<FieldLabel htmlFor="member-phone">Phone</FieldLabel>
								<Input
									id="member-phone"
									type="tel"
									placeholder="+971 50 000 0000"
									aria-invalid={Boolean(errors.phone)}
									{...register("phone")}
								/>
								<FieldErrorText message={errors.phone?.message} />
							</Field>
							<Field>
								<FieldLabel htmlFor="member-price">Price (AED)</FieldLabel>
								<Input
									id="member-price"
									type="number"
									min={0}
									step={1}
									aria-invalid={Boolean(errors.price)}
									{...register("price")}
								/>
								<FieldErrorText message={errors.price?.message} />
							</Field>
						</div>

						<Field>
							<FieldLabel htmlFor="member-car-model">Car model</FieldLabel>
							<Input
								id="member-car-model"
								placeholder="AMG C 63 S E Performance"
								aria-invalid={Boolean(errors.carModel)}
								{...register("carModel")}
							/>
							<FieldErrorText message={errors.carModel?.message} />
						</Field>

						<div className="grid gap-4 sm:grid-cols-2">
							<Field>
								<FieldLabel>Plan</FieldLabel>
								<div
									role="radiogroup"
									aria-label="Membership plan"
									className="flex gap-1"
								>
									{(["monthly", "yearly"] as const).map((value) => (
										<Button
											key={value}
											type="button"
											size="sm"
											variant={plan === value ? "default" : "outline"}
											aria-pressed={plan === value}
											onClick={() => {
												setValue("plan", value, { shouldValidate: true });
											}}
										>
											{value === "monthly" ? "Monthly" : "Yearly"}
										</Button>
									))}
								</div>
								<FieldErrorText message={errors.plan?.message} />
							</Field>
							<Field>
								<FieldLabel>Status</FieldLabel>
								<div
									role="radiogroup"
									aria-label="Membership status"
									className="flex flex-wrap gap-1"
								>
									{statusOptions.map((option) => (
										<Button
											key={option.value}
											type="button"
											size="sm"
											variant={status === option.value ? "default" : "outline"}
											aria-pressed={status === option.value}
											onClick={() => {
												setValue("status", option.value, {
													shouldValidate: true,
												});
											}}
										>
											{option.label}
										</Button>
									))}
								</div>
								<FieldErrorText message={errors.status?.message} />
							</Field>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<Field>
								<FieldLabel htmlFor="member-start">Start date</FieldLabel>
								<Input
									id="member-start"
									type="date"
									aria-invalid={Boolean(errors.startDate)}
									{...register("startDate")}
								/>
								<FieldErrorText message={errors.startDate?.message} />
							</Field>
							<Field>
								<FieldLabel htmlFor="member-end">End date</FieldLabel>
								<Input
									id="member-end"
									type="date"
									aria-invalid={Boolean(errors.endDate)}
									{...register("endDate")}
								/>
								<FieldErrorText message={errors.endDate?.message} />
							</Field>
						</div>

						<Field>
							<FieldLabel htmlFor="member-notes">Notes</FieldLabel>
							<Textarea
								id="member-notes"
								rows={3}
								placeholder="Optional internal notes"
								{...register("notes")}
							/>
							<FieldErrorText message={errors.notes?.message} />
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
							{submitting ? "Saving…" : member ? "Save changes" : "Add member"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
