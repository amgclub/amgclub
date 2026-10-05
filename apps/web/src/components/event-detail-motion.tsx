"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function EventDetailMotion() {
	useGSAP(
		() => {
			const root = document.body;
			if (!root) return;

			gsap.registerPlugin(ScrollTrigger);

			const mm = gsap.matchMedia();
			mm.add("(prefers-reduced-motion: no-preference)", () => {
				const ctx = gsap.context(() => {
					// The meta line (date, time, venue, price) joins the opening
					// sequence a beat behind the masthead, so the header block reads
					// as one entrance instead of a headline followed by stray text.
					gsap
						.timeline({ defaults: { ease: "power3.out" } })
						.from(".detail-meta", { y: 16, opacity: 0, duration: 0.5 }, 0.55);

					const rail = root.querySelector<HTMLElement>(".detail-rail");
					const railItems = root.querySelectorAll<HTMLElement>(
						".detail-rail > * > *",
					);

					// The rail reveals as a staggered unit when it enters the viewport
					// so the conversion column never sits on screen as a dead block.
					// `play reset` mirrors PageMotion: replay on entry, rewind on exit.
					if (rail && railItems.length > 0) {
						gsap
							.timeline({
								scrollTrigger: {
									trigger: rail,
									start: "top bottom-=40",
									toggleActions: "play reset play reset",
								},
							})
							.fromTo(
								railItems,
								{ y: 18, opacity: 0 },
								{
									y: 0,
									opacity: 1,
									duration: 0.5,
									stagger: 0.08,
									ease: "power3.out",
								},
								0.2,
							);
					}
				}, root);

				return () => {
					ctx.revert();
				};
			});

			return () => mm.revert();
		},
		{ dependencies: [] },
	);

	return null;
}
