import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const NOTION_DB_ID = "317b2ed6-fcd3-811c-9a3f-f6e9e5685544";

interface NotionRichText {
  plain_text: string;
}

interface NotionPage {
  id: string;
  properties: {
    Title: { title: NotionRichText[] };
    Brand: { select: { name: string } | null };
    Type: { select: { name: string } | null };
    Content: { rich_text: NotionRichText[] };
    Owner: { people: { name?: string }[] };
  };
}

// POST /api/brand-intel/sync — pull from Notion and upsert into Neon
export async function POST() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  if (auth.portalUser.role !== "admin") {
    return NextResponse.json({ error: "Only admins can sync from Notion" }, { status: 403 });
  }

  const notionKey = process.env.NOTION_API_KEY;
  if (!notionKey) {
    return NextResponse.json({ error: "NOTION_API_KEY not configured" }, { status: 500 });
  }

  // Fetch all pages from the Notion Brand Intelligence database
  const notionPages: NotionPage[] = [];
  let hasMore = true;
  let startCursor: string | undefined;

  while (hasMore) {
    const body: Record<string, unknown> = { page_size: 100 };
    if (startCursor) body.start_cursor = startCursor;

    const res = await fetch(`https://api.notion.com/v1/databases/${NOTION_DB_ID}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${notionKey}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: "Notion API error", details: err },
        { status: 502 }
      );
    }

    const data = await res.json();
    notionPages.push(...(data.results as NotionPage[]));
    hasMore = data.has_more;
    startCursor = data.next_cursor ?? undefined;
  }

  // Load existing brands for name matching
  const existingBrands = await db.select().from(schema.brands);
  const brandMap = new Map(existingBrands.map((b) => [b.brandName.toLowerCase(), b]));

  let created = 0;
  let updated = 0;
  let brandsCreated = 0;

  for (const page of notionPages) {
    const title =
      page.properties.Title?.title?.map((t) => t.plain_text).join("") || "Untitled";
    const brandName = page.properties.Brand?.select?.name;
    const typeName = page.properties.Type?.select?.name || null;
    const content =
      page.properties.Content?.rich_text?.map((t) => t.plain_text).join("") || null;
    const ownerName = page.properties.Owner?.people?.[0]?.name || null;

    if (!brandName) continue; // skip entries without a brand

    // Find or create brand
    let brand = brandMap.get(brandName.toLowerCase());
    if (!brand) {
      const [newBrand] = await db
        .insert(schema.brands)
        .values({ brandName, language: "fr" })
        .returning();
      brand = newBrand;
      brandMap.set(brandName.toLowerCase(), brand);
      brandsCreated++;
    }

    // Check if entry exists by notionPageId
    const [existing] = await db
      .select()
      .from(schema.brandIntelligence)
      .where(eq(schema.brandIntelligence.notionPageId, page.id))
      .limit(1);

    if (existing) {
      await db
        .update(schema.brandIntelligence)
        .set({
          brandId: brand.id,
          title,
          type: typeName,
          rawContent: content,
          ownerName,
          updatedAt: new Date(),
        })
        .where(eq(schema.brandIntelligence.id, existing.id));
      updated++;
    } else {
      await db.insert(schema.brandIntelligence).values({
        brandId: brand.id,
        title,
        type: typeName,
        rawContent: content,
        notionPageId: page.id,
        ownerName,
      });
      created++;
    }
  }

  await db.insert(schema.activityLog).values({
    userId: auth.portalUser.id,
    action: "brand_intel_synced",
    resourceType: "brand_intel",
    details: { source: "notion", created, updated, brandsCreated, totalPages: notionPages.length },
  });

  return NextResponse.json({
    success: true,
    summary: {
      notionPages: notionPages.length,
      created,
      updated,
      brandsCreated,
    },
  });
}
