"use client";
import { Button } from "@amgclub/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@amgclub/ui/components/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@amgclub/ui/components/empty";
import { MinusIcon, PlusIcon, ShoppingBagIcon, Trash2Icon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useCart } from "@/contexts/cart";
import { formatAED } from "@/lib/format";

export default function CartPage() {
	const { items, updateQuantity, removeItem, total, itemCount, clearCart } =
		useCart();

	if (items.length === 0) {
		return (
			<div className="mx-auto max-w-4xl px-4 py-8">
				<Empty className="border-none">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<ShoppingBagIcon />
						</EmptyMedia>
						<EmptyTitle>Your cart is empty</EmptyTitle>
						<EmptyDescription>
							Browse our shop and add some items to your cart.
						</EmptyDescription>
					</EmptyHeader>
					<Link href={"/shop" as Route}>
						<Button>Browse shop</Button>
					</Link>
				</Empty>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-4xl px-4 py-8">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="font-extrabold font-sans text-foreground text-headline-lg">
					Cart ({itemCount})
				</h1>
				<Button variant="outline" size="sm" onClick={clearCart}>
					Clear cart
				</Button>
			</div>

			<div className="grid gap-8 md:grid-cols-[1fr_320px]">
				{/* Cart items */}
				<div className="flex flex-col gap-4">
					{items.map((item) => (
						<Card key={item.productId}>
							<CardContent className="flex gap-4 p-4">
								{item.imageUrl ? (
									<img
										src={item.imageUrl}
										alt={item.name}
										className="size-20 shrink-0 object-cover"
									/>
								) : (
									<div className="flex size-20 shrink-0 items-center justify-center bg-muted">
										<ShoppingBagIcon className="size-5 text-muted-foreground" />
									</div>
								)}
								<div className="flex flex-1 flex-col justify-between">
									<div className="flex items-start justify-between">
										<div>
											<h3 className="font-medium font-sans text-body-md text-foreground">
												{item.name}
											</h3>
											<p className="text-caption text-muted-foreground">
												{formatAED(item.price)} each
											</p>
										</div>
										<Button
											variant="ghost"
											size="icon-sm"
											onClick={() => removeItem(item.productId)}
											aria-label={`Remove ${item.name}`}
										>
											<Trash2Icon className="size-4" />
										</Button>
									</div>
									<div className="flex items-center gap-2">
										<Button
											variant="outline"
											size="icon-sm"
											onClick={() =>
												updateQuantity(item.productId, item.quantity - 1)
											}
										>
											<MinusIcon className="size-3" />
										</Button>
										<span className="w-8 text-center text-body-md">
											{item.quantity}
										</span>
										<Button
											variant="outline"
											size="icon-sm"
											onClick={() =>
												updateQuantity(item.productId, item.quantity + 1)
											}
										>
											<PlusIcon className="size-3" />
										</Button>
										<span className="ml-auto font-bold font-sans text-body-md text-foreground">
											{formatAED(item.price * item.quantity)}
										</span>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Order summary */}
				<div>
					<Card>
						<CardHeader>
							<CardTitle className="font-bold font-sans text-foreground text-headline-sm">
								Order summary
							</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-col gap-3">
							<div className="flex justify-between text-body-sm">
								<span className="text-muted-foreground">
									Subtotal ({itemCount} items)
								</span>
								<span className="font-sans text-foreground">
									{formatAED(total)}
								</span>
							</div>
							<div className="flex justify-between text-body-sm">
								<span className="text-muted-foreground">Shipping</span>
								<span className="font-sans text-foreground">Free</span>
							</div>
							<hr />
							<div className="flex justify-between">
								<span className="font-bold font-sans text-body-md text-foreground">
									Total
								</span>
								<span className="font-bold font-sans text-body-md text-foreground">
									{formatAED(total)}
								</span>
							</div>
							<Link href={"/checkout" as Route} className="mt-2">
								<Button className="w-full">Proceed to checkout</Button>
							</Link>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
