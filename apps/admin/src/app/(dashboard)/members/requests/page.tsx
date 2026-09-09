import type { Metadata } from "next";

import { MembersView } from "@/components/members/members-view";

export const metadata: Metadata = {
	title: "Membership Requests",
};

export default function MembershipRequestsPage() {
	return (
		<MembersView
			title="Membership Requests"
			description="Applications from the website waiting for review."
			defaultStatus="in_review"
		/>
	);
}
