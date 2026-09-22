"use client";

import type { OrderDTO } from "@amgclub/api/routers/orders";
import { Button } from "@amgclub/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@amgclub/ui/components/card";
import { Skeleton } from "@amgclub/ui/components/skeleton";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
	OrderStatusBadge,
	PaymentStatusBadge,
} from "@/components/status-badge";
import { formatAED, formatDateTime } from "@/lib/format";
import { queryClient, trpc } from "@/utils/trpc";

type OrderDetail = OrderDTO & { customerPhone: string };

export function OrderDetailView() {
	const params = useParams<{ orderId: string }>();
	const orderId = params.orderId;

	const orderQuery = useQuery({
		...trpc.orders.getById.queryOptions(orderId),
		select: (data) => data as unknown as OrderDetail,
	});

	const statusMutation = useMutation({
		...trpc.orders.updateStatus.mutationOptions(),
		onSuccess: () => {
			toast.success("Order status updated");
			queryClient.invalidateQueries();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const paymentMutation = useMutation({
		...trpc.orders.updatePaymentStatus.mutationOptions(),
		onSuccess: () => {
			toast.success("Payment status updated");
			queryClient.invalidateQueries();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	if (orderQuery.isPending) {
		return (
			<div className="flex flex-col gap-6">
				<Skeleton className="h-8 w-48" />
				<div className="grid gap-4 md:grid-cols-2">
					<Skeleton className="h-48" />
					<Skeleton className="h-48" />
				</div>
				<Skeleton className="h-64" />
			</div>
		);
	}

	if (orderQuery.error || !orderQuery.data) {
		return (
			<div className="flex flex-col gap-4">
				<p className="text-body-sm text-destructive">
					Failed to load order: {orderQuery.error?.message ?? "Not found"}
				</p>
				<Link href={"/shop/orders" as Route}>
					<Button variant="outline">
						<ArrowLeftIcon />
						Back to orders
					</Button>
				</Link>
			</div>
		);
	}

	const order = orderQuery.data;
	const address = order.shippingAddress as Record<string, string>;

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-center gap-4">
				<Link href={"/shop/orders" as Route}>
					<Button variant="ghost" size="icon-sm">
						<ArrowLeftIcon />
					</Button>
				</Link>
				<div>
					<h1 className="font-extrabold font-sans text-headline-lg">
						{order.orderNumber}
					</h1>
					<p className="text-body-sm text-muted-foreground">
						Created {formatDateTime(order.createdAt)}
					</p>
				</div>
				<div className="ml-auto flex items-center gap-2">
					<OrderStatusBadge status={order.status} />
					<PaymentStatusBadge status={order.paymentStatus} />
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Customer</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-col gap-1">
						<p className="font-medium text-foreground">{order.customerName}</p>
						<p className="text-body-sm text-muted-foreground">
							{order.customerEmail}
						</p>
						{order.customerPhone ? (
							<p className="text-body-sm text-muted-foreground">
								{order.customerPhone}
							</p>
						) : null}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Shipping Address</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-col gap-1">
						{address.name ? (
							<p className="font-medium text-foreground">{address.name}</p>
						) : null}
						{address.address ? (
							<p className="text-body-sm text-muted-foreground">
								{address.address}
							</p>
						) : null}
						<p className="text-body-sm text-muted-foreground">
							{[address.city].filter(Boolean).join(", ")}
							{address.zip ? ` ${address.zip}` : ""}
						</p>
						{address.phone ? (
							<p className="text-body-sm text-muted-foreground">
								{address.phone}
							</p>
						) : null}
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Items</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-3">
						{order.items.map((item) => (
							<div
								key={item.id}
								className="flex items-center justify-between border-b pb-3 last:border-none last:pb-0"
							>
								<div>
									<p className="font-medium text-foreground">{item.name}</p>
									<p className="text-caption text-muted-foreground">
										Qty: {item.quantity} × {formatAED(item.price)}
									</p>
								</div>
								<p className="font-medium text-foreground">
									{formatAED(item.price * item.quantity)}
								</p>
							</div>
						))}
					</div>
					<div className="mt-4 flex flex-col items-end gap-1 border-t pt-4">
						<div className="flex gap-4 text-body-sm text-muted-foreground">
							<span>Subtotal</span>
							<span>{formatAED(order.subtotal)}</span>
						</div>
						<div className="flex gap-4 text-body-sm text-muted-foreground">
							<span>Shipping</span>
							<span>
								{order.shippingCost === 0
									? "Free"
									: formatAED(order.shippingCost)}
							</span>
						</div>
						<div className="flex gap-4 font-bold text-foreground">
							<span>Total</span>
							<span>{formatAED(order.total)}</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{order.notes ? (
				<Card>
					<CardHeader>
						<CardTitle>Notes</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-body-sm text-muted-foreground">{order.notes}</p>
					</CardContent>
				</Card>
			) : null}

			<div className="flex flex-wrap gap-2">
				<span className="text-foreground text-label-md">Update status:</span>
				{(
					["pending", "confirmed", "shipped", "delivered", "canceled"] as const
				).map((s) => (
					<Button
						key={s}
						size="sm"
						variant={order.status === s ? "default" : "outline"}
						disabled={statusMutation.isPending}
						onClick={() => {
							statusMutation.mutate({ id: order.id, status: s });
						}}
					>
						{s.charAt(0).toUpperCase() + s.slice(1)}
					</Button>
				))}
			</div>

			<div className="flex flex-wrap gap-2">
				<span className="text-foreground text-label-md">Payment status:</span>
				{(["pending", "paid", "failed", "refunded"] as const).map((ps) => (
					<Button
						key={ps}
						size="sm"
						variant={order.paymentStatus === ps ? "default" : "outline"}
						disabled={paymentMutation.isPending}
						onClick={() => {
							paymentMutation.mutate({ id: order.id, paymentStatus: ps });
						}}
					>
						{ps.charAt(0).toUpperCase() + ps.slice(1)}
					</Button>
				))}
			</div>
		</div>
	);
}
