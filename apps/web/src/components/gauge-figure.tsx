"use client";

import {
	Gauge,
	GaugeHub,
	GaugeNeedle,
	GaugeText,
	GaugeTickLabels,
	GaugeTicks,
	GaugeValue,
	GaugeZones,
} from "@amgclub/ui/components/gauge";
import { useEffect, useRef, useState } from "react";

const MAX = 240;
const REDLINE = 200;

const RADIUS = 160;
const RING = 18;

// The --color-* aliases: the bare --muted / --primary tokens hold oklch
// components, not colours, and would not resolve as a stroke.
const ZONES = [
	{ to: REDLINE, color: "var(--color-muted)" },
	{ to: MAX, color: "var(--color-primary)" },
];

export function GaugeFigure() {
	const hostRef = useRef<HTMLDivElement>(null);
	const [value, setValue] = useState(0);

	// The sweep runs once, on first sight of the section: the dial stays at 0
	// while it is offscreen and the observer is gone after it fires.
	useEffect(() => {
		const host = hostRef.current;
		if (!host) return;
		if (typeof IntersectionObserver === "undefined") {
			setValue(MAX);
			return;
		}
		const observer = new IntersectionObserver(
			(entries) => {
				if (!entries.some((entry) => entry.isIntersecting)) return;
				setValue(MAX);
				observer.disconnect();
			},
			{ threshold: 0.35 },
		);
		observer.observe(host);
		return () => observer.disconnect();
	}, []);

	return (
		<div ref={hostRef} className="w-full min-w-0">
			<Gauge
				value={value}
				min={0}
				max={MAX}
				startAngle={40}
				endAngle={320}
				radius={RADIUS}
				padding={76}
				fit="content"
				transition={{ type: "spring", visualDuration: 0.9, bounce: 0.08 }}
				className="text-foreground"
				aria-hidden="true"
			>
				<GaugeZones zones={ZONES} width={RING} />
				<GaugeTicks
					count={48}
					length={10}
					width={1.5}
					color="var(--color-muted-foreground)"
					opacity={0.6}
					offset={21}
					cap="butt"
				/>
				<GaugeTicks count={6} length={24} width={3} offset={27} cap="butt" />
				<GaugeTickLabels
					count={6}
					offset={56}
					fontSize={18}
					weight="semibold"
					decimals={0}
				/>
				<GaugeNeedle
					style="pointer"
					length={0.85}
					width={10}
					tail={26}
					tailColor="var(--color-muted-foreground)"
				/>
				<GaugeHub radius={10} />
				<GaugeValue y={104} fontSize={56} decimals={0} />
				<GaugeText
					y={150}
					fontSize={17}
					weight="medium"
					color="var(--color-on-surface-muted)"
				>
					km/h
				</GaugeText>
			</Gauge>
		</div>
	);
}
