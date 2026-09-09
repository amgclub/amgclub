const aedFormatter = new Intl.NumberFormat("en-AE", {
	style: "currency",
	currency: "AED",
	maximumFractionDigits: 2,
});

const aedWholeFormatter = new Intl.NumberFormat("en-AE", {
	style: "currency",
	currency: "AED",
	maximumFractionDigits: 0,
});

/** Format an AED amount, e.g. 350 → "AED 350.00". */
export function formatAED(amount: number, opts?: { whole?: number }): string {
	if (opts?.whole) {
		return aedWholeFormatter.format(amount);
	}
	return aedFormatter.format(amount);
}

/** Format "2026-03-12" as "12 Mar 2026". */
export function formatDate(value: string): string {
	const date = new Date(`${value}T00:00:00`);
	if (Number.isNaN(date.getTime())) {
		return value;
	}
	return new Intl.DateTimeFormat("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(date);
}

/** Format an ISO timestamp as "12 Mar 2026, 14:30". */
export function formatDateTime(value: string): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return value;
	}
	return new Intl.DateTimeFormat("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	}).format(date);
}

/** Format "14:30:00" (or "14:30") as "14:30". */
export function formatTime(value: string): string {
	return value.slice(0, 5);
}

export function formatPercent(value: number): string {
	return `${value.toFixed(1)}%`;
}

/** Today's date as YYYY-MM-DD (local time). */
export function todayISO(): string {
	const now = new Date();
	const offset = now.getTimezoneOffset();
	return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

/**
 * True when an active membership's end date falls within `days` days
 * (or has already passed).
 */
export function isExpiringSoon(endDate: string, days: number): boolean {
	const end = new Date(`${endDate}T23:59:59`);
	if (Number.isNaN(end.getTime())) {
		return false;
	}
	const limit = new Date();
	limit.setDate(limit.getDate() + days);
	return end.getTime() <= limit.getTime();
}

/** Compute a membership end date: start + 1 month (monthly) or 1 year (yearly). */
export function computeEndDate(
	startDate: string,
	plan: "monthly" | "yearly",
): string {
	const start = new Date(`${startDate}T00:00:00`);
	if (Number.isNaN(start.getTime())) {
		return startDate;
	}
	if (plan === "monthly") {
		start.setMonth(start.getMonth() + 1);
	} else {
		start.setFullYear(start.getFullYear() + 1);
	}
	const offset = start.getTimezoneOffset();
	return new Date(start.getTime() - offset * 60_000).toISOString().slice(0, 10);
}
