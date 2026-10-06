"use client";

import { Skeleton } from "@amgclub/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { LogoStripes } from "@/components/logo-stripes";
import { PageMotion } from "@/components/page-motion";
import { formatAED, formatDate, formatTime } from "@/lib/format";
import {
	FMT_DETAIL,
	FMT_INDEX,
	FMT_NAME,
	FOCUS_RING,
	FORMAT_ROW,
	HAIR_SPREAD,
	KICKER,
	LABEL,
	LABEL_LG,
	LABEL_SM,
	SPREAD,
	SPREAD_BODY,
	SPREAD_INTRO,
} from "@/lib/styles";
import { trpc } from "@/utils/trpc";

// The featured spread's photo reaches back through the spread body's right
// padding the way the home page's does; at max-xl that padding is gone, so
// the bleed drops with it.
const PHOTO =
	"spread-photo w-[calc(100%_+_3.6242cqw)] aspect-[2099/587] overflow-hidden max-xl:w-full max-xl:aspect-[3/2]";

// Always an <img>, from first paint: the parallax in page-motion binds on
// mount, so the box never changes size when the real photo arrives.
const FALLBACK_IMAGE = "/amg-race-track-gstudio_1080.webp";

const LEAD =
	"mt-[1.6cqw] flex items-baseline gap-[2cqw] border-foreground/[0.41] border-y-[1.5px] py-[1.2cqw] max-xl:mt-5 max-xl:flex-wrap max-xl:gap-3 max-xl:py-4";

const DATE =
	"font-extrabold font-sans text-[4.1921cqw] uppercase leading-[0.95] max-xl:text-[clamp(40px,11vw,64px)]";

// No events on the calendar: the message takes the date slot's own scale, in
// the world's italic display voice, so the spread never reads as broken.
const DATE_EMPTY = `${DATE} italic`;

const NAME =
	"font-extrabold font-sans text-[1.6cqw] uppercase max-xl:text-[clamp(16px,3.6vw,22px)]";

const META_ROW =
	"mt-[1cqw] flex items-center justify-between gap-x-[2cqw] gap-y-4 max-xl:mt-4 max-xl:flex-col max-xl:items-start";

const META = `text-on-surface-muted ${LABEL_SM} ${LABEL}`;

const REGISTER =
	"flex min-h-12 shrink-0 items-center bg-primary px-4 text-primary-foreground transition-opacity group-hover:opacity-85";

const REGISTER_TEXT = `font-medium font-sans uppercase leading-none ${LABEL} ${LABEL_LG}`;

const RETRY = `cursor-pointer border border-foreground/28 bg-background px-3 py-1.5 min-h-11 min-w-11 font-medium font-sans text-foreground uppercase transition-colors hover:border-foreground ${LABEL} ${LABEL_LG} ${FOCUS_RING}`;

const PANEL_TEXT =
	"font-normal font-sans text-on-surface-muted text-caption max-xl:text-body-md";

const LEDGER =
	"mt-[2.4cqw] list-none border-foreground/[0.41] border-t-[1.5px] p-0 max-xl:mt-6";

// The upcoming spread sits closest to the fold, so its top padding tightens
// on desktop only; the kicker is absolutely positioned to the section top and
// has to travel with it.
const SECTION_UPCOMING =
	"spread relative pt-[4cqw] pb-[5.6cqw] max-xl:pt-9 max-xl:pb-9 md:max-xl:pt-14 md:max-xl:pb-14";

const KICKER_UPCOMING = `absolute left-[5.1448cqw] top-[4cqw] text-primary-60 max-xl:static max-xl:mb-6 ${LABEL_SM} ${LABEL}`;

const ROW_LINK = `format-row group no-underline ${FORMAT_ROW} ${FOCUS_RING}`;

// The divider breaks the body column and starts out at the marginalia line,
// so it reads full-bleed inside the spread instead of set to the text measure.
const STATEMENT =
	"statement font-extrabold font-sans text-[clamp(44px,8.6cqw,150px)] uppercase leading-[0.86] tracking-[-0.03em] max-xl:text-[clamp(40px,11vw,88px)]";

const STATEMENT_BODY = "pl-[5.1448cqw] pr-[3.6242cqw] max-xl:pl-0 max-xl:pr-0";

const STRIPES =
	"mt-[2.4cqw] block h-auto w-[clamp(56px,7cqw,104px)] max-xl:mt-6 max-xl:w-[80px]";

// Ruled lines, not rounded blobs: every skeleton is a hairline-height bar.
const SKEL_DATE =
	"block h-[4cqw] w-[16cqw] rounded-none max-xl:h-10 max-xl:w-32";
const SKEL_NAME =
	"block h-[2.4cqw] w-[26cqw] rounded-none max-xl:h-6 max-xl:w-44";
const SKEL_META = "block h-3 w-56 rounded-none max-xl:w-44";
const SKEL_REGISTER = "block h-11 w-36 rounded-none";
const SKEL_INDEX = "block h-3 w-6 rounded-none";
const SKEL_ROW_NAME = "block h-5 w-1/2 rounded-none";
const SKEL_DETAIL =
	"ml-auto block h-3 w-32 rounded-none max-xl:ml-0 max-xl:w-40";

const DECK =
	"the season as it runs: the next drive up front, every mile already logged below.";

type UpcomingRow = { eventDate: string; location: string; price: number };

function priceTag(price: number) {
	return price > 0 ? formatAED(price, { whole: 1 }) : "Free";
}

function upcomingDetail(event: UpcomingRow) {
	return [formatDate(event.eventDate), event.location, priceTag(event.price)]
		.filter(Boolean)
		.join(" · ");
}

function pastDetail(event: { eventDate: string; location: string }) {
	return [formatDate(event.eventDate), event.location]
		.filter(Boolean)
		.join(" · ");
}

function ledgerIndex(position: number) {
	return String(position + 1).padStart(2, "0");
}

export default function EventsPage() {
	const {
		data: events,
		isPending,
		isError,
		refetch,
	} = useQuery(trpc.events.publicList.queryOptions());

	const {
		data: past,
		isPending: pastPending,
		isError: pastError,
		refetch: pastRefetch,
	} = useQuery(trpc.events.publicPast.queryOptions());

	const featured = events?.[0];
	const rest = events?.slice(1) ?? [];

	// The date and title inside the link give it their name; the photo is
	// decorative, so it ships an empty alt.
	const photo = (
		<figure className={PHOTO}>
			<img
				className="block h-full w-full object-cover object-center transition-[filter] duration-300 group-hover:brightness-125"
				src={featured?.imageUrl || FALLBACK_IMAGE}
				alt=""
			/>
		</figure>
	);

	const lead: ReactNode = isPending ? (
		<>
			<span className={DATE}>
				<Skeleton className={SKEL_DATE} />
			</span>
			<span className={NAME}>
				<Skeleton className={SKEL_NAME} />
			</span>
		</>
	) : isError ? null : featured ? (
		<>
			<span className={`${DATE} shrink-0`}>
				{formatDate(featured.eventDate)}
			</span>
			<span className={NAME}>{featured.title}</span>
		</>
	) : (
		<>
			<span className={DATE_EMPTY}>
				No events on the <span className="text-primary">calendar</span>
			</span>
			<span className={NAME}>New dates land through the season</span>
		</>
	);

	const metaRow: ReactNode = isError ? (
		<div className={META_ROW}>
			<p className={PANEL_TEXT}>Could not load the events.</p>
			<button type="button" onClick={() => void refetch()} className={RETRY}>
				Retry
			</button>
		</div>
	) : isPending ? (
		<div className={META_ROW}>
			<span className={META}>
				<Skeleton className={SKEL_META} />
			</span>
			<Skeleton className={SKEL_REGISTER} />
		</div>
	) : featured ? (
		<div className={META_ROW}>
			<span className={META}>
				{[
					featured.location,
					formatTime(featured.startTime),
					priceTag(featured.price),
				]
					.filter(Boolean)
					.join(" · ")}
			</span>
			<span className={REGISTER}>
				<span className={REGISTER_TEXT}>Register</span>
			</span>
		</div>
	) : null;

	// One link owns the whole feature — photo, lead, meta and the red action —
	// so the block is a single control rather than two links to one page.
	const featuredBody = (
		<>
			{photo}
			{lead === null ? null : <div className={LEAD}>{lead}</div>}
			{metaRow}
		</>
	);

	const featuredContent =
		!isPending && !isError && featured ? (
			<Link
				className={`group block no-underline ${FOCUS_RING}`}
				href={`/events/${featured.id}` as Route}
			>
				{featuredBody}
			</Link>
		) : (
			<div>{featuredBody}</div>
		);

	return (
		<main className="flex flex-1 flex-col">
			<div className="@container relative bg-background text-foreground max-xl:px-5 md:max-xl:px-12">
				<span
					className="absolute top-0 left-[3.6242cqw] h-full w-[1.5px] bg-foreground/40 max-xl:hidden"
					aria-hidden="true"
				/>

				<header className="relative pt-[2.2cqw] pb-[1.2cqw] max-xl:pt-6 max-xl:pb-6">
					<span
						className="hair-masthead block h-[1.5px] w-full bg-foreground/[0.41]"
						aria-hidden="true"
					/>
					<div className={SPREAD_BODY}>
						<div className="flex items-baseline justify-between gap-4 py-[1.1cqw] max-xl:py-4">
							<span className="t-issue font-medium font-sans text-[0.9223cqw] text-primary-60 uppercase leading-none max-xl:text-[clamp(10px,1.6vw,12px)]">
								The Roll · The Run · The Roar
							</span>
						</div>

						<h1 className="h1 m-0 font-extrabold font-sans text-[clamp(3.5rem,6.4cqw,10.5rem)] text-foreground uppercase leading-[0.86] tracking-[-0.03em] max-xl:mt-1 max-xl:text-[clamp(46px,8.6vw,116px)] max-xl:leading-[0.9] max-xl:tracking-normal">
							Events
						</h1>
						<span
							className="red-rule mt-3 block h-px w-24 bg-primary"
							aria-hidden="true"
						/>
						<p className="mt-4 max-w-[46cqw] font-normal font-sans text-[0.8125rem] text-on-surface-muted uppercase max-xl:mt-4 max-xl:max-w-none max-xl:text-body-sm">
							{DECK}
						</p>
					</div>
				</header>

				<section
					className={SECTION_UPCOMING}
					aria-label="001: The season ahead"
				>
					<span className={HAIR_SPREAD} aria-hidden="true" />
					<p className={`spread-kicker ${KICKER_UPCOMING}`}>
						001 /
						<br />
						The season ahead
					</p>
					<div className={SPREAD_BODY}>
						{featuredContent}

						{isPending ? (
							<div className={LEDGER} aria-hidden="true">
								{[0, 1, 2].map((row) => (
									<div key={row} className={`format-row ${FORMAT_ROW}`}>
										<span className={FMT_INDEX}>
											<Skeleton className={SKEL_INDEX} />
										</span>
										<span className={FMT_NAME}>
											<Skeleton className={SKEL_ROW_NAME} />
										</span>
										<span className={FMT_DETAIL}>
											<Skeleton className={SKEL_DETAIL} />
										</span>
									</div>
								))}
							</div>
						) : rest.length > 0 ? (
							<ol className={LEDGER} aria-label="More upcoming events">
								{rest.map((event, position) => (
									<li key={event.id}>
										<Link
											className={ROW_LINK}
											href={`/events/${event.id}` as Route}
										>
											<span className={FMT_INDEX} aria-hidden="true">
												{ledgerIndex(position)}
											</span>
											<span
												className={`${FMT_NAME} transition-colors group-hover:text-primary-60`}
											>
												{event.title}
											</span>
											<span className={FMT_DETAIL}>
												{upcomingDetail(event)}
											</span>
										</Link>
									</li>
								))}
							</ol>
						) : null}

						<LogoStripes className="absolute top-[5.6cqw] right-[3.6242cqw] block h-auto w-20 max-xl:top-9 max-xl:right-5" />
					</div>
				</section>

				<section className={SPREAD} aria-label="The season never idles">
					<span className={HAIR_SPREAD} aria-hidden="true" />
					<div className={STATEMENT_BODY}>
						<p className={STATEMENT}>
							The season
							<br />
							<span className="text-primary">never idles</span>
						</p>
					</div>
				</section>

				<section className={SPREAD} aria-label="002: Past drives">
					<span className={HAIR_SPREAD} aria-hidden="true" />
					<p className={`spread-kicker ${KICKER}`}>
						002 /
						<br />
						Past drives
					</p>
					<div className={SPREAD_BODY}>
						<p className={`spread-intro ${SPREAD_INTRO}`}>
							Every drive already run, newest first.
						</p>

						{pastPending ? (
							<div className={LEDGER} aria-hidden="true">
								{[0, 1, 2].map((row) => (
									<div key={row} className={`format-row ${FORMAT_ROW}`}>
										<span className={FMT_INDEX}>
											<Skeleton className={SKEL_INDEX} />
										</span>
										<span className={FMT_NAME}>
											<Skeleton className={SKEL_ROW_NAME} />
										</span>
										<span className={FMT_DETAIL}>
											<Skeleton className={SKEL_DETAIL} />
										</span>
									</div>
								))}
							</div>
						) : pastError ? (
							<div className="mt-[3.4cqw] flex flex-col items-start gap-4 max-xl:mt-6">
								<p className={PANEL_TEXT}>Could not load past drives.</p>
								<button
									type="button"
									onClick={() => void pastRefetch()}
									className={RETRY}
								>
									Retry
								</button>
							</div>
						) : past && past.length > 0 ? (
							<ol className={LEDGER} aria-label="Past drives">
								{past.map((event, position) => (
									<li key={event.id} className={`format-row ${FORMAT_ROW}`}>
										<span className={FMT_INDEX} aria-hidden="true">
											{ledgerIndex(position)}
										</span>
										<span className={FMT_NAME}>{event.title}</span>
										<span className={FMT_DETAIL}>{pastDetail(event)}</span>
									</li>
								))}
							</ol>
						) : (
							<p className={`mt-[3.4cqw] ${SPREAD_INTRO} max-xl:mt-6`}>
								No drives logged yet.
							</p>
						)}

						<LogoStripes className={STRIPES} />
					</div>
				</section>
			</div>

			<PageMotion />
		</main>
	);
}
