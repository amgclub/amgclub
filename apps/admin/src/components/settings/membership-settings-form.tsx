"use client";

import { Button } from "@amgclub/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@amgclub/ui/components/card";
import { Field, FieldGroup, FieldLabel } from "@amgclub/ui/components/field";
import { Input } from "@amgclub/ui/components/input";
import { Skeleton } from "@amgclub/ui/components/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { formatDateTime } from "@/lib/format";
import { queryClient, trpc } from "@/utils/trpc";

const settingsFormSchema = z.object({
	monthlyPrice: z.coerce
		.number()
		.min(0, "Price must be zero or more")
		.max(1_000_000),
	yearlyPrice: z.coerce
		.number()
		.min(0, "Price must be zero or more")
		.max(1_000_000),
	expiringSoonDays: z.coerce
		.number()
		.int("Use whole days")
		.min(1, "At least 1 day")
		.max(365, "At most 365 days"),
});

type SettingsFormInput = z.input<typeof settingsFormSchema>;
type SettingsFormOutput = z.output<typeof settingsFormSchema>;

export function MembershipSettingsForm() {
	const settingsQuery = useQuery(trpc.settings.get.queryOptions());

	const updateMutation = useMutation({
		...trpc.settings.update.mutationOptions(),
		onSuccess: () => {
			toast.success("Membership settings saved");
			queryClient.invalidateQueries();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const {
		register,
		handleSubmit,
		formState: { errors, isDirty },
	} = useForm<SettingsFormInput, unknown, SettingsFormOutput>({
		resolver: zodResolver(settingsFormSchema),

		values: settingsQuery.data
			? {
					monthlyPrice: settingsQuery.data.monthlyPrice,
					yearlyPrice: settingsQuery.data.yearlyPrice,
					expiringSoonDays: settingsQuery.data.expiringSoonDays,
				}
			: undefined,
	});

	if (settingsQuery.isPending) {
		return (
			<Card>
				<CardHeader>
					<Skeleton className="h-4 w-40" />
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-4">
						<Skeleton className="h-9 w-full" />
						<Skeleton className="h-9 w-full" />
						<Skeleton className="h-9 w-full" />
					</div>
				</CardContent>
			</Card>
		);
	}

	if (settingsQuery.isError) {
		return (
			<Card>
				<CardContent className="flex flex-col items-start gap-2">
					<p className="text-body-sm text-destructive">
						Failed to load settings: {settingsQuery.error.message}
					</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							settingsQuery.refetch().catch(() => {
								toast.error("Retry failed");
							});
						}}
					>
						Try again
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="font-normal font-sans text-headline-sm">
					Membership configuration
				</CardTitle>
				<CardDescription>
					Prices are in UAE Dirhams (AED) per billing period.{" "}
					{settingsQuery.data.updatedAt
						? `Last updated ${formatDateTime(settingsQuery.data.updatedAt)}.`
						: "No update yet."}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={(event) => {
						event.preventDefault();
						handleSubmit((values) => {
							updateMutation.mutate(values);
						})(event);
					}}
					className="flex flex-col gap-4"
				>
					<FieldGroup>
						<div className="grid gap-4 sm:grid-cols-3">
							<Field>
								<FieldLabel htmlFor="monthlyPrice">
									Monthly price (AED)
								</FieldLabel>
								<Input
									id="monthlyPrice"
									type="number"
									min={0}
									step={1}
									aria-invalid={Boolean(errors.monthlyPrice)}
									{...register("monthlyPrice")}
								/>
								{errors.monthlyPrice ? (
									<p className="text-caption text-destructive">
										{errors.monthlyPrice.message}
									</p>
								) : null}
							</Field>
							<Field>
								<FieldLabel htmlFor="yearlyPrice">
									Yearly price (AED)
								</FieldLabel>
								<Input
									id="yearlyPrice"
									type="number"
									min={0}
									step={1}
									aria-invalid={Boolean(errors.yearlyPrice)}
									{...register("yearlyPrice")}
								/>
								{errors.yearlyPrice ? (
									<p className="text-caption text-destructive">
										{errors.yearlyPrice.message}
									</p>
								) : null}
							</Field>
							<Field>
								<FieldLabel htmlFor="expiringSoonDays">
									Expiring soon (days)
								</FieldLabel>
								<Input
									id="expiringSoonDays"
									type="number"
									min={1}
									step={1}
									aria-invalid={Boolean(errors.expiringSoonDays)}
									{...register("expiringSoonDays")}
								/>
								{errors.expiringSoonDays ? (
									<p className="text-caption text-destructive">
										{errors.expiringSoonDays.message}
									</p>
								) : null}
							</Field>
						</div>
						<div className="flex items-center gap-3">
							<Button
								type="submit"
								disabled={updateMutation.isPending || !isDirty}
							>
								{updateMutation.isPending ? "Saving…" : "Save settings"}
							</Button>
							<p className="text-caption text-muted-foreground">
								"Expiring soon" controls when memberships are flagged on the
								dashboard and members table.
							</p>
						</div>
					</FieldGroup>
				</form>
			</CardContent>
		</Card>
	);
}
