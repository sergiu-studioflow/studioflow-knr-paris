import postgres from "postgres";

const DEMO_URL = "postgresql://neondb_owner:npg_X2frZMTqyS5v@ep-dark-math-anxcx3q1-pooler.c-6.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";
const KNR_URL = process.env.DATABASE_URL!;

async function main() {
  const demo = postgres(DEMO_URL);
  const knr = postgres(KNR_URL);

  console.log("Fetching references from Demo Portal...");
  const refs = await demo`
    SELECT name, image_url, industry, ad_type, brand, tags, airtable_record_id, is_active, sort_order
    FROM reference_ad_library
    WHERE is_active = true
  `;
  console.log(`Found ${refs.length} active references`);

  let inserted = 0;
  let skipped = 0;

  for (const ref of refs) {
    try {
      await knr`
        INSERT INTO reference_ad_library (name, image_url, industry, ad_type, brand, tags, airtable_record_id, is_active, sort_order)
        VALUES (${ref.name}, ${ref.image_url}, ${ref.industry}, ${ref.ad_type}, ${ref.brand}, ${ref.tags}, ${ref.airtable_record_id}, ${ref.is_active}, ${ref.sort_order})
        ON CONFLICT (airtable_record_id) DO NOTHING
      `;
      inserted++;
    } catch (err: any) {
      if (err.message?.includes("duplicate")) {
        skipped++;
      } else {
        console.error(`Error on ${ref.name}:`, err.message);
      }
    }
  }

  console.log(`Done: ${inserted} inserted, ${skipped} skipped`);
  await demo.end();
  await knr.end();
}

main().catch(console.error);
