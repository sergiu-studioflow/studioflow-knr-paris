"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, BarChart3, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import type { AnalyzedAd } from "@/lib/types";

function ScoreBar({ score }: { score: number | null }) {
  const s = score || 0;
  const color = s >= 75 ? "bg-emerald-500" : s >= 50 ? "bg-amber-500" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-muted/30">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(s, 100)}%` }} />
      </div>
      <span className="text-xs text-muted-foreground">{s}</span>
    </div>
  );
}

function mediaTypeColor(t: string | null) {
  switch (t) {
    case "Video": return "info";
    case "Image": return "success";
    case "Carousel": case "Carrousel": return "warning";
    default: return "secondary";
  }
}

function platformColor(p: string | null) {
  switch (p) {
    case "Meta": return "bg-blue-500/10 text-blue-400";
    case "TikTok": return "bg-pink-500/10 text-pink-400";
    default: return "bg-muted text-muted-foreground";
  }
}

export function AnalyzedAdsTable() {
  const [rows, setRows] = useState<AnalyzedAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<AnalyzedAd | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analyzed-ads?limit=200");
      if (res.ok) setRows(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (!loading && rows.length === 0) {
    return (
      <EmptyState icon={BarChart3} title="No analyzed ads yet" description="Run a competitor lookup to start collecting and analyzing ads." />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{rows.length} analyzed ad{rows.length !== 1 ? "s" : ""}</p>
        <button onClick={fetchData} disabled={loading} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/30">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-4">Ad Title</th>
              <th className="px-5 py-4">Source</th>
              <th className="px-5 py-4">Platform</th>
              <th className="px-5 py-4">Media</th>
              <th className="px-5 py-4">Hook Type</th>
              <th className="px-5 py-4">Effectiveness</th>
              <th className="px-5 py-4">Days</th>
              <th className="px-5 py-4">Cluster</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((ad) => (
              <tr key={ad.id} onClick={() => setDetail(ad)} className="cursor-pointer transition-colors hover:bg-muted/20">
                <td className="px-5 py-4 text-sm font-medium text-foreground max-w-[200px] truncate">{ad.adTitle || "Untitled"}</td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{ad.competitorName || ad.category || "--"}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${platformColor(ad.platform)}`}>{ad.platform || "--"}</span>
                </td>
                <td className="px-5 py-4"><Badge variant={mediaTypeColor(ad.mediaType)}>{ad.mediaType || "--"}</Badge></td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{ad.hookType || "--"}</td>
                <td className="px-5 py-4"><ScoreBar score={ad.effectivenessScore} /></td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{ad.daysRunning ?? "--"}</td>
                <td className="px-5 py-4 text-sm text-muted-foreground max-w-[120px] truncate">{ad.winnerCluster || "--"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDetail(null)}>
          <div onClick={(e) => e.stopPropagation()} className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">{detail.adTitle || "Untitled Ad"}</h3>
              <button onClick={() => setDetail(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-xs font-medium uppercase text-muted-foreground">Source</span><p className="text-foreground">{detail.competitorName || detail.category}</p></div>
              <div><span className="text-xs font-medium uppercase text-muted-foreground">Platform</span><p className="text-foreground">{detail.platform || "--"}</p></div>
              <div><span className="text-xs font-medium uppercase text-muted-foreground">Media Type</span><p><Badge variant={mediaTypeColor(detail.mediaType)}>{detail.mediaType}</Badge></p></div>
              <div><span className="text-xs font-medium uppercase text-muted-foreground">Hook</span><p className="text-foreground">{detail.hookUsed || "--"}</p></div>
              <div><span className="text-xs font-medium uppercase text-muted-foreground">Hook Type</span><p className="text-foreground">{detail.hookType || "--"}</p></div>
              <div><span className="text-xs font-medium uppercase text-muted-foreground">Messaging Angle</span><p className="text-foreground">{detail.messagingAngle || "--"}</p></div>
              <div><span className="text-xs font-medium uppercase text-muted-foreground">Visual Style</span><p className="text-foreground">{detail.visualStyle || "--"}</p></div>
              <div><span className="text-xs font-medium uppercase text-muted-foreground">Effectiveness</span><ScoreBar score={detail.effectivenessScore} /></div>
              <div><span className="text-xs font-medium uppercase text-muted-foreground">Longevity Score</span><ScoreBar score={detail.longevityScore} /></div>
              <div><span className="text-xs font-medium uppercase text-muted-foreground">Days Running</span><p className="text-foreground">{detail.daysRunning ?? "--"}</p></div>
              <div><span className="text-xs font-medium uppercase text-muted-foreground">Funnel Stage</span><p className="text-foreground">{detail.funnelStage || "--"}</p></div>
              <div><span className="text-xs font-medium uppercase text-muted-foreground">Winner Cluster</span><p className="text-foreground">{detail.winnerCluster || "--"}</p></div>
            </div>
            {detail.fullAnalysis && <div className="mt-4"><span className="text-xs font-medium uppercase text-muted-foreground">Full Analysis</span><p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{detail.fullAnalysis}</p></div>}
            {detail.psychologyTechniques && <div className="mt-4"><span className="text-xs font-medium uppercase text-muted-foreground">Psychology Techniques</span><p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{detail.psychologyTechniques}</p></div>}
            {detail.differentiationOpportunities && <div className="mt-4"><span className="text-xs font-medium uppercase text-muted-foreground">Differentiation Opportunities</span><p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{detail.differentiationOpportunities}</p></div>}
            {detail.replicableElements && <div className="mt-4"><span className="text-xs font-medium uppercase text-muted-foreground">Replicable Elements</span><p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{detail.replicableElements}</p></div>}
          </div>
        </div>
      )}
    </div>
  );
}
