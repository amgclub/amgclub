"use client";

import type { EventDTO } from "@amgclub/api/routers/events";
import { Button } from "@amgclub/ui/components/button";
import { Calendar } from "@amgclub/ui/components/calendar";
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
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@amgclub/ui/components/popover";
import { Textarea } from "@amgclub/ui/components/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { queryClient, trpc } from "@/utils/trpc";

import { ImageUpload } from "./image-upload";

dayjs.extend(localizedFormat);

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
	eventDate: z.date({ message: "Date is required" }),
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
	const [uncommittedUploads, setUncommittedUploads] = useState<string[]>([]);
	const [datePickerOpen, setDatePickerOpen] = useState(false);
	// The image stored before this dialog opened (used to clean up replaced/removed files).
	const previousImage = event?.imageUrl ?? null;

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
					eventDate: new Date(event.eventDate),
					startTime: event.startTime.slice(0, 5),
					endTime: event.endTime ? event.endTime.slice(0, 5) : "",
					price: event.price,
					status: event.status,
				}
			: {
					title: "",
					description: "",
					imageUrl: "",
					location: "",
					mapUrl: "",
					eventDate: undefined,
					startTime: "10:30",
					endTime: "12:30",
					price: 0,
					status: "active",
				},
	});

	const status = watch("status");
	const imageUrl = watch("imageUrl");
	const eventDate = watch("eventDate");

	const createMutation = useMutation({
		...trpc.events.create.mutationOptions(),
		onSuccess: () => {
			// The saved image is committed — don't delete it on dialog close.
			setUncommittedUploads([]);
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
			// The saved image is committed — don't delete it on dialog close.
			setUncommittedUploads([]);
			toast.success("Event updated");
			queryClient.invalidateQueries();
			onOpenChange(false);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const deleteFileMutation = useMutation(
		trpc.storage.deleteFile.mutationOptions(),
	);

	const submitting = createMutation.isPending || updateMutation.isPending;

	async function onSubmit(values: EventFormOutput) {
		const payload = {
			title: values.title,
			description: values.description || undefined,
			imageUrl: values.imageUrl || undefined,
			location: values.location,
			mapUrl: values.mapUrl || undefined,
			eventDate: dayjs(values.eventDate).format("YYYY-MM-DD"),
			startTime: values.startTime,
			endTime: values.endTime || undefined,
			price: values.price,
			status: values.status,
		};

		if (event) {
			await updateMutation.mutateAsync({ id: event.id, data: payload });
		} else {
			await createMutation.mutateAsync(payload);
		}

		// The event now points at the new image (or none): release the previous
		// stored file. Best-effort — a failed cleanup must not fail the save.
		const savedImage = payload.imageUrl ?? null;
		if (previousImage && previousImage !== savedImage) {
			void deleteFileMutation
				.mutateAsync({ url: previousImage })
				.catch(() => {});
		}
	}

	// When the dialog closes without saving, delete any freshly uploaded
	// images so they don't become orphaned storage objects.
	useEffect(() => {
		if (open || uncommittedUploads.length === 0) {
			return;
		}
		for (const url of uncommittedUploads) {
			void deleteFileMutation.mutateAsync({ url }).catch(() => {});
		}
		setUncommittedUploads([]);
	}, [open, uncommittedUploads, deleteFileMutation]);

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
							<FieldLabel>Title</FieldLabel>
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
								<FieldLabel>Location</FieldLabel>
								<Input
									id="event-location"
									placeholder="Jebel Jais, Ras Al Khaimah"
									aria-invalid={Boolean(errors.location)}
									{...register("location")}
								/>
								<FieldErrorText message={errors.location?.message} />
							</Field>
							<Field>
								<FieldLabel>Google Maps link</FieldLabel>
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
								<FieldLabel>Date</FieldLabel>
								<Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
									<PopoverTrigger
										render={
											<Button
												variant="outline"
												id="event-date"
												data-empty={!eventDate}
												className="!border-tertiary w-full justify-between font-normal data-[empty=true]:text-muted-foreground"
											/>
										}
									>
										{eventDate
											? dayjs(eventDate).format("MMMM D, YYYY")
											: "Select date"}
										<CalendarIcon data-icon="inline-end" />
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={eventDate}
											onSelect={(date) => {
												if (date) {
													setValue("eventDate", date, {
														shouldValidate: true,
													});
													setDatePickerOpen(false);
												}
											}}
											defaultMonth={eventDate}
										/>
									</PopoverContent>
								</Popover>
								<FieldErrorText message={errors.eventDate?.message} />
							</Field>
							<Field>
								<FieldLabel>Start time</FieldLabel>
								<Input
									id="event-start"
									type="time"
									aria-invalid={Boolean(errors.startTime)}
									className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
									{...register("startTime")}
								/>
								<FieldErrorText message={errors.startTime?.message} />
							</Field>
							<Field>
								<FieldLabel>End time</FieldLabel>
								<Input
									id="event-end"
									type="time"
									aria-invalid={Boolean(errors.endTime)}
									className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
									{...register("endTime")}
								/>
								<FieldErrorText message={errors.endTime?.message} />
							</Field>
						</div>

						<Field>
							<FieldLabel>Event image</FieldLabel>
							<ImageUpload
								imageUrl={imageUrl || null}
								onUploaded={(url) => {
									setUncommittedUploads((current) => [...current, url]);
								}}
								onChange={(url) => {
									setValue("imageUrl", url ?? "", {
										shouldValidate: true,
									});
								}}
							/>
						</Field>

						<Field>
							<FieldLabel>Description</FieldLabel>
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
								<FieldLabel>Price (AED, 0 = free)</FieldLabel>
								<Input
									id="event-price"
									type="number"
									min={0}
									step={1}
									aria-invalid={Boolean(errors.price)}
									{...register("price")}
								/>
								<FieldErrorText message={errors.price?.message} />
							</Field>
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
							{submitting ? "Saving…" : event ? "Save changes" : "Create event"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
