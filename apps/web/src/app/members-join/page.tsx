"use client";

import { Button } from "@amgclub/ui/components/button";
import { Field, FieldGroup, FieldLabel } from "@amgclub/ui/components/field";
import { Input } from "@amgclub/ui/components/input";
import { Skeleton } from "@amgclub/ui/components/skeleton";
import { Textarea } from "@amgclub/ui/components/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { JoinMotion, type JoinPhase } from "@/components/join-motion";
import { LogoStripes } from "@/components/logo-stripes";
import { PageMotion } from "@/components/page-motion";
import * as COPY from "@/lib/join-copy";
import {
	formatFee,
	type MembershipFormInput,
	type MembershipFormOutput,
	membershipFormSchema,
} from "@/lib/membership";
import {
	FOCUS_RING,
	HAIR_SPREAD,
	LABEL,
	LABEL_SM,
	SPREAD,
	SPREAD_BODY,
	SPREAD_INTRO,
} from "@/lib/styles";
import { trpc } from "@/utils/trpc";

// The page shell is the contact spread's, unchanged: same masthead row, same h1
// scale, same deck measure, same closing statement divider.
const HEADING =
	"m-0 font-extrabold font-sans uppercase leading-[0.86] tracking-[-0.03em] text-foreground text-[clamp(3.5rem,6.4cqw,10.5rem)] max-xl:text-[clamp(46px,8.6vw,116px)] max-xl:leading-[0.9] max-xl:tracking-normal";

const DECK_BASE =
	"mt-4 max-w-[46cqw] font-normal font-sans text-[0.8125rem] uppercase text-on-surface-muted max-xl:mt-4 max-xl:max-w-none max-xl:text-body-sm";

const SECTION =
	"spread relative pt-[4cqw] pb-[5.6cqw] max-xl:pt-9 max-xl:pb-9 md:max-xl:pt-14 md:max-xl:pb-14";

const KICKER = `absolute top-[4cqw] left-[5.1448cqw] text-primary-60 max-xl:static max-xl:mb-6 ${LABEL_SM} ${LABEL}`;

const COLUMN_LABEL = `m-0 text-on-surface-muted ${LABEL_SM} ${LABEL}`;

// Carried over verbatim from the contact form: dark fill, 1.5px hairline, no
// radius, focus expressed as a red border plus the house outline ring.
const FIELD_LABEL =
	"font-medium font-sans text-label-md uppercase tracking-[0.06em] text-foreground";

const FIELD_INPUT = `h-11 w-full min-w-0 rounded-none border-[1.5px] border-foreground/[0.41] bg-transparent px-3 text-body-sm text-foreground placeholder:text-on-surface-muted transition-colors focus-visible:border-primary focus-visible:ring-0 aria-invalid:border-destructive ${FOCUS_RING}`;

const FIELD_TEXTAREA = `flex min-h-24 w-full resize-none rounded-none border-[1.5px] border-foreground/[0.41] bg-transparent px-3 py-2.5 text-body-sm text-foreground placeholder:text-on-surface-muted transition-colors focus-visible:border-primary focus-visible:ring-0 aria-invalid:border-destructive ${FOCUS_RING}`;

const ERROR = "font-normal font-sans text-destructive-70 text-caption";

const CTA_FULL = `h-12 w-full px-10 text-label-lg uppercase tracking-[0.06em] ${FOCUS_RING}`;

/** In the result panel the actions sit side by side, so no full-bleed width. */
const CTA_INLINE = `h-12 shrink-0 px-10 text-label-lg uppercase tracking-[0.06em] ${FOCUS_RING}`;

const STATEMENT_BODY = "pl-[5.1448cqw] pr-[3.6242cqw] max-xl:pl-0 max-xl:pr-0";

// Fee ledger: ruled pairs on the spread's hairlines, no card and no fill. The
// fee is the one row that carries display weight, the rest are scannable terms.
const LEDGER =
	"m-0 mt-4 list-none border-foreground/[0.41] border-t-[1.5px] p-0";

const FEE_ROW =
	"grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-[1.6cqw] border-foreground/28 border-b-[1.5px] py-[1.1cqw] max-xl:grid-cols-1 max-xl:gap-y-1 max-xl:py-3";

const FEE_LABEL = `text-on-surface-muted ${LABEL_SM} ${LABEL}`;

const FEE_VALUE =
	"text-left font-medium font-sans text-body-sm text-foreground";

/** The one fee figure. Ledger scale, never hero scale. */
const FEE_AMOUNT =
	"font-extrabold font-sans text-[2.1478cqw] uppercase leading-none tracking-[-0.02em] text-foreground max-xl:text-[28px]";

const NOTE =
	"font-normal font-sans text-caption text-on-surface-muted max-xl:text-body-sm";

const RETRY = `min-h-11 cursor-pointer border-[1.5px] border-foreground/28 bg-background px-3 font-medium font-sans text-foreground uppercase transition-colors hover:border-foreground ${LABEL} ${LABEL_SM} ${FOCUS_RING}`;

// A real checkbox and a real <label>: the input carries the name, value and
// validation from react-hook-form, and the frame beside it paints the checked
// and focus states through the `peer-*` variants.
const CHECK_LABEL =
	"flex min-h-11 cursor-pointer items-start gap-3 py-2 font-normal font-sans text-body-sm text-foreground";

const CHECK_BOX =
	"peer absolute inset-0 size-5 cursor-pointer appearance-none opacity-0";

const CHECK_FRAME =
	"pointer-events-none flex size-5 shrink-0 items-center justify-center rounded-none border-[1.5px] border-foreground/60 bg-transparent transition-colors peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:outline-2 peer-focus-visible:outline-solid peer-focus-visible:outline-primary-70 peer-focus-visible:outline-offset-[3px] peer-disabled:cursor-not-allowed peer-disabled:opacity-50 peer-aria-invalid:border-destructive";

// `peer-*` only reaches direct siblings of the input, so the tick is a sibling
// of the frame rather than a child of it.
const CHECK_TICK =
	"pointer-events-none absolute inset-0 m-auto size-3 text-primary-foreground opacity-0 transition-opacity peer-checked:opacity-100";

const OVERLAY =
	"join-overlay absolute inset-0 z-10 flex flex-col items-start justify-center gap-5 bg-background px-6 py-8";

const OVERLAY_STRIPES =
	"join-overlay-stripes block h-auto w-[clamp(56px,6cqw,92px)]";

const OVERLAY_LABEL = `text-primary-60 ${LABEL_SM} ${LABEL}`;

const OVERLAY_CLIP = "block overflow-hidden";

const OVERLAY_LINE =
	"join-ov-line block font-extrabold font-sans text-[3.4cqw] uppercase leading-[0.92] tracking-[-0.02em] text-foreground max-xl:text-[clamp(38px,10vw,64px)]";

const OVERLAY_META = `join-ov-meta text-on-surface-muted ${LABEL_SM} ${LABEL}`;

const RESULT = "join-result flex flex-col items-start outline-none";

/**
 * The status medallion. A round background is the one sanctioned exception to
 * the square shape language: it is a status indicator, not a control, and the
 * alternative on a black field is a second red block competing with the CTA.
 */
const MEDALLION =
	"join-medallion flex size-14 shrink-0 items-center justify-center rounded-full border-[1.5px] border-primary text-primary"; // design-allow: status medallion

const MEDALLION_MARK = "join-mark size-7 overflow-visible";

const RESULT_CLIP = "mt-6 block overflow-hidden";

const RESULT_TITLE =
	"join-result-line block font-extrabold font-sans text-[2.8cqw] uppercase leading-[0.95] tracking-[-0.02em] text-foreground max-xl:text-[clamp(32px,8vw,52px)]";

const RESULT_BODY =
	"join-result-body mt-4 max-w-[52ch] font-normal font-sans text-body-md text-foreground";

// break-words, not break-all: an address is one unbreakable token, so breaking
// it everywhere splits names mid-word even when the whole address would sit
// comfortably on the next line.
const RESULT_EMAIL =
	"font-medium break-words text-foreground underline decoration-primary decoration-1 underline-offset-4";

const RESULT_ACTIONS = "mt-8 flex flex-wrap items-center gap-x-6 gap-y-2";

const BACK_LINK = `inline-flex min-h-11 items-center font-medium font-sans text-foreground uppercase transition-colors hover:text-primary-60 ${LABEL} ${LABEL_SM} ${FOCUS_RING}`;

/** tRPC's diagnostics, which describe the transport rather than the failure. */
const USELESS_ERROR_MESSAGES = new Set([
	"unknown error",
	"unable to transform response from server",
]);

export default function MembersJoinPage() {
	const [phase, setPhase] = useState<JoinPhase>("idle");
	const [submittedEmail, setSubmittedEmail] = useState("");
	const [failureMessage, setFailureMessage] = useState("");

	const resultRef = useRef<HTMLDivElement>(null);

	const pricing = useQuery(trpc.members.pricing.queryOptions());

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<MembershipFormInput, unknown, MembershipFormOutput>({
		resolver: zodResolver(membershipFormSchema),
		defaultValues: {
			memberName: "",
			email: "",
			phone: "",
			carModel: "",
			notes: "",
			acceptFee: false,
		},
	});

	const apply = useMutation({
		...trpc.members.applyMembership.mutationOptions(),
		onSuccess: (result) => {
			setSubmittedEmail(result.email);
			setPhase("success");
		},
		onError: (error) => {
			setFailureMessage(error.message);
			setPhase("error");
		},
	});

	// The result replaces a form that was the last thing focused, so the panel
	// takes focus itself. Without this a keyboard user is dropped to <body>.
	const settled = phase === "success" || phase === "error";
	useEffect(() => {
		if (settled) resultRef.current?.focus();
	}, [settled]);

	const accepted = watch("acceptFee");
	const pricingBlocked = pricing.isPending || pricing.isError;
	const fee =
		pricing.data && !pricing.isError
			? formatFee(pricing.data.price, pricing.data.currency)
			: null;

	async function onSubmit(values: MembershipFormOutput) {
		setPhase("submitting");
		await apply
			.mutateAsync({
				memberName: values.memberName,
				email: values.email,
				phone: values.phone,
				carModel: values.carModel,
				notes: values.notes ?? null,
			})
			.catch(() => null);
	}

	function backToForm() {
		apply.reset();
		setFailureMessage("");
		setPhase("idle");
	}

	return (
		<main className="flex flex-1 flex-col">
			{/*
				The overlay and the result panel both replace what the reader was
				looking at, so the live region is persistent and always in the DOM:
				a `role="status"` mounted at the same moment as its own text is
				often missed by screen readers.
			*/}
			<p className="sr-only" role="status" aria-live="polite">
				{phase === "submitting" && COPY.OVERLAY_ANNOUNCEMENT}
				{phase === "success" &&
					`${COPY.SUCCESS_TITLE}. ${COPY.SUCCESS_BODY_PREFIX} ${submittedEmail}.`}
				{phase === "error" && `${COPY.ERROR_TITLE}. ${COPY.ERROR_BODY}`}
			</p>

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
								{COPY.ISSUE_LINE}
							</span>
						</div>

						<h1 className={`h1 ${HEADING}`}>{COPY.HEADLINE}</h1>
						<span
							className="red-rule mt-3 block h-px w-24 bg-primary"
							aria-hidden="true"
						/>
						<p className={DECK_BASE}>{COPY.DECK}</p>
					</div>
				</header>

				<section className={SECTION} aria-label="001: The application">
					<span className={HAIR_SPREAD} aria-hidden="true" />
					<p className={`spread-kicker ${KICKER}`}>
						001 /
						<br />
						{COPY.KICKER_APPLICATION}
					</p>
					<div className={SPREAD_BODY}>
						{settled ? (
							<ResultPanel
								ref={resultRef}
								phase={phase}
								submittedEmail={submittedEmail}
								failureMessage={failureMessage}
								onBackToForm={backToForm}
							/>
						) : (
							<div className="grid max-xl:grid-cols-1 max-xl:gap-y-10 xl:grid-cols-[minmax(0,1fr)_26cqw] xl:gap-x-[3cqw]">
								<form
									noValidate
									className="relative"
									inert={phase === "submitting"}
									onSubmit={(event) => {
										event.preventDefault();
										handleSubmit(onSubmit)(event);
									}}
								>
									<p className={COLUMN_LABEL}>{COPY.COLUMN_FORM}</p>
									<FieldGroup className="mt-4">
										<div className="grid gap-4 sm:grid-cols-2">
											<Field>
												<FieldLabel className={FIELD_LABEL}>Name</FieldLabel>
												<Input
													autoComplete="name"
													placeholder="Full name"
													aria-invalid={Boolean(errors.memberName)}
													{...register("memberName")}
													className={FIELD_INPUT}
												/>
												{errors.memberName && (
													<p className={ERROR} role="alert">
														{errors.memberName.message}
													</p>
												)}
											</Field>
											<Field>
												<FieldLabel className={FIELD_LABEL}>Email</FieldLabel>
												<Input
													type="email"
													autoComplete="email"
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
												type="tel"
												autoComplete="tel"
												placeholder="+971 50 000 0000"
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
											<FieldLabel className={FIELD_LABEL}>
												Which AMG do you drive?
											</FieldLabel>
											<Input
												placeholder="A45, C63, GT3"
												aria-invalid={Boolean(errors.carModel)}
												{...register("carModel")}
												className={FIELD_INPUT}
											/>
											{errors.carModel && (
												<p className={ERROR} role="alert">
													{errors.carModel.message}
												</p>
											)}
										</Field>
										<Field>
											<FieldLabel className={FIELD_LABEL}>
												Anything else? (optional)
											</FieldLabel>
											<Textarea
												placeholder="Track days you have in mind, what you drive now, how you found us"
												aria-invalid={Boolean(errors.notes)}
												{...register("notes")}
												className={`${FIELD_TEXTAREA} min-h-28`}
											/>
											{errors.notes && (
												<p className={ERROR} role="alert">
													{errors.notes.message}
												</p>
											)}
										</Field>

										<Field>
											<FieldLabel className={CHECK_LABEL}>
												<span className="relative flex size-5 shrink-0 items-center justify-center">
													<input
														type="checkbox"
														disabled={pricingBlocked || apply.isPending}
														aria-invalid={Boolean(errors.acceptFee)}
														aria-describedby="accept-fee-error"
														{...register("acceptFee")}
														className={CHECK_BOX}
													/>
													<span className={CHECK_FRAME} />
													<svg
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														strokeWidth="3"
														strokeLinecap="square"
														className={CHECK_TICK}
														aria-hidden="true"
														focusable="false"
													>
														<path d="M4 12.5l5 5L20 6.5" />
													</svg>
												</span>
												<span>
													{fee
														? `I accept the ${fee} monthly membership fee.`
														: "I accept the monthly membership fee."}
												</span>
											</FieldLabel>
											{errors.acceptFee && (
												<p id="accept-fee-error" className={ERROR} role="alert">
													{errors.acceptFee.message}
												</p>
											)}
										</Field>
									</FieldGroup>
									<div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
										<Button
											type="submit"
											disabled={!accepted || pricingBlocked || apply.isPending}
											className={CTA_FULL}
										>
											{apply.isPending
												? COPY.SUBMIT_PENDING
												: COPY.SUBMIT_LABEL}
										</Button>
										{!accepted && <p className={NOTE}>{COPY.ACCEPT_HINT}</p>}
									</div>

									{phase === "submitting" && (
										<div className={OVERLAY} aria-hidden="true">
											<LogoStripes className={OVERLAY_STRIPES} />
											<p className={OVERLAY_LABEL}>{COPY.ISSUE_LINE}</p>
											<p>
												<span className={OVERLAY_CLIP}>
													<span className={OVERLAY_LINE}>Entering you</span>
												</span>
												<span className={OVERLAY_CLIP}>
													<span className={`${OVERLAY_LINE} text-primary`}>
														on the roll
													</span>
												</span>
											</p>
											<p className={OVERLAY_META}>{COPY.OVERLAY_META}</p>
										</div>
									)}
								</form>

								<aside aria-labelledby="fee-heading">
									<p id="fee-heading" className={COLUMN_LABEL}>
										{COPY.COLUMN_FEE}
									</p>
									<dl className={LEDGER}>
										<div className={FEE_ROW}>
											<dt className={FEE_LABEL}>{COPY.FEE_ROW_LABEL}</dt>
											<dd className="m-0">
												{pricing.isPending ? (
													<Skeleton
														aria-hidden="true"
														className="block h-6 w-28 rounded-none"
													/>
												) : pricing.isError || !fee ? (
													<span className={FEE_VALUE}>
														{COPY.FEE_UNAVAILABLE}
													</span>
												) : (
													<span className={FEE_AMOUNT}>{fee}</span>
												)}
											</dd>
										</div>
										{COPY.FEE_ROWS.map((row) => (
											<div key={row.label} className={FEE_ROW}>
												<dt className={FEE_LABEL}>{row.label}</dt>
												<dd className={`m-0 ${FEE_VALUE}`}>{row.value}</dd>
											</div>
										))}
									</dl>
									{pricing.isError && (
										<div className="mt-4">
											<p className={NOTE} role="alert">
												{COPY.FEE_UNAVAILABLE_NOTE}
											</p>
											<button
												type="button"
												onClick={() => void pricing.refetch()}
												className={`${RETRY} mt-3`}
											>
												{COPY.RETRY}
											</button>
										</div>
									)}
								</aside>
							</div>
						)}
					</div>
				</section>

				<section className={SPREAD} aria-label="002: One form, one month">
					<span className={HAIR_SPREAD} aria-hidden="true" />
					<div className={STATEMENT_BODY}>
						<p className="statement font-extrabold font-sans text-[clamp(44px,8.6cqw,150px)] uppercase leading-[0.86] tracking-[-0.03em] max-xl:text-[clamp(40px,11vw,88px)]">
							One form.
							<br />
							<span className="text-primary">One month.</span>
						</p>
					</div>
					<div className={`${STATEMENT_BODY} mt-[2.4cqw] max-xl:mt-6`}>
						<p className={SPREAD_INTRO}>{COPY.CLOSING}</p>
					</div>
				</section>
			</div>

			<JoinMotion phase={phase} />
			<PageMotion />
		</main>
	);
}

function ResultPanel({
	ref,
	phase,
	submittedEmail,
	failureMessage,
	onBackToForm,
}: {
	ref: React.Ref<HTMLDivElement>;
	phase: "success" | "error";
	submittedEmail: string;
	failureMessage: string;
	onBackToForm: () => void;
}) {
	const ok = phase === "success";

	// tRPC's own fallbacks ("Unknown error", "Unable to transform response from
	// server") name no problem and no recovery, so showing one would read as an
	// explanation when it is the absence of one. The panel's own copy already
	// says what happened and how to recover.
	const usableMessage = USELESS_ERROR_MESSAGES.has(
		failureMessage.trim().toLowerCase(),
	)
		? ""
		: failureMessage;

	return (
		<div ref={ref} tabIndex={-1} className={RESULT} data-join-result={phase}>
			{/* The mark is `aria-hidden`: the title beside it already says which
			    outcome this is, so announcing the glyph too would only repeat it. */}
			<span className={MEDALLION}>
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className={MEDALLION_MARK}
					aria-hidden="true"
				>
					{ok ? (
						<path
							className="join-mark-path"
							pathLength={1}
							d="M4 12.5l5 5L20 6.5"
						/>
					) : (
						<>
							<path className="join-mark-path" pathLength={1} d="M6 6l12 12" />
							<path className="join-mark-path" pathLength={1} d="M18 6L6 18" />
						</>
					)}
				</svg>
			</span>

			<p className={RESULT_CLIP}>
				<span className={RESULT_TITLE}>
					{ok ? COPY.SUCCESS_TITLE : COPY.ERROR_TITLE}
				</span>
			</p>

			{ok ? (
				<p className={RESULT_BODY}>
					{COPY.SUCCESS_BODY_PREFIX}{" "}
					<span className={RESULT_EMAIL}>{submittedEmail}</span>{" "}
					{COPY.SUCCESS_BODY_SUFFIX}
				</p>
			) : (
				<>
					<p className={RESULT_BODY}>{COPY.ERROR_BODY}</p>
					{usableMessage && (
						<p className={`${RESULT_BODY} text-primary-70`}>{usableMessage}</p>
					)}
					<p className={RESULT_BODY}>
						Prefer email? Write to{" "}
						<a
							href={`mailto:${COPY.CLUB_EMAIL}`}
							className={`font-medium text-foreground underline decoration-1 decoration-primary underline-offset-4 transition-colors hover:text-primary-60 ${FOCUS_RING}`}
						>
							{COPY.CLUB_EMAIL}
						</a>
						.
					</p>
				</>
			)}

			<div className={RESULT_ACTIONS}>
				{!ok && (
					<Button type="button" onClick={onBackToForm} className={CTA_INLINE}>
						{COPY.ERROR_RETRY}
					</Button>
				)}
				<Link href={"/" as Route} className={BACK_LINK}>
					{COPY.BACK_HOME}
				</Link>
			</div>
		</div>
	);
}
