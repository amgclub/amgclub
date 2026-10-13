import { z } from "zod";

/**
 * The public join form. The five fields mirror the server's
 * `membershipApplicationSchema`; `acceptFee` exists only here, because accepting
 * the monthly fee is a promise the applicant makes to the club rather than a
 * column anything stores.
 */
export const membershipFormSchema = z.object({
	memberName: z.string().trim().min(1, "Name is required").max(120),
	email: z
		.string()
		.trim()
		.min(1, "Email is required")
		.email("Enter a valid email address")
		.max(254),
	phone: z.string().trim().min(1, "Phone is required").max(32),
	carModel: z.string().trim().min(1, "Tell us which AMG you drive").max(120),
	notes: z
		.string()
		.trim()
		.max(2000, "Notes are limited to 2000 characters")
		.optional(),
	acceptFee: z.boolean().refine((accepted) => accepted, {
		message: "Accept the monthly membership fee to send your application",
	}),
});

export type MembershipFormInput = z.input<typeof membershipFormSchema>;
export type MembershipFormOutput = z.output<typeof membershipFormSchema>;

/**
 * The monthly fee, in the currency the server quotes it in. AED throughout
 * today; formatting reads the currency off the payload rather than assuming it,
 * so a change on the server lands here without an edit.
 */
export function formatFee(amount: number, currency: string): string {
	try {
		return new Intl.NumberFormat("en-AE", {
			style: "currency",
			currency,
			maximumFractionDigits: 0,
		}).format(amount);
	} catch {
		return `${amount} ${currency}`;
	}
}
