"use client";
import { Button } from "@amgclub/ui/components/button";
import { Field, FieldGroup, FieldLabel } from "@amgclub/ui/components/field";
import { Input } from "@amgclub/ui/components/input";
import { Textarea } from "@amgclub/ui/components/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PageMotion } from "@/components/page-motion";
import { useCart } from "@/contexts/cart";
import { formatAED } from "@/lib/format";
import {
	FOCUS_RING,
	HAIR_SPREAD,
	LABEL,
	LABEL_SM,
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

const RAIL_ROW = "flex items-baseline justify-between gap-3 text-body-sm";

const RAIL_VALUE = "shrink-0 font-sans tabular-nums text-foreground";

const TOTAL_LABEL = `font-bold font-sans uppercase text-foreground text-body-md ${LABEL_SM}`;

const TOTAL_VALUE =
	"m-0 font-extrabold font-sans tabular-nums text-foreground text-[2.2cqw] uppercase leading-none max-xl:text-[34px]";

const CTA = `h-12 w-full text-label-lg uppercase tracking-[0.06em] ${FOCUS_RING}`;

const TEXT_ACTION = `inline-flex min-h-11 items-center text-on-surface-muted transition-colors hover:text-primary-60 ${LABEL_SM} ${LABEL} ${FOCUS_RING}`;

const checkoutSchema = z.object({
	customerName: z.string().min(1, "Name is required").max(200),
	customerEmail: z
		.string()
		.min(1, "Email is required")
		.email("Invalid email")
		.max(200),
	customerPhone: z.string().min(1, "Phone is required").max(30),
	address: z.string().min(1, "Address is required").max(500),
	city: z.string().min(1, "City is required").max(100),
	zip: z.string().max(20).optional(),
	notes: z.string().max(500).optional(),
});

type CheckoutInput = z.input<typeof checkoutSchema>;
type CheckoutOutput = z.output<typeof checkoutSchema>;

export default function CheckoutPage() {
	const router = useRouter();
	const { items, total, itemCount, clearCart } = useCart();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CheckoutInput, unknown, CheckoutOutput>({
		resolver: zodResolver(checkoutSchema),
		defaultValues: {
			customerName: "",
			customerEmail: "",
			customerPhone: "",
			address: "",
			city: "",
			zip: "",
			notes: "",
		},
	});

	const orderMutation = useMutation({
		...trpc.orders.create.mutationOptions(),
		onSuccess: (data) => {
			clearCart();
			if (data.redirectUrl) {
				window.location.href = data.redirectUrl;
			} else {
				toast.success("Order placed successfully!");
				router.push(`/checkout/confirmation/${data.orderNumber}` as Route);
			}
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	if (items.length === 0) {
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
									Season 2026 · Checkout
								</span>
							</div>

							<h1 className={`h1 ${HEADING}`}>Checkout</h1>
							<span
								className="red-rule mt-3 block h-px w-24 bg-primary"
								aria-hidden="true"
							/>
							<p className={DECK_BASE}>Nothing to check out yet</p>
						</div>
					</header>

					<section className={SECTION} aria-label="001: The manifest">
						<span className={HAIR_SPREAD} aria-hidden="true" />
						<p className={`spread-kicker ${KICKER}`}>
							001 /
							<br />
							The manifest
						</p>
						<div className={SPREAD_BODY}>
							<div className="border-foreground/[0.41] border-t-[1.5px] pt-[2.4cqw] max-xl:pt-6">
								<p className="m-0 font-extrabold font-sans text-[clamp(22px,4cqw,56px)] text-foreground uppercase leading-[1.05]">
									Your cart is empty
								</p>
								<p
									className={`mt-3 font-medium font-sans text-on-surface-muted uppercase leading-[1.4] tracking-[0.06em] ${LABEL_SM} ${LABEL}`}
								>
									Add some items before checking out
								</p>
								<Link href={"/shop" as Route} className="mt-6 inline-block">
									<Button className="h-12 px-6 text-label-lg uppercase tracking-[0.06em]">
										Browse the shop
									</Button>
								</Link>
							</div>
						</div>
					</section>
				</div>

				<PageMotion />
			</main>
		);
	}

	async function onSubmit(values: CheckoutOutput) {
		await orderMutation.mutateAsync({
			customerName: values.customerName,
			customerEmail: values.customerEmail,
			customerPhone: values.customerPhone,
			items: items.map((item) => ({
				productId: item.productId,
				quantity: item.quantity,
			})),
			shippingAddress: {
				name: values.customerName,
				phone: values.customerPhone,
				address: values.address,
				city: values.city,
				zip: values.zip,
			},
			notes: values.notes,
		});
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
								Season 2026 · Checkout
							</span>
						</div>

						<h1 className={`h1 ${HEADING}`}>Checkout</h1>
						<span
							className="red-rule mt-3 block h-px w-24 bg-primary"
							aria-hidden="true"
						/>
						<p className={DECK_BASE}>Delivery details before payment</p>
					</div>
				</header>

				<section className={SECTION} aria-label="001: The shipping desk">
					<span className={HAIR_SPREAD} aria-hidden="true" />
					<p className={`spread-kicker ${KICKER}`}>
						001 /
						<br />
						The shipping desk
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
									<p className={COLUMN_LABEL}>Shipping details</p>
									<FieldGroup className="mt-4">
										<div className="grid gap-4 sm:grid-cols-2">
											<Field>
												<FieldLabel className={FIELD_LABEL}>
													Full name
												</FieldLabel>
												<Input
													placeholder="John Doe"
													aria-invalid={Boolean(errors.customerName)}
													{...register("customerName")}
													className={FIELD_INPUT}
												/>
												{errors.customerName && (
													<p className={ERROR} role="alert">
														{errors.customerName.message}
													</p>
												)}
											</Field>
											<Field>
												<FieldLabel className={FIELD_LABEL}>Email</FieldLabel>
												<Input
													type="email"
													placeholder="john@example.com"
													aria-invalid={Boolean(errors.customerEmail)}
													{...register("customerEmail")}
													className={FIELD_INPUT}
												/>
												{errors.customerEmail && (
													<p className={ERROR} role="alert">
														{errors.customerEmail.message}
													</p>
												)}
											</Field>
										</div>
										<Field>
											<FieldLabel className={FIELD_LABEL}>Phone</FieldLabel>
											<Input
												placeholder="+971 50 123 4567"
												aria-invalid={Boolean(errors.customerPhone)}
												{...register("customerPhone")}
												className={FIELD_INPUT}
											/>
											{errors.customerPhone && (
												<p className={ERROR} role="alert">
													{errors.customerPhone.message}
												</p>
											)}
										</Field>
										<Field>
											<FieldLabel className={FIELD_LABEL}>Address</FieldLabel>
											<Input
												placeholder="Street address, building, apartment"
												aria-invalid={Boolean(errors.address)}
												{...register("address")}
												className={FIELD_INPUT}
											/>
											{errors.address && (
												<p className={ERROR} role="alert">
													{errors.address.message}
												</p>
											)}
										</Field>
										<div className="grid gap-4 sm:grid-cols-2">
											<Field>
												<FieldLabel className={FIELD_LABEL}>City</FieldLabel>
												<Input
													placeholder="Dubai"
													aria-invalid={Boolean(errors.city)}
													{...register("city")}
													className={FIELD_INPUT}
												/>
												{errors.city && (
													<p className={ERROR} role="alert">
														{errors.city.message}
													</p>
												)}
											</Field>
											<Field>
												<FieldLabel className={FIELD_LABEL}>
													ZIP code
												</FieldLabel>
												<Input
													placeholder="00000"
													{...register("zip")}
													className={FIELD_INPUT}
												/>
											</Field>
										</div>
										<Field>
											<FieldLabel className={FIELD_LABEL}>
												Order notes (optional)
											</FieldLabel>
											<Textarea
												rows={3}
												placeholder="Special delivery instructions…"
												{...register("notes")}
												className={FIELD_TEXTAREA}
											/>
										</Field>
									</FieldGroup>
								</div>

								<aside className="flex flex-col gap-4 xl:sticky xl:top-6">
									<p className={COLUMN_LABEL}>Order summary</p>
									<div className={RAIL_BLOCK}>
										{items.map((item) => (
											<div key={item.productId} className={RAIL_ROW}>
												<span
													className="min-w-0 truncate text-on-surface-muted"
													title={`${item.name} × ${item.quantity}`}
												>
													{item.name} × {item.quantity}
												</span>
												<span className={RAIL_VALUE}>
													{formatAED(item.price * item.quantity)}
												</span>
											</div>
										))}
									</div>
									<div className={RAIL_BLOCK}>
										<div className={RAIL_ROW}>
											<span className="text-on-surface-muted">
												Subtotal ({itemCount}{" "}
												{itemCount === 1 ? "item" : "items"})
											</span>
											<span className={RAIL_VALUE}>{formatAED(total)}</span>
										</div>
										<div className={RAIL_ROW}>
											<span className="text-on-surface-muted">Shipping</span>
											<span className={RAIL_VALUE}>Free</span>
										</div>
									</div>
									<div className="flex items-baseline justify-between gap-3 border-foreground/[0.41] border-t-[1.5px] pt-4">
										<span className={TOTAL_LABEL}>Total</span>
										<span className={TOTAL_VALUE}>{formatAED(total)}</span>
									</div>
									<Button
										type="submit"
										className={CTA}
										disabled={orderMutation.isPending}
									>
										{orderMutation.isPending
											? "Placing order…"
											: "Proceed to payment"}
									</Button>
									<Link href={"/cart" as Route} className={TEXT_ACTION}>
										Back to cart
									</Link>
								</aside>
							</div>
						</form>
					</div>
				</section>
			</div>

			<PageMotion />
		</main>
	);
}
