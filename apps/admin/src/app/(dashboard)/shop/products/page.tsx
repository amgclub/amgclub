import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@amgclub/ui/components/empty";
import { PackageIcon } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Products",
};

export default function ShopProductsPage() {
	return (
		<div className="flex flex-col gap-6">
			<div>
				<h1 className="font-extrabold font-sans text-headline-lg">Products</h1>
				<p className="text-body-sm text-muted-foreground">
					Club merchandise and shop products
				</p>
			</div>
			<Empty className="border">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<PackageIcon />
					</EmptyMedia>
					<EmptyTitle>Shop coming soon</EmptyTitle>
					<EmptyDescription>
						Product management will be implemented here in a future iteration.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		</div>
	);
}
