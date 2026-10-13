import { randomUUID } from "node:crypto";
import { env } from "@amgclub/env/server";
import {
	DeleteObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Maximum allowed size for an uploaded image, in bytes (10 MiB). */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/** Supported image MIME types mapped to their file extension. */
export const imageMimeTypes: Readonly<Record<string, string>> = Object.freeze({
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
	"image/gif": "gif",
	"image/avif": "avif",
});

/** Storage error codes surfaced to callers. */
export type StorageErrorCode =
	| "unauthorized"
	| "too-large"
	| "invalid-type"
	| "invalid-folder"
	| "upload-failed"
	| "delete-failed";

const STORAGE_ERROR_MESSAGES: Readonly<Record<StorageErrorCode, string>> =
	Object.freeze({
		unauthorized: "An authenticated user is required.",
		"too-large": "Image exceeds the maximum allowed size.",
		"invalid-type": "Unsupported image type.",
		"invalid-folder": "Unsupported media folder.",
		"upload-failed": "Failed to upload the image to storage.",
		"delete-failed": "Failed to delete the object from storage.",
	});

/** Error thrown by the storage helpers when validation, upload, or delete fails. */
export class StorageError extends Error {
	readonly code: StorageErrorCode;
	readonly cause?: unknown;

	constructor(code: StorageErrorCode, message?: string, cause?: unknown) {
		super(message ?? STORAGE_ERROR_MESSAGES[code]);
		this.name = "StorageError";
		this.code = code;
		this.cause = cause;
	}
}

/** An image to be uploaded to storage. */
export interface ImageFile {
	bytes: Uint8Array<ArrayBuffer>;
	contentType: string;
	originalName?: string;
}

/** A stored image with its public URL and storage key. */
export interface StoredImage {
	url: string;
	key: string;
}

/** Input parameters for generating a signed upload URL. */
export interface GetSignedUploadUrlInput {
	contentType: string;
	size: number;
	fileName?: string;
	/**
	 * Storage folder the object lands in. Defaults to "events" so callers that
	 * predate folder scoping keep their existing behaviour.
	 */
	folder?: MediaFolder;
}

/** Result returned when a signed upload URL is generated. */
export interface SignedUploadUrlResult {
	uploadUrl: string;
	key: string;
	publicUrl: string;
}

// ---------------------------------------------------------------------------
// Env access
// ---------------------------------------------------------------------------

type EnvKey = keyof Env & string;

/** Reads a string env value via the runtime proxy; yields undefined when unset. */
function getEnvString(key: EnvKey | string): string | undefined {
	const value =
		(env as unknown as Record<string, unknown>)[key] ?? process.env[key];
	return typeof value === "string" ? value : undefined;
}

/**
 * The active storage backend: "s3" when STORAGE_PROVIDER is set to "s3"
 * (case-insensitive), otherwise "supabase".
 */
export function storageProvider(): "supabase" | "s3" {
	return (getEnvString("STORAGE_PROVIDER") ?? "supabase").toLowerCase() === "s3"
		? "s3"
		: "supabase";
}

// ---------------------------------------------------------------------------
// Validation & key generation
// ---------------------------------------------------------------------------

/**
 * Validates an image upload by MIME type and byte size.
 *
 * @returns the file extension to use for the stored object key.
 * @throws StorageError with code "invalid-type" or "too-large".
 */
export function validateImageUpload(input: {
	contentType: string;
	size: number;
}): { ext: string } {
	const ext = imageMimeTypes[input.contentType];
	if (ext === undefined) {
		throw new StorageError(
			"invalid-type",
			`Unsupported image type "${input.contentType}".`,
		);
	}
	if (input.size > MAX_IMAGE_BYTES) {
		throw new StorageError(
			"too-large",
			`Image is ${input.size} bytes; the maximum is ${MAX_IMAGE_BYTES} bytes.`,
		);
	}
	return { ext };
}

/**
 * Folders an upload may target. Constrained to a fixed set rather than accepted
 * free-form, because the folder becomes a literal segment of the object key.
 */
export const MEDIA_FOLDERS = ["events", "products"] as const;

/** A folder the media bucket accepts uploads into. */
export type MediaFolder = (typeof MEDIA_FOLDERS)[number];

/** Folder used when a caller does not specify one. */
export const DEFAULT_MEDIA_FOLDER: MediaFolder = "events";

/**
 * Builds the storage key for a new image: `{actor}/{folder}/{uuid}.{ext}`.
 * The actor prefix keeps each admin's uploads under their own folder.
 */
function buildKey(ext: string, actor: string, folder: MediaFolder): string {
	// Defence in depth: the folder is part of an object key, so a value outside
	// the allow-list must never be interpolated, even from an untyped caller.
	if (!(MEDIA_FOLDERS as readonly string[]).includes(folder)) {
		throw new StorageError(
			"invalid-folder",
			`Unsupported media folder "${folder}".`,
		);
	}
	return `${actor}/${folder}/${randomUUID()}.${ext}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generates a pre-signed PUT upload URL for direct client-to-storage uploads.
 * Validates file size (<= 10 MiB) and content type, scoping the key to the actor.
 *
 * @throws StorageError with code "unauthorized", "invalid-type", "too-large", or "upload-failed".
 */
export async function getSignedUploadUrl(
	input: GetSignedUploadUrlInput,
	actor: string,
): Promise<SignedUploadUrlResult> {
	const userId = actor.trim();
	if (userId === "") {
		throw new StorageError("unauthorized");
	}

	const { ext } = validateImageUpload({
		contentType: input.contentType,
		size: input.size,
	});
	const key = buildKey(ext, userId, input.folder ?? DEFAULT_MEDIA_FOLDER);

	if (storageProvider() === "s3") {
		const bucket = getEnvString("AWS_MEDIA_BUCKET_NAME") ?? "";
		try {
			const uploadUrl = await getSignedUrl(
				getS3Client(),
				new PutObjectCommand({
					Bucket: bucket,
					Key: key,
					ContentType: input.contentType,
					CacheControl: "public, max-age=31536000, immutable",
				}),
				{ expiresIn: 900 },
			);
			const publicUrl = getPublicUrl(bucket, key);
			return { uploadUrl, key, publicUrl };
		} catch (cause) {
			throw new StorageError("upload-failed", undefined, cause);
		}
	}

	const { bucket } = supabaseStorageTarget();
	try {
		const client = getSupabaseClient();
		const { data, error: storageError } = await client.storage
			.from(bucket)
			.createSignedUploadUrl(key);

		if (storageError || !data?.signedUrl) {
			const msg = storageError?.message ?? "Failed to create signed upload URL";
			throw new StorageError("upload-failed", `Supabase: ${msg}`);
		}

		const publicUrl = getPublicUrl(bucket, key);
		return { uploadUrl: data.signedUrl, key, publicUrl };
	} catch (cause) {
		if (cause instanceof StorageError) throw cause;
		throw new StorageError(
			"upload-failed",
			cause instanceof Error ? cause.message : undefined,
			cause,
		);
	}
}

/**
 * Uploads an image directly on the server to the configured provider on behalf
 * of `actor` and returns its public URL and key.
 *
 * @throws StorageError with code "unauthorized", "invalid-type", "too-large",
 * or "upload-failed".
 */
export async function uploadImage(
	file: ImageFile,
	actor: string,
	folder?: MediaFolder,
): Promise<StoredImage> {
	const userId = actor.trim();
	if (userId === "") {
		throw new StorageError("unauthorized");
	}
	const { ext } = validateImageUpload({
		contentType: file.contentType,
		size: file.bytes.byteLength,
	});
	const key = buildKey(ext, userId, folder ?? DEFAULT_MEDIA_FOLDER);

	if (storageProvider() === "s3") {
		return uploadToS3(file, key);
	}
	return uploadToSupabase(file, key);
}

/**
 * Deletes a stored object, accepting either a public URL or a raw storage key.
 *
 * @throws StorageError with code "delete-failed".
 */
export async function deleteStoredObject(
	urlOrKey: string,
	_actor?: string,
): Promise<void> {
	if (storageProvider() === "s3") {
		await deleteFromS3(parseS3Key(urlOrKey));
		return;
	}
	await deleteFromSupabase(parseSupabaseKey(urlOrKey));
}

/**
 * Resolves the public URL for a stored object across providers.
 */
export function getPublicUrl(bucket: string, key: string): string {
	if (storageProvider() === "s3") {
		return s3PublicUrl(bucket, key);
	}
	return supabasePublicUrl(bucket, key);
}

// ---------------------------------------------------------------------------
// Supabase backend
// ---------------------------------------------------------------------------

let supabaseClient: SupabaseClient | undefined;

/** Lazily creates one shared Supabase client with SUPABASE_SECRET_KEY. */
function getSupabaseClient(): SupabaseClient {
	if (!supabaseClient) {
		const { baseUrl } = supabaseStorageTarget();
		const secretKey = getEnvString("SUPABASE_SECRET_KEY") ?? "";
		if (secretKey === "") {
			throw new StorageError(
				"upload-failed",
				"SUPABASE_SECRET_KEY is not configured.",
			);
		}
		if (baseUrl === "") {
			throw new StorageError(
				"upload-failed",
				"SUPABASE_URL is not configured.",
			);
		}
		supabaseClient = createClient(baseUrl, secretKey, {
			auth: {
				persistSession: false,
				autoRefreshToken: false,
			},
		});
	}
	return supabaseClient;
}

/** Resolves the configured Supabase bucket and API base URL. */
function supabaseStorageTarget(): { bucket: string; baseUrl: string } {
	return {
		bucket: getEnvString("SUPABASE_STORAGE_BUCKET") ?? "admin-media",
		baseUrl: trimTrailingSlash(getEnvString("SUPABASE_URL") ?? ""),
	};
}

async function uploadToSupabase(
	file: ImageFile,
	key: string,
): Promise<StoredImage> {
	const { bucket } = supabaseStorageTarget();
	try {
		const client = getSupabaseClient();
		const { error: storageError } = await client.storage
			.from(bucket)
			.upload(key, file.bytes, {
				contentType: file.contentType,
				upsert: false,
			});
		if (storageError) {
			throw new StorageError(
				"upload-failed",
				`Supabase: ${storageError.message}`,
			);
		}
	} catch (cause) {
		if (cause instanceof StorageError) throw cause;
		throw new StorageError(
			"upload-failed",
			cause instanceof Error ? cause.message : undefined,
			cause,
		);
	}
	return { url: supabasePublicUrl(bucket, key), key };
}

async function deleteFromSupabase(key: string): Promise<void> {
	const { bucket } = supabaseStorageTarget();
	try {
		const client = getSupabaseClient();
		const { error: storageError } = await client.storage
			.from(bucket)
			.remove([key]);
		if (storageError) {
			throw new StorageError(
				"delete-failed",
				`Supabase: ${storageError.message}`,
			);
		}
	} catch (cause) {
		if (cause instanceof StorageError) throw cause;
		throw new StorageError(
			"delete-failed",
			cause instanceof Error ? cause.message : undefined,
			cause,
		);
	}
}

/** Matches Supabase object URLs and captures the key after the bucket segment. */
const SUPABASE_OBJECT_URL =
	/(?:\/storage\/v1\/object\/public\/|\/storage\/v1\/object\/)(?:[^/]+\/)(.+)$/;

/** Extracts a storage key from a Supabase URL, or returns the input unchanged when it is a raw key. */
function parseSupabaseKey(urlOrKey: string): string {
	const cleanUrl = urlOrKey.split("?")[0] ?? urlOrKey;
	const match = SUPABASE_OBJECT_URL.exec(cleanUrl);
	return match?.[1] ?? cleanUrl;
}

/** Builds the public URL for a Supabase storage object. */
function supabasePublicUrl(bucket: string, key: string): string {
	const { baseUrl } = supabaseStorageTarget();
	return `${baseUrl}/storage/v1/object/public/${bucket}/${key}`;
}

// ---------------------------------------------------------------------------
// S3 backend
// ---------------------------------------------------------------------------

let s3Client: S3Client | undefined;

/** Lazily creates one shared S3 client per process for the configured endpoint/region. */
function getS3Client(): S3Client {
	s3Client ??= new S3Client({
		region: getEnvString("AWS_S3_REGION") ?? "auto",
		endpoint: getEnvString("AWS_S3_ENDPOINT_URL") || undefined,
		forcePathStyle: Boolean(getEnvString("AWS_S3_ENDPOINT_URL")),
		credentials: {
			accessKeyId: getEnvString("AWS_ACCESS_KEY_ID") ?? "",
			secretAccessKey: getEnvString("AWS_SECRET_ACCESS_KEY") ?? "",
		},
		requestChecksumCalculation: "WHEN_REQUIRED",
	});
	return s3Client;
}

async function uploadToS3(file: ImageFile, key: string): Promise<StoredImage> {
	const bucket = getEnvString("AWS_MEDIA_BUCKET_NAME") ?? "";
	try {
		await withRetry(() =>
			getS3Client().send(
				new PutObjectCommand({
					Bucket: bucket,
					Key: key,
					Body: file.bytes,
					ContentType: file.contentType,
					CacheControl: "public, max-age=31536000, immutable",
				}),
			),
		);
	} catch (cause) {
		throw new StorageError("upload-failed", undefined, cause);
	}
	return { url: s3PublicUrl(bucket, key), key };
}

async function deleteFromS3(urlOrKey: string): Promise<void> {
	const key = parseS3Key(urlOrKey);
	try {
		await withRetry(() =>
			getS3Client().send(
				new DeleteObjectCommand({
					Bucket: getEnvString("AWS_MEDIA_BUCKET_NAME") ?? "",
					Key: key,
				}),
			),
		);
	} catch (cause) {
		// Deleting a missing object is a no-op: treat HTTP 404 as success.
		if (isNotFoundError(cause)) {
			return;
		}
		throw new StorageError("delete-failed", undefined, cause);
	}
}

/** Duck-types the AWS SDK v3 service exception to detect HTTP 404 responses. */
function isNotFoundError(error: unknown): boolean {
	return httpStatus(error) === 404;
}

/**
 * HTTP statuses worth another attempt: throttling plus transient upstream
 * faults.
 */
const RETRYABLE_STATUS: ReadonlySet<number> = new Set([
	429, 500, 502, 503, 504,
]);

/** Attempts in total (the first call plus retries) and the base backoff delay. */
const RETRY_ATTEMPTS = 3;
const RETRY_BASE_MS = 150;

/** Extracts the HTTP status from an AWS SDK v3 error, or undefined if absent. */
function httpStatus(error: unknown): number | undefined {
	if (typeof error !== "object" || error === null) {
		return undefined;
	}
	const status = (error as { $metadata?: { httpStatusCode?: number } })
		.$metadata?.httpStatusCode;
	if (typeof status === "number") {
		return status;
	}
	// Some S3 errors surface only as a name when the status never made it back.
	const name = (error as { name?: string }).name;
	return name === "SlowDown"
		? 503
		: name === "RequestTimeout" || name === "ServiceUnavailable"
			? 503
			: undefined;
}

/**
 * Runs `operation`, retrying throttled and transient failures with exponential
 * backoff. Non-retryable errors (a 403, a bad key) propagate on the first
 * attempt, so a genuine permission problem is never masked by three slow tries.
 */
async function withRetry<T>(operation: () => Promise<T>): Promise<T> {
	let attempt = 1;
	for (;;) {
		try {
			return await operation();
		} catch (error) {
			const status = httpStatus(error);
			if (
				attempt >= RETRY_ATTEMPTS ||
				status === undefined ||
				!RETRYABLE_STATUS.has(status)
			) {
				throw error;
			}
			await new Promise((resolve) =>
				setTimeout(resolve, RETRY_BASE_MS * 2 ** (attempt - 1)),
			);
			attempt += 1;
		}
	}
}

/** Removes a single trailing slash from a base URL so segments join cleanly. */
function trimTrailingSlash(value: string): string {
	return value.endsWith("/") ? value.slice(0, -1) : value;
}

/**
 * Resolves the public URL for an S3 object: custom domain first, then the
 * configured endpoint (path style), then classic `https://{bucket}.s3.amazonaws.com/{key}`.
 */
function s3PublicUrl(bucket: string, key: string): string {
	const customDomain = getEnvString("AWS_MEDIA_CUSTOM_DOMAIN");
	if (typeof customDomain === "string" && customDomain.length > 0) {
		return `${trimTrailingSlash(customDomain)}/${key}`;
	}
	const endpoint = getEnvString("AWS_S3_ENDPOINT_URL");
	if (typeof endpoint === "string" && endpoint.length > 0) {
		return `${trimTrailingSlash(endpoint)}/${bucket}/${key}`;
	}
	return `https://${bucket}.s3.amazonaws.com/${key}`;
}

/** Extracts a storage key from an S3 URL (custom domain, endpoint, or s3.amazonaws.com), or returns the input unchanged. */
function parseS3Key(urlOrKey: string): string {
	const cleanUrl = urlOrKey.split("?")[0] ?? urlOrKey;
	const customDomain = getEnvString("AWS_MEDIA_CUSTOM_DOMAIN");
	if (
		typeof customDomain === "string" &&
		customDomain.length > 0 &&
		cleanUrl.startsWith(customDomain)
	) {
		return cleanUrl.slice(customDomain.length).replace(/^\//, "");
	}
	const endpoint = getEnvString("AWS_S3_ENDPOINT_URL");
	if (
		typeof endpoint === "string" &&
		endpoint.length > 0 &&
		cleanUrl.startsWith(endpoint)
	) {
		const prefix = `${trimTrailingSlash(endpoint)}/${getEnvString("AWS_MEDIA_BUCKET_NAME") ?? ""}/`;
		if (cleanUrl.startsWith(prefix)) {
			return cleanUrl.slice(prefix.length);
		}
		return cleanUrl;
	}
	const bucket = getEnvString("AWS_MEDIA_BUCKET_NAME") ?? "";
	const awsPrefix = `https://${bucket}.s3.amazonaws.com/`;
	if (bucket.length > 0 && cleanUrl.startsWith(awsPrefix)) {
		return cleanUrl.slice(awsPrefix.length);
	}
	return cleanUrl;
}
