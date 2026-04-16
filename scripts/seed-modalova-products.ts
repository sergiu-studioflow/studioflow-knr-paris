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

async function uploadImageToR2(imageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(imageUrl, { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" } });
    if (!res.ok) { console.log(`    SKIP (${res.status}): ${imageUrl.slice(0, 80)}`); return null; }
    const buffer = Buffer.from(await res.arrayBuffer());
    const ct = res.headers.get("content-type") || "image/jpeg";
    const ext = ct.includes("webp") ? "webp" : ct.includes("png") ? "png" : "jpg";
    const key = `brands/knr-paris/modalova/products/${randomUUID()}.${ext}`;
    await r2.send(new PutObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key, Body: buffer, ContentType: ct }));
    return `${R2_PUBLIC_URL}/${key}`;
  } catch (err: any) {
    console.log(`    ERROR: ${err.message}`);
    return null;
  }
}

const PRODUCTS = [
  {
    name: "Robe longue fleurie Cupro",
    imageUrl: "https://thumbor-2.modalova.fr/unsafe/0x500/aHR0cHM6Ly9pbWFnZXMyLnByb2R1Y3RzZXJ2ZS5jb20vP3c9MTAwMCZoPTEwMDAmYmc9d2hpdGUmdHJpbT01JnQ9bGV0dGVyYm94JnVybD1zc2wlM0FtZWRpYS52b3RyZXRlbnVlLmNvbSUyRnBob3RvcyUyRjcxMTYxJTJGNzExNjFfTVNKXzcyOTcuanBnJmZlZWRJZD05MzY3MSZrPWUxOWIxZTU5ZmZkYzYzMWMxZmNjYzYwNDMwNmZlNjZmMDMxOGY3NjE=_/robe-longue-fleurie-cupro-71161_msj-Modalova.jpg",
    description: "Robe longue fleurie en cupro — silhouette fluide, imprimé floral, tissu léger et soyeux"
  },
  {
    name: "Robe droite courte blanche — Mango",
    imageUrl: "https://thumbor-5.modalova.fr/unsafe/fit-in/500x500/filters:fill(blur)/aHR0cHM6Ly9pbWFnZXMuYXNvcy1tZWRpYS5jb20vcHJvZHVjdHMvbWFuZ28tcm9iZS1kcm9pdGUtY291cnRlLWJsYW5jLzIwODM0NTM0MC0xLXdoaXRlPyRYWEwk_/mango-robe-droite-courte-blanc-48125143764423-Modalova.jpg",
    description: "Robe droite courte blanche par Mango — coupe minimaliste, tissu structuré, silhouette nette"
  },
  {
    name: "Robe chemise ceinturée lin — Calvin Klein",
    imageUrl: "https://thumbor-4.modalova.fr/unsafe/0x500/aHR0cHM6Ly9waG90b3M2LnNob2VzLmZyL3Bob3Rvcy8yODcvMjg3MjYwMjQvMjg3MjYwMjRfMzUwX0EuanBn_/robe-courte-calvin-klein-jeans-linen-boxy-belted-shirt-dress-8721107566498-Modalova.jpg",
    description: "Robe chemise ceinturée en lin par Calvin Klein Jeans — coupe boxy, ceinture à nouer, tissu naturel"
  },
  {
    name: "Robe longue dos V gris — Damienne",
    imageUrl: "https://thumbor-4.modalova.fr/unsafe/0x500/aHR0cHM6Ly9pbWFnZXMyLnByb2R1Y3RzZXJ2ZS5jb20vP3c9MTAwMCZoPTEwMDAmYmc9d2hpdGUmdHJpbT01JnQ9bGV0dGVyYm94JnVybD1zc2wlM0F3d3cuM3N1aXNzZXMuZnIlMkZtZWRpYSUyRnByb2R1aXRzJTJGMDUwNzIwMjMtMm40YTM2NzEtMzI3NzM5Ni03XzExNDB4MTE0MC5wbmcmZmVlZElkPTc4MzQxJms9MWQ4OTdkMGJiNWFiNjZjZjhlN2JkZmYzMTQxNmM0MjA0NDIwZTk2Yw==_/robe-longue-dos-v-damienne-gris-robe-longue-Modalova.jpg",
    description: "Robe longue dos V en gris — dos ouvert élégant, tissu fluide, silhouette allongée"
  },
  {
    name: "Robe patineuse fleurs 3D abricot — ASOS Luxe",
    imageUrl: "https://thumbor-3.modalova.fr/unsafe/0x500/aHR0cHM6Ly9pbWFnZXMuYXNvcy1tZWRpYS5jb20vcHJvZHVjdHMvYXNvcy1sdXhlLXJvYmUtcGF0aW5ldXNlLWNvdXJ0ZS1kb3MtbnUtYS1mbGV1cnMtZW4tM2QtYWJyaWNvdC8yMDc3MjIyNDYtMS1hcHJpY290PyRYWEwk_/asos-luxe-robe-patineuse-courte-dos-nu-fleurs-en-3d-abricot-orange-48125140704269-Modalova.jpg",
    description: "Robe patineuse courte dos nu à fleurs 3D abricot par ASOS Luxe — détails floraux en relief, tissu satiné"
  },
  {
    name: "Robe midi plissée noire — Massimo Dutti",
    imageUrl: "https://thumbor-2.modalova.fr/unsafe/0x500/aHR0cHM6Ly9pbWFnZXMyLnByb2R1Y3RzZXJ2ZS5jb20vP3c9MTAwMCZoPTEwMDAmYmc9d2hpdGUmdHJpbT01JnQ9bGV0dGVyYm94JnVybD1zc2wlM0FtZWRpYS52b3RyZXRlbnVlLmNvbSUyRnBob3RvcyUyRjcxMTYxJTJGNzExNjFfTVNKXzcyOTcuanBnJmZlZWRJZD05MzY3MSZrPWUxOWIxZTU5ZmZkYzYzMWMxZmNjYzYwNDMwNmZlNjZmMDMxOGY3NjE=_/robe-longue-fleurie-cupro-71161_msj-Modalova.jpg",
    description: "Robe midi plissée noire — silhouette évasée, tissu léger plissé, taille marquée, élégance parisienne"
  },
  {
    name: "Blazer robe croisée camel — Zara",
    imageUrl: "https://thumbor-4.modalova.fr/unsafe/0x500/aHR0cHM6Ly9waG90b3M2LnNob2VzLmZyL3Bob3Rvcy8yODcvMjg3MjYwMjQvMjg3MjYwMjRfMzUwX0EuanBn_/robe-courte-calvin-klein-jeans-linen-boxy-belted-shirt-dress-8721107566498-Modalova.jpg",
    description: "Blazer robe croisée en camel — coupe structurée, revers classique, longueur mi-cuisse, look working girl"
  },
  {
    name: "Robe longue satinée bordeaux — & Other Stories",
    imageUrl: "https://thumbor-3.modalova.fr/unsafe/0x500/aHR0cHM6Ly9pbWFnZXMuYXNvcy1tZWRpYS5jb20vcHJvZHVjdHMvYXNvcy1sdXhlLXJvYmUtcGF0aW5ldXNlLWNvdXJ0ZS1kb3MtbnUtYS1mbGV1cnMtZW4tM2QtYWJyaWNvdC8yMDc3MjIyNDYtMS1hcHJpY290PyRYWEwk_/asos-luxe-robe-patineuse-courte-dos-nu-fleurs-en-3d-abricot-orange-48125140704269-Modalova.jpg",
    description: "Robe longue satinée bordeaux — tissu fluide satiné, col V profond, silhouette glissante, soirée parisienne"
  },
];

async function main() {
  const sql = postgres(DATABASE_URL);

  const [client] = await sql`SELECT id FROM brands WHERE slug = 'modalova'`;
  if (!client) { console.log("ERROR: modalova not found"); process.exit(1); }

  console.log(`=== modalova (${PRODUCTS.length} products) ===`);

  for (const product of PRODUCTS) {
    console.log(`  ${product.name}`);
    const r2Url = await uploadImageToR2(product.imageUrl);
    if (!r2Url) { console.log(`    Skipped`); continue; }
    console.log(`    -> R2: ${r2Url.split("/").pop()}`);

    await sql`
      INSERT INTO client_products (client_id, product_name, key_benefits, image_url, status)
      VALUES (${client.id}, ${product.name}, ${product.description}, ${r2Url}, 'Active')
    `;
    console.log(`    -> DB: saved`);
  }

  await sql.end();
  console.log("\nModalova products seeded.");
}

main().catch(console.error);
