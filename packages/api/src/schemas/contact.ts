import { z } from "zod";

export const contactSchema = z.object({
	name: z.string().trim().min(1, "Name is required").max(120),
	email: z
		.string()
		.trim()
		.min(1, "Email is required")
		.email("Invalid email address")
		.max(200),
	phone: z.string().trim().min(1, "Phone is required").max(30),
	message: z.string().trim().min(1, "Message is required").max(2000),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactOutput = z.output<typeof contactSchema>;
