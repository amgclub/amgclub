"use client";

import { Button } from "@amgclub/ui/components/button";
import { useMutation } from "@tanstack/react-query";
import { ImageIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { useRef, useState } from "react";
import { trpc } from "@/utils/trpc";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/**
 * Image picker for the event form. Requests a pre-signed upload URL via tRPC
 * and uploads directly to storage, passing the resulting URL back through `onChange`.
 * Track every successful upload with `onUploaded` so callers can delete unsaved
 * files when the dialog closes.
 */
export function ImageUpload({
	imageUrl,
	onChange,
	onUploaded,
}: {
	imageUrl: string | null;
	onChange: (url: string | null) => void;
	onUploaded?: (url: string) => void;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [announcement, setAnnouncement] = useState<string | null>(null);
	const [fileName, setFileName] = useState<string | null>(null);

	const getUploadUrlMutation = useMutation(
		trpc.storage.getUploadUrl.mutationOptions(),
	);

	function openPicker() {
		inputRef.current?.click();
	}

	async function handleFiles(files: FileList | null | undefined) {
		const file = files?.[0];
		if (!file) {
			return;
		}

		if (!file.type.startsWith("image/")) {
			const message = "Only image files are allowed.";
			setError(message);
			setAnnouncement(`Upload failed: ${message}`);
			return;
		}
		if (file.size > MAX_IMAGE_BYTES) {
			const message = "Images must be 10 MB or smaller.";
			setError(message);
			setAnnouncement(`Upload failed: ${message}`);
			return;
		}

		setError(null);
		setUploading(true);
		setAnnouncement("Uploading…");

		try {
			const { uploadUrl, publicUrl } = await getUploadUrlMutation.mutateAsync({
				contentType: file.type,
				size: file.size,
				fileName: file.name,
			});

			const uploadResponse = await fetch(uploadUrl, {
				method: "PUT",
				headers: {
					"Content-Type": file.type,
				},
				body: file,
			});
			if (!uploadResponse.ok) {
				let detail = "";
				try {
					const body = await uploadResponse.text();
					detail = body ? `: ${body}` : "";
				} catch {
					// response body unreadable — leave detail empty
				}
				throw new Error(
					`Failed to upload image to storage (${uploadResponse.status})${detail}`,
				);
			}

			setFileName(file.name);
			setAnnouncement("Image uploaded.");
			onUploaded?.(publicUrl);
			onChange(publicUrl);
		} catch (uploadError) {
			const message =
				uploadError instanceof Error && uploadError.message !== ""
					? uploadError.message
					: "Upload failed.";
			setError(message);
			setAnnouncement(`Upload failed: ${message}`);
		} finally {
			setUploading(false);
		}
	}

	const isUploading = uploading || getUploadUrlMutation.isPending;

	return (
		<div className="flex w-full flex-col gap-2" aria-busy={isUploading}>
			{imageUrl ? (
				<div className="flex items-center gap-3">
					<img
						src={imageUrl}
						alt=""
						className="size-32 shrink-0 border object-cover"
					/>
					<div className="flex flex-col items-start gap-2">
						<p className="max-w-48 truncate text-caption text-muted-foreground">
							{fileName ?? "Image uploaded"}
						</p>
						<div className="flex items-center gap-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								disabled={isUploading}
								onClick={openPicker}
							>
								<ImageIcon />
								Replace
							</Button>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								disabled={isUploading}
								onClick={() => {
									setFileName(null);
									setAnnouncement("Image removed.");
									onChange(null);
								}}
							>
								<Trash2Icon />
								Remove
							</Button>
						</div>
					</div>
				</div>
			) : (
				<button
					type="button"
					disabled={isUploading}
					onClick={openPicker}
					onDragOver={(event) => {
						event.preventDefault();
					}}
					onDrop={(event) => {
						event.preventDefault();
						void handleFiles(event.dataTransfer.files);
					}}
					className="flex w-full cursor-pointer flex-col items-center gap-2 border-border border-dashed bg-surface-weak p-6 text-center text-caption text-muted-foreground"
				>
					<UploadIcon className="size-5 text-muted-foreground" />
					<p className="font-medium text-foreground">Drop an image here</p>
					<p>PNG or JPG, up to 10 MB</p>
					<span className="font-medium font-sans text-label-sm">
						{isUploading ? "Uploading…" : "Browse files"}
					</span>
				</button>
			)}

			<input
				ref={inputRef}
				id="event-image"
				type="file"
				accept="image/*"
				className="hidden"
				aria-label="Upload event image"
				onChange={(event) => {
					void handleFiles(event.target.files);
					event.target.value = "";
				}}
			/>

			{error ? <p className="text-caption text-destructive">{error}</p> : null}

			<p role="status" aria-live="polite" className="sr-only">
				{announcement ?? "No active image upload."}
			</p>
		</div>
	);
}
