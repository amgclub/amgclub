"use client";

import { Button } from "@amgclub/ui/components/button";
import { Card, CardContent } from "@amgclub/ui/components/card";
import { Skeleton } from "@amgclub/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { trpc } from "@/utils/trpc";

function PaymentSuccessInner() {
	const searchParams = useSearchParams();
	const intentId = searchParams.get("intent");

	const paymentQuery = useQuery({
		...trpc.orders.verifyPayment.queryOptions(
			{ paymentIntentId: intentId ?? "" },
			{ enabled: Boolean(intentId) },
		),
		refetchInterval: (query) => {
			// Stop polling once paid or failed
			if (
				query.state.data?.paymentStatus === "paid" ||
				query.state.data?.paymentStatus === "failed"
			) {
				return false;
			}
			// Poll every 2s while pending
			return 2000;
		},
	});

	if (!intentId) {
		return (
			<div className="mx-auto max-w-lg px-4 py-16 text-center">
				<Card>
					<CardContent className="flex flex-col items-center gap-4 p-8">
						<XCircleIcon className="size-16 text-muted-foreground" />
						<h1 className="font-bold font-sans text-headline-md">
							Invalid payment link
						</h1>
						<p className="text-body-sm text-muted-foreground">
							This payment link is invalid or has expired.
						</p>
						<div className="mt-4 flex gap-3">
							<Link href={"/shop" as Route}>
								<Button>Continue shopping</Button>
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (paymentQuery.isPending) {
		return (
			<div className="mx-auto max-w-lg px-4 py-16 text-center">
				<Card>
					<CardContent className="flex flex-col items-center gap-4 p-8">
						<Skeleton className="size-16 rounded-none" />
						<Skeleton className="h-6 w-48" />
						<Skeleton className="h-4 w-64" />
					</CardContent>
				</Card>
			</div>
		);
	}

	const status = paymentQuery.data?.paymentStatus ?? "pending";

	return (
		<div className="mx-auto max-w-lg px-4 py-16 text-center">
			<Card>
				<CardContent className="flex flex-col items-center gap-4 p-8">
					{status === "paid" ? (
						<CheckCircleIcon className="size-16 text-primary" />
					) : status === "failed" ? (
						<XCircleIcon className="size-16 text-muted-foreground" />
					) : (
						<Skeleton className="size-16 rounded-none" />
					)}

					<h1 className="font-bold font-sans text-headline-md">
						{status === "paid"
							? "Payment Successful"
							: status === "failed"
								? "Payment Failed"
								: "Processing payment…"}
					</h1>

					<p className="text-body-sm text-muted-foreground">
						{status === "paid"
							? "Thank you! Your payment has been received and your order is being processed."
							: status === "failed"
								? "Your payment could not be processed. Please try again."
								: "Waiting for payment confirmation from Ziina…"}
					</p>

					<div className="mt-4 flex gap-3">
						{status === "paid" && paymentQuery.data?.orderNumber ? (
							<Link
								href={
									`/checkout/confirmation/${paymentQuery.data.orderNumber}` as Route
								}
							>
								<Button>View order</Button>
							</Link>
						) : null}
						<Link href={"/shop" as Route}>
							<Button variant={status === "paid" ? "outline" : "default"}>
								Continue shopping
							</Button>
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default function PaymentSuccessPage() {
	return (
		<Suspense fallback={null}>
			<PaymentSuccessInner />
		</Suspense>
	);
}
