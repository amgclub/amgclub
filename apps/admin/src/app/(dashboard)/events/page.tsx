import type { Metadata } from "next";

import { EventsView } from "@/components/events/events-view";

export const metadata: Metadata = {
	title: "All Events",
};

export default function EventsPage() {
	return <EventsView />;
}
