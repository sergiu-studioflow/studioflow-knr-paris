"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Brain, RefreshCw, Loader2 } from "lucide-react";
import { BrandIntelCard } from "./brand-intel-card";

interface Brand {
  id: string;
  brandName: string;
}

interface BrandIntelEntry {
  id: string;
  brandId: string | null;
  brandName: string | null;
  title: string;
  type: string | null;
  rawContent: string | null;
  ownerName: string | null;
  updatedAt: string | null;
}

export function BrandIntelPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [entries, setEntries] = useState<BrandIntelEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [brandsRes, intelRes] = await Promise.all([
        fetch("/api/brands"),
        fetch("/api/brand-intel"),
      ]);
      const brandsData: Brand[] = await brandsRes.json();
      const intelData: BrandIntelEntry[] = await intelRes.json();

      // Only show brands that have intel entries
      const brandsWithIntel = new Set(intelData.map((e) => e.brandId));
      const filteredBrands = brandsData.filter((b) => brandsWithIntel.has(b.id));

      setBrands(filteredBrands);
      setEntries(intelData);

      // Select first brand with entries if none selected
      if (!selectedBrand && filteredBrands.length > 0) {
        setSelectedBrand(filteredBrands[0].id);
      }
    } catch {
      setError("Failed to load brand intelligence data");
    } finally {
      setLoading(false);
    }
  }, [selectedBrand]);

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    setError(null);
    try {
      const res = await fetch("/api/brand-intel/sync", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Sync failed");
      }
      const result = await res.json();
      setSyncResult(
        `Synced ${result.summary.notionPages} entries: ${result.summary.created} created, ${result.summary.updated} updated` +
          (result.summary.brandsCreated > 0
            ? `, ${result.summary.brandsCreated} new brands`
            : "")
      );
      // Refresh data after sync
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const handleEntryUpdated = (updated: BrandIntelEntry) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === updated.id ? { ...e, ...updated } : e))
    );
  };

  const selectedEntries = entries.filter((e) => e.brandId === selectedBrand);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (brands.length === 0 && entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Brain className="h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">
          No brand intelligence data yet.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Sync from Notion to import your brand intelligence.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={handleSync}
          disabled={syncing}
        >
          {syncing ? (
            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="mr-1 h-3.5 w-3.5" />
          )}
          {syncing ? "Syncing..." : "Sync from Notion"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sync controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {syncResult && (
            <span className="text-xs text-green-500">{syncResult}</span>
          )}
          {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          disabled={syncing}
        >
          {syncing ? (
            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="mr-1 h-3.5 w-3.5" />
          )}
          {syncing ? "Syncing..." : "Sync from Notion"}
        </Button>
      </div>

      {/* Brand tabs + content */}
      <Tabs
        value={selectedBrand || undefined}
        onValueChange={(v) => setSelectedBrand(v)}
      >
        <TabsList className="flex-wrap h-auto gap-1">
          {brands.map((brand) => {
            const count = entries.filter((e) => e.brandId === brand.id).length;
            return (
              <TabsTrigger key={brand.id} value={brand.id}>
                {brand.brandName}
                <span className="ml-1.5 text-[11px] opacity-60">{count}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {brands.map((brand) => (
          <TabsContent key={brand.id} value={brand.id}>
            <div className="space-y-3">
              {selectedEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No intelligence entries for {brand.brandName}.
                </p>
              ) : (
                selectedEntries.map((entry) => (
                  <BrandIntelCard
                    key={entry.id}
                    entry={entry}
                    onUpdated={handleEntryUpdated}
                  />
                ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
