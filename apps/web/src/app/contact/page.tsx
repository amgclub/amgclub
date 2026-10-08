"use client";
import type { ContactInput, ContactOutput } from "@amgclub/api/schemas/contact";
import { contactSchema } from "@amgclub/api/schemas/contact";
import { Button } from "@amgclub/ui/components/button";
import { Field, FieldGroup, FieldLabel } from "@amgclub/ui/components/field";
import { Input } from "@amgclub/ui/components/input";
import { Textarea } from "@amgclub/ui/components/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { PageMotion } from "@/components/page-motion";
import {
	FOCUS_RING,
	HAIR_SPREAD,
	LABEL,
	LABEL_SM,
	SPREAD,
	SPREAD_BODY,
} from "@/lib/styles";
import { trpc } from "@/utils/trpc";

const HEADING =
	"m-0 font-extrabold font-sans uppercase leading-[0.86] tracking-[-0.03em] text-foreground text-[clamp(3.5rem,6.4cqw,10.5rem)] max-xl:text-[clamp(46px,8.6vw,116px)] max-xl:leading-[0.9] max-xl:tracking-normal";

const DECK_BASE =
	"mt-4 max-w-[46cqw] font-normal font-sans text-[0.8125rem] uppercase text-on-surface-muted max-xl:mt-4 max-xl:max-w-none max-xl:text-body-sm";

const SECTION =
	"spread relative pt-[4cqw] pb-[5.6cqw] max-xl:pt-9 max-xl:pb-9 md:max-xl:pt-14 md:max-xl:pb-14";

const KICKER = `absolute top-[4cqw] left-[5.1448cqw] text-primary-60 max-xl:static max-xl:mb-6 ${LABEL_SM} ${LABEL}`;

const COLUMN_LABEL = `m-0 text-on-surface-muted ${LABEL_SM} ${LABEL}`;

const FIELD_LABEL =
	"font-medium font-sans text-label-md uppercase tracking-[0.06em] text-foreground";

const FIELD_INPUT = `h-11 w-full min-w-0 rounded-none border-[1.5px] border-foreground/[0.41] bg-transparent px-3 text-body-sm text-foreground placeholder:text-on-surface-muted transition-colors focus-visible:border-primary focus-visible:ring-0 aria-invalid:border-destructive ${FOCUS_RING}`;

const FIELD_TEXTAREA = `flex min-h-24 w-full resize-none rounded-none border-[1.5px] border-foreground/[0.41] bg-transparent px-3 py-2.5 text-body-sm text-foreground placeholder:text-on-surface-muted transition-colors focus-visible:border-primary focus-visible:ring-0 aria-invalid:border-destructive ${FOCUS_RING}`;

const ERROR = "font-normal font-sans text-destructive-70 text-caption";

const RAIL_BLOCK =
	"flex flex-col gap-2.5 border-foreground/[0.41] border-t-[1.5px] pt-4";

const CTA_FULL = `h-12 w-full sm:w-auto sm:px-10 text-label-lg uppercase tracking-[0.06em] ${FOCUS_RING}`;

const STATEMENT =
	"statement font-extrabold font-sans text-[clamp(44px,8.6cqw,150px)] uppercase leading-[0.86] tracking-[-0.03em] max-xl:text-[clamp(40px,11vw,88px)]";

const STATEMENT_BODY = "pl-[5.1448cqw] pr-[3.6242cqw] max-xl:pl-0 max-xl:pr-0";

export default function ContactPage() {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<ContactInput, unknown, ContactOutput>({
		resolver: zodResolver(contactSchema),
		defaultValues: {
			name: "",
			email: "",
			phone: "",
			message: "",
		},
	});

	const sendMutation = useMutation({
		...trpc.contact.send.mutationOptions(),
		onSuccess: () => {
			toast.success("Message sent. The club will reply by email.");
			reset();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	async function onSubmit(values: ContactOutput) {
		await sendMutation.mutateAsync(values).catch(() => null);
	}

	return (
		<main className="flex flex-1 flex-col">
			<div className="@container relative bg-background text-foreground max-xl:px-5 md:max-xl:px-12">
				<span
					className="absolute top-0 left-[3.6242cqw] h-full w-[1.5px] bg-foreground/40 max-xl:hidden"
					aria-hidden="true"
				/>

				<header className="relative pt-[2.2cqw] pb-[1.2cqw] max-xl:pt-6 max-xl:pb-6">
					<span
						className="hair-masthead block h-[1.5px] w-full bg-foreground/[0.41]"
						aria-hidden="true"
					/>
					<div className={SPREAD_BODY}>
						<div className="flex items-baseline justify-between gap-4 py-[1.1cqw] max-xl:py-4">
							<span className="t-issue font-medium font-sans text-[0.9223cqw] text-primary-60 uppercase leading-none max-xl:text-[clamp(10px,1.6vw,12px)]">
								Season 2026 · Contact
							</span>
						</div>

						<h1 className={`h1 ${HEADING}`}>Contact</h1>
						<span
							className="red-rule mt-3 block h-px w-24 bg-primary"
							aria-hidden="true"
						/>
						<p className={DECK_BASE}>
							Every message reaches the club directly.
						</p>
					</div>
				</header>

				<section className={SECTION} aria-label="001: The front desk">
					<span className={HAIR_SPREAD} aria-hidden="true" />
					<p className={`spread-kicker ${KICKER}`}>
						001 /
						<br />
						The front desk
					</p>
					<div className={SPREAD_BODY}>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								handleSubmit(onSubmit)(e);
							}}
						>
							<div className="grid max-xl:grid-cols-1 max-xl:gap-y-8 xl:grid-cols-[minmax(0,1fr)_26cqw] xl:gap-x-[3cqw]">
								<div>
									<p className={COLUMN_LABEL}>Message the club</p>
									<FieldGroup className="mt-4">
										<div className="grid gap-4 sm:grid-cols-2">
											<Field>
												<FieldLabel className={FIELD_LABEL}>Name</FieldLabel>
												<Input
													placeholder="Full name"
													aria-invalid={Boolean(errors.name)}
													{...register("name")}
													className={FIELD_INPUT}
												/>
												{errors.name && (
													<p className={ERROR} role="alert">
														{errors.name.message}
													</p>
												)}
											</Field>
											<Field>
												<FieldLabel className={FIELD_LABEL}>Email</FieldLabel>
												<Input
													type="email"
													placeholder="you@example.com"
													aria-invalid={Boolean(errors.email)}
													{...register("email")}
													className={FIELD_INPUT}
												/>
												{errors.email && (
													<p className={ERROR} role="alert">
														{errors.email.message}
													</p>
												)}
											</Field>
										</div>
										<Field>
											<FieldLabel className={FIELD_LABEL}>Phone</FieldLabel>
											<Input
												placeholder="+971 …"
												aria-invalid={Boolean(errors.phone)}
												{...register("phone")}
												className={FIELD_INPUT}
											/>
											{errors.phone && (
												<p className={ERROR} role="alert">
													{errors.phone.message}
												</p>
											)}
										</Field>
										<Field>
											<FieldLabel className={FIELD_LABEL}>Message</FieldLabel>
											<Textarea
												placeholder="Tell us what you need"
												aria-invalid={Boolean(errors.message)}
												{...register("message")}
												className={`${FIELD_TEXTAREA} min-h-40`}
											/>
											{errors.message && (
												<p className={ERROR} role="alert">
													{errors.message.message}
												</p>
											)}
										</Field>
									</FieldGroup>
									<div className="mt-6">
										<Button
											type="submit"
											disabled={sendMutation.isPending}
											className={CTA_FULL}
										>
											{sendMutation.isPending ? "Sending…" : "Send message"}
										</Button>
									</div>
								</div>

								<div>
									<p className={COLUMN_LABEL}>Club details</p>
									<div className="mt-4 flex flex-col gap-6">
										<div className={RAIL_BLOCK}>
											<p
												className={`text-on-surface-muted ${LABEL_SM} ${LABEL}`}
											>
												Address
											</p>
											<p className="text-body-sm text-foreground">
												Dubai, United Arab Emirates
											</p>
										</div>
										<div className={RAIL_BLOCK}>
											<p
												className={`text-on-surface-muted ${LABEL_SM} ${LABEL}`}
											>
												Email
											</p>
											<a
												href="mailto:hello@amgclub.ae"
												className={`text-body-sm text-foreground transition-colors hover:text-primary-60 ${FOCUS_RING}`}
											>
												hello@amgclub.ae
											</a>
										</div>
										<div className={RAIL_BLOCK}>
											<p
												className={`text-on-surface-muted ${LABEL_SM} ${LABEL}`}
											>
												Social
											</p>
											<a
												href="https://www.instagram.com/amgclubuae"
												target="_blank"
												rel="noopener noreferrer"
												aria-label="AMG Club UAE on Instagram"
												className={`group flex items-center gap-3 ${FOCUS_RING}`}
											>
												<span className="flex size-12 shrink-0 items-center justify-center border-[1.5px] border-foreground/[0.41] text-foreground transition-colors group-hover:border-primary group-hover:text-primary-60">
													<svg
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														strokeWidth="1.5"
														strokeLinecap="round"
														strokeLinejoin="round"
														className="size-5"
														aria-hidden="true"
													>
														<rect x="3" y="3" width="18" height="18" rx="5" />
														<circle cx="12" cy="12" r="4" />
														<circle
															cx="17.2"
															cy="6.8"
															r="1"
															fill="currentColor"
															stroke="none"
														/>
													</svg>
												</span>
												<span className="font-sans text-body-sm text-on-surface-muted transition-colors group-hover:text-foreground">
													@amgclubuae
												</span>
											</a>
										</div>
									</div>
								</div>
							</div>
						</form>
					</div>
				</section>

				<section className={SPREAD} aria-label="The garage is open">
					<span className={HAIR_SPREAD} aria-hidden="true" />
					<div className={STATEMENT_BODY}>
						<p className={STATEMENT}>
							The garage
							<br />
							<span className="text-primary">is open</span>
						</p>
					</div>
				</section>
			</div>

			<PageMotion />
		</main>
	);
}
