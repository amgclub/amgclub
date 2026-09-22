import { Badge } from "@amgclub/ui/components/badge";

export type MembershipStatus = "in_review" | "active" | "paused" | "canceled";

export type EventStatus = "active" | "paused" | "canceled";

const membershipLabels: Record<MembershipStatus, string> = {
	in_review: "In review",
	active: "Active",
	paused: "Paused",
	canceled: "Canceled",
};

const eventLabels: Record<EventStatus, string> = {
	active: "Active",
	paused: "Paused",
	canceled: "Canceled",
};

export function MembershipStatusBadge({
	status,
}: {
	status: MembershipStatus;
}) {
	const variant = {
		in_review: "muted",
		active: "default",
		paused: "subtle",
		canceled: "destructive",
	} as const;

	return <Badge variant={variant[status]}>{membershipLabels[status]}</Badge>;
}

export function EventStatusBadge({ status }: { status: EventStatus }) {
	const variant = {
		active: "default",
		paused: "subtle",
		canceled: "destructive",
	} as const;

	return <Badge variant={variant[status]}>{eventLabels[status]}</Badge>;
}

// ---------------------------------------------------------------------------
// Order statuses
// ---------------------------------------------------------------------------

export type OrderStatus =
	| "pending"
	| "confirmed"
	| "shipped"
	| "delivered"
	| "canceled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

const orderStatusLabels: Record<OrderStatus, string> = {
	pending: "Pending",
	confirmed: "Confirmed",
	shipped: "Shipped",
	delivered: "Delivered",
	canceled: "Canceled",
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
	pending: "Pending",
	paid: "Paid",
	failed: "Failed",
	refunded: "Refunded",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
	const variant = {
		pending: "muted",
		confirmed: "default",
		shipped: "default",
		delivered: "default",
		canceled: "destructive",
	} as const;

	return <Badge variant={variant[status]}>{orderStatusLabels[status]}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
	const variant = {
		pending: "muted",
		paid: "default",
		failed: "destructive",
		refunded: "subtle",
	} as const;

	return <Badge variant={variant[status]}>{paymentStatusLabels[status]}</Badge>;
}
