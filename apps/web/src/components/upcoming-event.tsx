"use client";

import { Skeleton } from "@amgclub/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { diagonalweave } from "tabbied/patterns";
import { TabbiedPattern } from "tabbied/react";
import { formatAED, formatDate, formatTime } from "@/lib/format";
import {
	FOCUS_RING,
	HAIR_SPREAD,
	KICKER,
	LABEL,
	LABEL_LG,
	LABEL_SM,
	SPREAD,
	SPREAD_BODY,
} from "@/lib/styles";
import { trpc } from "@/utils/trpc";

// One link spans the photo and the lead, so the note is a grid item laid over
// its right-hand end rather than a child of it. The photo keeps the original
// full-bleed box by reaching back through the spread body's right padding.
const PHOTO =
	"spread-photo w-[calc(100%_+_3.6242cqw)] aspect-[2099/587] overflow-hidden max-xl:w-full max-xl:aspect-[3/2]";

const PANEL =
	"flex h-full w-full flex-col items-center justify-center gap-3 bg-surface-weak px-6 text-center";

// Shown while the query runs and for any event that has no photo of its own, so
// the figure is always an <img>: the parallax in page-motion binds on mount and
// the box never changes size when the real photo arrives.
const FALLBACK_IMAGE = "/amg-race-track-gstudio_1080.webp";

const PANEL_TEXT =
	"font-normal font-sans text-on-surface-muted text-caption max-xl:text-body-md";

const ROW =
	"season-row mt-[2.4cqw] grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-[2cqw] max-xl:mt-5 max-xl:grid-cols-[1fr] max-xl:gap-y-3";

const LINK = `group col-start-1 col-end-3 row-start-1 block no-underline max-xl:col-end-2 ${FOCUS_RING}`;

const LEAD =
	"season-lead mt-[2.4cqw] flex items-baseline gap-[2cqw] border-foreground/[0.41] border-y py-[1.6cqw] max-xl:mt-5 max-xl:flex-wrap max-xl:gap-3 max-xl:py-4";

const DATE =
	"season-date font-extrabold font-sans text-[4.1921cqw] uppercase leading-[0.95] max-xl:text-[clamp(40px,11vw,64px)]";

// No event to show: the empty state takes the date slot's own scale instead of
// hiding behind a caption, so the spread never reads as broken.
const DATE_EMPTY = `${DATE} italic`;

const NAME =
	"season-name font-extrabold font-sans text-[1.6cqw] uppercase max-xl:text-[clamp(16px,3.6vw,22px)]";

// No event to show. The empty state swaps the photo slot for a racetrack:
// contour rings drawn in the palette tokens, reseeded on a timer (tabbied
// pauses it itself under reduced motion, off-screen and in hidden tabs). The
// --color-* aliases, not the bare --* tokens: those hold oklch components.
const RACETRACK = [
	"var(--color-background)",
	"var(--color-primary)",
	"var(--color-on-surface-muted)",
];

// Two columns rather than absolute placement: this spread is a flow layout
// with its own max-xl stack, so the pattern is just the row's second item and
// reflows to below the text instead of needing a second absolute rule set.
const EMPTY_ROW =
	"season-row mt-[2.4cqw] grid grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)] items-stretch gap-x-[3cqw] max-xl:mt-5 max-xl:grid-cols-[1fr] max-xl:gap-y-6";

const EMPTY_TEXT = "flex flex-col justify-between gap-6 max-xl:gap-5";

const LEAD_EMPTY =
	"season-lead flex flex-col gap-[1.6cqw] border-foreground/[0.41] border-y py-[1.6cqw] max-xl:gap-3 max-xl:py-4";

// Like the photo, the pattern reaches back through the spread body's right
// padding; at max-xl that padding is gone, so the bleed drops with it. Explicit
// width the way the photo does it: the negative-margin variant measured wider
// than its track and pushed a horizontal scrollbar onto the page.
const PATTERN =
	"w-[calc(100%_+_3.6242cqw)] aspect-[16/7] overflow-hidden max-xl:w-full max-xl:aspect-[16/9]";

const NOTE = `season-note text-on-surface-muted pb-[1.6cqw] ${LABEL_SM} ${LABEL}`;

// The note is a grid item laid over the link's right-hand end, outside it, so
// the link stays a single control. The row aligns to its end rather than to a
// baseline: the link is a block wrapper with no line box of its own, so a
// baseline alignment resolves differently depending on whether the photo is an
// image or a panel, and the note drifted out of the box in the no-image case.
// The padding puts its baseline back on the date's line.
const NOTE_WITH_EVENT =
	"col-start-2 row-start-1 max-xl:col-start-1 max-xl:row-start-2";
const NOTE_ALIGNED = "max-xl:pb-0";

const ACTION = `font-medium font-sans text-primary-60 uppercase no-underline transition-colors hover:text-foreground ${LABEL} ${LABEL_LG} ${FOCUS_RING}`;

const RETRY = `cursor-pointer border border-foreground/28 bg-background px-3 py-1.5 min-h-11 min-w-11 font-medium font-sans text-foreground uppercase transition-colors hover:border-foreground ${LABEL} ${LABEL_LG} ${FOCUS_RING}`;

export default function UpcomingEvent() {
	const {
		data: event,
		isPending,
		isError,
		refetch,
	} = useQuery(trpc.events.publicNext.queryOptions());

	const photo: ReactNode = isError ? (
		<div className={PANEL}>
			<p className={PANEL_TEXT}>Could not load the next event.</p>
		</div>
	) : (
		// Decorative: the date and title inside the link give it its name.
		<img
			className="block h-full w-full object-cover object-center transition-[filter] duration-300 group-hover:brightness-125"
			src={event?.imageUrl || FALLBACK_IMAGE}
			alt=""
		/>
	);

	const lead: ReactNode = isPending ? (
		<>
			<span className={DATE}>
				<Skeleton className="block h-[4cqw] w-[16cqw] rounded-none max-xl:h-10 max-xl:w-32" />
			</span>
			<span className={NAME}>
				<Skeleton className="block h-[1.6cqw] w-[26cqw] rounded-none max-xl:h-5 max-xl:w-44" />
			</span>
		</>
	) : isError ? null : event ? (
		<>
			<span className={DATE}>{formatDate(event.eventDate)}</span>
			<span className={NAME}>{event.title}</span>
		</>
	) : (
		<>
			<span className={DATE_EMPTY}>
				Stay <span className="text-primary">tuned</span>
			</span>
			<span className={NAME}>Upcoming events are on the way</span>
		</>
	);

	const note: ReactNode = event ? (
		[
			event.location,
			formatTime(event.startTime),
			event.price > 0 ? formatAED(event.price, { whole: 1 }) : "Free",
		]
			.filter(Boolean)
			.join(" · ")
	) : isError ? (
		<button type="button" onClick={() => void refetch()} className={RETRY}>
			Retry
		</button>
	) : null;

	// The empty state is its own layout: no figure and no link wrapping the
	// block; the "See all events" line is the only control, set in the text
	// column under the message it belongs to.
	const isEmpty = !isPending && !isError && !event;

	return (
		<section className={SPREAD} aria-label="005: Upcoming event">
			<span className={HAIR_SPREAD} aria-hidden="true" />
			<p className={`spread-kicker ${KICKER}`}>
				005 /
				<br />
				Upcoming event
			</p>

			<div className={SPREAD_BODY}>
				{isEmpty ? (
					<div className={EMPTY_ROW}>
						<div className={EMPTY_TEXT}>
							<div className={LEAD_EMPTY}>
								<span className={DATE_EMPTY}>
									Stay <span className="text-primary">tuned</span>
								</span>
								<span className={NAME}>Upcoming events are on the way</span>
							</div>
							<Link
								className={`${ACTION} mt-[2cqw] py-3.5 max-xl:mt-5`}
								href={"/events" as Route}
							>
								See all events
							</Link>
						</div>

						<div className={PATTERN}>
							<TabbiedPattern
								pattern={diagonalweave}
								palette={RACETRACK}
								redrawInterval={4000}
							/>
						</div>
					</div>
				) : (
					<div className={ROW}>
						<Link
							className={LINK}
							href={(event ? `/events/${event.id}` : "/events") as Route}
							inert={isPending || undefined}
							aria-label={event ? undefined : "See all events"}
						>
							<figure className={PHOTO}>{photo}</figure>
							{lead === null ? null : <div className={LEAD}>{lead}</div>}
						</Link>

						<span
							className={
								event ? `${NOTE} ${NOTE_WITH_EVENT} ${NOTE_ALIGNED}` : NOTE
							}
						>
							{note}
						</span>
					</div>
				)}
			</div>
		</section>
	);
}
