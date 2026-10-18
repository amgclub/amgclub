/** Tailwind class strings shared by the home page. */

export const LABEL =
	"text-[0.87653cqw] leading-[1.4] font-medium font-sans uppercase tracking-[0.06em]";
export const LABEL_SM = "max-xl:text-label-sm";
export const LABEL_LG = "max-xl:text-label-lg";

export const KICKER = `absolute left-[5.1448cqw] top-[5.6cqw] text-primary-60 max-xl:static max-xl:mb-6 ${LABEL_SM} ${LABEL}`;

export const FORMAT_ROW =
	"grid grid-cols-[5.6cqw_1fr_auto] items-baseline gap-x-[1.6cqw] border-b border-foreground/[0.41] py-[1.5cqw] max-xl:grid-cols-[44px_1fr] max-xl:gap-y-2 max-xl:py-4";

export const FMT_INDEX =
	"font-medium font-sans tracking-[0.06em] text-[0.87653cqw] text-primary-60 max-xl:text-label-sm";

export const FMT_NAME =
	"text-[1.9055cqw] leading-[1.05] font-extrabold font-sans uppercase max-xl:text-[clamp(22px,5vw,36px)]";

export const FMT_DETAIL = `text-right text-on-surface-muted max-xl:col-start-2 max-xl:text-left ${LABEL_SM} ${LABEL}`;

/**
 * The 003 run-format marks: boxed on a yellow tint and pinned to the row's
 * right edge at every width — the plate rides the rule line rather than
 * sitting in the grid, so it never pushes the name around. Below `xl` they
 * lighten, because the rows are tighter and a full-strength plate crowds the
 * type. The name reserves the plate's band (`xl:pr-[4cqw]`) so a long format
 * never runs underneath it.
 */
export const FMT_MARK =
	"absolute right-0 top-1/2 flex -translate-y-1/2 items-center justify-center bg-yellow/[0.14] p-[0.55cqw] max-xl:bg-yellow/[0.07] max-xl:p-2 max-xl:opacity-70";

export const FMT_MARK_SIZE = "size-[2.4cqw] max-xl:size-9";

/**
 * The mark tilts alternating row to row — `10deg, -10deg, 10deg…` — so five
 * identical boxed plates don't read as one stamped pattern. Driven by the
 * row's index, not by an `odd`/`even` variant, because the tilt has to stay
 * stable across breakpoints.
 */
export const fmtMarkTilt = (index: number) =>
	index % 2 === 0 ? "rotate-[10deg]" : "-rotate-[10deg]";

export const SPREAD_INTRO =
	"max-w-[46cqw] text-[1.029cqw] leading-[1.5] font-normal font-sans text-on-surface-muted max-xl:max-w-none max-xl:text-body-lg md:max-xl:max-w-[720px]";

export const SPREAD = "spread relative py-[5.6cqw] max-xl:py-9 md:max-xl:py-14";

export const HAIR_SPREAD =
	"hair-spread absolute left-0 top-0 h-px w-full bg-foreground/[0.41]";

export const SPREAD_BODY =
	"ml-[20.7317cqw] pr-[3.6242cqw] max-xl:ml-0 max-xl:pr-0";

export const FOCUS_RING =
	"focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-primary-70 focus-visible:outline-offset-[3px]";
