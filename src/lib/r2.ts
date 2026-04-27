import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


const SLUG_RE = /^[a-z0-9-]+$/;
const R2_ACCOUNT_ID = (process.env.R2_ACCOUNT_ID || "").trim();
const R2_ACCESS_KEY_ID = (process.env.R2_ACCESS_KEY_ID || "").trim();
const R2_SECRET_ACCESS_KEY = (process.env.R2_SECRET_ACCESS_KEY || "").trim();
const R2_BUCKET_NAME = (process.env.R2_BUCKET_NAME || "studioflow-assets").trim();
const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL || "").trim();

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload a file buffer to R2 and return the public URL.
 */
export async function uploadToR2(
  key: string,
  body: Buffer | ReadableStream | Uint8Array,
  contentType: string
): Promise<string> {
  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: body instanceof Buffer || body instanceof Uint8Array ? body : await streamToBuffer(body),
      ContentType: contentType,
    })
  );
  return `${R2_PUBLIC_URL}/${key}`;
}

/**
 * Generate a presigned URL for direct browser upload to R2.
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(r2, command, { expiresIn });
}

/**
 * Generate a presigned GET URL for downloading from R2.
 */
export async function getPresignedDownloadUrl(
  key: string,
  expiresIn = 600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });
  return getSignedUrl(r2, command, { expiresIn });
}

/**
 * Convert an R2 public URL to a presigned download URL.
 */
export async function toAccessibleUrl(url: string): Promise<string> {
  const key = r2KeyFromUrl(url);
  if (!key) return url;
  return getPresignedDownloadUrl(key);
}

/**
 * Download a file from R2 as a Buffer.
 */
export async function downloadFromR2(key: string): Promise<{ buffer: Buffer; contentType: string }> {
  const res = await r2.send(
    new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    })
  );
  const bytes = await res.Body!.transformToByteArray();
  return {
    buffer: Buffer.from(bytes),
    contentType: res.ContentType || "application/octet-stream",
  };
}

/**
 * Known R2 public URL prefixes for this bucket.
 */
const R2_PUBLIC_URLS = [
  R2_PUBLIC_URL,
  "https://pub-studioflow.r2.dev",
  "https://pub-c85814e28869441d8a619b3b90562166.r2.dev",
].filter(Boolean);

const R2_EXTERNAL_PUBLIC_URL = "https://pub-c85814e28869441d8a619b3b90562166.r2.dev";

/**
 * Convert any R2 URL to one that's publicly accessible by external services.
 */
export function toExternalUrl(url: string): string {
  const key = r2KeyFromUrl(url);
  if (!key) return url;
  return `${R2_EXTERNAL_PUBLIC_URL}/${key}`;
}

/**
 * Extract the R2 object key from a public URL.
 */
export function r2KeyFromUrl(url: string): string | null {
  for (const prefix of R2_PUBLIC_URLS) {
    if (url.startsWith(prefix)) {
      return url.slice(prefix.length + 1);
    }
  }
  return null;
}

/**
 * Delete an object from R2.
 */
export async function deleteFromR2(key: string): Promise<void> {
  await r2.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    })
  );
}

/**
 * Build an R2 object key with the appropriate prefix.
 */
export function r2Key(brandSlug: string, assetType: string, filename: string): string {
  const slug = (brandSlug ?? "").trim();
  const type = (assetType ?? "").trim();
  if (!SLUG_RE.test(slug)) {
    throw new Error(`r2Key: invalid brandSlug ${JSON.stringify(brandSlug)} (must match ${SLUG_RE})`);
  }
  if (!type || /[\s/]/.test(type)) {
    throw new Error(`r2Key: invalid assetType ${JSON.stringify(assetType)} (no whitespace or slashes)`);
  }
  if (slug === "demo") return `demo/${type}/${filename}`;
  return `brands/${slug}/${type}/${filename}`;
}

/**
 * Get the public URL for an R2 key.
 */
export function r2Url(key: string): string {
  return `${R2_PUBLIC_URL}/${key}`;
}

async function streamToBuffer(stream: ReadableStream): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let done = false;
  while (!done) {
    const result = await reader.read();
    if (result.value) chunks.push(result.value);
    done = result.done;
  }
  return Buffer.concat(chunks);
}
