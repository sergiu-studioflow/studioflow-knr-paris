"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import type { IntelligenceReport } from "@/lib/types";

function ReportSection({ title, content }: { title: string; content: string | null }) {
  if (!content) return null;
  return (
    <div className="mt-3">
      <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h5>
      <p className="mt-1 whitespace-pre-wrap text-sm text-foreground leading-relaxed">{content}</p>
    </div>
  );
}

export function ReportViewer() {
  const [reports, setReports] = useState<IntelligenceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/intelligence-reports");
      if (res.ok) setReports(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (!loading && reports.length === 0) {
    return <EmptyState icon={FileText} title="No intelligence reports yet" description="Reports are generated automatically after each competitor lookup." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{reports.length} report{reports.length !== 1 ? "s" : ""}</p>
        <button onClick={fetchData} disabled={loading} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/30">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <div className="space-y-3">
        {reports.map((r) => {
          const isExpanded = expandedId === r.id;
          return (
            <div key={r.id} className="rounded-xl border border-border bg-card overflow-hidden">
              <button onClick={() => setExpandedId(isExpanded ? null : r.id)} className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-muted/20">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-sm font-semibold text-foreground">{r.reportTitle || "Intelligence Report"}</h4>
                    <Badge variant={r.lookupMode === "Competitor" ? "info" : "warning"}>{r.lookupMode || "--"}</Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{r.lookupMode === "Competitor" ? r.competitorName : r.category}</span>
                    {r.brandName && <span>Brand: {r.brandName}</span>}
                    {r.week && <span>Week: {r.week}</span>}
                    {r.adsAnalyzedCount != null && <span>{r.adsAnalyzedCount} ads analyzed</span>}
                    <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
              </button>

              {isExpanded && (
                <div className="border-t border-border px-6 py-5 space-y-1">
                  <ReportSection title="Executive Summary" content={r.executiveSummary} />
                  <ReportSection title="Winning Patterns" content={r.winningPatterns} />
                  <ReportSection title="Emerging Trends" content={r.emergingTrends} />
                  <ReportSection title="Hook Trends" content={r.hookTrends} />
                  <ReportSection title="Visual Trends" content={r.visualTrends} />
                  <ReportSection title="Longevity Winners" content={r.longevityWinners} />
                  <ReportSection title="Competitor Activity" content={r.competitorActivity} />
                  <ReportSection title="Differentiation Recommendations" content={r.differentiationRecommendations} />
                  <ReportSection title="Ideation Seeds" content={r.ideationSeeds} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
