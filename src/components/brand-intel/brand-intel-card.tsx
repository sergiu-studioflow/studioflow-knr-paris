"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Save, X, Loader2, ChevronRight, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

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

const TYPE_COLORS: Record<string, string> = {
  "Brand Identity": "bg-green-500/15 text-green-400 border-green-500/20",
  Products: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  "Target Audience": "bg-purple-500/15 text-purple-400 border-purple-500/20",
  "Voice & Tone": "bg-pink-500/15 text-pink-400 border-pink-500/20",
  Compliance: "bg-red-500/15 text-red-400 border-red-500/20",
  "Visual Direction": "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  "Competitive Landscape": "bg-gray-500/15 text-gray-400 border-gray-500/20",
};

export function BrandIntelCard({
  entry,
  onUpdated,
}: {
  entry: BrandIntelEntry;
  onUpdated: (updated: BrandIntelEntry) => void;
}) {
  const [collapsed, setCollapsed] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.max(300, textareaRef.current.scrollHeight) + "px";
    }
  }, [editing]);

  const handleEdit = () => {
    setDraft(entry.rawContent || "");
    setEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/brand-intel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: entry.id, rawContent: draft }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }
      const updated = await res.json();
      onUpdated({ ...entry, rawContent: updated.rawContent, updatedAt: updated.updatedAt });
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.max(300, e.target.scrollHeight) + "px";
  };

  const typeColor = entry.type ? TYPE_COLORS[entry.type] || "bg-muted text-muted-foreground" : null;

  return (
    <Card>
      <CardHeader
        className="flex flex-row items-center justify-between space-y-0 cursor-pointer select-none py-4"
        onClick={() => !editing && setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <ChevronRight
            className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${collapsed ? "" : "rotate-90"}`}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base">{entry.title}</CardTitle>
              {entry.type && (
                <Badge variant="outline" className={`text-[11px] ${typeColor}`}>
                  {entry.type}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              {entry.ownerName && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {entry.ownerName}
                </span>
              )}
              {entry.updatedAt && (
                <span className="text-xs text-muted-foreground">
                  Updated {new Date(entry.updatedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
        {!collapsed && (
          <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
            {editing ? (
              <>
                <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving}>
                  <X className="mr-1 h-3.5 w-3.5" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="mr-1 h-3.5 w-3.5" />
                  )}
                  {saving ? "Saving..." : "Save"}
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Pencil className="mr-1 h-3.5 w-3.5" />
                Edit
              </Button>
            )}
          </div>
        )}
      </CardHeader>

      {!collapsed && (
        <>
          {error && (
            <div className="mx-6 mb-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}
          <CardContent>
            {editing ? (
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={handleTextareaInput}
                placeholder="Write brand intelligence content here... (Markdown supported)"
                className="w-full min-h-[300px] rounded-lg border border-input bg-background p-4 text-sm font-mono leading-relaxed outline-none resize-none focus:border-foreground/20 focus:ring-2 focus:ring-foreground/5 placeholder:text-muted-foreground transition-all duration-150"
                spellCheck
              />
            ) : entry.rawContent ? (
              <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed [&_strong]:text-foreground [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2 [&_p]:text-secondary-foreground [&_p]:mb-3 [&_li]:text-secondary-foreground [&_code]:text-foreground">
                <ReactMarkdown>{entry.rawContent}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic py-4">
                No content yet. Click Edit to add brand intelligence.
              </p>
            )}
          </CardContent>
        </>
      )}
    </Card>
  );
}
