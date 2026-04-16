import postgres from "postgres";
import { readFileSync } from "fs";
import { join } from "path";

const DATABASE_URL = process.env.DATABASE_URL!;
const PROMPTS_DIR = join(__dirname, "prompts");

const BRANDS = [
  { slug: "balcon-avec-vue", industries: '["Art + Illustration", "Retail", "Apparel", "Home + Living"]' },
  { slug: "doamabijoux", industries: '["Jewellery", "Fashion", "Luxury", "Accessories"]' },
  { slug: "eco-sense", industries: '["Cleaning", "B2B Services", "Facilities Management", "Tech"]' },
  { slug: "modalova", industries: '["Fashion", "Apparel", "Retail", "Accessories", "Luxury"]' },
  { slug: "taion", industries: '["Apparel", "Outerwear", "Fashion", "Retail"]' },
];

async function main() {
  const sql = postgres(DATABASE_URL);

  for (const brand of BRANDS) {
    const agent1Path = join(PROMPTS_DIR, `${brand.slug}-agent1.txt`);
    const agent2Path = join(PROMPTS_DIR, `${brand.slug}-agent2.txt`);

    let agent1: string, agent2: string;
    try {
      agent1 = readFileSync(agent1Path, "utf-8").trim();
      agent2 = readFileSync(agent2Path, "utf-8").trim();
    } catch (err) {
      console.log(`  Skipping ${brand.slug} — prompt files not found`);
      continue;
    }

    console.log(`Seeding ${brand.slug}...`);
    console.log(`  Agent 1: ${agent1.length} chars`);
    console.log(`  Agent 2: ${agent2.length} chars`);

    // Get client ID from brands table
    const [client] = await sql`SELECT id FROM brands WHERE slug = ${brand.slug}`;
    if (!client) {
      console.log(`  ERROR: Brand ${brand.slug} not found in brands table`);
      continue;
    }

    await sql`
      INSERT INTO client_static_ad_config (client_id, agent1_prompt, agent2_prompt, allowed_industries)
      VALUES (${client.id}, ${agent1}, ${agent2}, ${brand.industries})
      ON CONFLICT (client_id) DO UPDATE SET
        agent1_prompt = EXCLUDED.agent1_prompt,
        agent2_prompt = EXCLUDED.agent2_prompt,
        allowed_industries = EXCLUDED.allowed_industries,
        updated_at = now()
    `;
    console.log(`  Done`);
  }

  await sql.end();
  console.log("\nAll prompts seeded.");
}

main().catch(console.error);
