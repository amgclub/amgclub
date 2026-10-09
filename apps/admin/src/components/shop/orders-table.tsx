"use client";

import type { OrderDTO } from "@amgclub/api/routers/orders";
import { Button } from "@amgclub/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@amgclub/ui/components/dropdown-menu";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@amgclub/ui/components/empty";
import { Skeleton } from "@amgclub/ui/components/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@amgclub/ui/components/table";
import {
	CircleCheckIcon,
	CircleXIcon,
	EllipsisVerticalIcon,
	ShoppingBagIcon,
	TruckIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import {
	type OrderStatus,
	OrderStatusBadge,
	PaymentStatusBadge,
} from "@/components/status-badge";
import { formatAED, formatDateTime } from "@/lib/format";

export interface OrdersTableProps {
	orders: OrderDTO[];
	loading: boolean;
	error: { message: string } | null;
	onRetry: () => void;
	onStatusChange: (order: OrderDTO, status: OrderStatus) => void;
	hasFilters: boolean;
}

export function OrdersTable({
	orders,
	loading,
	error,
	onRetry,
	onStatusChange,
	hasFilters,
}: OrdersTableProps) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Order #</TableHead>
					<TableHead>Customer</TableHead>
					<TableHead>Items</TableHead>
					<TableHead>Total</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Payment</TableHead>
					<TableHead>Date</TableHead>
					<TableHead className="text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{loading ? (
					Array.from({ length: 6 }).map((_, index) => (
						<TableRow key={`skeleton-${String(index)}`}>
							{Array.from({ length: 8 }).map((__, cell) => (
								<TableCell key={`skeleton-${String(index)}-${String(cell)}`}>
									<Skeleton className="h-4 w-full" />
								</TableCell>
							))}
						</TableRow>
					))
				) : error ? (
					<TableRow>
						<TableCell colSpan={8}>
							<div className="flex flex-col items-center gap-2 py-8">
								<p className="text-body-sm text-destructive-70">
									Failed to load orders: {error.message}
								</p>
								<Button
									variant="outline"
									size="sm"
									className="min-h-11 min-w-11"
									onClick={onRetry}
								>
									Try again
								</Button>
							</div>
						</TableCell>
					</TableRow>
				) : orders.length === 0 ? (
					<TableRow>
						<TableCell colSpan={8}>
							<Empty className="border-none">
								<EmptyHeader>
									<EmptyMedia variant="icon">
										<ShoppingBagIcon />
									</EmptyMedia>
									<EmptyTitle>No orders found</EmptyTitle>
									<EmptyDescription>
										{hasFilters
											? "No orders match the current filters."
											: "Orders will appear here once customers start purchasing."}
									</EmptyDescription>
								</EmptyHeader>
							</Empty>
						</TableCell>
					</TableRow>
				) : (
					orders.map((order) => (
						<OrderRow
							key={order.id}
							order={order}
							onStatusChange={onStatusChange}
						/>
					))
				)}
			</TableBody>
		</Table>
	);
}

function OrderRow({
	order,
	onStatusChange,
}: {
	order: OrderDTO;
	onStatusChange: (order: OrderDTO, status: OrderStatus) => void;
}) {
	return (
		<TableRow>
			<TableCell>
				<Link
					href={`/shop/orders/${order.id}` as Route}
					className="font-medium text-foreground hover:text-primary-70"
				>
					{order.orderNumber}
				</Link>
			</TableCell>
			<TableCell>
				<div className="min-w-0">
					<p className="truncate font-medium text-foreground">
						{order.customerName}
					</p>
					<p className="truncate text-caption text-muted-foreground">
						{order.customerEmail}
					</p>
				</div>
			</TableCell>
			<TableCell>{order.items.length}</TableCell>
			<TableCell>{formatAED(order.total)}</TableCell>
			<TableCell>
				<OrderStatusBadge status={order.status} />
			</TableCell>
			<TableCell>
				<PaymentStatusBadge status={order.paymentStatus} />
			</TableCell>
			<TableCell>
				<span className="text-body-sm">{formatDateTime(order.createdAt)}</span>
			</TableCell>
			<TableCell className="text-right">
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button
								variant="ghost"
								size="icon-sm"
								aria-label={`Actions for order ${order.orderNumber}`}
							/>
						}
					>
						<EllipsisVerticalIcon />
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-44">
						{order.status !== "confirmed" && order.status !== "canceled" ? (
							<DropdownMenuItem
								onClick={() => {
									onStatusChange(order, "confirmed");
								}}
							>
								<CircleCheckIcon />
								Confirm
							</DropdownMenuItem>
						) : null}
						{order.status === "confirmed" ? (
							<DropdownMenuItem
								onClick={() => {
									onStatusChange(order, "shipped");
								}}
							>
								<TruckIcon />
								Mark shipped
							</DropdownMenuItem>
						) : null}
						{order.status === "shipped" ? (
							<DropdownMenuItem
								onClick={() => {
									onStatusChange(order, "delivered");
								}}
							>
								<CircleCheckIcon />
								Mark delivered
							</DropdownMenuItem>
						) : null}
						{order.status !== "canceled" ? (
							<>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									variant="destructive"
									onClick={() => {
										onStatusChange(order, "canceled");
									}}
								>
									<CircleXIcon />
									Cancel order
								</DropdownMenuItem>
							</>
						) : null}
					</DropdownMenuContent>
				</DropdownMenu>
			</TableCell>
		</TableRow>
	);
}
