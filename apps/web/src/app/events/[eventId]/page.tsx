"use client";

import { Button } from "@amgclub/ui/components/button";
import { Skeleton } from "@amgclub/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import { EventDetailMotion } from "@/components/event-detail-motion";
import EventRegisterForm from "@/components/event-register-form";
import { PageMotion } from "@/components/page-motion";
import { formatAED, formatDate, formatTime } from "@/lib/format";
import {
	FMT_DETAIL,
	FMT_INDEX,
	FMT_NAME,
	FORMAT_ROW,
	HAIR_SPREAD,
	KICKER,
	SPREAD,
	SPREAD_BODY,
	SPREAD_INTRO,
} from "@/lib/styles";
import { trpc } from "@/utils/trpc";

const FALLBACK_IMAGE = "/amg-race-track-gstudio_1080.webp";

export default function EventDetailPage() {
	const params = useParams<{ eventId: string }>();

	const { data: events, isLoading } = useQuery(
		trpc.events.publicList.queryOptions(),
	);

	const event = events?.find((e) => e.id === params.eventId);
	const priceLabel =
		event && event.price > 0 ? formatAED(event.price, { whole: 1 }) : "Free";

	if (isLoading) {
		return (
			<main className="flex flex-1 flex-col">
				<div className="@container relative bg-background text-foreground max-xl:px-5 md:max-xl:px-12">
					<span
						className="absolute top-0 left-[3.6242cqw] h-full w-[1.5px] bg-foreground/40 max-xl:hidden"
						aria-hidden="true"
					/>
					<header className="relative pt-[2.2cqw] pb-[1.2cqw] max-xl:pt-6 max-xl:pb-6">
						<span
							className="block h-[1.5px] w-full bg-foreground/[0.41]"
							aria-hidden="true"
						/>
						<div className={SPREAD_BODY}>
							<div className="py-[1.1cqw] max-xl:py-4">
								<Skeleton className="h-3 w-56" />
							</div>
							<Skeleton className="h-[clamp(52px,7.9cqw,168px)] w-2/3" />
							<Skeleton className="mt-5 h-4 w-[46cqw] max-xl:max-w-none" />
						</div>
					</header>
					<section className={SPREAD} aria-hidden="true">
						<span className={HAIR_SPREAD} />
						<div className={SPREAD_BODY}>
							<div className="grid max-xl:grid-cols-1 max-xl:gap-y-8 xl:grid-cols-[minmax(0,1fr)_26cqw] xl:gap-x-[3cqw]">
								<div className="min-w-0">
									<Skeleton className="aspect-[2099/587] w-full max-xl:aspect-[3/2]" />
									<Skeleton className="mt-[2.4cqw] h-4 w-3/4 max-xl:mt-5" />
									<ol className="mt-[3.4cqw] list-none border-foreground/[0.41] border-t-[1.5px] p-0 max-xl:mt-6">
										{[0, 1, 2].map((row) => (
											<li key={row} className={FORMAT_ROW}>
												<Skeleton className="h-3 w-6" />
												<Skeleton className="h-5 w-32" />
												<Skeleton className="h-3 w-24 justify-self-end max-xl:col-start-2 max-xl:justify-self-start" />
											</li>
										))}
									</ol>
								</div>
								<aside className="border-foreground/[0.41] max-xl:border-t-[1.5px] max-xl:border-l-0 max-xl:pt-6 max-xl:pl-0 xl:border-l-[1.5px] xl:pl-[2cqw]">
									<Skeleton className="h-8 w-32" />
									<div className="mt-5 flex flex-col gap-3 border-foreground/[0.41] border-t-[1.5px] pt-4">
										<Skeleton className="h-3 w-full" />
										<Skeleton className="h-3 w-full" />
										<Skeleton className="h-3 w-2/3" />
									</div>
									<Skeleton className="mt-6 h-5 w-48" />
									<div className="mt-4 flex flex-col gap-4">
										<Skeleton className="h-11 w-full" />
										<Skeleton className="h-11 w-full" />
										<Skeleton className="h-11 w-full" />
										<Skeleton className="h-12 w-full" />
									</div>
								</aside>
							</div>
						</div>
					</section>
				</div>
			</main>
		);
	}

	if (!event) {
		return (
			<main className="flex flex-1 flex-col">
				<div className="mx-auto max-w-2xl px-4 py-8 text-center">
					<h1 className="font-extrabold font-sans text-foreground text-headline-lg">
						Event not found
					</h1>
					<p className="mt-2 font-sans text-body-md text-muted-foreground">
						The event you're looking for doesn't exist or is no longer active.
					</p>
					<div className="mt-5 flex justify-center">
						<Link href={"/events" as Route}>
							<Button variant="outline" className="min-h-11">
								Browse all events
							</Button>
						</Link>
					</div>
				</div>
			</main>
		);
	}

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
						<h1 className="h1 font-extrabold font-sans text-[clamp(3.5rem,7.9cqw,10.5rem)] text-foreground uppercase leading-[0.86] tracking-[-0.03em] max-xl:mt-1 max-xl:text-[clamp(52px,13vw,120px)] max-xl:leading-[0.9] max-xl:tracking-normal">
							{event.title}
						</h1>
						<span
							className="red-rule mt-3 block h-px w-24 bg-primary"
							aria-hidden="true"
						/>
						<p className="detail-meta mt-4 max-w-[46cqw] font-normal font-sans text-[0.8125rem] text-on-surface-muted uppercase max-xl:mt-4 max-xl:max-w-none max-xl:text-body-sm">
							{formatDate(event.eventDate)} · {formatTime(event.startTime)}
							{event.endTime ? `–${formatTime(event.endTime)}` : ""} ·{" "}
							{event.location} · {priceLabel}
						</p>
					</div>
				</header>

				<section className={SPREAD} aria-label="001: The spread">
					<span className={HAIR_SPREAD} aria-hidden="true" />
					<p className={`spread-kicker ${KICKER}`}>
						001 /
						<br />
						The spread
					</p>
					<div className={SPREAD_BODY}>
						<div className="grid max-xl:grid-cols-1 max-xl:gap-y-8 xl:grid-cols-[minmax(0,1fr)_26cqw] xl:gap-x-[3cqw]">
							<div className="min-w-0">
								<figure className="spread-photo aspect-[2099/587] overflow-hidden max-xl:aspect-[3/2]">
									<img
										className="block h-full w-full object-cover object-center"
										src={event.imageUrl || FALLBACK_IMAGE}
										onError={(e) => {
											const img = e.currentTarget;
											if (!img.src.endsWith(FALLBACK_IMAGE)) {
												img.src = FALLBACK_IMAGE;
											}
										}}
										alt={event.title}
									/>
								</figure>
								<p
									className={`spread-intro ${SPREAD_INTRO} mt-[2.4cqw] max-xl:mt-5`}
								>
									{event.description || "Details and schedule to follow."}
								</p>
								<ol className="mt-[3.4cqw] list-none border-foreground/[0.41] border-t-[1.5px] p-0 max-xl:mt-6">
									<li className={`format-row ${FORMAT_ROW}`}>
										<span className={FMT_INDEX} aria-hidden="true">
											01
										</span>
										<span className={FMT_NAME}>Date &amp; time</span>
										<span className={FMT_DETAIL}>
											{formatDate(event.eventDate)} ·{" "}
											{formatTime(event.startTime)}
											{event.endTime ? `–${formatTime(event.endTime)}` : ""}
										</span>
									</li>
									<li className={`format-row ${FORMAT_ROW}`}>
										<span className={FMT_INDEX} aria-hidden="true">
											02
										</span>
										<span className={FMT_NAME}>Location</span>
										<span className={FMT_DETAIL}>{event.location}</span>
									</li>
									<li className={`format-row ${FORMAT_ROW}`}>
										<span className={FMT_INDEX} aria-hidden="true">
											03
										</span>
										<span className={FMT_NAME}>Registered</span>
										<span className={FMT_DETAIL}>
											{event.totalAttendees}{" "}
											{event.totalAttendees === 1 ? "attendee" : "attendees"}
										</span>
									</li>
								</ol>
							</div>
							<aside className="detail-rail border-foreground/[0.41] max-xl:border-t-[1.5px] max-xl:border-l-0 max-xl:pt-6 max-xl:pl-0 xl:border-l-[1.5px] xl:pl-[2cqw]">
								<div className="flex flex-col gap-5 xl:sticky xl:top-6">
									<p className="font-extrabold font-sans text-[2.2cqw] text-foreground uppercase leading-none max-xl:text-[34px]">
										{priceLabel}
									</p>
									<dl className="m-0 flex flex-col gap-3 border-foreground/[0.41] border-t-[1.5px] pt-4">
										<div className="flex items-baseline justify-between gap-3">
											<dt className="font-medium font-sans text-[0.87653cqw] text-on-surface-muted uppercase leading-[1.4] tracking-[0.06em] max-xl:text-label-sm">
												Date
											</dt>
											<dd className="m-0 text-right font-medium font-sans text-[0.87653cqw] text-foreground uppercase leading-[1.4] tracking-[0.06em] max-xl:text-label-sm">
												{formatDate(event.eventDate)} ·{" "}
												{formatTime(event.startTime)}
												{event.endTime ? `–${formatTime(event.endTime)}` : ""}
											</dd>
										</div>
										<div className="flex items-baseline justify-between gap-3">
											<dt className="font-medium font-sans text-[0.87653cqw] text-on-surface-muted uppercase leading-[1.4] tracking-[0.06em] max-xl:text-label-sm">
												Location
											</dt>
											<dd className="m-0 text-right font-medium font-sans text-[0.87653cqw] text-foreground uppercase leading-[1.4] tracking-[0.06em] max-xl:text-label-sm">
												{event.location}
											</dd>
										</div>
										<div className="flex items-baseline justify-between gap-3">
											<dt className="font-medium font-sans text-[0.87653cqw] text-on-surface-muted uppercase leading-[1.4] tracking-[0.06em] max-xl:text-label-sm">
												Registered
											</dt>
											<dd className="m-0 text-right font-medium font-sans text-[0.87653cqw] text-foreground uppercase leading-[1.4] tracking-[0.06em] max-xl:text-label-sm">
												{event.totalAttendees}{" "}
												{event.totalAttendees === 1 ? "attendee" : "attendees"}
											</dd>
										</div>
									</dl>
									<div>
										<h2 className="font-bold font-sans text-foreground text-headline-sm">
											Register for this event
										</h2>
										<div className="mt-4">
											<EventRegisterForm
												eventId={event.id}
												eventPrice={event.price}
											/>
										</div>
									</div>
								</div>
							</aside>
						</div>
					</div>
				</section>
			</div>
			<PageMotion />
			<EventDetailMotion />
		</main>
	);
}
