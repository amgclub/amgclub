import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@amgclub/ui/components/empty";
import { LayersIcon } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Collections",
};

export default function ShopCollectionsPage() {
	return (
		<div className="flex flex-col gap-6">
			<div>
				<h1 className="font-extrabold font-sans text-headline-lg">
					Collections
				</h1>
				<p className="text-body-sm text-muted-foreground">
					Curated shop collections
				</p>
			</div>
			<Empty className="border">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<LayersIcon />
					</EmptyMedia>
					<EmptyTitle>Shop coming soon</EmptyTitle>
					<EmptyDescription>
						Collection management will be implemented here in a future
						iteration.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		</div>
	);
}
