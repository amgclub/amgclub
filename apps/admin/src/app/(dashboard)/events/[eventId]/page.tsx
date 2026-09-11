import type { Metadata } from "next";

import { EventAttendeesView } from "@/components/events/event-attendees-view";

export const metadata: Metadata = {
	title: "Event Attendees",
};

export default async function EventAttendeesPage({
	params,
}: {
	params: Promise<{ eventId: string }>;
}) {
	const { eventId } = await params;
	return <EventAttendeesView eventId={eventId} />;
}
