"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Trash2, Search, Send } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import type { CompetitorLookupRequest, Competitor, Brand } from "@/lib/types";

export function LookupRequests() {
  const [rows, setRows] = useState<CompetitorLookupRequest[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  const [lookupMode, setLookupMode] = useState<"Competitor" | "Category">("Competitor");
  const [competitorId, setCompetitorId] = useState("");
  const [category, setCategory] = useState("");
  const [brandId, setBrandId] = useState("");
  const [country, setCountry] = useState("FR");
  const [maxAds, setMaxAds] = useState(30);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [lookupRes, compRes, brandRes] = await Promise.all([
        fetch("/api/competitor-lookups"),
        fetch("/api/competitors"),
        fetch("/api/brands"),
      ]);
      if (lookupRes.ok) setRows(await lookupRes.json());
      if (compRes.ok) setCompetitors(await compRes.json());
      if (brandRes.ok) setBrands(await brandRes.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (lookupMode === "Competitor" && competitorId) {
      const comp = competitors.find((c) => c.id === competitorId);
      if (comp?.brandId) setBrandId(comp.brandId);
    }
  }, [competitorId, lookupMode, competitors]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const selectedBrand = brands.find((b) => b.id === brandId);

      await fetch("/api/competitor-lookups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lookupMode,
          competitorId: lookupMode === "Competitor" ? competitorId : null,
          category: lookupMode === "Category" ? category : null,
          brandId: brandId || null,
          brandName: selectedBrand?.brandName || null,
          country,
          maxAds,
        }),
      });
      setCompetitorId("");
      setCategory("");
      setBrandId("");
      setCountry("FR");
      setMaxAds(30);
      fetchData();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBulkDelete() {
    if (!selected.size) return;
    await fetch("/api/competitor-lookups", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selected) }),
    });
    setSelected(new Set());
    fetchData();
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(selected.size === rows.length ? new Set() : new Set(rows.map((r) => r.id)));
  }

  const grouped = competitors.reduce<Record<string, Competitor[]>>((acc, c) => {
    const key = c.brandName || "No Brand";
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">New Lookup Request</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            {(["Competitor", "Category"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setLookupMode(mode)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  lookupMode === mode
                    ? "bg-foreground text-background"
                    : "border border-border text-muted-foreground hover:bg-muted/30"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {lookupMode === "Competitor" ? (
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Competitor *</label>
                <select
                  value={competitorId}
                  onChange={(e) => setCompetitorId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
                  required
                >
                  <option value="">-- Select Competitor --</option>
                  {Object.entries(grouped).map(([brand, comps]) => (
                    <optgroup key={brand} label={brand}>
                      {comps.filter((c) => c.isActive).map((c) => (
                        <option key={c.id} value={c.id}>{c.competitorName}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Category *</label>
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. mountain lifestyle gifts"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
                  required
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Brand Context</label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
              >
                <option value="">-- Optional --</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.brandName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Country</label>
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Max Ads</label>
              <input
                type="number"
                value={maxAds}
                onChange={(e) => setMaxAds(parseInt(e.target.value) || 30)}
                min={5}
                max={100}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {submitting ? "Submitting..." : "Run Lookup"}
          </button>
        </form>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{rows.length} request{rows.length !== 1 ? "s" : ""}</p>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button onClick={handleBulkDelete} className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20">
              <Trash2 className="h-3.5 w-3.5" /> Delete ({selected.size})
            </button>
          )}
          <button onClick={fetchData} disabled={loading} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/30">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {rows.length === 0 && !loading ? (
        <EmptyState icon={Search} title="No lookup requests yet" description="Submit a new lookup above to analyze competitor ads." />
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-4 w-10"><input type="checkbox" checked={selected.size === rows.length && rows.length > 0} onChange={toggleAll} className="rounded border-border" /></th>
                <th className="px-5 py-4">Mode</th>
                <th className="px-5 py-4">Target</th>
                <th className="px-5 py-4">Brand</th>
                <th className="px-5 py-4">Country</th>
                <th className="px-5 py-4">Max Ads</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-5 py-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-muted/20">
                  <td className="px-5 py-5"><input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} className="rounded border-border" /></td>
                  <td className="px-5 py-5">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${r.lookupMode === "Competitor" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"}`}>
                      {r.lookupMode}
                    </span>
                  </td>
                  <td className="px-5 py-5 text-sm font-medium text-foreground">{r.lookupMode === "Competitor" ? r.competitorName || "--" : r.category || "--"}</td>
                  <td className="px-5 py-5 text-sm text-muted-foreground">{r.brandName || "--"}</td>
                  <td className="px-5 py-5 text-sm text-muted-foreground">{r.country}</td>
                  <td className="px-5 py-5 text-sm text-muted-foreground">{r.maxAds}</td>
                  <td className="px-6 py-5"><StatusBadge status={r.status} /></td>
                  <td className="px-5 py-5 text-sm text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
