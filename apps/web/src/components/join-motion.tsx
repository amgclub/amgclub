"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export type JoinPhase = "idle" | "submitting" | "success" | "error";

/**
 * The two choreographed moments on `/members-join`: the submitting overlay that
 * covers the form, and the result panel that replaces it.
 *
 * Everything is inside one `gsap.matchMedia()` query so a visitor with
 * `prefers-reduced-motion: reduce` gets the finished state with no motion at
 * all. Start values are never written to CSS for that reason: if the query does
 * not match, nothing runs and every element keeps its own readable default.
 */
export function JoinMotion({ phase }: { phase: JoinPhase }) {
	useGSAP(
		() => {
			const root = document.body;

			gsap.registerPlugin(ScrollTrigger);

			// Swapping the form for the result panel changes the document height by
			// most of a viewport, which leaves every `start` position calculated for
			// the old layout. Without a refresh the spreads below sit at their
			// pre-reveal state (invisible) with no scroll left to trigger them.
			ScrollTrigger.refresh();

			const mm = gsap.matchMedia();
			mm.add("(prefers-reduced-motion: no-preference)", () => {
				const ctx = gsap.context(() => {
					if (phase === "submitting") {
						const overlay = root.querySelector<HTMLElement>(".join-overlay");

						if (overlay) {
							gsap.fromTo(
								overlay,
								{ opacity: 0 },
								{ opacity: 1, duration: 0.26, ease: "power2.out" },
							);

							// The stripe mark breathes under the copy: a slow two-way
							// fade, never a scale pulse, so the red never appears to move.
							const stripes = root.querySelector<HTMLElement>(
								".join-overlay-stripes",
							);
							if (stripes) {
								gsap.to(stripes, {
									opacity: 0.34,
									duration: 0.95,
									ease: "sine.inOut",
									repeat: -1,
									yoyo: true,
									delay: 0.2,
								});
							}

							// Each line rides up from behind its own clip edge rather than
							// fading in place, which is what makes the overlay read as
							// printed type arriving rather than a block appearing.
							gsap.from(".join-ov-line", {
								yPercent: 108,
								duration: 0.72,
								stagger: 0.13,
								ease: "power3.out",
								delay: 0.12,
							});
							gsap.from(".join-ov-meta", {
								opacity: 0,
								y: 12,
								duration: 0.45,
								ease: "power2.out",
								delay: 0.52,
							});
						}
					}

					if (phase === "success" || phase === "error") {
						gsap.from(".join-result", {
							y: 26,
							opacity: 0,
							duration: 0.55,
							ease: "power3.out",
						});

						const medallion =
							root.querySelector<HTMLElement>(".join-medallion");
						if (medallion) {
							gsap.from(medallion, {
								scale: 0.62,
								opacity: 0,
								duration: 0.6,
								ease: "back.out(1.7)",
							});
						}

						// `pathLength="1"` on the marks normalises both the tick and the
						// cross to a single dash unit, so the same 1 → 0 draw works
						// whatever the path's real length is.
						const marks =
							root.querySelectorAll<SVGGeometryElement>(".join-mark-path");
						if (marks.length > 0) {
							gsap.set(marks, { strokeDasharray: 1, strokeDashoffset: 1 });
							gsap.to(marks, {
								strokeDashoffset: 0,
								duration: 0.5,
								stagger: 0.14,
								ease: "power2.inOut",
								delay: 0.28,
							});
						}

						gsap.from(".join-result-line", {
							yPercent: 108,
							duration: 0.66,
							stagger: 0.1,
							ease: "power3.out",
							delay: 0.22,
						});
						gsap.from(".join-result-body", {
							y: 16,
							opacity: 0,
							duration: 0.5,
							stagger: 0.09,
							ease: "power3.out",
							delay: 0.44,
						});
					}
				}, root);

				return () => {
					ctx.revert();
				};
			});

			return () => mm.revert();
		},
		{ dependencies: [phase] },
	);

	return null;
}
