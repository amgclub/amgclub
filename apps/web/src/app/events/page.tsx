"use client";

import { Badge } from "@amgclub/ui/components/badge";
import { Button } from "@amgclub/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@amgclub/ui/components/card";
import { Skeleton } from "@amgclub/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { formatAED, formatDate, formatTime } from "@/lib/format";
import { trpc } from "@/utils/trpc";

export default function EventsPage() {
	const { data: events, isLoading } = useQuery(
		trpc.events.publicList.queryOptions(),
	);

	return (
		<div className="mx-auto max-w-4xl px-4 py-8">
			<div className="mb-8">
				<h1 className="font-extrabold font-sans text-foreground text-headline-lg">
					Upcoming Events
				</h1>
				<p className="mt-2 font-sans text-body-md text-muted-foreground">
					Join us at our next AMG Club gathering
				</p>
			</div>

			{isLoading ? (
				<div className="flex flex-col gap-4">
					{Array.from({ length: 3 }).map((_, i) => (
						<Skeleton key={i} className="h-48 w-full" />
					))}
				</div>
			) : !events?.length ? (
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<h2 className="font-bold font-sans text-foreground text-headline-md">
						No upcoming events
					</h2>
					<p className="mt-2 font-sans text-body-sm text-muted-foreground">
						Check back soon for new events
					</p>
				</div>
			) : (
				<div className="flex flex-col gap-4">
					{events.map((event) => (
						<Link key={event.id} href={`/events/${event.id}`}>
							<Card className="cursor-pointer transition-colors hover:bg-muted/50">
								<div className="flex gap-4">
									{event.imageUrl && (
										<img
											src={event.imageUrl}
											alt={event.title}
											className="h-40 w-40 object-cover"
										/>
									)}
									<div className="flex flex-1 flex-col justify-between p-4">
										<CardHeader className="p-0">
											<div className="flex items-start justify-between">
												<CardTitle className="font-bold font-sans text-foreground text-headline-md">
													{event.title}
												</CardTitle>
												{event.price > 0 ? (
													<Badge variant="default">
														{formatAED(event.price, { whole: 1 })}
													</Badge>
												) : (
													<Badge variant="outline">Free</Badge>
												)}
											</div>
										</CardHeader>
										<CardContent className="mt-2 p-0">
											<div className="flex flex-wrap gap-4 font-sans text-caption text-muted-foreground">
												<div className="flex items-center gap-1">
													<CalendarIcon className="size-3" />
													<span>
														{formatDate(event.eventDate)} ·{" "}
														{formatTime(event.startTime)}
														{event.endTime
															? `–${formatTime(event.endTime)}`
															: ""}
													</span>
												</div>
												<div className="flex items-center gap-1">
													<MapPinIcon className="size-3" />
													<span>{event.location}</span>
												</div>
												<div className="flex items-center gap-1">
													<UsersIcon className="size-3" />
													<span>
														{event.totalAttendees}{" "}
														{event.totalAttendees === 1
															? "attendee"
															: "attendees"}
													</span>
												</div>
											</div>
											<div className="mt-3">
												<Button variant="default" size="sm">
													Register
												</Button>
											</div>
										</CardContent>
									</div>
								</div>
							</Card>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
