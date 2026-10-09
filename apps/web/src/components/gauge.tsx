"use client";

import type { GaugeTransition } from "@amgclub/ui/components/gauge";
import {
	Gauge,
	GaugeArc,
	GaugeHub,
	GaugeInset,
	GaugeNeedle,
	GaugeText,
	GaugeTickLabels,
	GaugeTicks,
	GaugeTrack,
	GaugeValue,
	GaugeZones,
} from "@amgclub/ui/components/gauge";
import { useEffect, useState } from "react";

const zones = [
	{ to: 180, color: "var(--color-muted)" },
	{ to: 240, color: "var(--color-primary)" },
];

const MAIN_MIN = 0;
const MAIN_MAX = 240;

const SPRING: GaugeTransition = {
	type: "spring",
	visualDuration: 0.5,
	bounce: 0.1,
};

export type GaugeMode = "manual" | "sweep" | "wander" | "jump";

const nextTarget = (
	mode: Exclude<GaugeMode, "manual">,
	base: number,
	previous: number,
	min: number,
	max: number,
	amplitude: number,
) => {
	const range = max - min;
	if (mode === "sweep") return previous === max ? min : max;
	if (mode === "jump") return min + Math.random() * range;
	return Math.min(
		max,
		Math.max(min, base + (2 * Math.random() - 1) * amplitude * range),
	);
};

export function CustomGauge({
	value = 100,
	fuel = 50,
	mode = "manual",
	period = 3,
	amplitude = 0.25,
}: {
	value?: number;
	fuel?: number;
	mode?: GaugeMode;
	period?: number;
	amplitude?: number;
}) {
	const [main, setMain] = useState(value);

	useEffect(() => {
		if (mode === "manual") {
			setMain(value);
			return;
		}
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		const tick = () =>
			setMain((previous) =>
				nextTarget(mode, value, previous, MAIN_MIN, MAIN_MAX, amplitude),
			);

		const first = window.setTimeout(tick, 0);
		const loop = window.setInterval(tick, period * 1000);
		return () => {
			window.clearTimeout(first);
			window.clearInterval(loop);
		};
	}, [mode, period, amplitude, value]);

	const transition: GaugeTransition =
		mode === "manual" || mode === "jump"
			? SPRING
			: { type: "tween", duration: period, ease: "easeInOut" };

	return (
		<Gauge
			value={main}
			min={MAIN_MIN}
			max={MAIN_MAX}
			startAngle={40}
			endAngle={320}
			radius={200}
			padding={56}
			transition={transition}
			initialValue={mode === "manual" ? undefined : 0}
		>
			<GaugeZones
				zones={zones}
				width={8}
				offset={0}
				gap={0}
				cap="butt"
				opacity={1}
			/>
			<GaugeTicks
				count={48}
				length={8}
				width={1.5}
				color="var(--color-muted-foreground)"
				offset={-12}
				cap="butt"
				opacity={0.6}
			/>
			<GaugeTicks
				count={12}
				length={18}
				width={3}
				color="var(--color-foreground)"
				offset={-16}
				cap="butt"
				opacity={1}
			/>
			<GaugeTickLabels
				count={12}
				offset={-54}
				fontSize={20}
				color="var(--color-foreground)"
				font="sans"
				weight="semibold"
				decimals={0}
			/>
			<GaugeNeedle
				style="pointer"
				length={0.85}
				width={10}
				color="var(--color-foreground)"
				tail={32}
			/>
			<GaugeHub radius={12} color="var(--color-foreground)" />
			<GaugeValue
				x={0}
				y={56}
				fontSize={40}
				color="var(--color-foreground)"
				font="mono"
				weight="semibold"
				decimals={0}
			/>
			<GaugeText
				x={0}
				y={88}
				fontSize={16}
				color="var(--color-muted-foreground)"
				font="sans"
				weight="medium"
			>
				km/h
			</GaugeText>
			<GaugeInset
				x={0}
				y={0}
				scale={1}
				value={fuel}
				min={0}
				max={100}
				startAngle={326}
				endAngle={394}
				transition={SPRING}
			>
				<GaugeTrack
					width={8}
					color="var(--color-muted)"
					opacity={1}
					cap="butt"
					offset={0}
				/>
				<GaugeArc
					width={8}
					color="var(--color-muted-foreground)"
					opacity={1}
					cap="butt"
					offset={0}
					reverse
				/>
				<GaugeTicks
					count={4}
					length={10}
					width={2}
					color="var(--color-muted-foreground)"
					offset={-12}
					cap="butt"
					opacity={1}
				/>
				<GaugeText
					x={-128}
					y={188}
					fontSize={20}
					color="var(--color-muted-foreground)"
					font="sans"
					weight="semibold"
				>
					E
				</GaugeText>
				<GaugeText
					x={128}
					y={188}
					fontSize={20}
					color="var(--color-muted-foreground)"
					font="sans"
					weight="semibold"
				>
					F
				</GaugeText>
			</GaugeInset>
		</Gauge>
	);
}
