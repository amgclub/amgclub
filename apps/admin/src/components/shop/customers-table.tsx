"use client";

import type { CustomerDTO } from "@amgclub/api/routers/customers";
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
	EllipsisVerticalIcon,
	PencilIcon,
	Trash2Icon,
	UsersIcon,
} from "lucide-react";

import { formatDateTime } from "@/lib/format";

export interface CustomersTableProps {
	customers: CustomerDTO[];
	loading: boolean;
	error: { message: string } | null;
	onRetry: () => void;
	onEdit: (customer: CustomerDTO) => void;
	onDelete: (customer: CustomerDTO) => void;
	hasFilters: boolean;
}

export function CustomersTable({
	customers,
	loading,
	error,
	onRetry,
	onEdit,
	onDelete,
	hasFilters,
}: CustomersTableProps) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Name</TableHead>
					<TableHead>Email</TableHead>
					<TableHead>Phone</TableHead>
					<TableHead>Created</TableHead>
					<TableHead className="text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{loading ? (
					Array.from({ length: 6 }).map((_, index) => (
						<TableRow key={`skeleton-${String(index)}`}>
							{Array.from({ length: 5 }).map((__, cell) => (
								<TableCell key={`skeleton-${String(index)}-${String(cell)}`}>
									<Skeleton className="h-4 w-full" />
								</TableCell>
							))}
						</TableRow>
					))
				) : error ? (
					<TableRow>
						<TableCell colSpan={5}>
							<div className="flex flex-col items-center gap-2 py-8">
								<p className="text-body-sm text-destructive-70">
									Failed to load customers: {error.message}
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
				) : customers.length === 0 ? (
					<TableRow>
						<TableCell colSpan={5}>
							<Empty className="border-none">
								<EmptyHeader>
									<EmptyMedia variant="icon">
										<UsersIcon />
									</EmptyMedia>
									<EmptyTitle>No customers found</EmptyTitle>
									<EmptyDescription>
										{hasFilters
											? "No customers match the current search."
											: "Customers will appear here once they place an order."}
									</EmptyDescription>
								</EmptyHeader>
							</Empty>
						</TableCell>
					</TableRow>
				) : (
					customers.map((customer) => (
						<CustomerRow
							key={customer.id}
							customer={customer}
							onEdit={onEdit}
							onDelete={onDelete}
						/>
					))
				)}
			</TableBody>
		</Table>
	);
}

function CustomerRow({
	customer,
	onEdit,
	onDelete,
}: {
	customer: CustomerDTO;
	onEdit: (customer: CustomerDTO) => void;
	onDelete: (customer: CustomerDTO) => void;
}) {
	return (
		<TableRow>
			<TableCell>
				<p className="font-medium text-foreground">{customer.name}</p>
			</TableCell>
			<TableCell>
				<p className="text-body-sm text-muted-foreground">{customer.email}</p>
			</TableCell>
			<TableCell>
				<p className="text-body-sm text-muted-foreground">
					{customer.phone ?? "—"}
				</p>
			</TableCell>
			<TableCell>
				<span className="text-body-sm">
					{formatDateTime(customer.createdAt)}
				</span>
			</TableCell>
			<TableCell className="text-right">
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button
								variant="ghost"
								size="icon-sm"
								aria-label={`Actions for ${customer.name}`}
							/>
						}
					>
						<EllipsisVerticalIcon />
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-40">
						<DropdownMenuItem
							onClick={() => {
								onEdit(customer);
							}}
						>
							<PencilIcon />
							Edit
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							variant="destructive"
							onClick={() => {
								onDelete(customer);
							}}
						>
							<Trash2Icon />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</TableCell>
		</TableRow>
	);
}
