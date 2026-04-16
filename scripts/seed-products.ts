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

async function uploadImageToR2(imageUrl: string, brandSlug: string): Promise<string | null> {
  try {
    const res = await fetch(imageUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) { console.log(`    SKIP (${res.status}): ${imageUrl.slice(0, 80)}`); return null; }
    const buffer = Buffer.from(await res.arrayBuffer());
    const ct = res.headers.get("content-type") || "image/png";
    const ext = ct.includes("webp") ? "webp" : ct.includes("jpeg") || ct.includes("jpg") ? "jpg" : "png";
    const key = `brands/knr-paris/${brandSlug}/products/${randomUUID()}.${ext}`;
    await r2.send(new PutObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key, Body: buffer, ContentType: ct }));
    return `${R2_PUBLIC_URL}/${key}`;
  } catch (err: any) {
    console.log(`    ERROR: ${err.message}`);
    return null;
  }
}

type Product = { name: string; imageUrl: string; description?: string };

const BRANDS: Record<string, Product[]> = {
  "balcon-avec-vue": [
    { name: "Aiguille du Midi", imageUrl: "https://balconavecvue.com/wp-content/uploads/2026/01/Balconavecvue_illustration_savoie_hautesavoie_-9-300x420.png", description: "Collection Terroir — art print featuring the Aiguille du Midi peak (3842m), single-weight line drawing with red accent figure" },
    { name: "Albertville | Conflans", imageUrl: "https://balconavecvue.com/wp-content/uploads/2024/09/Balconavecvue_illustration_savoie_hautesavoie_2-300x420.png", description: "Collection Rustique — warm autumnal boulevard scene with medieval hilltop village, golden ochre and pine green palette" },
    { name: "Albertville | Jeux Olympiques 1992", imageUrl: "https://balconavecvue.com/wp-content/uploads/2024/12/Balconavecvue_illustration_savoie_hautesavoie_3-300x420.png", description: "Collection Rustique — Olympic ice stadium interior with torch tower, vivid sky blue and deep red palette" },
    { name: "Annecy | Vieille ville", imageUrl: "https://balconavecvue.com/wp-content/uploads/2025/06/Balconavecvue_illustration_savoie_hautesavoie17-300x420.png", description: "Collection Rustique — Palais de l'Isle canal island at golden hour, warm peach and stone ochre palette" },
    { name: "Annecy | Entre lac et montagnes", imageUrl: "https://balconavecvue.com/wp-content/uploads/2025/06/Balconavecvue_illustration_savoie_hautesavoie18-300x420.png", description: "Collection Rustique — aerial panoramic view of Lac d'Annecy, vivid turquoise-blue lake and forest-green hills" },
    { name: "Altitude élevée, souffle coupé", imageUrl: "https://balconavecvue.com/wp-content/uploads/2024/12/Balconavecvue_illustration_savoie_hautesavoie_-1-300x420.png", description: "Collection Rustique — wide open ski piste with two tiny skier figures, pure white snow and deep pine green" },
    { name: "Albertville | Centre-Ville", imageUrl: "https://balconavecvue.com/wp-content/uploads/2024/12/Balconavecvue_illustration_savoie_hautesavoie_1-300x420.png", description: "Collection Rustique — symmetrical street perspective with church steeple and green sculpted hedges" },
    { name: "Aiguilles d'Arves", imageUrl: "https://balconavecvue.com/wp-content/uploads/2026/01/Balconavecvue_illustration_savoie_hautesavoie_-16-300x420.png", description: "Collection Terroir — three-pronged needle peaks with three red hikers walking below" },
  ],
  "doamabijoux": [
    { name: "Bague Goccia A — Or Jaune", imageUrl: "https://doamabijoux.com/cdn/shop/files/Doamabijoux_Bague_Goccia_ajouree_plaquee_or_jaune_credit_photo_Thierry_Depagne.jpg", description: "Goccia A ring, yellow gold plated — organic asymmetric drop form with teardrop cutouts" },
    { name: "Bague Goccia P — Argent", imageUrl: "https://doamabijoux.com/cdn/shop/files/DoamabijouxBagueGocciaPargentmassifbrillantcreditphotoThierryDepagne.jpg", description: "Goccia P ring, sterling silver — sinuous concave scoop, mirror-polished silver" },
    { name: "Collier Goccia A — Or Jaune", imageUrl: "https://doamabijoux.com/cdn/shop/files/DoamabjouxCollierGocciaajoureePlaqueorjaunebrillant.jpg", description: "Goccia A necklace, yellow gold plated — organic raindrop pendant with cutouts on fine rolo chain" },
    { name: "Bague Scala BIG — Argent", imageUrl: "https://doamabijoux.com/cdn/shop/files/DoamabijouxBagueSCALABIGargentbrillant.jpg", description: "Scala BIG ring, sterling silver — wide architectural signet with sinuous wave profile" },
    { name: "Bague Scala BIG — Or Jaune", imageUrl: "https://doamabijoux.com/cdn/shop/files/DoamabijouxBagueSCALABIGplaqueorjaunebrillant.jpg", description: "Scala BIG ring, yellow gold plated — polished mirror finish, broad flat rectangular face" },
    { name: "Collier Scala 3C — Tricolore", imageUrl: "https://doamabijoux.com/cdn/shop/files/DoamabjouxCollierSCALABIG3couleursargentetplaqueorbrillantavecchaineenargentmassif.jpg", description: "Scala necklace 3C — three bar pendants in rose gold, yellow gold, and silver on silver chain" },
    { name: "Bracelet Goccia — Argent Brillant", imageUrl: "https://doamabijoux.com/cdn/shop/files/DoamabijouxBraceletGocciaAargentmassifbrillantcuirnoir1.jpg", description: "Goccia bracelet, shiny solid silver — drop pendant on double black leather cord" },
    { name: "Bague Goccia P — Or Rose", imageUrl: "https://doamabijoux.com/cdn/shop/files/Doamabijoux_Bague_Goccia_P_plaquee_or_rose_brillant_credit_photo_Thierry_Depagne.jpg", description: "Goccia P ring, rose gold plated — warm blush-pink rose gold, dome-faced sinuous form" },
  ],
  "eco-sense": [
    { name: "Poudre de charbon de bambou activé 3 en 1", imageUrl: "https://eco-sense.fr/cdn/shop/files/poudre-charbon.png?v=1764388461", description: "Activated bamboo charcoal powder — multi-use for teeth whitening, skin care, and detox" },
    { name: "Brosse à dents en bambou — charbon", imageUrl: "https://eco-sense.fr/cdn/shop/files/brosse-a-dents-takesumi.png?v=1764744457", description: "Bamboo toothbrush infused with bamboo charcoal bristles — zero waste dental care" },
    { name: "Mug isotherme inox 500 ml", imageUrl: "https://eco-sense.fr/cdn/shop/files/mug-isotherme-couvercle-noir.png?v=1763697075", description: "Stainless steel insulated mug 500ml with handle and lid — reusable drink container" },
    { name: "Filtre charbon bambou — Takesumi", imageUrl: "https://eco-sense.fr/cdn/shop/files/filtre-charbon-naturel.png?v=1764740329", description: "Natural bamboo charcoal water filter stick — purifies water naturally" },
    { name: "Filtres gourde charbon végétal actif (x4)", imageUrl: "https://eco-sense.fr/cdn/shop/files/filtre-charbon-sachet.png?v=1764674272", description: "Pack of 4 activated charcoal filters for reusable water bottles" },
    { name: "Balle de bain charbon bambou 5 en 1", imageUrl: "https://eco-sense.fr/cdn/shop/files/boule-bain-charbon.png?v=1764140956", description: "Bamboo charcoal bath ball — 5-in-1 bath water purifier and skin softener" },
    { name: "Pailles en bambou réutilisables (x10)", imageUrl: "https://eco-sense.fr/cdn/shop/files/pailles-bambou.png?v=1763095265", description: "Set of 10 reusable bamboo straws — eco-friendly alternative to plastic" },
    { name: "Couverts en bambou 6 en 1", imageUrl: "https://eco-sense.fr/cdn/shop/files/ensemble-ustensiles-noir.png?v=1764842915", description: "Portable bamboo cutlery set 6-in-1 — fork, knife, spoon, chopsticks, straw, cleaning brush" },
  ],
  "taion": [
    { name: "Basic V-Neck Button Down Vest — Black", imageUrl: "https://taion-wear.com/cdn/shop/files/TAION-001_BLACK.jpg?v=1773246662", description: "Unisex Basic V-Neck vest in jet black (#0D0D0D) high-density nylon, square lattice quilt, 800FP down, YKK snap buttons" },
    { name: "Basic Hi-Neck W-Zip Down Vest", imageUrl: "https://taion-wear.com/cdn/shop/files/TAION-002WZ-1_9ad650ec-e8b5-49a1-8bab-20443337f7e5.jpg?v=1751993204", description: "Unisex Basic Hi-Neck vest with two-way YKK W-zip, tall stand-up funnel collar, square lattice quilt" },
    { name: "Military Zip V-Neck Down Vest", imageUrl: "https://taion-wear.com/cdn/shop/files/TAION-001ZML-1_BLACK.webp?v=1756466745", description: "Unisex Military V-Neck vest in 5mm square ripstop hard shell nylon, CORDURA construction" },
    { name: "Military Crew Neck Down Vest", imageUrl: "https://taion-wear.com/cdn/shop/files/TAION-004B2ML-1-1_7c6d42bd-3a8c-4ed7-8f63-ca6c7555d19d.jpg?v=1737477286", description: "Unisex Military crew neck vest, boxy Military Line silhouette, side-slit zips, snap button closure" },
    { name: "Work V-Neck Button Down Vest", imageUrl: "https://taion-wear.com/cdn/shop/files/TAION-001BWK_BLACK-B_1_1d86b981-c8cf-437f-b3b2-9b31b20c3792.webp?v=1752331219", description: "Unisex Work vest in CORDURA nylon, 5-zone pocket system, hammer loop, orange CORDURA certification tag" },
    { name: "Work V-Neck Corduroy x Down Vest", imageUrl: "https://taion-wear.com/cdn/shop/files/25AW_TAION-001BWK-CT_D.NAVY.webp?v=1754318115", description: "Work vest with deep chocolate fine-wale corduroy outer shell, square lattice quilt stitching intersecting the wales" },
    { name: "Military V-Neck W-Zip Vest — Soft Shell", imageUrl: "https://taion-wear.com/cdn/shop/files/TAION-001ALSZML-1_OFF_WHITE.webp?v=1773143967", description: "Military vest in soft shell with W-zip, off-white colorway, stand collar" },
    { name: "Military Crew Neck Vest — Soft Shell", imageUrl: "https://taion-wear.com/cdn/shop/files/TAION-004ALSBML-1_G.BEIGE.png?v=1772465060", description: "Military crew neck vest in soft shell, gold beige colorway, relaxed boxy fit" },
  ],
};

async function main() {
  const sql = postgres(DATABASE_URL);

  for (const [slug, products] of Object.entries(BRANDS)) {
    console.log(`\n=== ${slug} (${products.length} products) ===`);

    // Get client ID
    const [client] = await sql`SELECT id FROM brands WHERE slug = ${slug}`;
    if (!client) { console.log(`  ERROR: Brand ${slug} not found`); continue; }

    for (const product of products) {
      console.log(`  ${product.name}`);

      // Download and upload image to R2
      const r2Url = await uploadImageToR2(product.imageUrl, slug);
      if (!r2Url) { console.log(`    Skipped (no image)`); continue; }
      console.log(`    -> R2: ${r2Url.split("/").pop()}`);

      // Insert into client_products
      await sql`
        INSERT INTO client_products (client_id, product_name, key_benefits, image_url, status)
        VALUES (${client.id}, ${product.name}, ${product.description || null}, ${r2Url}, 'Active')
      `;
      console.log(`    -> DB: saved`);
    }
  }

  await sql.end();
  console.log("\nAll products seeded.");
}

main().catch(console.error);
