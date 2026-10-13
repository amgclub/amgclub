"use client";

import type { ProductDTO } from "@amgclub/api/routers/shop";
import { Button } from "@amgclub/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@amgclub/ui/components/dialog";
import { Field, FieldGroup, FieldLabel } from "@amgclub/ui/components/field";
import { Input } from "@amgclub/ui/components/input";
import { Textarea } from "@amgclub/ui/components/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ImageIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { queryClient, trpc } from "@/utils/trpc";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const productFormSchema = z.object({
	name: z.string().min(1, "Name is required").max(200),
	slug: z.string().min(1, "Slug is required").max(200),
	description: z.string().max(8000).optional(),
	price: z.coerce.number().min(0, "Price must be zero or more").max(1_000_000),
	compareAtPrice: z.coerce
		.number()
		.min(0)
		.max(1_000_000)
		.optional()
		.or(z.literal(0)),
	status: z.enum(["draft", "active", "archived"]),
	inventory: z.coerce.number().int().min(0).default(0),
	sku: z.string().max(60).optional().or(z.literal("")),
	weight: z.coerce.number().min(0).max(999).optional().or(z.literal(0)),
});

type ProductFormInput = z.input<typeof productFormSchema>;
type ProductFormOutput = z.output<typeof productFormSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "")
		.replace(/[\s_]+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

function FieldErrorText({ message }: { message?: string }) {
	if (!message) {
		return null;
	}
	return <p className="text-caption text-destructive-70">{message}</p>;
}

const statusOptions = [
	{ value: "draft", label: "Draft" },
	{ value: "active", label: "Active" },
	{ value: "archived", label: "Archived" },
] as const;

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

// ---------------------------------------------------------------------------
// Image upload slot
// ---------------------------------------------------------------------------

interface ImageSlot {
	file: File;
	previewUrl: string;
	altText: string;
	sortOrder: number;
}

function ImageUploadSlot({
	slot,
	onUpdate,
	onRemove,
}: {
	slot: ImageSlot;
	onUpdate: (
		updates: Partial<Pick<ImageSlot, "altText" | "file" | "previewUrl">>,
	) => void;
	onRemove: () => void;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const prevUrlRef = useRef(slot.previewUrl);

	function openPicker() {
		inputRef.current?.click();
	}

	function handleFileChange(files: FileList | null | undefined) {
		const file = files?.[0];
		if (!file) return;
		if (!file.type.startsWith("image/")) {
			toast.error("Only image files are allowed.");
			return;
		}
		if (file.size > MAX_IMAGE_BYTES) {
			toast.error("Images must be 10 MB or smaller.");
			return;
		}
		if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
		const url = URL.createObjectURL(file);
		prevUrlRef.current = url;
		onUpdate({ file, previewUrl: url });
	}

	return (
		<div className="flex items-start gap-3 border p-3">
			<img
				src={slot.previewUrl}
				alt=""
				className="size-20 shrink-0 border object-cover"
			/>
			<div className="flex flex-1 flex-col gap-2">
				<Input
					placeholder="Alt text (optional)"
					value={slot.altText}
					onChange={(e) => {
						onUpdate({ altText: e.target.value });
					}}
				/>
				<div className="flex items-center gap-2">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={openPicker}
					>
						<ImageIcon />
						Replace
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => {
							if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
							onRemove();
						}}
					>
						<Trash2Icon />
						Remove
					</Button>
				</div>
			</div>
			<input
				ref={inputRef}
				type="file"
				accept="image/*"
				className="hidden"
				onChange={(e) => {
					handleFileChange(e.target.files);
					e.target.value = "";
				}}
			/>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProductFormDialog({
	open,
	onOpenChange,
	product,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	product?: ProductDTO | null;
}) {
	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<ProductFormInput, unknown, ProductFormOutput>({
		resolver: zodResolver(productFormSchema),

		defaultValues: product
			? {
					name: product.name,
					slug: product.slug,
					description: product.description ?? "",
					price: product.price,
					compareAtPrice: product.compareAtPrice ?? 0,
					status: product.status,
					inventory: product.inventory,
					sku: product.sku ?? "",
					weight: product.weight ?? 0,
				}
			: {
					name: "",
					slug: "",
					description: "",
					price: 0,
					compareAtPrice: 0,
					status: "draft",
					inventory: 0,
					sku: "",
					weight: 0,
				},
	});

	const name = watch("name");
	const status = watch("status");
	const slugManuallyEdited = useRef(false);

	// ── Image state ────────────────────────────────────────────────────
	const [imageSlots, setImageSlots] = useState<ImageSlot[]>(() =>
		(product?.images ?? []).map((img) => ({
			file: null as unknown as File,
			previewUrl: img.url,
			altText: img.altText ?? "",
			sortOrder: img.sortOrder,
		})),
	);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const addFiles = useCallback((files: FileList | null | undefined) => {
		if (!files) return;
		const newSlots: ImageSlot[] = [];
		for (const file of Array.from(files)) {
			if (!file.type.startsWith("image/")) {
				toast.error(`Skipping "${file.name}": only image files are allowed.`);
				continue;
			}
			if (file.size > MAX_IMAGE_BYTES) {
				toast.error(
					`Skipping "${file.name}": images must be 10 MB or smaller.`,
				);
				continue;
			}
			newSlots.push({
				file,
				previewUrl: URL.createObjectURL(file),
				altText: "",
				sortOrder: 0,
			});
		}
		setImageSlots((prev) => {
			const offset = prev.length;
			return [
				...prev,
				...newSlots.map((s, i) => ({
					...s,
					sortOrder: offset + i,
				})),
			];
		});
	}, []);

	function updateSlot(
		index: number,
		updates: Partial<Pick<ImageSlot, "altText" | "file" | "previewUrl">>,
	) {
		setImageSlots((prev) =>
			prev.map((s, i) => (i === index ? { ...s, ...updates } : s)),
		);
	}

	function removeSlot(index: number) {
		setImageSlots((prev) => prev.filter((_, i) => i !== index));
	}

	// ── Mutations ──────────────────────────────────────────────────────
	const createMutation = useMutation({
		...trpc.shop.create.mutationOptions(),
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const updateMutation = useMutation({
		...trpc.shop.update.mutationOptions(),
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const updateImagesMutation = useMutation({
		...trpc.shop.updateImages.mutationOptions(),
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const getUploadUrlMutation = useMutation(
		trpc.storage.getUploadUrl.mutationOptions(),
	);

	const submitting =
		createMutation.isPending ||
		updateMutation.isPending ||
		updateImagesMutation.isPending;

	function autoSlug() {
		if (!product && !slugManuallyEdited.current) {
			setValue("slug", slugify(name), { shouldValidate: true });
		}
	}

	async function onSubmit(values: ProductFormOutput) {
		const payload = {
			name: values.name,
			slug: values.slug,
			description: values.description || undefined,
			price: values.price,
			compareAtPrice: values.compareAtPrice || undefined,
			status: values.status,
			inventory: values.inventory,
			sku: values.sku || undefined,
			weight: values.weight || undefined,
		};

		let savedProduct: ProductDTO;

		if (product) {
			savedProduct = await updateMutation.mutateAsync({
				id: product.id,
				data: payload,
			});
		} else {
			savedProduct = await createMutation.mutateAsync(payload);
		}

		// Upload pending image files and save to product_images
		const slotsWithFiles = imageSlots.filter((s) => s.file instanceof File);
		if (slotsWithFiles.length > 0 || product) {
			const uploadedImages: {
				url: string;
				altText?: string;
				sortOrder: number;
			}[] = [];

			for (const slot of imageSlots) {
				if (slot.file instanceof File) {
					try {
						const { uploadUrl, publicUrl } =
							await getUploadUrlMutation.mutateAsync({
								contentType: slot.file.type,
								size: slot.file.size,
								fileName: slot.file.name,
								// Shop media belongs in its own folder; the storage
								// default is "events".
								folder: "products",
							});

						const uploadResponse = await fetch(uploadUrl, {
							method: "PUT",
							headers: { "Content-Type": slot.file.type },
							body: slot.file,
						});
						if (!uploadResponse.ok) {
							throw new Error(`Upload failed (${uploadResponse.status})`);
						}

						uploadedImages.push({
							url: publicUrl,
							altText: slot.altText || undefined,
							sortOrder: slot.sortOrder,
						});
					} catch (err) {
						toast.error(
							`Failed to upload "${slot.file.name}": ${err instanceof Error ? err.message : "Unknown error"}`,
						);
					}
				} else if (slot.previewUrl) {
					uploadedImages.push({
						url: slot.previewUrl,
						altText: slot.altText || undefined,
						sortOrder: slot.sortOrder,
					});
				}
			}

			await updateImagesMutation.mutateAsync({
				productId: savedProduct.id,
				images: uploadedImages,
			});
		}

		toast.success(product ? "Product updated" : "Product created");
		queryClient.invalidateQueries();
		onOpenChange(false);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>
						{product ? "Edit product" : "Create product"}
					</DialogTitle>
					<DialogDescription>
						{product
							? "Update product details, images, and inventory."
							: "Add a new product to the shop."}
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleSubmit(onSubmit)(e);
					}}
					className="flex flex-col gap-4"
				>
					<FieldGroup>
						{/* ── Basic info ─────────────────────────────────── */}
						<Field>
							<FieldLabel>Name</FieldLabel>
							<Input
								id="product-name"
								placeholder="AMG Performance Cap"
								aria-invalid={Boolean(errors.name)}
								{...register("name", { onChange: autoSlug })}
							/>
							<FieldErrorText message={errors.name?.message} />
						</Field>

						<Field>
							<FieldLabel>Slug</FieldLabel>
							<Input
								id="product-slug"
								placeholder="amg-performance-cap"
								aria-invalid={Boolean(errors.slug)}
								{...register("slug", {
									onChange: () => {
										slugManuallyEdited.current = true;
									},
								})}
							/>
							<FieldErrorText message={errors.slug?.message} />
						</Field>

						<Field>
							<FieldLabel>Description</FieldLabel>
							<Textarea
								id="product-description"
								rows={3}
								placeholder="Product description…"
								{...register("description")}
							/>
							<FieldErrorText message={errors.description?.message} />
						</Field>

						{/* ── Pricing & inventory ────────────────────────── */}
						<div className="grid gap-4 sm:grid-cols-3">
							<Field>
								<FieldLabel>Price (AED)</FieldLabel>
								<Input
									id="product-price"
									type="number"
									min={0}
									step={0.01}
									aria-invalid={Boolean(errors.price)}
									{...register("price")}
								/>
								<FieldErrorText message={errors.price?.message} />
							</Field>
							<Field>
								<FieldLabel>Compare at price</FieldLabel>
								<Input
									id="product-compare"
									type="number"
									min={0}
									step={0.01}
									placeholder="Optional"
									{...register("compareAtPrice")}
								/>
							</Field>
							<Field>
								<FieldLabel>Inventory</FieldLabel>
								<Input
									id="product-inventory"
									type="number"
									min={0}
									aria-invalid={Boolean(errors.inventory)}
									{...register("inventory")}
								/>
								<FieldErrorText message={errors.inventory?.message} />
							</Field>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<Field>
								<FieldLabel>SKU</FieldLabel>
								<Input
									id="product-sku"
									placeholder="Optional"
									{...register("sku")}
								/>
							</Field>
							<Field>
								<FieldLabel>Weight (kg)</FieldLabel>
								<Input
									id="product-weight"
									type="number"
									min={0}
									step={0.1}
									placeholder="Optional"
									{...register("weight")}
								/>
							</Field>
						</div>

						{/* ── Status ─────────────────────────────────────── */}
						<Field>
							<FieldLabel>Status</FieldLabel>
							<div
								role="radiogroup"
								aria-label="Product status"
								className="flex flex-wrap gap-1"
							>
								{statusOptions.map((option) => (
									<Button
										key={option.value}
										type="button"
										size="sm"
										variant={status === option.value ? "default" : "outline"}
										aria-pressed={status === option.value}
										onClick={() => {
											setValue("status", option.value, {
												shouldValidate: true,
											});
										}}
									>
										{option.label}
									</Button>
								))}
							</div>
							<FieldErrorText message={errors.status?.message} />
						</Field>

						{/* ── Images ─────────────────────────────────────── */}
						<div className="flex flex-col gap-3 border-t pt-4">
							<div className="flex items-center justify-between">
								<h3 className="font-medium font-sans text-label-lg">Images</h3>
								<Button
									type="button"
									size="sm"
									variant="outline"
									onClick={() => fileInputRef.current?.click()}
								>
									<UploadIcon />
									Add images
								</Button>
							</div>
							{imageSlots.length > 0 ? (
								<div className="flex flex-col gap-3">
									{imageSlots.map((slot, index) => (
										<ImageUploadSlot
											key={`${String(index)}-${slot.previewUrl}`}
											slot={slot}
											onUpdate={(updates) => {
												updateSlot(index, updates);
											}}
											onRemove={() => {
												removeSlot(index);
											}}
										/>
									))}
								</div>
							) : (
								<button
									type="button"
									onClick={() => fileInputRef.current?.click()}
									className="flex w-full cursor-pointer flex-col items-center gap-2 border-border border-dashed bg-surface-weak p-6 text-center text-caption text-muted-foreground"
								>
									<UploadIcon className="size-5 text-muted-foreground" />
									<p className="font-medium font-sans text-foreground">
										Drop images here
									</p>
									<p>PNG or JPG, up to 10 MB each</p>
								</button>
							)}
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								multiple
								className="hidden"
								onChange={(e) => {
									addFiles(e.target.files);
									e.target.value = "";
								}}
							/>
						</div>
					</FieldGroup>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								onOpenChange(false);
							}}
							disabled={submitting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={submitting}>
							{submitting
								? "Saving…"
								: product
									? "Save changes"
									: "Create product"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
