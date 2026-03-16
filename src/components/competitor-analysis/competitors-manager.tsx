"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, RefreshCw, Trash2, Pencil, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import type { Competitor, Brand } from "@/lib/types";

export function CompetitorsManager() {
  const [rows, setRows] = useState<Competitor[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formBrandId, setFormBrandId] = useState("");
  const [formSearchTerms, setFormSearchTerms] = useState("");
  const [formPageId, setFormPageId] = useState("");
  const [formTiktokHandle, setFormTiktokHandle] = useState("");
  const [formPlatforms, setFormPlatforms] = useState("Meta");
  const [formCountry, setFormCountry] = useState("FR");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [compRes, brandRes] = await Promise.all([
        fetch("/api/competitors"),
        fetch("/api/brands"),
      ]);
      if (compRes.ok) setRows(await compRes.json());
      if (brandRes.ok) setBrands(await brandRes.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  function resetForm() {
    setFormName("");
    setFormBrandId("");
    setFormSearchTerms("");
    setFormPageId("");
    setFormTiktokHandle("");
    setFormPlatforms("Meta");
    setFormCountry("FR");
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(c: Competitor) {
    setFormName(c.competitorName);
    setFormBrandId(c.brandId || "");
    setFormSearchTerms(c.metaSearchTerms || "");
    setFormPageId(c.metaPageId || "");
    setFormTiktokHandle(c.tiktokHandle || "");
    setFormPlatforms(c.platforms);
    setFormCountry(c.country);
    setEditingId(c.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) return;

    const payload = {
      ...(editingId ? { id: editingId } : {}),
      competitorName: formName,
      brandId: formBrandId || null,
      metaSearchTerms: formSearchTerms || null,
      metaPageId: formPageId || null,
      tiktokHandle: formTiktokHandle || null,
      platforms: formPlatforms,
      country: formCountry,
    };

    await fetch("/api/competitors", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    resetForm();
    fetchData();
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch("/api/competitors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !current }),
    });
    fetchData();
  }

  async function handleBulkDelete() {
    if (!selected.size) return;
    await fetch("/api/competitors", {
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

  if (!loading && rows.length === 0 && !showForm) {
    return (
      <EmptyState
        icon={Target}
        title="No competitors tracked yet"
        description="Add competitors to start tracking their Meta and TikTok ad strategies."
        action={
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90">
            <Plus className="h-4 w-4" /> Add Competitor
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {showForm && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">{editingId ? "Edit Competitor" : "Add Competitor"}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Competitor Name *</label>
              <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Marcel Travel Poster" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Brand</label>
              <select value={formBrandId} onChange={(e) => setFormBrandId(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20">
                <option value="">-- Select Brand --</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.brandName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Meta Page ID</label>
              <input value={formPageId} onChange={(e) => setFormPageId(e.target.value)} placeholder="Facebook Page ID" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">TikTok Handle</label>
              <input value={formTiktokHandle} onChange={(e) => setFormTiktokHandle(e.target.value)} placeholder="@username" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Platforms</label>
              <select value={formPlatforms} onChange={(e) => setFormPlatforms(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20">
                <option value="Meta">Meta</option>
                <option value="TikTok">TikTok</option>
                <option value="Meta,TikTok">Meta + TikTok</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Country</label>
              <input value={formCountry} onChange={(e) => setFormCountry(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Meta Search Terms (one per line)</label>
              <textarea value={formSearchTerms} onChange={(e) => setFormSearchTerms(e.target.value)} placeholder={"keyword 1\nkeyword 2"} rows={3} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <button type="submit" className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90">
                {editingId ? "Save Changes" : "Add Competitor"}
              </button>
              <button type="button" onClick={resetForm} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/30">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{rows.length} competitor{rows.length !== 1 ? "s" : ""}</p>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button onClick={handleBulkDelete} className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20">
              <Trash2 className="h-3.5 w-3.5" /> Delete ({selected.size})
            </button>
          )}
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-colors hover:bg-foreground/90">
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          )}
          <button onClick={fetchData} disabled={loading} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/30">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-4 w-10"><input type="checkbox" checked={selected.size === rows.length && rows.length > 0} onChange={toggleAll} className="rounded border-border" /></th>
              <th className="px-5 py-4">Competitor</th>
              <th className="px-5 py-4">Brand</th>
              <th className="px-5 py-4">Platforms</th>
              <th className="px-5 py-4">Country</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Last Scraped</th>
              <th className="px-5 py-4 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((c) => (
              <tr key={c.id} className="transition-colors hover:bg-muted/20">
                <td className="px-5 py-4"><input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} className="rounded border-border" /></td>
                <td className="px-5 py-4 text-sm font-medium text-foreground">{c.competitorName}</td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{c.brandName || "--"}</td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{c.platforms}</td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{c.country}</td>
                <td className="px-5 py-4">
                  <button onClick={() => toggleActive(c.id, c.isActive)}>
                    <Badge variant={c.isActive ? "success" : "secondary"}>{c.isActive ? "Active" : "Paused"}</Badge>
                  </button>
                </td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{c.lastScraped ? new Date(c.lastScraped).toLocaleDateString() : "Never"}</td>
                <td className="px-5 py-4">
                  <button onClick={() => startEdit(c)} className="text-muted-foreground hover:text-foreground transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
