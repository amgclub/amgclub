/** The home page's copy and data. */

export const DECK_LEFT =
	"a club for Mercedes-AMG owners across the UAE. We meet, we drive, and we take the cars properly: morning runs to Jebel Jais, track days, night meets in Dubai.";

export const DECK_RIGHT =
	"founded in 2018. 275+ members and 100+ events a season across 20+ tracks. Five run formats, from the Apr 7 Annual Desert Drive to open track days. Join by form.";

export const JOIN_URL = "/members-join";

export const RUN_FORMATS = [
	{
		index: "01",
		name: "Annual Desert Drive",
		detail: "Apr 7",
		icon: "calendar",
	},
	{
		index: "02",
		name: "Open track days",
		detail: "20+ tracks a season",
		icon: "flag",
	},
	{
		index: "03",
		name: "Morning runs",
		detail: "Jebel Jais",
		icon: "mountains",
	},
	{ index: "04", name: "Night meets", detail: "Dubai", icon: "moon" },
	{ index: "05", name: "Club socials", detail: "Year-round", icon: "confetti" },
] as const;

// Numeric values so record-value.tsx can count them up; the "+" lives in the
// suffix so the roll animates the digits only.
export const RECORD = [
	{ value: 2018, label: "Founded" },
	{ value: 275, suffix: "+", label: "Members" },
	{ value: 100, suffix: "+", label: "Events a season" },
	{ value: 20, suffix: "+", label: "Tracks" },
] as const;

// `season` marks the one detail that leads with the current season year, which
// the list resolves at render time rather than baking in here.
export const MEMBER_PERKS = [
	{ index: "01", name: "Member roll", detail: "275+ owners since 2018" },
	{ index: "02", name: "Season calendar", detail: "100+ events a season" },
	{ index: "03", name: "Track access", detail: "20+ tracks" },
	{ index: "04", name: "Club issue", detail: "Issue 001", season: true },
] as const;
