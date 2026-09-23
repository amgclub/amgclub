"use client";

import { Badge } from "@amgclub/ui/components/badge";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@amgclub/ui/components/card";
import { Skeleton } from "@amgclub/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react";
import { useParams } from "next/navigation";
import EventRegisterForm from "@/components/event-register-form";
import { formatAED, formatDate, formatTime } from "@/lib/format";
import { trpc } from "@/utils/trpc";

export default function EventDetailPage() {
	const params = useParams<{ eventId: string }>();

	const { data: events, isLoading } = useQuery(
		trpc.events.publicList.queryOptions(),
	);

	const event = events?.find((e) => e.id === params.eventId);

	if (isLoading) {
		return (
			<div className="mx-auto max-w-2xl px-4 py-8">
				<Skeleton className="mb-4 h-8 w-64" />
				<Skeleton className="mb-2 h-4 w-full" />
				<Skeleton className="mb-8 h-4 w-3/4" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	if (!event) {
		return (
			<div className="mx-auto max-w-2xl px-4 py-8 text-center">
				<h1 className="font-extrabold font-sans text-foreground text-headline-lg">
					Event not found
				</h1>
				<p className="mt-2 font-sans text-body-md text-muted-foreground">
					The event you're looking for doesn't exist or is no longer active.
				</p>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-2xl px-4 py-8">
			{event.imageUrl && (
				<img
					src={event.imageUrl}
					alt={event.title}
					className="mb-6 h-64 w-full object-cover"
				/>
			)}

			<div className="mb-6 flex items-start justify-between">
				<h1 className="font-extrabold font-sans text-foreground text-headline-lg">
					{event.title}
				</h1>
				{event.price > 0 ? (
					<Badge variant="default">
						{formatAED(event.price, { whole: 1 })}
					</Badge>
				) : (
					<Badge variant="outline">Free</Badge>
				)}
			</div>

			<div className="mb-6 flex flex-col gap-3 font-sans text-body-sm text-muted-foreground">
				<div className="flex items-center gap-2">
					<CalendarIcon className="size-4" />
					<span>
						{formatDate(event.eventDate)} · {formatTime(event.startTime)}
						{event.endTime ? `–${formatTime(event.endTime)}` : ""}
					</span>
				</div>
				<div className="flex items-center gap-2">
					<MapPinIcon className="size-4" />
					<span>{event.location}</span>
				</div>
				<div className="flex items-center gap-2">
					<UsersIcon className="size-4" />
					<span>
						{event.totalAttendees}{" "}
						{event.totalAttendees === 1 ? "attendee" : "attendees"} registered
					</span>
				</div>
			</div>

			{event.description && (
				<p className="mb-8 font-sans text-body-md text-foreground/80">
					{event.description}
				</p>
			)}

			<Card>
				<CardHeader>
					<CardTitle className="font-bold font-sans text-foreground text-headline-sm">
						Register for this event
					</CardTitle>
				</CardHeader>
				<CardContent>
					<EventRegisterForm eventId={event.id} eventPrice={event.price} />
				</CardContent>
			</Card>
		</div>
	);
}
