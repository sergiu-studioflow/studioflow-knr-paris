import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "studioflow-assets";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!; // e.g. https://assets.studio-flow.co

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
 * The client PUTs the file directly to this URL (no server relay needed).
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 600 // 10 minutes
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(r2, command, { expiresIn });
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
 * Demo assets go under demo/ top-level; brand assets under brands/{slug}/.
 * e.g. brands/my-sweet-smile/videos/abc123.mp4
 * e.g. demo/static-ad-system/generated-ads/abc123.png
 */
export function r2Key(brandSlug: string, assetType: string, filename: string): string {
  if (brandSlug === "demo") return `demo/${assetType}/${filename}`;
  return `brands/${brandSlug}/${assetType}/${filename}`;
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
