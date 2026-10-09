export {
	GaugeArc,
	type GaugeArcProps,
	GaugeStack,
	type GaugeStackPart,
	type GaugeStackProps,
	GaugeTrack,
	GaugeZones,
	type GaugeZonesProps,
} from "./arcs";
export {
	type GaugeContextValue,
	type GaugeDomainProps,
	useGauge,
} from "./context";
export { GaugeControl, type GaugeControlProps } from "./control";
export { GaugeDot, type GaugeDotProps } from "./dot";
export { Gauge, type GaugeFit, type GaugeProps } from "./gauge";
export { GaugeInset, type GaugeInsetProps } from "./inset";
export {
	angleToValue,
	arcBox,
	arcPath,
	clamp,
	cutValues,
	degreesToRadians,
	polar,
	stepValues,
	valueToAngle,
	valueToTurnedAngle,
} from "./math";
export {
	GaugeHub,
	type GaugeHubProps,
	GaugeNeedle,
	type GaugeNeedleProps,
} from "./needle";
export {
	GaugeText,
	type GaugeTextProps,
	GaugeValue,
	type GaugeValueProps,
} from "./text";
export {
	GaugeMarks,
	type GaugeMarksProps,
	GaugeTickLabels,
	type GaugeTickLabelsProps,
	GaugeTicks,
	type GaugeTicksProps,
} from "./ticks";
export {
	GaugeTooltip,
	type GaugeTooltipPosition,
	type GaugeTooltipProps,
	type GaugeTooltipSide,
} from "./tooltip";
export {
	cubicBezier,
	DEFAULT_TRANSITION,
	easingFunction,
	type GaugeEasing,
	type GaugeSpringTransition,
	type GaugeTransition,
	type GaugeTweenTransition,
	resolveTransition,
	springPhysics,
	stepSpring,
} from "./transition";
export { useAnimatedValue } from "./use-animated-value";
export {
	clockLabel,
	clockTime,
	compassLabel,
	durationLabel,
	type FontFamily,
	type FontWeight,
	fadeColor,
	fontClass,
	type NeedleStyle,
	type StrokeCap,
	type TextAnchor,
	weightClass,
	type Zone,
	zoneColor,
	zoneCutoffs,
} from "./utils";
