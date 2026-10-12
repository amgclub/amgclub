"use client";

import NumberFlow from "@number-flow/react";
import { MinusIcon, PlusIcon } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import { FOCUS_RING } from "@/lib/styles";

const SHELL =
	"flex w-fit shrink-0 items-stretch border-[1.5px] border-foreground/[0.41]";

const STEP_BTN = `flex size-11 cursor-pointer select-none items-center justify-center border-foreground/[0.41] text-foreground transition-colors hover:text-primary-60 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-foreground ${FOCUS_RING}`;

const STEP_BTN_FIRST = `${STEP_BTN} border-r-[1.5px]`;
const STEP_BTN_LAST = `${STEP_BTN} border-l-[1.5px]`;

// The field is one cell the input and the digits both occupy, so the value can be
// typed as well as stepped without the box changing width as the number grows.
const FIELD =
	"relative grid w-12 items-center justify-items-center text-center [grid-template-areas:'overlap'] *:[grid-area:overlap]";

// Transparent text on purpose: the input owns the value and the caret for
// screen readers and typing, and the NumberFlow digits are what a sighted user
// actually sees. Kerning is off to match how NumberFlow sets its own digits, so
// the caret lands where the glyph is rather than next to it. The two vendor
// spin-button resets are the `spin-hide` rule the NumberFlow docs use, inlined
// here so the input needs no global utility. FOCUS_RING rather than a bare
// outline reset: the field is the one control a keyboard user lands on first
// here, so it cannot be the one with no visible focus.
const INPUT = `h-full w-full appearance-none bg-transparent p-0 text-center font-medium font-sans text-label-lg text-transparent [appearance:textfield] [font-variant-numeric:tabular-nums] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${FOCUS_RING}`;

const DIGITS = "pointer-events-none font-medium font-sans text-label-lg";

type QuantityInputProps = {
	value: number;
	onChange: (value: number) => void;
	/** Defaults to 1: nothing in the shop or the cart can be ordered in zero. */
	min?: number;
	max?: number;
	/** Both pages word these per context ("...of Frappe Racing"), so they pass them in. */
	decreaseLabel: string;
	increaseLabel: string;
};

export function QuantityInput({
	value,
	onChange,
	min = 1,
	max = Number.POSITIVE_INFINITY,
	decreaseLabel,
	increaseLabel,
}: QuantityInputProps) {
	// Where an emptied field falls back to. The mount-time value, not `min`, so
	// clearing the field never quietly decrements the quantity.
	const fallback = useRef(value);

	// Typed digits should land as typed. Only a step gets the roll.
	const [animated, setAnimated] = useState(true);
	// The caret shares the line with digits that are mid-transition.
	const [showCaret, setShowCaret] = useState(true);

	function handleChange(event: ChangeEvent<HTMLInputElement>) {
		const el = event.currentTarget;
		setAnimated(false);

		let next = value;
		if (el.value === "") {
			next = fallback.current;
		} else {
			const num = el.valueAsNumber;
			if (!Number.isNaN(num) && num >= min && num <= max)
				next = Math.floor(num);
		}

		// Written back by hand because a rejected entry ("09", "300", "") leaves
		// the DOM holding text React will never re-render, since the value prop
		// did not move.
		el.value = String(next);
		onChange(next);
	}

	function step(diff: number) {
		setAnimated(true);
		const next = Math.min(Math.max(value + diff, min), max);
		if (next !== value) onChange(next);
	}

	return (
		<div className={SHELL}>
			<button
				type="button"
				className={STEP_BTN_FIRST}
				onClick={() => step(-1)}
				disabled={value <= min}
				aria-label={decreaseLabel}
			>
				<MinusIcon className="size-3.5" aria-hidden="true" />
			</button>

			<div className={FIELD}>
				<input
					type="number"
					className={`${INPUT} ${showCaret ? "caret-foreground" : "caret-transparent"}`}
					style={{ fontKerning: "none" }}
					value={value}
					min={min}
					max={Number.isFinite(max) ? max : undefined}
					step={1}
					inputMode="numeric"
					autoComplete="off"
					onChange={handleChange}
				/>
				<NumberFlow
					value={value}
					locales="en-US"
					format={{ useGrouping: false }}
					className={DIGITS}
					aria-hidden="true"
					animated={animated}
					onAnimationsStart={() => setShowCaret(false)}
					onAnimationsFinish={() => setShowCaret(true)}
				/>
			</div>

			<button
				type="button"
				className={STEP_BTN_LAST}
				onClick={() => step(1)}
				disabled={value >= max}
				aria-label={increaseLabel}
			>
				<PlusIcon className="size-3.5" aria-hidden="true" />
			</button>
		</div>
	);
}
