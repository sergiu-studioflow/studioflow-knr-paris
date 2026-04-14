"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Brain, Pencil, Save, X } from "lucide-react";

type Section = {
  id: string;
  title: string;
  content: string | null;
  sectionType: string | null;
  sortOrder: number;
};

export function ClientBrandIntelEditor({ clientSlug }: { clientSlug: string }) {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/clients/${clientSlug}/brand-intel`)
      .then((r) => r.json())
      .then((data) => {
        setSections(Array.isArray(data) ? data : []);
        // Build a single document from sections
        const doc = (Array.isArray(data) ? data : [])
          .sort((a: Section, b: Section) => a.sortOrder - b.sortOrder)
          .map((s: Section) => `## ${s.title}\n\n${s.content || ""}`)
          .join("\n\n---\n\n");
        setDraft(doc);
      })
      .finally(() => setLoading(false));
  }, [clientSlug]);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.max(400, textareaRef.current.scrollHeight) + "px";
    }
  }, [editing]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    // Rebuild from sections
    const doc = sections
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((s) => `## ${s.title}\n\n${s.content || ""}`)
      .join("\n\n---\n\n");
    setDraft(doc);
    setEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Parse the document back into sections by splitting on "## " headers
      const rawSections = draft.split(/(?=^## )/m).filter((s) => s.trim());
      const parsed = rawSections.map((raw, i) => {
        const lines = raw.trim().split("\n");
        const title = lines[0].replace(/^##\s*/, "").trim();
        const content = lines.slice(1).join("\n").replace(/^---\s*$/m, "").trim();
        return { title, content, sortOrder: i };
      });

      // Delete existing sections and recreate
      for (const existing of sections) {
        await fetch(`/api/clients/${clientSlug}/brand-intel/${existing.id}`, { method: "DELETE" });
      }

      const newSections: Section[] = [];
      for (const section of parsed) {
        const res = await fetch(`/api/clients/${clientSlug}/brand-intel`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: section.title, content: section.content, sortOrder: section.sortOrder }),
        });
        if (res.ok) {
          newSections.push(await res.json());
        }
      }

      setSections(newSections);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.max(400, e.target.scrollHeight) + "px";
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Brand Intelligence Document</h3>
            <p className="text-xs text-muted-foreground">{sections.length} sections</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button onClick={handleCancel} disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted">
                <X className="h-3 w-3" /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90 disabled:opacity-50">
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                {saving ? "Saving..." : "Save"}
              </button>
            </>
          ) : (
            <button onClick={handleEdit} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted">
              <Pencil className="h-3 w-3" /> Edit
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {editing ? (
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={handleTextareaInput}
          placeholder={"## Core Identity & Mission\n\nDescribe the brand's core identity...\n\n---\n\n## Target Customer Profile\n\nDescribe the ideal customer..."}
          className="w-full min-h-[400px] rounded-xl border border-border bg-background p-5 text-sm font-mono leading-relaxed outline-none resize-none focus:border-foreground/20 transition-colors"
          spellCheck
        />
      ) : draft.trim() ? (
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-2 first:[&_h2]:mt-0">
            {draft}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 py-12 text-center">
          <Brain className="h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No brand intelligence yet.</p>
          <button onClick={handleEdit} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90">
            <Pencil className="h-3 w-3" /> Add Brand Intel
          </button>
        </div>
      )}
    </div>
  );
}
