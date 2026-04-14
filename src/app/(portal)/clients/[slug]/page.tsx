"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Brain, Package, Zap, Target, Palette, Search, Pencil, Trash2, Plus, Loader2, Save,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import type {
  Client, ClientBrandIntel, ClientProduct, ClientUsp,
  ClientCompetitor, ClientCreativeDna, ClientResearchSource,
} from "@/lib/types";

type Tab = "overview" | "brand-intel" | "products" | "usps" | "competitors" | "creative-dna" | "research-sources" | "settings";

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "overview", label: "Overview", icon: Target },
  { key: "brand-intel", label: "Brand Intel", icon: Brain },
  { key: "products", label: "Products", icon: Package },
  { key: "usps", label: "USPs", icon: Zap },
  { key: "competitors", label: "Competitors", icon: Search },
  { key: "creative-dna", label: "Creative DNA", icon: Palette },
  { key: "research-sources", label: "Research", icon: Search },
];

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [client, setClient] = useState<Client | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/clients/${slug}`)
      .then((r) => r.ok ? r.json() : null)
      .then(setClient)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="space-y-4">
        <Link href="/clients" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Clients
        </Link>
        <p className="text-muted-foreground">Client not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/clients" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Clients
        </Link>
        <div className="flex items-start gap-4">
          {client.logoUrl ? (
            <img src={client.logoUrl} alt="" className="h-12 w-12 rounded-xl object-cover" />
          ) : (
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold"
              style={{
                backgroundColor: client.brandColor ? `${client.brandColor}15` : "hsl(var(--muted))",
                color: client.brandColor || "hsl(var(--muted-foreground))",
              }}
            >
              {client.clientName.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{client.clientName}</h1>
            <p className="text-sm text-muted-foreground">
              {[client.category, client.primaryMarket].filter(Boolean).join(" · ") || client.clientSlug}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-border/50 pb-px">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              tab === t.key
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground/80"
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "overview" && <OverviewTab client={client} />}
      {tab === "brand-intel" && <SubResourceTab slug={slug} endpoint="brand-intel" columns={["title", "sectionType", "content"]} />}
      {tab === "products" && <SubResourceTab slug={slug} endpoint="products" columns={["productName", "category", "price", "status"]} />}
      {tab === "usps" && <SubResourceTab slug={slug} endpoint="usps" columns={["uspText", "uspCategory", "isPrimary"]} />}
      {tab === "competitors" && <SubResourceTab slug={slug} endpoint="competitors" columns={["competitorName", "competitorType", "websiteUrl", "isActive"]} />}
      {tab === "creative-dna" && <SubResourceTab slug={slug} endpoint="creative-dna" columns={["attributeName", "attributeType", "allowedValues", "defaultValue"]} />}
      {tab === "research-sources" && <SubResourceTab slug={slug} endpoint="research-sources" columns={["sourceType", "identifier", "isActive"]} />}
    </div>
  );
}

function OverviewTab({ client }: { client: Client }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-4 rounded-xl border border-border/50 bg-card p-5">
        <h3 className="font-medium">Client Details</h3>
        <dl className="space-y-3 text-sm">
          <Row label="Name" value={client.clientName} />
          <Row label="Slug" value={client.clientSlug || "—"} mono />
          <Row label="Website" value={client.website || "—"} />
          <Row label="Category" value={client.category || "—"} />
          <Row label="Market" value={client.primaryMarket || "—"} />
          <Row label="Currency" value={client.currency || "—"} />
          <Row label="Cluster" value={client.cluster || "—"} />
          <Row label="Status" value={client.status} />
          <Row label="Created" value={formatDate(client.createdAt)} />
        </dl>
      </div>

      <div className="space-y-4 rounded-xl border border-border/50 bg-card p-5">
        <h3 className="font-medium">Storage & Infrastructure</h3>
        <dl className="space-y-3 text-sm">
          <Row label="Storage Prefix" value={client.storagePrefix} mono />
          <Row label="Brand Color" value={client.brandColor || "Default"} />
          <Row label="Provisioned" value={client.provisionedAt ? formatDate(client.provisionedAt) : "Pending"} />
        </dl>
        {client.notes && (
          <div className="mt-4 border-t border-border/50 pt-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
            <p className="text-sm">{client.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("text-right", mono && "font-mono text-xs")}>{value}</dd>
    </div>
  );
}

/**
 * Generic sub-resource tab that fetches and displays data in a table.
 */
function SubResourceTab({
  slug, endpoint, columns,
}: {
  slug: string;
  endpoint: string;
  columns: string[];
}) {
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch(`/api/clients/${slug}/${endpoint}`)
      .then((r) => r.json())
      .then(setRows)
      .finally(() => setLoading(false));
  }, [slug, endpoint]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this item?")) return;
    const res = await fetch(`/api/clients/${slug}/${endpoint}/${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{rows.length} item{rows.length !== 1 ? "s" : ""}</p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/50 py-12 text-center">
          <p className="text-sm text-muted-foreground">No items yet. Add data via the API or Brand Intelligence page.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                {columns.map((col) => (
                  <th key={col} className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                    {formatColumnName(col)}
                  </th>
                ))}
                <th className="w-16 px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border/30 last:border-0 hover:bg-muted/20">
                  {columns.map((col) => (
                    <td key={col} className="max-w-[200px] truncate px-4 py-2.5">
                      {formatCellValue(row[col])}
                    </td>
                  ))}
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="rounded p-1 text-muted-foreground/50 transition-colors hover:bg-red-500/10 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatColumnName(col: string): string {
  return col
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}
