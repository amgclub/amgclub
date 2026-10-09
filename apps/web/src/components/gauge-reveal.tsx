"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type ReactNode, useRef } from "react";

export function GaugeReveal({ children }: { children: ReactNode }) {
	const ref = useRef<HTMLDivElement>(null);

	useGSAP(
		() => {
			gsap.registerPlugin(ScrollTrigger);

			const mm = gsap.matchMedia();
			mm.add("(prefers-reduced-motion: no-preference)", () => {
				const ctx = gsap.context(() => {
					const el = ref.current;
					if (!el) return;
					const h = el.offsetHeight || 1;
					const hold = Math.max(window.innerHeight - h, 0);
					const tl = gsap.timeline({
						scrollTrigger: {
							trigger: el,
							start: "top bottom",
							end: "bottom top",
							scrub: 0.4,
						},
					});
					tl.fromTo(
						el,
						{ opacity: 0 },
						{ opacity: 1, duration: h, ease: "none" },
					)
						.to(el, { opacity: 1, duration: hold, ease: "none" })
						.to(el, { opacity: 0, duration: h, ease: "none" });
				}, ref);
				return () => ctx.revert();
			});
			return () => mm.revert();
		},
		{ dependencies: [] },
	);

	return <div ref={ref}>{children}</div>;
}
