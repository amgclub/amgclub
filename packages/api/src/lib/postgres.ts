/** Postgres error codes surfaced by the driver. */
const PG_FOREIGN_KEY_VIOLATION = "23503";

export function isForeignKeyViolation(error: unknown): boolean {
	let current: unknown = error;

	for (let depth = 0; depth < 5 && current; depth++) {
		if (
			typeof current === "object" &&
			current !== null &&
			"code" in current &&
			(current as { code?: unknown }).code === PG_FOREIGN_KEY_VIOLATION
		) {
			return true;
		}
		current =
			typeof current === "object" && current !== null && "cause" in current
				? (current as { cause?: unknown }).cause
				: undefined;
	}

	return false;
}
