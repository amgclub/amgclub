/** The home page's copy and data. */

export const DECK_LEFT =
	"a club for Mercedes-AMG owners across the UAE. We meet, we drive, and we take the cars properly: morning runs to Jebel Jais, track days, night meets in Dubai.";

export const DECK_RIGHT =
	"founded in 2018. 275+ members and 100+ events a season across 20+ tracks. Five run formats, from the Apr 7 Annual Desert Drive to open track days. Join by form.";

export const JOIN_URL = "https://forms.gle/fvR3TBKgyiF4aU1Y8";

export const RUN_FORMATS = [
	{ index: "01", name: "Annual Desert Drive", detail: "Apr 7" },
	{ index: "02", name: "Open track days", detail: "20+ tracks a season" },
	{ index: "03", name: "Morning runs", detail: "Jebel Jais" },
	{ index: "04", name: "Night meets", detail: "Dubai" },
	{ index: "05", name: "Club socials", detail: "Year-round" },
] as const;

export const RECORD = [
	{ value: "2018", label: "Founded" },
	{ value: "275+", label: "Members" },
	{ value: "100+", label: "Events a season" },
	{ value: "20+", label: "Tracks" },
] as const;

export const MEMBER_PERKS = [
	{ index: "01", name: "Member roll", detail: "275+ owners since 2018" },
	{ index: "02", name: "Season calendar", detail: "100+ events a season" },
	{ index: "03", name: "Track access", detail: "20+ tracks" },
	{ index: "04", name: "Club issue", detail: "Season 2026 · Issue 001" },
] as const;
