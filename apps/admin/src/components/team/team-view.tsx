"use client";

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
import { useQuery } from "@tanstack/react-query";
import {
	BanIcon,
	CircleCheckIcon,
	EllipsisVerticalIcon,
	KeyRoundIcon,
	ShieldIcon,
	Trash2Icon,
	UserPlusIcon,
	UsersIcon,
} from "lucide-react";

import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { AddTeamMemberDialog } from "@/components/team/add-team-member-dialog";
import { ChangePasswordDialog } from "@/components/team/change-password-dialog";
import { authClient } from "@/lib/auth-client";
import { formatDateTime } from "@/lib/format";

interface TeamUser {
	id: string;
	name: string;
	email: string;
	role?: string | null;
	banned?: boolean | null;
	createdAt: string;
}

function useTeamUsers() {
	return useQuery({
		queryKey: ["team", "users"],
		queryFn: async (): Promise<TeamUser[]> => {
			const { data, error } = await authClient.admin.listUsers({
				query: { limit: 100, sortBy: "createdAt" },
			});
			if (error) {
				throw new Error(error.message ?? "Failed to load team members");
			}
			return (data?.users ?? []).map((user) => ({
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				banned: user.banned,
				createdAt:
					user.createdAt instanceof Date
						? user.createdAt.toISOString()
						: String(user.createdAt),
			}));
		},
	});
}

export function TeamView() {
	const [addOpen, setAddOpen] = useState(false);
	const [removeTarget, setRemoveTarget] = useState<TeamUser | null>(null);
	const [passwordTarget, setPasswordTarget] = useState<TeamUser | null>(null);
	const usersQuery = useTeamUsers();

	async function setRole(user: TeamUser, role: "admin" | "user") {
		const { error } = await authClient.admin.setRole({ userId: user.id, role });
		if (error) {
			toast.error(error.message ?? "Failed to update role");
			return;
		}
		toast.success(
			`${user.name} is now ${role === "admin" ? "an admin" : "staff"}`,
		);
		usersQuery.refetch().catch(() => {
			toast.error("Refresh failed");
		});
	}

	async function setBanned(user: TeamUser, banned: boolean) {
		const { error } = banned
			? await authClient.admin.banUser({ userId: user.id })
			: await authClient.admin.unbanUser({ userId: user.id });
		if (error) {
			toast.error(error.message ?? "Failed to update member");
			return;
		}
		toast.success(banned ? `${user.name} banned` : `${user.name} unbanned`);
		usersQuery.refetch().catch(() => {
			toast.error("Refresh failed");
		});
	}

	async function removeUser(user: TeamUser) {
		const { error } = await authClient.admin.removeUser({ userId: user.id });
		if (error) {
			toast.error(error.message ?? "Failed to remove team member");
			return;
		}
		toast.success(`${user.name} removed`);
		setRemoveTarget(null);
		usersQuery.refetch().catch(() => {
			toast.error("Refresh failed");
		});
	}

	const users = usersQuery.data ?? [];

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="font-extrabold font-sans text-headline-lg">Team</h1>
					<p className="text-body-sm text-muted-foreground">
						Backend accounts that can access this console. There is no public
						sign-up.
					</p>
				</div>
				<Button
					onClick={() => {
						setAddOpen(true);
					}}
				>
					<UserPlusIcon />
					Add team member
				</Button>
			</div>

			<div className="border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Role</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Created</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{usersQuery.isPending ? (
							Array.from({ length: 3 }).map((_, index) => (
								<TableRow key={`skeleton-${String(index)}`}>
									{Array.from({ length: 6 }).map((__, cell) => (
										<TableCell
											key={`skeleton-${String(index)}-${String(cell)}`}
										>
											<Skeleton className="h-4 w-full" />
										</TableCell>
									))}
								</TableRow>
							))
						) : usersQuery.isError ? (
							<TableRow>
								<TableCell colSpan={6}>
									<div className="flex flex-col items-center gap-2 py-8">
										<p className="text-body-sm text-destructive">
											{usersQuery.error.message}
										</p>
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												usersQuery.refetch().catch(() => {
													toast.error("Retry failed");
												});
											}}
										>
											Try again
										</Button>
									</div>
								</TableCell>
							</TableRow>
						) : users.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6}>
									<Empty className="border-none">
										<EmptyHeader>
											<EmptyMedia variant="icon">
												<UsersIcon />
											</EmptyMedia>
											<EmptyTitle>No team members</EmptyTitle>
											<EmptyDescription>
												Create the first backend account.
											</EmptyDescription>
										</EmptyHeader>
									</Empty>
								</TableCell>
							</TableRow>
						) : (
							users.map((user) => (
								<TeamRow
									key={user.id}
									user={user}
									onRoleChange={setRole}
									onBanChange={setBanned}
									onRemove={setRemoveTarget}
									onPasswordChange={setPasswordTarget}
								/>
							))
						)}
					</TableBody>
				</Table>
			</div>

			<AddTeamMemberDialog open={addOpen} onOpenChange={setAddOpen} />

			<ChangePasswordDialog
				open={passwordTarget !== null}
				onOpenChange={(next) => {
					if (!next) {
						setPasswordTarget(null);
					}
				}}
				user={passwordTarget}
				onSuccess={() => {
					usersQuery.refetch().catch(() => {
						toast.error("Refresh failed");
					});
				}}
			/>

			<ConfirmDialog
				open={removeTarget !== null}
				onOpenChange={(next) => {
					if (!next) {
						setRemoveTarget(null);
					}
				}}
				title="Remove team member?"
				description={
					removeTarget
						? `${removeTarget.name} (${removeTarget.email}) will lose access to this console immediately.`
						: ""
				}
				confirmLabel="Remove"
				onConfirm={() => {
					if (removeTarget) {
						void removeUser(removeTarget);
					}
				}}
			/>
		</div>
	);
}

function TeamRow({
	user,
	onRoleChange,
	onBanChange,
	onRemove,
	onPasswordChange,
}: {
	user: TeamUser;
	onRoleChange: (user: TeamUser, role: "admin" | "user") => Promise<void>;
	onBanChange: (user: TeamUser, banned: boolean) => Promise<void>;
	onRemove: (user: TeamUser) => void;
	onPasswordChange: (user: TeamUser) => void;
}) {
	return (
		<TableRow>
			<TableCell className="font-medium">{user.name}</TableCell>
			<TableCell>{user.email}</TableCell>
			<TableCell>
				<Badge variant={user.role === "admin" ? "default" : "subtle"}>
					<ShieldIcon />
					{user.role === "admin" ? "Admin" : "Staff"}
				</Badge>
			</TableCell>
			<TableCell>
				{user.banned ? (
					<Badge variant="destructive">Banned</Badge>
				) : (
					<Badge variant="outline">
						<CircleCheckIcon />
						Active
					</Badge>
				)}
			</TableCell>
			<TableCell>{formatDateTime(user.createdAt)}</TableCell>
			<TableCell className="text-right">
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button
								variant="ghost"
								size="icon-sm"
								aria-label={`Actions for ${user.name}`}
							/>
						}
					>
						<EllipsisVerticalIcon />
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-44">
						{user.role !== "admin" ? (
							<DropdownMenuItem
								onClick={() => {
									void onRoleChange(user, "admin");
								}}
							>
								<ShieldIcon />
								Make admin
							</DropdownMenuItem>
						) : (
							<DropdownMenuItem
								onClick={() => {
									void onRoleChange(user, "user");
								}}
							>
								<ShieldIcon />
								Set as staff
							</DropdownMenuItem>
						)}
						{user.banned ? (
							<DropdownMenuItem
								onClick={() => {
									void onBanChange(user, false);
								}}
							>
								<CircleCheckIcon />
								Unban
							</DropdownMenuItem>
						) : (
							<DropdownMenuItem
								variant="destructive"
								onClick={() => {
									void onBanChange(user, true);
								}}
							>
								<BanIcon />
								Ban
							</DropdownMenuItem>
						)}
						<DropdownMenuItem
							onClick={() => {
								onPasswordChange(user);
							}}
						>
							<KeyRoundIcon />
							Change password
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							variant="destructive"
							onClick={() => {
								onRemove(user);
							}}
						>
							<Trash2Icon />
							Remove
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</TableCell>
		</TableRow>
	);
}
