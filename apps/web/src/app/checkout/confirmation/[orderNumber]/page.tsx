"use client";
import { Button } from "@amgclub/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@amgclub/ui/components/card";
import { Skeleton } from "@amgclub/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { CheckCircleIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatAED, formatDateTime } from "@/lib/format";
import { trpc } from "@/utils/trpc";

export default function OrderConfirmationPage() {
	const params = useParams<{ orderNumber: string }>();

	const { data: order, isLoading } = useQuery(
		trpc.orders.getByOrderNumber.queryOptions({
			orderNumber: params.orderNumber,
		}),
	);

	if (isLoading) {
		return (
			<div className="mx-auto max-w-2xl px-4 py-8">
				<Skeleton className="mb-4 h-8 w-48" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	if (!order) {
		return (
			<div className="mx-auto max-w-2xl px-4 py-8 text-center">
				<h1 className="font-bold font-sans text-headline-md">
					Order not found
				</h1>
				<Link
					href={"/shop" as Route}
					className="mt-4 inline-block text-primary underline"
				>
					Back to shop
				</Link>
			</div>
		);
	}

	const address = order.shippingAddress as Record<string, string>;

	return (
		<div className="mx-auto max-w-2xl px-4 py-8">
			<div className="mb-8 flex flex-col items-center text-center">
				<CheckCircleIcon className="mb-4 size-16 text-primary" />
				<h1 className="font-extrabold font-sans text-foreground text-headline-lg">
					Order confirmed!
				</h1>
				<p className="mt-2 font-sans text-body-md text-muted-foreground">
					Thank you for your order. Your order number is:
				</p>
				<p className="mt-2 font-bold font-sans text-foreground text-headline-md">
					{order.orderNumber}
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="font-bold font-sans text-foreground text-headline-sm">
						Order details
					</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<div className="grid gap-4 text-body-sm sm:grid-cols-2">
						<div>
							<p className="text-muted-foreground">Status</p>
							<p className="font-medium font-sans text-foreground capitalize">
								{order.status}
							</p>
						</div>
						<div>
							<p className="text-muted-foreground">Payment</p>
							<p className="font-medium font-sans text-foreground capitalize">
								{order.paymentStatus}
							</p>
						</div>
						<div>
							<p className="text-muted-foreground">Date</p>
							<p className="font-medium font-sans text-foreground">
								{formatDateTime(order.createdAt)}
							</p>
						</div>
						<div>
							<p className="text-muted-foreground">Shipping to</p>
							<p className="font-medium font-sans text-foreground">
								{address.name}, {address.address}, {address.city}
							</p>
						</div>
					</div>

					<hr />

					<div className="flex flex-col gap-2">
						{order.items.map((item) => (
							<div key={item.id} className="flex justify-between text-body-sm">
								<span className="text-muted-foreground">
									{item.name} × {item.quantity}
								</span>
								<span className="font-sans text-foreground">
									{formatAED(item.price * item.quantity)}
								</span>
							</div>
						))}
					</div>

					<hr />

					<div className="flex justify-between">
						<span className="font-bold font-sans text-body-md text-foreground">
							Total
						</span>
						<span className="font-bold font-sans text-body-md text-foreground">
							{formatAED(order.total)}
						</span>
					</div>
				</CardContent>
			</Card>

			<div className="mt-6 flex justify-center gap-4">
				<Link href={"/shop" as Route}>
					<Button variant="outline">Continue shopping</Button>
				</Link>
			</div>
		</div>
	);
}
