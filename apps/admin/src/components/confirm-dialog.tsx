"use client";

import { Button } from "@amgclub/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@amgclub/ui/components/dialog";

interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	confirmLabel?: string;
	cancelLabel?: string;
	loading?: boolean;
	onConfirm: () => void;
}

/** Generic destructive-action confirmation dialog. */
export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel = "Delete",
	cancelLabel = "Cancel",
	loading = false,
	onConfirm,
}: ConfirmDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						variant="outline"
						type="button"
						onClick={() => onOpenChange(false)}
						disabled={loading}
					>
						{cancelLabel}
					</Button>
					<Button
						variant="destructive"
						type="button"
						onClick={onConfirm}
						disabled={loading}
					>
						{loading ? "Working…" : confirmLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
