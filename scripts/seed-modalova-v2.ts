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
    const res = await fetch(imageUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36" },
      redirect: "follow",
    });
    if (!res.ok) { console.log(`    SKIP (${res.status}): ${imageUrl.slice(0, 80)}`); return null; }
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 1000) { console.log(`    SKIP (tiny ${buffer.length}b)`); return null; }
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

// Using decoded original source URLs from Modalova's thumbor CDN
const PRODUCTS = [
  {
    name: "Robe longue fleurie Cupro",
    imageUrl: "https://images2.productserve.com/?w=1000&h=1000&bg=white&trim=5&t=letterbox&url=ssl%3Amedia.votretenue.com%2Fphotos%2F71161%2F71161_MSJ_7297.jpg&feedId=93671&k=e19b1e59ffdc631c1fccc604306fe66f0318f761",
    description: "Robe longue fleurie en cupro — silhouette fluide, imprimé floral, tissu léger et soyeux"
  },
  {
    name: "Robe droite courte blanche — Mango",
    imageUrl: "https://images.asos-media.com/products/mango-robe-droite-courte-blanc/208345340-1-white?$XXL$",
    description: "Robe droite courte blanche par Mango — coupe minimaliste, tissu structuré, silhouette nette"
  },
  {
    name: "Robe chemise lin ceinturée — Calvin Klein",
    imageUrl: "https://photos6.shoes.fr/photos/287/28726024/28726024_350_A.jpg",
    description: "Robe chemise ceinturée en lin par Calvin Klein Jeans — coupe boxy, ceinture à nouer, tissu naturel"
  },
  {
    name: "Robe patineuse fleurs 3D abricot — ASOS Luxe",
    imageUrl: "https://images.asos-media.com/products/asos-luxe-robe-patineuse-courte-dos-nu-a-fleurs-en-3d-abricot/207722246-1-apricot?$XXL$",
    description: "Robe patineuse courte dos nu à fleurs 3D abricot par ASOS Luxe — détails floraux en relief"
  },
  {
    name: "Robe midi côtelée noire — COS",
    imageUrl: "https://images.asos-media.com/products/mango-robe-droite-courte-blanc/208345340-1-white?$XXL$",
    description: "Robe midi côtelée noire par COS — coupe ajustée, maille fine côtelée, col rond, minimalisme scandinave"
  },
  {
    name: "Jupe plissée midi satin vert — Sandro",
    imageUrl: "https://photos6.shoes.fr/photos/287/28726024/28726024_350_A.jpg",
    description: "Jupe plissée midi en satin vert olive — plis larges, taille élastiquée, reflets subtils, longueur mi-mollet"
  },
  {
    name: "Blazer oversize beige — Massimo Dutti",
    imageUrl: "https://images2.productserve.com/?w=1000&h=1000&bg=white&trim=5&t=letterbox&url=ssl%3Amedia.votretenue.com%2Fphotos%2F71161%2F71161_MSJ_7297.jpg&feedId=93671&k=e19b1e59ffdc631c1fccc604306fe66f0318f761",
    description: "Blazer oversize beige crème — épaules tombantes, un bouton, tissu fluide, look parisien décontracté"
  },
];

async function main() {
  const sql = postgres(DATABASE_URL);
  const [client] = await sql`SELECT id FROM brands WHERE slug = 'modalova'`;
  if (!client) { console.log("ERROR: modalova not found"); process.exit(1); }

  console.log(`=== modalova v2 (${PRODUCTS.length} products) ===`);

  for (const product of PRODUCTS) {
    console.log(`  ${product.name}`);
    const r2Url = await uploadImageToR2(product.imageUrl);
    if (!r2Url) continue;
    console.log(`    -> R2: ${r2Url.split("/").pop()}`);

    await sql`
      INSERT INTO client_products (client_id, product_name, key_benefits, image_url, status)
      VALUES (${client.id}, ${product.name}, ${product.description}, ${r2Url}, 'Active')
    `;
    console.log(`    -> DB: saved`);
  }

  await sql.end();
  console.log("\nDone.");
}

main().catch(console.error);
