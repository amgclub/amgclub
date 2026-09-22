import type { Metadata } from "next";
import { ProductDetailView } from "@/components/shop/product-detail-view";

export const metadata: Metadata = {
	title: "Product",
};

export default async function ProductPage({
	params,
}: {
	params: Promise<{ productId: string }>;
}) {
	const { productId } = await params;
	return <ProductDetailView productId={productId} />;
}
