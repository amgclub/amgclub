"use client";

import { useGSAP } from "@gsap/react";
import NumberFlow, {
	continuous,
	type NumberFlowElement,
} from "@number-flow/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useState } from "react";

type RecordValueProps = {
	value: number;
	suffix?: string;
	/** Position in the record list, so the roll matches the row stagger. */
	index: number;
};

export function RecordValue({ value, suffix, index }: RecordValueProps) {
	// Hydration has to see the final figure — the server HTML renders it and
	// the client's first render must match — so the rewind to 0 lives in the
	// useGSAP layout effect below, which runs before paint and never flashes
	// the finished number.
	const [display, setDisplay] = useState(value);
	const flow = useRef<NumberFlowElement>(null);

	useGSAP(
		() => {
			gsap.registerPlugin(ScrollTrigger);

			const mm = gsap.matchMedia();
			mm.add("(prefers-reduced-motion: no-preference)", () => {
				// Same trigger and config as the reveal in page-motion.tsx, so the
				// roll replays with the row fade each time the spread re-enters.
				const spread = flow.current?.closest(".spread");
				// No spread means no shared reveal trigger; leave the figure at
				// its value rather than rewinding it with nothing to play it.
				if (!spread) return;

				// useGSAP is a layout effect: this re-render to 0 commits before
				// the first paint, so the number never shows its final value.
				setDisplay(0);

				const ctx = gsap.context(() => {
					const counter = { n: 0 };
					const tl = gsap.timeline({
						scrollTrigger: {
							trigger: spread,
							start: "top bottom-=40",
							toggleActions: "play reset play reset",
						},
					});

					tl.to(
						counter,
						{
							n: value,
							duration: 1.1,
							ease: "power2.out",
							onUpdate: () => setDisplay(Math.round(counter.n)),
						},
						0.2 + index * 0.07,
					);
				});

				return () => {
					ctx.revert();
				};
			});

			return () => mm.revert();
		},
		{ dependencies: [] },
	);

	return (
		<NumberFlow
			ref={flow}
			value={display}
			suffix={suffix}
			plugins={[continuous]}
			format={{ useGrouping: false }}
		/>
	);
}
