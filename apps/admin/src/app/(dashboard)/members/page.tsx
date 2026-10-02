import type { Metadata } from "next";

import { MembersView } from "@/components/members/members-view";

export const metadata: Metadata = {
	title: "All Members",
};

export default function MembersPage() {
	return (
		<MembersView
			title="All Members"
			description="Every club membership, website applications and manually added members."
		/>
	);
}
