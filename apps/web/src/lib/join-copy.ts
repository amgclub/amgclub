/** Copy for the membership application page, `/members-join`. */

/** The masthead running line, matching the header band's "Season 2026 · Issue 001". */
export const ISSUE_LINE = "Season 2026 · Membership";

export const HEADLINE = "Join the club";

export const DECK =
	"One month of AMG Club UAE. The team reads every application and answers on the email you give us.";

/** Left-rail kicker for the spread that carries the form. */
export const KICKER_APPLICATION = "The application";

/** Left-rail kicker for the closing statement spread. */
export const KICKER_STATEMENT = "One season, one fee";

export const INTRO =
	"Name, a way to reach you, and the AMG you drive. The team reads every application and replies by email, usually within the week.";

/** Column heading over the form fields. */
export const COLUMN_FORM = "Your details";

/** Column heading over the fee ledger. */
export const COLUMN_FEE = "Monthly membership";

/**
 * The fee ledger. Ruled rows, not cards: the fee is the only row that carries
 * display weight, the rest are terms the reader scans past.
 */
export const FEE_ROWS = [
	{ label: "Term", value: "1 month, renews monthly" },
	{ label: "Plan", value: "One monthly plan" },
	{ label: "Runs", value: "Five formats a season" },
	{ label: "Next", value: "Email from the club team" },
] as const;

export const CLOSING =
	"One application is all it takes. The rest is the month.";

/** The first ledger row: the one figure the whole page turns on. */
export const FEE_ROW_LABEL = "Monthly fee";

/** Shown in place of the fee when `members.pricing` cannot be reached. */
export const FEE_UNAVAILABLE = "Fee unavailable";

/**
 * The pricing failure path. The fee is the one thing on the page that cannot be
 * written down in advance, so when it will not load the form says so and closes
 * itself rather than asking someone to accept a number it cannot show them.
 */
export const FEE_UNAVAILABLE_NOTE =
	"The membership fee could not be loaded, so the form is closed for now. Try again, or email the club and we will take your application by hand.";

export const RETRY = "Retry";

/** Shown beside the submit button while the acceptance box is unticked. */
export const ACCEPT_HINT = "Tick the box to send your application.";

export const SUBMIT_LABEL = "Send application";
export const SUBMIT_PENDING = "Sending your application";

/** Announced while the overlay covers the form. */
export const OVERLAY_ANNOUNCEMENT =
	"Sending your application to the club team.";

/** Caption under the overlay's headline. */
export const OVERLAY_META = "Sending your application to the club team";

export const SUCCESS_TITLE = "Application sent";
export const SUCCESS_BODY_PREFIX =
	"The club team has your request and will read it. Someone will contact you at";
export const SUCCESS_BODY_SUFFIX = "about your membership and the month ahead.";

export const ERROR_TITLE = "That did not go through";
export const ERROR_BODY =
	"Nothing was saved. Your details are still in the form, so try again in a moment.";
export const ERROR_RETRY = "Back to the form";

export const BACK_HOME = "Back to the homepage";
export const CLUB_EMAIL = "hello@amgclub.ae";
