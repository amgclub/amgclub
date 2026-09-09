"use client";

import type { MemberDTO } from "@amgclub/api/routers/members";
import { Badge } from "@amgclub/ui/components/badge";
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
	BanIcon,
	CircleCheckIcon,
	EllipsisVerticalIcon,
	PauseIcon,
	PencilIcon,
	PlayIcon,
	Trash2Icon,
	UsersIcon,
} from "lucide-react";

import {
	type MembershipStatus,
	MembershipStatusBadge,
} from "@/components/status-badge";
import { formatAED, formatDate, isExpiringSoon } from "@/lib/format";

export interface MembersTableProps {
	members: MemberDTO[];
	loading: boolean;
	error: { message: string } | null;
	expiringSoonDays: number;
	onRetry: () => void;
	onEdit: (member: MemberDTO) => void;
	onDelete: (member: MemberDTO) => void;
	onStatusChange: (member: MemberDTO, status: MembershipStatus) => void;
	hasFilters: boolean;
}

export function MembersTable({
	members,
	loading,
	error,
	expiringSoonDays,
	onRetry,
	onEdit,
	onDelete,
	onStatusChange,
	hasFilters,
}: MembersTableProps) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Name</TableHead>
					<TableHead>Email</TableHead>
					<TableHead>Phone</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Start Date</TableHead>
					<TableHead>End Date</TableHead>
					<TableHead>Price</TableHead>
					<TableHead className="text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{loading ? (
					Array.from({ length: 8 }).map((_, index) => (
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
								<p className="text-body-sm text-destructive">
									Failed to load members: {error.message}
								</p>
								<Button variant="outline" size="sm" onClick={onRetry}>
									Try again
								</Button>
							</div>
						</TableCell>
					</TableRow>
				) : members.length === 0 ? (
					<TableRow>
						<TableCell colSpan={8}>
							<Empty className="border-none">
								<EmptyHeader>
									<EmptyMedia variant="icon">
										<UsersIcon />
									</EmptyMedia>
									<EmptyTitle>No members found</EmptyTitle>
									<EmptyDescription>
										{hasFilters
											? "No members match the current filters."
											: "Add a member manually or wait for website applications."}
									</EmptyDescription>
								</EmptyHeader>
							</Empty>
						</TableCell>
					</TableRow>
				) : (
					members.map((member) => (
						<MembersTableRow
							key={member.id}
							member={member}
							expiringSoonDays={expiringSoonDays}
							onEdit={onEdit}
							onDelete={onDelete}
							onStatusChange={onStatusChange}
						/>
					))
				)}
			</TableBody>
		</Table>
	);
}

function MembersTableRow({
	member,
	expiringSoonDays,
	onEdit,
	onDelete,
	onStatusChange,
}: {
	member: MemberDTO;
	expiringSoonDays: number;
	onEdit: (member: MemberDTO) => void;
	onDelete: (member: MemberDTO) => void;
	onStatusChange: (member: MemberDTO, status: MembershipStatus) => void;
}) {
	const expiring =
		member.status === "active" &&
		isExpiringSoon(member.endDate, expiringSoonDays);

	return (
		<TableRow>
			<TableCell className="font-medium">{member.memberName}</TableCell>
			<TableCell>{member.email}</TableCell>
			<TableCell>{member.phone}</TableCell>
			<TableCell>
				<MembershipStatusBadge status={member.status} />
			</TableCell>
			<TableCell>{formatDate(member.startDate)}</TableCell>
			<TableCell>
				<div className="flex flex-col items-start gap-1">
					<span className={expiring ? "text-destructive" : undefined}>
						{formatDate(member.endDate)}
					</span>
					{expiring ? <Badge variant="destructive">Expiring soon</Badge> : null}
				</div>
			</TableCell>
			<TableCell>{formatAED(member.price)}</TableCell>
			<TableCell className="text-right">
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button
								variant="ghost"
								size="icon-sm"
								aria-label={`Actions for ${member.memberName}`}
							/>
						}
					>
						<EllipsisVerticalIcon />
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-44">
						{member.status === "in_review" ||
						member.status === "paused" ||
						member.status === "canceled" ? (
							<DropdownMenuItem
								onClick={() => {
									onStatusChange(member, "active");
								}}
							>
								{member.status === "in_review" ? (
									<CircleCheckIcon />
								) : (
									<PlayIcon />
								)}
								{member.status === "in_review"
									? "Approve"
									: member.status === "paused"
										? "Resume"
										: "Reactivate"}
							</DropdownMenuItem>
						) : null}
						{member.status === "active" ? (
							<DropdownMenuItem
								onClick={() => {
									onStatusChange(member, "paused");
								}}
							>
								<PauseIcon />
								Pause
							</DropdownMenuItem>
						) : null}
						{member.status !== "canceled" ? (
							<DropdownMenuItem
								variant="destructive"
								onClick={() => {
									onStatusChange(member, "canceled");
								}}
							>
								<BanIcon />
								Cancel membership
							</DropdownMenuItem>
						) : null}
						<DropdownMenuItem
							onClick={() => {
								onEdit(member);
							}}
						>
							<PencilIcon />
							Edit
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							variant="destructive"
							onClick={() => {
								onDelete(member);
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
