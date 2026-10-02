import type { Metadata } from "next";

import { TeamView } from "@/components/team/team-view";

export const metadata: Metadata = {
	title: "Settings | Team",
};

export default function SettingsTeamPage() {
	return <TeamView />;
}
