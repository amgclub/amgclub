"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function PageMotion() {
	useGSAP(
		() => {
			// Scoped to <body>, not <main>: the shared header lives outside main
			// but its entrance (hairline draw, issue/nav/cta fade) is part of the
			// same opening timeline.
			const root = document.body;
			if (!root) return;

			gsap.registerPlugin(ScrollTrigger);

			const mm = gsap.matchMedia();
			mm.add("(prefers-reduced-motion: no-preference)", () => {
				const ctx = gsap.context(() => {
					const draw = {
						scaleX: 0,
						transformOrigin: "left center",
						ease: "power2.inOut",
					};

					const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

					// Skips targets this page doesn't have, so shared pages stay warning-free.
					const from = (targets: string, vars: gsap.TweenVars, pos: number) => {
						const els = gsap.utils.toArray(targets, root);
						if (els.length > 0) tl.from(els, vars, pos);
					};

					from(".hair-masthead", { ...draw, duration: 0.7 }, 0.1);
					from(
						".r-cover-photo img",
						{ scale: 1.05, duration: 1.2, ease: "power2.out" },
						0,
					);
					tl.fromTo(
						".t-issue, .masthead-nav a, .t-mcta, .mcta-mark",
						{ opacity: 0 },
						{ opacity: 1, duration: 0.4, stagger: 0.08 },
						0.3,
					);
					from(".h1", { y: 36, opacity: 0, duration: 0.7 }, 0.3);
					from(".red-rule", { ...draw, duration: 0.6 }, 0.6);
					from(
						".t-kicker, .r-deck-left .deck, .r-deck-right .deck, .cta-join",
						{
							y: 16,
							opacity: 0,
							duration: 0.5,
							stagger: 0.09,
						},
						0.55,
					);
					from(".hair-next", { ...draw, duration: 0.6 }, 0.9);
					from(".t-num", { y: 14, opacity: 0, duration: 0.5 }, 1);
					from(".t-head", { y: 24, opacity: 0, duration: 0.6 }, 1.05);

					gsap.utils.toArray<HTMLElement>(".spread").forEach((spread) => {
						const hair = spread.querySelector(".hair-spread");
						const kicker = spread.querySelector(".spread-kicker");
						const rows = spread.querySelectorAll(
							".spread-intro, .format-row, .rec-col, .spread-photo, .season-row, .join-band-label, .join-band-note, .statement",
						);

						// `play reset play reset` re-runs the reveal from the start every
						// time the spread enters the viewport (downwards or back up) and
						// rewinds it to its pre-animation state whenever it leaves again,
						// so no `once` and no half-played spread left behind.
						const tl = gsap.timeline({
							scrollTrigger: {
								trigger: spread,
								start: "top bottom-=40",
								toggleActions: "play reset play reset",
							},
						});
						if (hair) {
							tl.fromTo(
								hair,
								{ scaleX: 0 },
								{ ...draw, scaleX: 1, duration: 0.6 },
								0,
							);
						}
						if (kicker) {
							tl.fromTo(
								kicker,
								{ y: 12, opacity: 0 },
								{ y: 0, opacity: 1, duration: 0.45 },
								0.15,
							);
						}
						if (rows.length > 0) {
							tl.fromTo(
								rows,
								{ y: 22, opacity: 0 },
								{
									y: 0,
									opacity: 1,
									duration: 0.55,
									stagger: 0.07,
									ease: "power3.out",
								},
								0.2,
							);
						}
					});

					// The spread photo is an <img> from first paint (the upcoming
					// event falls back to a still while its data loads), so a single
					// lookup is enough and the node is never replaced.
					const photo =
						root.querySelector<HTMLImageElement>(".spread-photo img");
					if (photo) {
						gsap.set(photo, { scale: 1.12 });
						gsap.fromTo(
							photo,
							{ yPercent: -5 },
							{
								yPercent: 5,
								ease: "none",
								scrollTrigger: {
									trigger: photo.parentElement ?? photo,
									start: "top bottom",
									end: "bottom top",
									scrub: 0.6,
								},
							},
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
