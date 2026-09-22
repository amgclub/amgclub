import type { Metadata } from "next";
import { OrderDetailView } from "@/components/shop/order-detail-view";

export const metadata: Metadata = { title: "Order Details" };

export default function OrderDetailPage() {
	return <OrderDetailView />;
}
