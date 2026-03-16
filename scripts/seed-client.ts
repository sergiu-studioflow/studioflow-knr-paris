import postgres from "postgres";
import "dotenv/config";

// =============================================================
// CUSTOMIZE THESE VALUES FOR EACH CLIENT BEFORE RUNNING
// =============================================================
const BRAND_NAME = process.env.SEED_BRAND_NAME ?? "";
const PORTAL_TITLE = process.env.SEED_PORTAL_TITLE ?? `${BRAND_NAME} Creative Studio`;
const BRAND_COLOR = process.env.SEED_BRAND_COLOR ?? "#b2ff00";
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "";

// KNR Paris Brand Intelligence — full content from .Clients/KNR Paris/KNR Paris - Brand Intelligence Layer.md
const BRAND_INTEL_CONTENT = `## Agency Overview

KNR is a Paris-based digital agency founded and led by Gabriel Kaam. The agency exists at a specific and increasingly valuable intersection in the French e-commerce services market: it combines full-stack web development capability with media buying and growth services, serving brands predominantly in the fashion, beauty, and luxury sectors.

This combination is strategically significant. Most agencies in the French market specialise in one or the other. KNR does both, which means it controls the entire digital revenue infrastructure for its clients, from the platform they sell on to the campaigns that drive traffic to it.

The agency currently services over 100 clients. Media buying represents a smaller share due to a creative production bottleneck — producing approximately five creatives per month per brand when the requirement is closer to fifty. The AI creative systems are being built to fundamentally remove this constraint.

KNR operates from France, serves a predominantly French client base, and all content defaults to French. Multi-language expansion is planned for Swiss-French markets.

---

## Competitive Position

KNR's competitive advantage: ability to own the full digital value chain from website to revenue. Every website KNR builds is a potential media buying client. With AI creative systems, KNR can offer fully integrated service — website, site management, advertising, unlimited AI creative at scale, full-transparency reporting — all within a single relationship.

---

## Team Structure

- **Gabriel Kaam** — CEO, strategic centre, client relationships, business development
- **Clemence** — Operational Lead, day-to-day contact, primary AI systems operator
- **Media Buyers** — Paid campaigns across Meta and Google, constrained by creative volume
- **Ad Strategist** — Campaign angles, audience targeting, creative directions
- **Creative Director, Copywriter, Graphic Designer** — In-house production team (capacity bottleneck)

---

## Client Portfolio (5 Brands)

1. **Jewellery** — Luxury, precision product rendering required
2. **Lifestyle** — Aspirational world-building, emotional territory
3. **Balcon avec Vue** — Modern mountain lifestyle gifts, first AI test brand. Products: socks, keychains, pins, postcards, bookmarks, posters, puzzles. Visual identity tied to specific alpine locations (Megeve, Annecy, Chamonix). Competitors: Marcel Travel Poster, Louis Laffiche, La Loutre, Felicie Aussi, Breizhclub, Puzzlejourferie
4. **Website Launch** — Social ads upsell, time-sensitive
5. **Fashion Marketplace** — Gabriel's own, 10,000 brands, 2M products

---

## Quality Standards

- Product detail fidelity is paramount (buckle placement, stitching patterns)
- UGC/video must be photorealistic (no waxy skin, accurate lip sync, natural expressions)
- No AI-looking output — must be indistinguishable from human-produced creative
- Per-brand calibration (not generic threshold)
- No vintage cliche, no generic stock visuals

---

## Technical Environment

- **Notion** — Central OS, client collaboration interface
- **n8n** — Self-hosted automation platform
- **Meta Ads Manager** — Primary advertising platform
- **Google Drive** — Asset storage
- **Slack** — Real-time communication

---

## Strategic Goals

Shift from web-development-first to full-service growth agency where media buying powered by AI creative is the primary recurring revenue engine. Lower-cost media buying tier planned. Every successful case study becomes a sales asset.
`;
// =============================================================

if (!BRAND_NAME) {
  console.error("❌ SEED_BRAND_NAME env var is required. Set it before running seed.");
  console.error("   Example: SEED_BRAND_NAME=Trimrx SEED_ADMIN_EMAIL=client@company.com npm run seed");
  process.exit(1);
}

if (!ADMIN_EMAIL) {
  console.error("❌ SEED_ADMIN_EMAIL env var is required.");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL not set. Copy .env.example to .env.local and fill in values.");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });

async function main() {
  console.log(`\nSeeding database for: ${BRAND_NAME}\n`);

  // 1. App Config (singleton)
  await sql`
    INSERT INTO app_config (brand_name, brand_color, logo_url, portal_title, features, workflows)
    VALUES (
      ${BRAND_NAME},
      ${BRAND_COLOR},
      '/client-logo.png',
      ${PORTAL_TITLE},
      '{"brand_intel_editing": true}'::jsonb,
      '{}'::jsonb
    )
    ON CONFLICT DO NOTHING
  `;
  console.log("  ✓ app_config");

  // 2. Brand Intelligence (singleton)
  await sql`
    INSERT INTO brand_intelligence (title, raw_content)
    VALUES ('Brand Intelligence', ${BRAND_INTEL_CONTENT})
    ON CONFLICT DO NOTHING
  `;
  console.log("  ✓ brand_intelligence");

  // 3. Better Auth user + portal user
  // The Better Auth user must be created first via magic link login.
  // After the admin logs in for the first time, run this to create their portal profile:
  //
  //   INSERT INTO users (user_id, display_name, email, role)
  //   SELECT id, name, email, 'admin'
  //   FROM "user"
  //   WHERE email = 'ADMIN_EMAIL'
  //   ON CONFLICT DO NOTHING;
  //
  console.log("  ⚠️  Admin user: log in via magic link first, then run the SQL above to grant admin role.");

  console.log(`\n✅ Database seeded for ${BRAND_NAME}`);
  console.log("📋 Next steps:");
  console.log("   1. Add client-logo.png to /public/");
  console.log(`   2. Send magic link to ${ADMIN_EMAIL} from the portal login page`);
  console.log("   3. Run the admin SQL above after first login to grant admin role");
  console.log("   4. Set BETTER_AUTH_URL and NEXT_PUBLIC_APP_URL to the Vercel deployment URL");

  await sql.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
