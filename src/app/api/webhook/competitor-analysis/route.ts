import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST /api/webhook/competitor-analysis — n8n callback with results
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-webhook-secret");
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { requestId, status, report, analyzedAds, scrapedAds, creativeBriefs } = body;

  // Save scraped ads
  if (scrapedAds && Array.isArray(scrapedAds)) {
    for (const ad of scrapedAds) {
      await db.insert(schema.scrapedAds).values({
        adId: ad.ad_id || ad.adId,
        competitorId: ad.competitor_id || ad.competitorId || null,
        competitorName: ad.competitor_name || ad.competitorName || null,
        brandId: ad.brand_id || ad.brandId || null,
        platform: ad.platform || null,
        lookupMode: ad.lookup_mode || ad.lookupMode || null,
        category: ad.category || null,
        mediaType: ad.media_type || ad.mediaType || null,
        adCopy: ad.ad_copy || ad.adCopy || null,
        mediaUrl: ad.media_url || ad.mediaUrl || null,
        landingPageUrl: ad.landing_page_url || ad.landingPageUrl || null,
        daysRunning: ad.days_running ?? ad.daysRunning ?? null,
        variationCount: ad.variation_count ?? ad.variationCount ?? null,
        longevityScore: ad.longevity_score ?? ad.longevityScore ?? null,
        qualifiesForAnalysis: ad.qualifies_for_analysis ?? ad.qualifiesForAnalysis ?? true,
        analysisStatus: ad.analysis_status || ad.analysisStatus || "Complete",
        dateScraped: ad.date_scraped || ad.dateScraped ? new Date(ad.date_scraped || ad.dateScraped) : new Date(),
        week: ad.week || null,
      });
    }
  }

  // Save analyzed ads
  if (analyzedAds && Array.isArray(analyzedAds)) {
    for (const ad of analyzedAds) {
      await db.insert(schema.analyzedAds).values({
        adTitle: ad.ad_title || ad.adTitle || null,
        competitorId: ad.competitor_id || ad.competitorId || null,
        competitorName: ad.competitor_name || ad.competitorName || null,
        brandId: ad.brand_id || ad.brandId || null,
        brandName: ad.brand_name || ad.brandName || null,
        platform: ad.platform || null,
        lookupMode: ad.lookup_mode || ad.lookupMode || null,
        category: ad.category || null,
        mediaType: ad.media_type || ad.mediaType || null,
        adCopy: ad.ad_copy || ad.adCopy || null,
        mediaUrl: ad.media_url || ad.mediaUrl || null,
        daysRunning: ad.days_running ?? ad.daysRunning ?? null,
        longevityScore: ad.longevity_score ?? ad.longevityScore ?? null,
        effectivenessScore: ad.effectiveness_score ?? ad.effectivenessScore ?? null,
        hookUsed: ad.hook_used || ad.hookUsed || null,
        hookType: ad.hook_type || ad.hookType || null,
        messagingAngle: ad.messaging_angle || ad.messagingAngle || null,
        visualStyle: ad.visual_style || ad.visualStyle || null,
        psychologyTechniques: ad.psychology_techniques || ad.psychologyTechniques || null,
        longevitySignals: ad.longevity_signals || ad.longevitySignals || null,
        targetAudience: ad.target_audience || ad.targetAudience || null,
        funnelStage: ad.funnel_stage || ad.funnelStage || null,
        contentFormat: ad.content_format || ad.contentFormat || null,
        fullAnalysis: ad.full_analysis || ad.fullAnalysis || null,
        differentiationOpportunities: ad.differentiation_opportunities || ad.differentiationOpportunities || null,
        replicableElements: ad.replicable_elements || ad.replicableElements || null,
        winnerCluster: ad.winner_cluster || ad.winnerCluster || null,
        dateScraped: ad.date_scraped || ad.dateScraped ? new Date(ad.date_scraped || ad.dateScraped) : new Date(),
        week: ad.week || null,
      });
    }
  }

  // Save intelligence report
  let reportId = null;
  if (report) {
    const [saved] = await db
      .insert(schema.intelligenceReports)
      .values({
        reportTitle: report.report_title || report.reportTitle || "Intelligence Report",
        reportType: report.report_type || report.reportType || "On-Demand",
        brandId: report.brand_id || report.brandId || null,
        brandName: report.brand_name || report.brandName || null,
        lookupMode: report.lookup_mode || report.lookupMode || null,
        competitorName: report.competitor_name || report.competitorName || null,
        category: report.category || null,
        week: report.week || null,
        executiveSummary: report.executive_summary || report.executiveSummary || null,
        winningPatterns: report.winning_patterns || report.winningPatterns || null,
        emergingTrends: report.emerging_trends || report.emergingTrends || null,
        hookTrends: report.hook_trends || report.hookTrends || null,
        visualTrends: report.visual_trends || report.visualTrends || null,
        longevityWinners: report.longevity_winners || report.longevityWinners || null,
        competitorActivity: report.competitor_activity || report.competitorActivity || null,
        differentiationRecommendations: report.differentiation_recommendations || report.differentiationRecommendations || null,
        ideationSeeds: report.ideation_seeds || report.ideationSeeds || null,
        adsAnalyzedCount: report.ads_analyzed_count ?? report.adsAnalyzedCount ?? null,
      })
      .returning();
    reportId = saved.id;
  }

  // Save creative briefs
  if (creativeBriefs && Array.isArray(creativeBriefs)) {
    for (const brief of creativeBriefs) {
      await db.insert(schema.creativeBriefs).values({
        briefTitle: brief.brief_title || brief.briefTitle || null,
        brandId: brief.brand_id || brief.brandId || null,
        brandName: brief.brand_name || brief.brandName || null,
        reportId: reportId || brief.report_id || brief.reportId || null,
        status: brief.status || "Genere",
        hypothesis: brief.hypothesis || null,
        targetAudience: brief.target_audience || brief.targetAudience || null,
        mainHook: brief.main_hook || brief.mainHook || null,
        hookVariations: brief.hook_variations || brief.hookVariations || null,
        angle: brief.angle || null,
        visualDirection: brief.visual_direction || brief.visualDirection || null,
        copyDirection: brief.copy_direction || brief.copyDirection || null,
        format: brief.format || null,
        platform: brief.platform || null,
        funnelStage: brief.funnel_stage || brief.funnelStage || null,
        language: brief.language || "Francais",
        complianceNotes: brief.compliance_notes || brief.complianceNotes || null,
        inspiredBy: brief.inspired_by || brief.inspiredBy || null,
        differentiation: brief.differentiation || null,
      });
    }
  }

  // Update lookup request status + link report (only if requestId provided — scheduled runs skip this)
  if (requestId) {
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (status) updates.status = status;
    if (reportId) updates.resultReportId = reportId;

    await db
      .update(schema.competitorLookupRequests)
      .set(updates)
      .where(eq(schema.competitorLookupRequests.id, requestId));
  }

  return NextResponse.json({ success: true, reportId });
}
