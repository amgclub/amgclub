import type { Metadata } from "next";

import { MembershipSettingsForm } from "@/components/settings/membership-settings-form";

export const metadata: Metadata = {
	title: "Settings — General",
};

export default function SettingsGeneralPage() {
	return (
		<div className="flex flex-col gap-6">
			<div>
				<h1 className="font-extrabold font-sans text-headline-lg">General</h1>
				<p className="text-body-sm text-muted-foreground">
					Club-wide membership configuration
				</p>
			</div>
			<MembershipSettingsForm />
		</div>
	);
}
