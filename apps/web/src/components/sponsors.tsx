import { LogoMarquee } from "@amgclub/ui/components/smoothui/logo-cloud-3";
import {
	HAIR_SPREAD,
	KICKER,
	SPREAD,
	SPREAD_BODY,
	SPREAD_INTRO,
} from "@/lib/styles";

const SPONSORS = [
	{
		name: "Goodyear",
		src: "/brands/Goodyear_Tires_Logo_0.svg",
		w: 176,
		h: 30,
		size: "h-[42px] md:h-[56px]",
	},
	{
		name: "Michelin",
		src: "/brands/Michelin_Logo_0.svg",
		w: 198,
		h: 36,
		size: "h-[42px] md:h-[56px]",
	},
	{
		name: "Continental",
		src: "/brands/continental-logo.svg",
		w: 218,
		h: 40,
		size: "h-[42px] md:h-[56px]",
	},
	{
		name: "Yas Marina Circuit",
		src: "/brands/Yas_Marina_Circuit_idRI7iPH2__1.svg",
		w: 1398,
		h: 136,
		size: "h-[24px] md:h-[32px]",
	},
	{
		name: "Experience Abu Dhabi",
		src: "/brands/abu-dhabi-exp.svg",
		w: 600,
		h: 240,
		size: "h-[52px] md:h-[72px]",
	},
];

const MARQUEE_RESET =
	"[&>section]:py-0 [&>section>div]:mx-0 [&>section>div]:max-w-none [&>section>div]:px-0 [&>section>div>div:first-child]:hidden [&>section>div>div:last-child>div>div]:opacity-90";

export default function Sponsors() {
	return (
		<section className={SPREAD} aria-label="006: Brand sponsors">
			<span className={HAIR_SPREAD} aria-hidden="true" />
			<p className={`spread-kicker ${KICKER}`}>
				006 /
				<br />
				Brands
			</p>
			<div className={SPREAD_BODY}>
				<h2 className="m-0 font-extrabold font-sans text-[2.7763cqw] text-foreground uppercase leading-[1.0268] tracking-[-0.03em] max-xl:text-[clamp(40px,7.4vw,96px)] max-xl:leading-none">
					In good company
				</h2>
				<p className={`spread-intro mt-[1.6cqw] max-xl:mt-4 ${SPREAD_INTRO}`}>
					The brands that roll with the club, season after season.
				</p>

				<div className={`mt-[3.4cqw] max-xl:mt-6 ${MARQUEE_RESET}`}>
					<LogoMarquee
						title=""
						description=""
						speed="slow"
						pauseOnHover={false}
						logos={SPONSORS.map((sponsor) => ({
							name: sponsor.name,
							logo: (
								<img
									className={`w-auto object-contain grayscale ${sponsor.size}`}
									src={sponsor.src}
									alt={sponsor.name}
									width={sponsor.w}
									height={sponsor.h}
									loading="lazy"
								/>
							),
						}))}
					/>
				</div>
			</div>
		</section>
	);
}
