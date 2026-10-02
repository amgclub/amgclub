"use client";

import type { EventDTO, MemberDTO } from "@amgclub/api/routers/analytics";
import { Button } from "@amgclub/ui/components/button";
import { Card, CardContent } from "@amgclub/ui/components/card";

import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@amgclub/ui/components/empty";
import { CalendarDaysIcon, CalendarXIcon, UsersIcon } from "lucide-react";

import { MembershipStatusBadge } from "@/components/status-badge";
import { formatAED, formatDate, formatTime } from "@/lib/format";

export function QueryErrorCard({ onRetry }: { onRetry: () => void }) {
	return (
		<Card>
			<CardContent className="flex flex-col items-start gap-2">
				<p className="text-body-sm text-destructive-70">
					Something went wrong loading the dashboard.
				</p>
				<Button
					variant="outline"
					size="sm"
					className="min-h-11 min-w-11"
					onClick={() => {
						onRetry();
					}}
				>
					Try again
				</Button>
			</CardContent>
		</Card>
	);
}

export function UpcomingEventsList({ events }: { events: EventDTO[] }) {
	if (events.length === 0) {
		return (
			<Empty className="border-none">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<CalendarXIcon />
					</EmptyMedia>
					<EmptyTitle>No upcoming events</EmptyTitle>
					<EmptyDescription>
						Create an event to see it listed here.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	return (
		<ul className="flex flex-col divide-y">
			{events.map((event) => (
				<li
					key={event.id}
					className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
				>
					<div className="flex size-9 shrink-0 items-center justify-center bg-muted">
						<CalendarDaysIcon className="size-4 text-muted-foreground" />
					</div>
					<div className="min-w-0 flex-1">
						<p className="truncate font-medium text-body-sm">{event.title}</p>
						<p className="truncate text-caption text-muted-foreground">
							{formatDate(event.eventDate)} · {formatTime(event.startTime)} ·{" "}
							{event.location}
						</p>
					</div>
					<div className="text-right text-caption text-muted-foreground">
						<p>{event.price === 0 ? "Free" : formatAED(event.price)}</p>
						<p>
							{event.totalAttendees}{" "}
							{event.totalAttendees === 1 ? "attendee" : "attendees"}
						</p>
					</div>
				</li>
			))}
		</ul>
	);
}

export function RecentMembersList({ members }: { members: MemberDTO[] }) {
	if (members.length === 0) {
		return (
			<Empty className="border-none">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<UsersIcon />
					</EmptyMedia>
					<EmptyTitle>No members yet</EmptyTitle>
					<EmptyDescription>
						Add a member manually or review website applications here.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	return (
		<ul className="flex flex-col divide-y">
			{members.map((member) => (
				<li
					key={member.id}
					className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
				>
					<div className="min-w-0 flex-1">
						<p className="truncate font-medium text-body-sm">
							{member.memberName}
						</p>
						<p className="truncate text-caption text-muted-foreground">
							{member.email} ·{" "}
							{member.plan === "monthly" ? "Monthly" : "Yearly"} ·{" "}
							{formatAED(member.price)}
						</p>
					</div>
					<MembershipStatusBadge status={member.status} />
				</li>
			))}
		</ul>
	);
}
