import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@amgclub/ui/components/empty";
import { TagIcon } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Categories",
};

export default function ShopCategoriesPage() {
	return (
		<div className="flex flex-col gap-6">
			<div>
				<h1 className="font-extrabold font-sans text-headline-lg">
					Categories
				</h1>
				<p className="text-body-sm text-muted-foreground">
					Shop product categories
				</p>
			</div>
			<Empty className="border">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<TagIcon />
					</EmptyMedia>
					<EmptyTitle>Shop coming soon</EmptyTitle>
					<EmptyDescription>
						Category management will be implemented here in a future iteration.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		</div>
	);
}
