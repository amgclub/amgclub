"use client";
import { Button } from "@amgclub/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@amgclub/ui/components/card";
import { Field, FieldGroup, FieldLabel } from "@amgclub/ui/components/field";
import { Input } from "@amgclub/ui/components/input";
import { Textarea } from "@amgclub/ui/components/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useCart } from "@/contexts/cart";
import { formatAED } from "@/lib/format";
import { trpc } from "@/utils/trpc";

const checkoutSchema = z.object({
	customerName: z.string().min(1, "Name is required").max(200),
	customerEmail: z.string().email("Invalid email").max(200),
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
	const { items, total, clearCart } = useCart();

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
			toast.success("Order placed successfully!");
			router.push(`/checkout/confirmation/${data.orderNumber}` as Route);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	if (items.length === 0) {
		return (
			<div className="mx-auto max-w-4xl px-4 py-8 text-center">
				<h1 className="font-bold font-sans text-headline-md">
					No items in cart
				</h1>
				<p className="mt-2 text-body-sm text-muted-foreground">
					Add some items before checking out.
				</p>
			</div>
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
		<div className="max-w-5xl px-4 py-8">
			<h1 className="mb-6 font-extrabold font-sans text-foreground text-headline-lg">
				Checkout
			</h1>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					handleSubmit(onSubmit)(e);
				}}
			>
				<div className="grid gap-8 md:grid-cols-[1fr_360px]">
					{/* Shipping form */}
					<Card>
						<CardHeader>
							<CardTitle className="font-bold font-sans text-foreground text-headline-sm">
								Shipping details
							</CardTitle>
						</CardHeader>
						<CardContent>
							<FieldGroup>
								<div className="grid gap-4 sm:grid-cols-2">
									<Field>
										<FieldLabel>Full name</FieldLabel>
										<Input
											placeholder="John Doe"
											aria-invalid={Boolean(errors.customerName)}
											{...register("customerName")}
										/>
										{errors.customerName && (
											<p className="text-caption text-destructive">
												{errors.customerName.message}
											</p>
										)}
									</Field>
									<Field>
										<FieldLabel>Email</FieldLabel>
										<Input
											type="email"
											placeholder="john@example.com"
											aria-invalid={Boolean(errors.customerEmail)}
											{...register("customerEmail")}
										/>
										{errors.customerEmail && (
											<p className="text-caption text-destructive">
												{errors.customerEmail.message}
											</p>
										)}
									</Field>
								</div>
								<Field>
									<FieldLabel>Phone</FieldLabel>
									<Input
										placeholder="+971 50 123 4567"
										aria-invalid={Boolean(errors.customerPhone)}
										{...register("customerPhone")}
									/>
									{errors.customerPhone && (
										<p className="text-caption text-destructive">
											{errors.customerPhone.message}
										</p>
									)}
								</Field>
								<Field>
									<FieldLabel>Address</FieldLabel>
									<Input
										placeholder="Street address, building, apartment"
										aria-invalid={Boolean(errors.address)}
										{...register("address")}
									/>
									{errors.address && (
										<p className="text-caption text-destructive">
											{errors.address.message}
										</p>
									)}
								</Field>
								<div className="grid gap-4 sm:grid-cols-2">
									<Field>
										<FieldLabel>City</FieldLabel>
										<Input
											placeholder="Dubai"
											aria-invalid={Boolean(errors.city)}
											{...register("city")}
										/>
										{errors.city && (
											<p className="text-caption text-destructive">
												{errors.city.message}
											</p>
										)}
									</Field>
									<Field>
										<FieldLabel>ZIP code</FieldLabel>
										<Input placeholder="00000" {...register("zip")} />
									</Field>
								</div>
								<Field>
									<FieldLabel>Order notes (optional)</FieldLabel>
									<Textarea
										rows={3}
										placeholder="Special delivery instructions…"
										{...register("notes")}
									/>
								</Field>
							</FieldGroup>
						</CardContent>
					</Card>

					{/* Order summary */}
					<div>
						<Card>
							<CardHeader>
								<CardTitle className="font-bold font-sans text-foreground text-headline-sm">
									Order summary
								</CardTitle>
							</CardHeader>
							<CardContent className="flex flex-col gap-3">
								{items.map((item) => (
									<div
										key={item.productId}
										className="flex justify-between text-body-sm"
									>
										<span className="text-muted-foreground">
											{item.name} × {item.quantity}
										</span>
										<span className="font-sans text-foreground">
											{formatAED(item.price * item.quantity)}
										</span>
									</div>
								))}
								<hr />
								<div className="flex justify-between text-body-sm">
									<span className="text-muted-foreground">Shipping</span>
									<span className="font-sans text-foreground">Free</span>
								</div>
								<div className="flex justify-between">
									<span className="font-bold font-sans text-body-md text-foreground">
										Total
									</span>
									<span className="font-bold font-sans text-body-md text-foreground">
										{formatAED(total)}
									</span>
								</div>
								<Button
									type="submit"
									className="mt-2 w-full"
									disabled={orderMutation.isPending}
								>
									{orderMutation.isPending ? "Placing order…" : "Place order"}
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</form>
		</div>
	);
}
