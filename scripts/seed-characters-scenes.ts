import postgres from "postgres";
import { randomUUID } from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const DATABASE_URL = process.env.DATABASE_URL!;
const R2_ACCOUNT_ID = "3adaf4c8b26fb5baf9697503c1830fde";
const R2_ACCESS_KEY_ID = "ce14cca6fb52b9317ff8449a09c60dec";
const R2_SECRET_ACCESS_KEY = "d04cb35518bad5b8c67ed276d2faee5c3b1686f3c7b868590445286f6cc6d688";
const R2_BUCKET_NAME = "studioflow-assets";
const R2_PUBLIC_URL = "https://pub-c85814e28869441d8a619b3b90562166.r2.dev";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

async function uploadToR2(imageUrl: string, brandSlug: string, assetType: string): Promise<string | null> {
  try {
    // Fix pub-studioflow.r2.dev -> pub-c85814e... (old domain returns 401)
    const fixedUrl = imageUrl.replace("pub-studioflow.r2.dev", "pub-c85814e28869441d8a619b3b90562166.r2.dev");
    const res = await fetch(fixedUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) { console.log(`    SKIP (${res.status}): ${fixedUrl.slice(0, 80)}`); return null; }
    const buffer = Buffer.from(await res.arrayBuffer());
    const ct = res.headers.get("content-type") || "image/png";
    const ext = ct.includes("jpeg") || ct.includes("jpg") ? "jpg" : "png";
    const key = `brands/knr-paris/${brandSlug}/video-generation/${assetType}/${randomUUID()}.${ext}`;
    await r2.send(new PutObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key, Body: buffer, ContentType: ct }));
    return `${R2_PUBLIC_URL}/${key}`;
  } catch (err: any) {
    console.log(`    ERROR: ${err.message}`);
    return null;
  }
}

const CHARACTERS = [
  { name: "Josh", imageUrl: "https://pub-studioflow.r2.dev/demo/video-generation/characters/809c0526-7977-4401-80b5-56583de7fb2e.png", description: "Male, late 20s, mixed heritage, short curly dark brown hair, light stubble and goatee, warm brown eyes, medium-brown skin, athletic build, confident relaxed expression" },
  { name: "Lia", imageUrl: "https://pub-studioflow.r2.dev/brands/demo/video-generation/characters/eef9fec3-f827-4ac0-91ad-b4635178796d.jpg", description: "Female, mid-to-late 20s, white/European, short auburn-red bob with blunt fringe, blue-green eyes, light freckles, fair skin, slim build, small gold hoop earrings, delicate gold necklace" },
  { name: "Marie", imageUrl: "https://pub-studioflow.r2.dev/demo/video-generation/characters/64d89610-883c-486d-9281-bcffe3f43210.png", description: "Female, early 30s, white/European, long dirty-blonde hair with natural highlights, green-hazel eyes, light freckles, fair skin, natural minimal makeup, small gold stud earring" },
  { name: "Mike", imageUrl: "https://pub-studioflow.r2.dev/brands/demo/video-generation/characters/ab435051-f496-41c3-b938-64d0d7367043.jpg", description: "Male, late 20s to early 30s, mixed heritage, short curly dark hair with fade, full beard, brown eyes, olive-to-brown skin, wears round green-tinted glasses, gold chain necklace, relaxed confident expression" },
];

const SCENES = [
  { name: "Scene 1", imageUrl: "https://pub-c85814e28869441d8a619b3b90562166.r2.dev/brands/demo/video-generation/scenes/bb55ed2d-3c66-4c4e-85aa-5a6f92cd45e2.jpg" },
  { name: "Scene 2", imageUrl: "https://pub-c85814e28869441d8a619b3b90562166.r2.dev/brands/demo/video-generation/scenes/77a110d3-08bd-4b11-b4e2-c68798c85e97.jpg" },
  { name: "Scene 3", imageUrl: "https://pub-c85814e28869441d8a619b3b90562166.r2.dev/brands/demo/video-generation/scenes/c9620592-55ef-4ec5-9841-5a8eb20cbce4.jpg" },
  { name: "Scene 4", imageUrl: "https://pub-c85814e28869441d8a619b3b90562166.r2.dev/brands/demo/video-generation/scenes/d8d5c467-3bc1-4778-aab1-594dcdb8d710.jpg" },
  { name: "Scene 5", imageUrl: "https://pub-c85814e28869441d8a619b3b90562166.r2.dev/brands/demo/video-generation/scenes/12ac95cd-ab5c-473c-84e6-b55cd8a0ad88.jpg" },
];

const BRAND_SLUGS = ["balcon-avec-vue", "doamabijoux", "eco-sense", "modalova", "taion"];

async function main() {
  const sql = postgres(DATABASE_URL);

  for (const slug of BRAND_SLUGS) {
    const [client] = await sql`SELECT id FROM brands WHERE slug = ${slug}`;
    if (!client) { console.log(`ERROR: ${slug} not found`); continue; }

    console.log(`\n=== ${slug} ===`);

    // Seed characters
    for (const char of CHARACTERS) {
      console.log(`  Character: ${char.name}`);
      const r2Url = await uploadToR2(char.imageUrl, slug, "characters");
      if (!r2Url) continue;
      console.log(`    -> R2: ${r2Url.split("/").pop()}`);
      await sql`INSERT INTO characters (client_id, name, image_url, description, status) VALUES (${client.id}, ${char.name}, ${r2Url}, ${char.description}, 'ready')`;
      console.log(`    -> DB: saved`);
    }

    // Seed scenes
    for (const scene of SCENES) {
      console.log(`  Scene: ${scene.name}`);
      const r2Url = await uploadToR2(scene.imageUrl, slug, "scenes");
      if (!r2Url) continue;
      console.log(`    -> R2: ${r2Url.split("/").pop()}`);
      await sql`INSERT INTO scenes (client_id, name, image_url) VALUES (${client.id}, ${scene.name}, ${r2Url})`;
      console.log(`    -> DB: saved`);
    }
  }

  await sql.end();
  console.log("\nAll characters & scenes seeded.");
}

main().catch(console.error);
