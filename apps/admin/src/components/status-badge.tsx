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
