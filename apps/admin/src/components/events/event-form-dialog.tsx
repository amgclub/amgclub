"use client";

import type { EventDTO } from "@amgclub/api/routers/events";
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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { queryClient, trpc } from "@/utils/trpc";

const eventFormSchema = z.object({
	title: z.string().min(1, "Title is required").max(160),
	description: z.string().max(4000).optional(),
	imageUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
	location: z.string().min(1, "Location is required").max(240),
	mapUrl: z
		.string()
		.url("Enter a valid Google Maps link")
		.optional()
		.or(z.literal("")),
	eventDate: z
		.string()
		.min(1, "Date is required")
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
	startTime: z
		.string()
		.min(1, "Start time is required")
		.regex(/^\d{2}:\d{2}$/, "Invalid time"),
	endTime: z
		.string()
		.regex(/^\d{2}:\d{2}$/, "Invalid time")
		.optional()
		.or(z.literal("")),
	price: z.coerce.number().min(0, "Price must be zero or more").max(1_000_000),
	totalAttendees: z.coerce.number().int().min(0).max(1_000_000),
	status: z.enum(["active", "paused", "canceled"]),
});

type EventFormInput = z.input<typeof eventFormSchema>;
type EventFormOutput = z.output<typeof eventFormSchema>;

const statusOptions = [
	{ value: "active", label: "Active" },
	{ value: "paused", label: "Paused" },
	{ value: "canceled", label: "Canceled" },
] as const;

function FieldErrorText({ message }: { message?: string }) {
	if (!message) {
		return null;
	}
	return <p className="text-caption text-destructive">{message}</p>;
}

export function EventFormDialog({
	open,
	onOpenChange,
	event,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	event?: EventDTO | null;
}) {
	const [freeEvent, setFreeEvent] = useState(!event || event.price === 0);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<EventFormInput, unknown, EventFormOutput>({
		resolver: zodResolver(eventFormSchema),

		defaultValues: event
			? {
					title: event.title,
					description: event.description ?? "",
					imageUrl: event.imageUrl ?? "",
					location: event.location,
					mapUrl: event.mapUrl ?? "",
					eventDate: event.eventDate,
					startTime: event.startTime.slice(0, 5),
					endTime: event.endTime ? event.endTime.slice(0, 5) : "",
					price: event.price,
					totalAttendees: event.totalAttendees,
					status: event.status,
				}
			: {
					title: "",
					description: "",
					imageUrl: "",
					location: "",
					mapUrl: "",
					eventDate: "",
					startTime: "",
					endTime: "",
					price: 0,
					totalAttendees: 0,
					status: "active",
				},
	});

	const status = watch("status");

	const createMutation = useMutation({
		...trpc.events.create.mutationOptions(),
		onSuccess: () => {
			toast.success("Event created");
			queryClient.invalidateQueries();
			onOpenChange(false);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const updateMutation = useMutation({
		...trpc.events.update.mutationOptions(),
		onSuccess: () => {
			toast.success("Event updated");
			queryClient.invalidateQueries();
			onOpenChange(false);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const submitting = createMutation.isPending || updateMutation.isPending;

	function toggleFree(next: boolean) {
		setFreeEvent(next);
		if (next) {
			setValue("price", 0, { shouldValidate: true });
		}
	}

	async function onSubmit(values: EventFormOutput) {
		const payload = {
			title: values.title,
			description: values.description || undefined,
			imageUrl: values.imageUrl || undefined,
			location: values.location,
			mapUrl: values.mapUrl || undefined,
			eventDate: values.eventDate,
			startTime: values.startTime,
			endTime: values.endTime || undefined,
			price: freeEvent ? 0 : values.price,
			totalAttendees: values.totalAttendees,
			status: values.status,
		};

		if (event) {
			await updateMutation.mutateAsync({ id: event.id, data: payload });
		} else {
			await createMutation.mutateAsync(payload);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>{event ? "Edit event" : "Create event"}</DialogTitle>
					<DialogDescription>
						Events appear on the club website once active.
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
							<FieldLabel htmlFor="event-title">Title</FieldLabel>
							<Input
								id="event-title"
								placeholder="Morning drive to Jebel Jais"
								aria-invalid={Boolean(errors.title)}
								{...register("title")}
							/>
							<FieldErrorText message={errors.title?.message} />
						</Field>

						<div className="grid gap-4 sm:grid-cols-2">
							<Field>
								<FieldLabel htmlFor="event-location">Location</FieldLabel>
								<Input
									id="event-location"
									placeholder="Jebel Jais, Ras Al Khaimah"
									aria-invalid={Boolean(errors.location)}
									{...register("location")}
								/>
								<FieldErrorText message={errors.location?.message} />
							</Field>
							<Field>
								<FieldLabel htmlFor="event-map">Google Maps link</FieldLabel>
								<Input
									id="event-map"
									type="url"
									placeholder="https://maps.app.goo.gl/…"
									aria-invalid={Boolean(errors.mapUrl)}
									{...register("mapUrl")}
								/>
								<FieldErrorText message={errors.mapUrl?.message} />
							</Field>
						</div>

						<div className="grid gap-4 sm:grid-cols-3">
							<Field>
								<FieldLabel htmlFor="event-date">Date</FieldLabel>
								<Input
									id="event-date"
									type="date"
									aria-invalid={Boolean(errors.eventDate)}
									{...register("eventDate")}
								/>
								<FieldErrorText message={errors.eventDate?.message} />
							</Field>
							<Field>
								<FieldLabel htmlFor="event-start">Start time</FieldLabel>
								<Input
									id="event-start"
									type="time"
									aria-invalid={Boolean(errors.startTime)}
									{...register("startTime")}
								/>
								<FieldErrorText message={errors.startTime?.message} />
							</Field>
							<Field>
								<FieldLabel htmlFor="event-end">End time</FieldLabel>
								<Input
									id="event-end"
									type="time"
									aria-invalid={Boolean(errors.endTime)}
									{...register("endTime")}
								/>
								<FieldErrorText message={errors.endTime?.message} />
							</Field>
						</div>

						<Field>
							<FieldLabel htmlFor="event-image">Image URL</FieldLabel>
							<Input
								id="event-image"
								type="url"
								placeholder="https://cdn.example.com/event.jpg"
								aria-invalid={Boolean(errors.imageUrl)}
								{...register("imageUrl")}
							/>
							<FieldErrorText message={errors.imageUrl?.message} />
						</Field>

						<Field>
							<FieldLabel htmlFor="event-description">Description</FieldLabel>
							<Textarea
								id="event-description"
								rows={3}
								placeholder="What's the plan?"
								{...register("description")}
							/>
							<FieldErrorText message={errors.description?.message} />
						</Field>

						<div className="grid gap-4 sm:grid-cols-2">
							<Field>
								<FieldLabel htmlFor="event-price">
									Price (AED, 0 = free)
								</FieldLabel>
								<div className="flex items-center gap-2">
									<Input
										id="event-price"
										type="number"
										min={0}
										step={1}
										disabled={freeEvent}
										aria-invalid={Boolean(errors.price)}
										{...register("price")}
									/>
									<Button
										type="button"
										size="sm"
										variant={freeEvent ? "default" : "outline"}
										aria-pressed={freeEvent}
										onClick={() => {
											toggleFree(!freeEvent);
										}}
									>
										Free
									</Button>
								</div>
								<FieldErrorText message={errors.price?.message} />
							</Field>
							<Field>
								<FieldLabel htmlFor="event-attendees">
									Total attendees
								</FieldLabel>
								<Input
									id="event-attendees"
									type="number"
									min={0}
									step={1}
									aria-invalid={Boolean(errors.totalAttendees)}
									{...register("totalAttendees")}
								/>
								<FieldErrorText message={errors.totalAttendees?.message} />
							</Field>
						</div>

						<Field>
							<FieldLabel>Status</FieldLabel>
							<div
								role="radiogroup"
								aria-label="Event status"
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
							{submitting ? "Saving…" : event ? "Save changes" : "Create event"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
