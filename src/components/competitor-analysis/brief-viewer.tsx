"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import type { CreativeBrief } from "@/lib/types";

const statusColors: Record<string, string> = {
  "Genere": "bg-blue-500/10 text-blue-400",
  "En Revision": "bg-amber-500/10 text-amber-400",
  "Approuve": "bg-emerald-500/10 text-emerald-400",
  "En Production": "bg-purple-500/10 text-purple-400",
  "Archive": "bg-muted text-muted-foreground",
};

function BriefField({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="mt-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <p className="mt-0.5 whitespace-pre-wrap text-sm text-foreground leading-relaxed">{value}</p>
    </div>
  );
}

export function BriefViewer() {
  const [briefs, setBriefs] = useState<CreativeBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/creative-briefs");
      if (res.ok) setBriefs(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function updateStatus(id: string, status: string) {
    await fetch("/api/creative-briefs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchData();
  }

  if (!loading && briefs.length === 0) {
    return <EmptyState icon={FileText} title="No creative briefs yet" description="Briefs are generated automatically from intelligence reports." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{briefs.length} brief{briefs.length !== 1 ? "s" : ""}</p>
        <button onClick={fetchData} disabled={loading} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/30">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <div className="space-y-3">
        {briefs.map((b) => {
          const isExpanded = expandedId === b.id;
          const colorClass = statusColors[b.status] || statusColors["Genere"];

          return (
            <div key={b.id} className="rounded-xl border border-border bg-card overflow-hidden">
              <button onClick={() => setExpandedId(isExpanded ? null : b.id)} className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-muted/20">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-sm font-semibold text-foreground">{b.briefTitle || "Creative Brief"}</h4>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>{b.status}</span>
                    {b.format && <span className="text-xs text-muted-foreground">{b.format}</span>}
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                    {b.brandName && <span>{b.brandName}</span>}
                    {b.platform && <span>{b.platform}</span>}
                    {b.funnelStage && <span>{b.funnelStage}</span>}
                    <span>{new Date(b.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
              </button>

              {isExpanded && (
                <div className="border-t border-border px-6 py-5">
                  {/* Status Update Buttons */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    {["Genere", "En Revision", "Approuve", "En Production", "Archive"].map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(b.id, s)}
                        className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                          b.status === s
                            ? "bg-foreground text-background"
                            : "border border-border text-muted-foreground hover:bg-muted/30"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  <BriefField label="Hypothesis" value={b.hypothesis} />
                  <BriefField label="Target Audience" value={b.targetAudience} />
                  <BriefField label="Main Hook" value={b.mainHook} />
                  <BriefField label="Hook Variations" value={b.hookVariations} />
                  <BriefField label="Angle" value={b.angle} />
                  <BriefField label="Visual Direction" value={b.visualDirection} />
                  <BriefField label="Copy Direction" value={b.copyDirection} />
                  <BriefField label="Compliance Notes" value={b.complianceNotes} />
                  <BriefField label="Inspired By" value={b.inspiredBy} />
                  <BriefField label="Differentiation" value={b.differentiation} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
