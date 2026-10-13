import type { Route } from "next";
import Link from "next/link";
import { CustomGauge } from "@/components/gauge";
import { GaugeReveal } from "@/components/gauge-reveal";
import { PageMotion } from "@/components/page-motion";
import { Year } from "@/components/year";
import { DECK_LEFT, DECK_RIGHT, JOIN_URL } from "@/lib/data";
import {
	FOCUS_RING,
	HAIR_SPREAD,
	KICKER,
	LABEL,
	LABEL_SM,
	SPREAD,
	SPREAD_BODY,
	SPREAD_INTRO,
} from "@/lib/styles";

const HEADING =
	"m-0 font-extrabold font-sans uppercase leading-[0.86] tracking-[-0.03em] text-foreground text-[clamp(3.5rem,6.4cqw,10.5rem)] max-xl:text-[clamp(46px,8.6vw,116px)] max-xl:leading-[0.9] max-xl:tracking-normal";

const DECK_BASE =
	"mt-4 max-w-[46cqw] font-normal font-sans text-[0.8125rem] uppercase text-on-surface-muted max-xl:mt-4 max-xl:max-w-none max-xl:text-body-sm";

const STATEMENT =
	"statement font-extrabold font-sans text-[clamp(44px,8.6cqw,150px)] uppercase leading-[0.86] tracking-[-0.03em] max-xl:text-[clamp(40px,11vw,88px)]";

const STATEMENT_BODY = "pl-[5.1448cqw] pr-[3.6242cqw] max-xl:pl-0 max-xl:pr-0";

// The hero deck opens this page and its second sentence leads the Redline
// spread, so each half is used once rather than the string twice.
const DECK_OPENER = DECK_LEFT.slice(0, DECK_LEFT.indexOf(". ") + 1);

// The kicker is a heading here, so it carries the heading reset as well as
// the marginalia styling the <p> pattern takes for free.
const KICKER_H = `spread-kicker m-0 ${KICKER}`;

// Deck copy set as the spread's lead: the sentence opens mid-case in data.ts,
// so the first letter is lifted rather than the string rewritten.
const WHO_INTRO = `${SPREAD_INTRO} first-letter:uppercase`;

const WHO_GRID =
	"grid grid-cols-2 gap-x-[4cqw] gap-y-[1.5cqw] max-xl:grid-cols-1 max-xl:gap-4";

const REDLINE_GRID =
	"grid max-xl:grid-cols-1 max-xl:gap-y-8 xl:grid-cols-[minmax(0,1fr)_34cqw] xl:gap-x-[4cqw]";

const REDLINE_INTRO =
	"We meet, we drive, and we take the cars properly: morning runs to Jebel Jais, track days, night meets in Dubai.";

export default function AboutPage() {
	return (
		<main className="flex flex-1 flex-col">
			<div className="@container relative bg-background text-foreground max-xl:px-5 md:max-xl:px-12">
				<span
					className="absolute top-0 left-[3.6242cqw] h-full w-px bg-foreground/[0.41] max-xl:hidden"
					aria-hidden="true"
				/>

				<header className="relative pt-[2.2cqw] pb-[1.2cqw] max-xl:pt-6 max-xl:pb-6">
					<span
						className="hair-masthead block h-px w-full bg-foreground/[0.41]"
						aria-hidden="true"
					/>
					<div className={SPREAD_BODY}>
						<div className="flex items-baseline justify-between gap-4 py-[1.1cqw] max-xl:py-4">
							<span className="t-issue font-medium font-sans text-[0.9223cqw] text-primary-60 uppercase leading-none max-xl:text-[clamp(10px,1.6vw,12px)]">
								Season <Year /> · About
							</span>
						</div>

						<h1 className={`h1 ${HEADING}`}>
							Born from <span className="text-primary">Passion</span>
						</h1>
						<span
							className="red-rule mt-3 block h-px w-24 bg-primary"
							aria-hidden="true"
						/>
						<p className={DECK_BASE}>{DECK_OPENER}</p>
					</div>
				</header>

				<section className={SPREAD} aria-label="001: Who we are">
					<span className={HAIR_SPREAD} aria-hidden="true" />
					<h2 className={KICKER_H}>
						001 /
						<br />
						Who we are
					</h2>

					<div className={SPREAD_BODY}>
						<div className={WHO_GRID}>
							<p className={`spread-intro ${WHO_INTRO}`}>{DECK_LEFT}</p>
							<p className={`spread-intro ${WHO_INTRO}`}>{DECK_RIGHT}</p>
							<p className={`spread-intro ${WHO_INTRO}`}>
								Five formats run the season. The Annual Desert Drive opens the
								calendar on April 7, followed by open track days across 20+
								tracks, morning runs up Jebel Jais, night meets across Dubai,
								and club socials year-round. We meet, we drive, and we take the
								cars properly, and between the five formats a season comes to
								100+ events across the UAE. There is rarely a long wait between
								one drive and the next. Pick one format or all five; new members
								join by form.
							</p>
							{/* <AboutPattern /> */}
						</div>
					</div>
				</section>

				<section className={SPREAD} aria-label="002: Redline">
					<span className={HAIR_SPREAD} aria-hidden="true" />
					<h2 className={KICKER_H}>
						002 /
						<br />
						Redline
					</h2>
					<div className={SPREAD_BODY}>
						<div className={REDLINE_GRID}>
							<p className={`spread-intro ${SPREAD_INTRO}`}>{REDLINE_INTRO}</p>
						</div>
					</div>
					<div className={`${STATEMENT_BODY} mt-[7cqw] max-xl:mt-10`}>
						<p className={STATEMENT}>
							We meet.
							<br />
							<span className="text-primary">We drive.</span>
						</p>
					</div>
					<div className="absolute top-0 right-0 w-120 -translate-y-1/2 bg-black max-xl:w-40">
						<GaugeReveal>
							<CustomGauge mode="wander" />
						</GaugeReveal>
					</div>
				</section>

				<section className="spread relative p-0" aria-label="Join the club">
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
							By form · Season <Year />
						</span>
					</Link>
				</section>
			</div>

			<PageMotion />
		</main>
	);
}
