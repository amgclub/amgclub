"use client";

import type { EventDTO } from "@amgclub/api/routers/events";
import { Button } from "@amgclub/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@amgclub/ui/components/dropdown-menu";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@amgclub/ui/components/empty";
import { Skeleton } from "@amgclub/ui/components/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@amgclub/ui/components/table";
import {
	CalendarXIcon,
	CircleCheckIcon,
	EllipsisVerticalIcon,
	ImagesIcon,
	PauseIcon,
	PencilIcon,
	Trash2Icon,
} from "lucide-react";

import Link from "next/link";

import { type EventStatus, EventStatusBadge } from "@/components/status-badge";
import { formatAED, formatDate, formatTime } from "@/lib/format";

export interface EventsTableProps {
	events: EventDTO[];
	loading: boolean;
	error: { message: string } | null;
	onRetry: () => void;
	onEdit: (event: EventDTO) => void;
	onDelete: (event: EventDTO) => void;
	onStatusChange: (event: EventDTO, status: EventStatus) => void;
	hasFilters: boolean;
}

export function EventsTable({
	events,
	loading,
	error,
	onRetry,
	onEdit,
	onDelete,
	onStatusChange,
	hasFilters,
}: EventsTableProps) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Event</TableHead>
					<TableHead>Location</TableHead>
					<TableHead>Date & Time</TableHead>
					<TableHead>Price</TableHead>
					<TableHead>Attendees</TableHead>
					<TableHead>Status</TableHead>
					<TableHead className="text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{loading ? (
					Array.from({ length: 6 }).map((_, index) => (
						<TableRow key={`skeleton-${String(index)}`}>
							{Array.from({ length: 7 }).map((__, cell) => (
								<TableCell key={`skeleton-${String(index)}-${String(cell)}`}>
									<Skeleton className="h-4 w-full" />
								</TableCell>
							))}
						</TableRow>
					))
				) : error ? (
					<TableRow>
						<TableCell colSpan={7}>
							<div className="flex flex-col items-center gap-2 py-8">
								<p className="text-body-sm text-destructive">
									Failed to load events: {error.message}
								</p>
								<Button variant="outline" size="sm" onClick={onRetry}>
									Try again
								</Button>
							</div>
						</TableCell>
					</TableRow>
				) : events.length === 0 ? (
					<TableRow>
						<TableCell colSpan={7}>
							<Empty className="border-none">
								<EmptyHeader>
									<EmptyMedia variant="icon">
										<CalendarXIcon />
									</EmptyMedia>
									<EmptyTitle>No events found</EmptyTitle>
									<EmptyDescription>
										{hasFilters
											? "No events match the current filters."
											: "Create your first club event."}
									</EmptyDescription>
								</EmptyHeader>
							</Empty>
						</TableCell>
					</TableRow>
				) : (
					events.map((event) => (
						<EventRow
							key={event.id}
							event={event}
							onEdit={onEdit}
							onDelete={onDelete}
							onStatusChange={onStatusChange}
						/>
					))
				)}
			</TableBody>
		</Table>
	);
}

function EventRow({
	event,
	onEdit,
	onDelete,
	onStatusChange,
}: {
	event: EventDTO;
	onEdit: (event: EventDTO) => void;
	onDelete: (event: EventDTO) => void;
	onStatusChange: (event: EventDTO, status: EventStatus) => void;
}) {
	return (
		<TableRow>
			<TableCell>
				<div className="flex items-center gap-3">
					{event.imageUrl ? (
						<img
							src={event.imageUrl}
							alt=""
							className="size-9 shrink-0 border object-cover"
						/>
					) : (
						<div className="flex size-9 shrink-0 items-center justify-center bg-muted">
							<ImagesIcon className="size-4 text-muted-foreground" />
						</div>
					)}
					<div className="min-w-0">
						<Link
							href={`/events/${event.id}`}
							className="max-w-52 truncate font-medium text-foreground hover:text-primary"
						>
							{event.title}
						</Link>
						{event.mapUrl ? (
							<a
								href={event.mapUrl}
								target="_blank"
								rel="noreferrer"
								className="text-caption text-muted-foreground underline underline-offset-4 hover:text-primary"
							>
								Map link
							</a>
						) : null}
					</div>
				</div>
			</TableCell>
			<TableCell>{event.location}</TableCell>
			<TableCell>
				{formatDate(event.eventDate)}
				<br />
				<span className="text-caption text-muted-foreground">
					{formatTime(event.startTime)}
					{event.endTime ? `–${formatTime(event.endTime)}` : ""}
				</span>
			</TableCell>
			<TableCell>
				{event.price === 0 ? "Free" : formatAED(event.price)}
			</TableCell>
			<TableCell>{event.totalAttendees}</TableCell>
			<TableCell>
				<EventStatusBadge status={event.status} />
			</TableCell>
			<TableCell className="text-right">
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button
								variant="ghost"
								size="icon-sm"
								aria-label={`Actions for ${event.title}`}
							/>
						}
					>
						<EllipsisVerticalIcon />
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-40">
						{event.status !== "active" ? (
							<DropdownMenuItem
								onClick={() => {
									onStatusChange(event, "active");
								}}
							>
								<CircleCheckIcon />
								{event.status === "paused" ? "Resume" : "Restore"}
							</DropdownMenuItem>
						) : (
							<DropdownMenuItem
								onClick={() => {
									onStatusChange(event, "paused");
								}}
							>
								<PauseIcon />
								Pause
							</DropdownMenuItem>
						)}
						{event.status !== "canceled" ? (
							<DropdownMenuItem
								variant="destructive"
								onClick={() => {
									onStatusChange(event, "canceled");
								}}
							>
								<CalendarXIcon />
								Cancel event
							</DropdownMenuItem>
						) : null}
						<DropdownMenuItem
							onClick={() => {
								onEdit(event);
							}}
						>
							<PencilIcon />
							Edit
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							variant="destructive"
							onClick={() => {
								onDelete(event);
							}}
						>
							<Trash2Icon />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</TableCell>
		</TableRow>
	);
}
