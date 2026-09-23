"use client";

import { Badge } from "@amgclub/ui/components/badge";
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
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { formatDateTime } from "@/lib/format";
import { queryClient, trpc } from "@/utils/trpc";

const ziinaFormSchema = z.object({
	ziinaMode: z.enum(["test", "live"]),
	ziinaWebhookSecret: z.string().max(500).nullish(),
});

type ZiinaFormInput = z.input<typeof ziinaFormSchema>;
type ZiinaFormOutput = z.output<typeof ziinaFormSchema>;

export function ZiinaSettingsForm() {
	const settingsQuery = useQuery(trpc.settings.getPayment.queryOptions());

	const updateMutation = useMutation({
		...trpc.settings.updatePayment.mutationOptions(),
		onSuccess: () => {
			toast.success("Ziina settings saved");
			queryClient.invalidateQueries();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const registerWebhookMutation = useMutation({
		...trpc.settings.registerWebhook.mutationOptions(),
		onSuccess: () => {
			toast.success("Webhook registered");
			queryClient.invalidateQueries();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const [webhookUrl, setWebhookUrl] = useState(
		settingsQuery.data?.ziinaWebhookUrl ?? "",
	);

	// Sync URL from server when data loads
	const prevUrl = settingsQuery.data?.ziinaWebhookUrl;
	useEffect(() => {
		if (prevUrl !== undefined) {
			setWebhookUrl(prevUrl ?? "");
		}
	}, [prevUrl]);

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors, isDirty },
	} = useForm<ZiinaFormInput, unknown, ZiinaFormOutput>({
		resolver: zodResolver(ziinaFormSchema),
		values: settingsQuery.data
			? {
					ziinaMode: settingsQuery.data.ziinaMode,
					ziinaWebhookSecret: settingsQuery.data.ziinaWebhookSecret,
				}
			: undefined,
	});

	const currentMode = watch("ziinaMode");

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
				<CardHeader>
					<CardTitle className="font-normal font-sans text-headline-sm">
						Ziina payment settings
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-start gap-2">
						<p className="text-body-sm text-muted-foreground">
							Payment settings are not available yet. Run the database migration
							to enable Ziina payment configuration.
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
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<CardTitle className="font-normal font-sans text-headline-sm">
						Ziina payment settings
					</CardTitle>
					<Badge variant={currentMode === "live" ? "default" : "subtle"}>
						{currentMode === "live" ? "Live" : "Test"}
					</Badge>
				</div>
				<CardDescription>
					Configure Ziina payment mode and webhook verification.{" "}
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
						<Field>
							<FieldLabel>Mode</FieldLabel>
							<div className="flex gap-2">
								<button
									type="button"
									onClick={() => {
										setValue("ziinaMode", "test", { shouldDirty: true });
									}}
									className={`inline-flex items-center justify-center whitespace-nowrap rounded-none border px-3 py-1.5 font-medium text-xs outline-none transition-all ${
										currentMode === "test"
											? "border-primary bg-primary text-primary-foreground"
											: "border-border bg-background text-foreground hover:bg-muted"
									}`}
								>
									Test
								</button>
								<button
									type="button"
									onClick={() => {
										setValue("ziinaMode", "live", { shouldDirty: true });
									}}
									className={`inline-flex items-center justify-center whitespace-nowrap rounded-none border px-3 py-1.5 font-medium text-xs outline-none transition-all ${
										currentMode === "live"
											? "border-primary bg-primary text-primary-foreground"
											: "border-border bg-background text-foreground hover:bg-muted"
									}`}
								>
									Live
								</button>
							</div>
							<input type="hidden" {...register("ziinaMode")} />
						</Field>

						<Field>
							<FieldLabel htmlFor="ziinaWebhookSecret">
								Webhook Secret
							</FieldLabel>
							<Input
								id="ziinaWebhookSecret"
								type="text"
								placeholder="HMAC secret from Ziina dashboard"
								aria-invalid={Boolean(errors.ziinaWebhookSecret)}
								{...register("ziinaWebhookSecret")}
							/>
							{errors.ziinaWebhookSecret ? (
								<p className="text-caption text-destructive">
									{errors.ziinaWebhookSecret.message}
								</p>
							) : null}
						</Field>

						<div className="flex items-center gap-3">
							<Button
								type="submit"
								disabled={updateMutation.isPending || !isDirty}
							>
								{updateMutation.isPending ? "Saving…" : "Save settings"}
							</Button>
						</div>
					</FieldGroup>
				</form>

				<div className="mt-4 border-border border-t pt-4">
					<h3 className="font-medium font-sans text-foreground text-label-md">
						Webhook Registration
					</h3>
					<p className="mt-1 text-body-sm text-muted-foreground">
						Register your webhook URL with Ziina to receive payment event
						notifications.
					</p>
					<div className="mt-3 flex items-end gap-3">
						<Field className="flex-1">
							<FieldLabel htmlFor="webhookUrl">Webhook URL</FieldLabel>
							<Input
								id="webhookUrl"
								type="url"
								placeholder={`${typeof window !== "undefined" ? window.location.origin : ""}/api/webhooks/ziina`}
								value={webhookUrl}
								onChange={(e) => {
									setWebhookUrl(e.target.value);
								}}
							/>
						</Field>
						<Button
							variant="outline"
							disabled={registerWebhookMutation.isPending || !webhookUrl.trim()}
							onClick={() => {
								if (webhookUrl.trim()) {
									registerWebhookMutation.mutate({
										url: webhookUrl.trim(),
									});
								}
							}}
						>
							{registerWebhookMutation.isPending
								? "Registering…"
								: "Register webhook"}
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
