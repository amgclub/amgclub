import {
	deleteStoredObject,
	getSignedUploadUrl,
	StorageError,
} from "@amgclub/storage";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { adminProcedure, router } from "../index";

export const storageRouter = router({
	getUploadUrl: adminProcedure
		.input(
			z.object({
				contentType: z.string(),
				size: z.number().int().positive(),
				fileName: z.string().optional(),
				folder: z.enum(["events", "products"]).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				return await getSignedUploadUrl(input, ctx.session.user.id);
			} catch (error) {
				if (error instanceof StorageError) {
					if (
						error.code === "invalid-type" ||
						error.code === "invalid-folder"
					) {
						throw new TRPCError({
							code: "BAD_REQUEST",
							message: error.message,
							cause: error,
						});
					}
					if (error.code === "too-large") {
						throw new TRPCError({
							code: "PAYLOAD_TOO_LARGE",
							message: error.message,
							cause: error,
						});
					}
					if (error.code === "unauthorized") {
						throw new TRPCError({
							code: "UNAUTHORIZED",
							message: error.message,
							cause: error,
						});
					}
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: error.message,
						cause: error,
					});
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message:
						error instanceof Error
							? error.message
							: "Failed to generate upload URL",
					cause: error,
				});
			}
		}),

	deleteFile: adminProcedure
		.input(
			z.object({
				url: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				await deleteStoredObject(input.url, ctx.session.user.id);
				return { success: true };
			} catch (error) {
				if (error instanceof StorageError) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: error.message,
						cause: error,
					});
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message:
						error instanceof Error ? error.message : "Failed to delete file",
					cause: error,
				});
			}
		}),
});
