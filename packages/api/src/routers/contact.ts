import { env } from "@amgclub/env/server";
import { TRPCError } from "@trpc/server";
import { Resend } from "resend";
import { router } from "../index";
import { contactRateLimitedProcedure } from "../rate-limit";
import { contactSchema } from "../schemas/contact";

function escapeHtml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function buildTextBody(input: {
	name: string;
	email: string;
	phone: string;
	message: string;
}): string {
	return [
		"New contact message from the AMG Club UAE website.",
		"",
		`Name: ${input.name}`,
		`Email: ${input.email}`,
		`Phone: ${input.phone}`,
		"Message:",
		input.message,
	].join("\n");
}

function buildHtmlBody(input: {
	name: string;
	email: string;
	phone: string;
	message: string;
}): string {
	const labelStyle =
		"padding:8px 16px 8px 0;font-weight:bold;color:#666;vertical-align:top;"; // design-allow: email (no design tokens in HTML email)
	const valueStyle = "padding:8px 0;color:#111;"; // design-allow: email
	const row = (label: string, value: string): string =>
		`<tr><td style="${labelStyle}">${escapeHtml(
			label,
		)}</td><td style="${valueStyle}">${escapeHtml(value)}</td></tr>`;

	return [
		"<!DOCTYPE html>",
		'<html><body style="margin:0;padding:24px;background:#f5f5f5;font-family:Helvetica,Arial,sans-serif;">', // design-allow: email
		'<div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e0e0e0;padding:24px;">', // design-allow: email
		'<h1 style="margin:0 0 16px;font-size:20px;color:#111;">New contact message</h1>', // design-allow: email
		'<p style="margin:0 0 16px;font-size:14px;color:#444;">Someone submitted the contact form on the AMG Club UAE website.</p>', // design-allow: email
		'<table style="width:100%;border-collapse:collapse;font-size:14px;">',
		row("Name", input.name),
		row("Email", input.email),
		row("Phone", input.phone),
		row("Message", input.message),
		"</table>",
		"</div></body></html>",
	].join("\n");
}

export const contactRouter = router({
	send: contactRateLimitedProcedure
		.input(contactSchema)
		.mutation(async ({ input }) => {
			if (!env.RESEND_API_KEY) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Contact form is not configured yet. Set RESEND_API_KEY.",
				});
			}

			const resend = new Resend(env.RESEND_API_KEY);

			const { error } = await resend.emails.send({
				from: env.RESEND_FROM_EMAIL,
				to: env.CONTACT_TO_EMAIL,
				replyTo: input.email,
				subject: `New contact message from ${input.name}`,
				text: buildTextBody(input),
				html: buildHtmlBody(input),
			});

			if (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Could not send your message. Try again later.",
				});
			}

			return { ok: true as const };
		}),
});
