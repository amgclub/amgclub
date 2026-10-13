import type { Route } from "next";
import Link from "next/link";
import { CoverVideo } from "@/components/cover-video";
import { PageMotion } from "@/components/page-motion";
import { RecordValue } from "@/components/record-value";
import Sponsors from "@/components/sponsors";
import UpcomingEvent from "@/components/upcoming-event";
import {
	DECK_LEFT,
	DECK_RIGHT,
	JOIN_URL,
	MEMBER_PERKS,
	RECORD,
	RUN_FORMATS,
} from "@/lib/data";
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

export default function Home() {
	return (
		<main className="flex flex-1 flex-col">
			<div className="comp-frame @container relative aspect-[2624/1472] w-full self-start overflow-hidden bg-background max-xl:flex max-xl:flex-col max-xl:gap-8 max-xl:overflow-visible max-xl:px-5 max-xl:pb-0 md:max-xl:gap-11 md:max-xl:px-12 md:max-xl:pb-6">
				<figure className="r-cover-photo absolute top-[4%] left-[20%] h-[60%] w-[80%] max-md:aspect-[16/9] max-xl:relative max-xl:top-auto max-xl:left-auto max-xl:-mx-5 max-xl:aspect-[2099/587] max-xl:h-auto max-xl:w-auto max-xl:overflow-hidden md:max-xl:-mx-12">
					<img
						className="block h-full w-full object-cover max-xl:object-[50%_62%] xl:absolute xl:top-0 xl:left-[0.9052%] xl:w-[99.0948%]"
						src="/cover-photo.png"
						alt="Black AMG GT leading an AMG Club convoy through a mountain pass"
						width={1344}
						height={768}
					/>
					<CoverVideo />
					<span
						className="cover-scrim pointer-events-none absolute inset-x-0 bottom-0 h-[40%] bg-linear-to-b from-transparent to-background"
						aria-hidden="true"
					/>
				</figure>

				<div
					className="r-margin-rule absolute top-0 left-0 h-full w-[10%] max-xl:hidden"
					aria-hidden="true"
				>
					<span className="hair-margin absolute top-0 left-[3.6242cqw] h-full w-[0.0572cqw] bg-foreground/40" />
				</div>

				<div className="r-margin-label absolute top-[50%] left-[4.8%] h-[4.08%] w-[5.49%] max-xl:static max-xl:order-1 max-xl:h-auto max-xl:w-auto">
					<p
						className={`t-kicker absolute top-[-0.197cqw] left-[0.3049cqw] whitespace-nowrap text-primary-60 max-xl:static max-xl:whitespace-normal ${LABEL_SM} ${LABEL}`}
					>
						002 /
						<br />
						Who we are
					</p>
				</div>

				<div className="r-headline absolute top-[50%] left-[46.46%] h-[20%] w-[18.86%] max-xl:static max-xl:order-2 max-xl:h-auto max-xl:w-auto">
					<h1 className="h1 absolute top-[4.12cqw] left-[-25.7622cqw] m-0 whitespace-nowrap font-extrabold font-sans text-[clamp(3.5rem,6.4cqw,10.5rem)] text-foreground uppercase leading-[0.86] tracking-[-0.03em] [word-spacing:0.05em] max-xl:static max-xl:whitespace-normal max-xl:text-[clamp(46px,8.6vw,116px)] max-xl:leading-[0.9] max-xl:tracking-normal">
						Born from <span className="text-primary">Passion</span>
					</h1>
					<span
						className="red-rule absolute top-[10.6cqw] left-[0.343cqw] block h-px w-24 bg-primary max-xl:static max-xl:mt-4 max-xl:self-start min-[1280px]:h-[0.0762cqw] min-[1280px]:w-[38.872cqw]"
						aria-hidden="true"
					/>
				</div>

				<div className="r-deck-left absolute top-[70.77%] left-[46.46%] h-[17.6%] w-[19.05%] max-xl:static max-xl:order-3 max-xl:h-auto max-xl:w-auto">
					<p className="deck absolute top-0 left-0 w-full break-words text-justify font-normal font-sans text-[0.8125rem] text-on-surface-muted uppercase max-xl:static max-xl:w-auto max-xl:text-left max-xl:text-body-sm">
						{DECK_LEFT}
					</p>
				</div>
				<div className="r-deck-right absolute top-[70.77%] left-[66.96%] h-[17.6%] w-[19.74%] max-xl:static max-xl:order-4 max-xl:h-auto max-xl:w-auto">
					<p className="deck absolute top-0 left-0 w-full break-words text-justify font-normal font-sans text-[0.8125rem] text-on-surface-muted uppercase max-xl:static max-xl:w-auto max-xl:text-left max-xl:text-body-sm">
						{DECK_RIGHT}
					</p>
				</div>

				<div className="r-cta-join absolute top-[70.5%] left-[20.31%] h-[12.77%] w-[8.46%] max-xl:relative max-xl:top-auto max-xl:left-auto max-xl:order-5 max-xl:h-[88px] max-xl:w-[min(200px,56vw)]">
					<Link
						className={`cta-join group/cta absolute top-[0.4192cqw] left-[0.3811cqw] flex h-[7.6982cqw] w-[7.8506cqw] items-end justify-center bg-primary p-5 text-primary-foreground no-underline ${FOCUS_RING} max-xl:inset-0 max-xl:h-auto max-xl:w-auto max-xl:items-end max-xl:justify-start max-xl:p-5`}
						href={JOIN_URL as Route}
					>
						<span
							className={`t-cta-label whitespace-nowrap font-medium font-sans text-[0.87653cqw] text-primary-foreground uppercase leading-none transition-opacity group-hover/cta:opacity-85 ${LABEL_LG}`}
						>
							Join the club
						</span>
					</Link>
				</div>

				<div
					className="r-next-rule absolute top-[90%] left-0 h-[10%] w-full max-xl:static max-xl:order-6 max-xl:h-auto max-xl:w-auto"
					aria-hidden="true"
				>
					<span className="hair-next absolute top-[2.0145cqw] left-0 h-[0.0572cqw] w-full bg-foreground/[0.41] max-xl:static max-xl:block max-xl:h-px max-xl:w-full" />
				</div>

				<div className="r-section-003-num absolute top-[95.72%] left-[4.8%] h-[2.45%] w-[2.06%] max-xl:static max-xl:order-7 max-xl:mt-1 max-xl:h-auto max-xl:w-auto">
					<p className="t-num absolute top-[0.2222cqw] left-[0.2668cqw] whitespace-nowrap font-normal font-sans text-[0.87653cqw] text-foreground leading-none tracking-[0.04em] max-xl:static max-xl:text-label-sm">
						003
					</p>
				</div>

				<div className="r-section-003-head absolute top-[95.72%] left-[27.1%] h-[4.28%] w-[13.72%] max-xl:static max-xl:order-8 max-xl:h-auto max-xl:w-auto">
					<h2 className="t-head absolute top-[-0.0381cqw] left-[-6.3262cqw] m-0 whitespace-nowrap font-extrabold font-sans text-[2.7763cqw] text-foreground uppercase leading-[1.0268] tracking-[-0.03em] max-xl:static max-xl:whitespace-normal max-xl:text-[clamp(40px,7.4vw,96px)] max-xl:leading-none">
						Full throttle living
					</h2>
				</div>
			</div>

			<div className="spreads @container relative bg-background text-foreground max-xl:px-5 md:max-xl:px-12">
				<div className="spreads-run relative">
					<span
						className="spreads-margin absolute top-0 left-[3.6242cqw] h-full w-[1.5px] bg-foreground/40 max-xl:hidden"
						aria-hidden="true"
					/>

					<section
						id="about"
						className={SPREAD}
						aria-label="003: Full throttle living"
					>
						<div className={SPREAD_BODY}>
							<p className={`spread-intro ${SPREAD_INTRO}`}>
								Five formats run the season: the Apr 7 Annual Desert Drive, open
								track days, morning runs up Jebel Jais, night meets across
								Dubai, and club socials.
							</p>
							<ol className="formats mt-[3.4cqw] list-none border-foreground/[0.41] border-t-[1.5px] p-0 max-xl:mt-6">
								{RUN_FORMATS.map((format) => (
									<li key={format.index} className={`format-row ${FORMAT_ROW}`}>
										<span
											className={`fmt-index ${FMT_INDEX}`}
											aria-hidden="true"
										>
											{format.index}
										</span>
										<span className={`fmt-name ${FMT_NAME}`}>
											{format.name}
										</span>
										<span className={`fmt-detail ${FMT_DETAIL}`}>
											{format.detail}
										</span>
									</li>
								))}
							</ol>
						</div>
					</section>

					<section className={SPREAD} aria-label="004: Club record">
						<span className={HAIR_SPREAD} aria-hidden="true" />
						<p className={`spread-kicker ${KICKER}`}>
							004 /
							<br />
							The record
						</p>
						<div className={SPREAD_BODY}>
							<dl className="record m-0 grid grid-cols-4 max-xl:grid-cols-2 max-xl:gap-y-8 md:max-xl:grid-cols-4">
								{RECORD.map((entry, i) => (
									<div
										key={entry.label}
										className={`rec-col flex flex-col-reverse pl-[2cqw] max-xl:pl-0 md:max-xl:pl-6 ${i > 0 ? "border-foreground/28 border-l-[1.5px] max-xl:border-l-0 md:max-xl:border-l-[1.5px]" : ""}`}
									>
										<dt
											className={`rec-label mb-[1.1cqw] text-on-surface-muted max-xl:mb-2 ${LABEL_SM} ${LABEL}`}
										>
											{entry.label}
										</dt>
										<dd className="rec-value m-0 font-extrabold font-sans text-[5.1067cqw] leading-[0.95] tracking-[-0.02em] max-xl:text-[clamp(44px,10vw,72px)]">
											{/* The Founded entry carries no suffix key, hence the `in` check. */}
											<RecordValue
												value={entry.value}
												suffix={"suffix" in entry ? entry.suffix : undefined}
												index={i}
											/>
										</dd>
									</div>
								))}
							</dl>
						</div>
					</section>

					<UpcomingEvent />

					<Sponsors />

					<section id="perks" className={SPREAD} aria-label="007: Member perks">
						<span className={HAIR_SPREAD} aria-hidden="true" />
						<p className={`spread-kicker ${KICKER}`}>
							007 /
							<br />
							Member perks
						</p>
						<div className={SPREAD_BODY}>
							<p className={`spread-intro ${SPREAD_INTRO}`}>
								Four things run with the membership: the roll, the season
								calendar, the tracks, and the club issue.
							</p>
							<ol className="formats mt-[3.4cqw] list-none border-foreground/[0.41] border-t-[1.5px] p-0 max-xl:mt-6">
								{MEMBER_PERKS.map((perk) => (
									<li key={perk.index} className={`format-row ${FORMAT_ROW}`}>
										<span
											className={`fmt-index ${FMT_INDEX}`}
											aria-hidden="true"
										>
											{perk.index}
										</span>
										<span className={`fmt-name ${FMT_NAME}`}>{perk.name}</span>
										<span className={`fmt-detail ${FMT_DETAIL}`}>
											{perk.detail}
										</span>
									</li>
								))}
							</ol>
						</div>
					</section>
				</div>

				<section
					id="contact"
					className="spread relative p-0"
					aria-label="Join the club"
				>
					<Link
						className={`join-band group/cta relative flex min-h-[16cqw] items-end justify-between gap-[2cqw] bg-primary pt-[5cqw] pr-[3.6242cqw] pb-[3.2cqw] pl-[20.7317cqw] text-primary-foreground no-underline ${FOCUS_RING} max-xl:min-h-0 max-xl:flex-col max-xl:items-start max-xl:gap-5 max-xl:p-10 md:max-xl:p-16`}
						href={JOIN_URL as Route}
					>
						<span className="join-band-label font-extrabold font-sans text-[4.534cqw] uppercase leading-[0.95] transition-opacity group-hover/cta:opacity-85 max-xl:text-[clamp(40px,11vw,72px)]">
							Join the club
						</span>
						<span
							className={`join-band-note pb-[0.7cqw] max-xl:pb-0 ${LABEL_SM} ${LABEL}`}
						>
							By form · Season 2026
						</span>
					</Link>
				</section>
			</div>

			<PageMotion />
		</main>
	);
}
