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

export function formatAED(amount: number, opts?: { whole?: number }): string {
	if (opts?.whole) {
		return aedWholeFormatter.format(amount);
	}
	return aedFormatter.format(amount);
}

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

export function formatTime(value: string): string {
	return value.slice(0, 5);
}
