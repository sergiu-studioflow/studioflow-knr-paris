import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

/**
 * GET /api/clients/[slug]/compliance-rules — Fetch a client's compliance rules.
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { slug } = await params;
  const [client] = await db
    .select({ complianceRules: schema.clients.complianceRules })
    .from(schema.clients)
    .where(eq(schema.clients.clientSlug, slug))
    .limit(1);

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  return NextResponse.json({ complianceRules: client.complianceRules ?? "" });
}

/**
 * PUT /api/clients/[slug]/compliance-rules — Update a client's compliance rules.
 */
export async function PUT(req: NextRequest, { params }: Params) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;
  if (auth.portalUser.role === "viewer") {
    return NextResponse.json({ error: "Edit access required" }, { status: 403 });
  }

  const { slug } = await params;
  const body = await req.json();
  const complianceRules = typeof body.complianceRules === "string" ? body.complianceRules : null;

  const [updated] = await db
    .update(schema.clients)
    .set({ complianceRules, updatedAt: new Date() })
    .where(eq(schema.clients.clientSlug, slug))
    .returning({ complianceRules: schema.clients.complianceRules });

  if (!updated) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  return NextResponse.json({ complianceRules: updated.complianceRules ?? "" });
}
