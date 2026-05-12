"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Pencil,
  Save,
  X,
  Loader2,
  ChevronRight,
  Eye,
  Code2,
  BookOpen,
  Clock,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Section = {
  id: string;
  title: string;
  content: string | null;
  sectionType: string | null;
  sortOrder: number;
};

/**
 * Promote bare section-title lines to ## headings so a flat doc reads as structured prose.
 * The very first qualifying line gets `# `; subsequent qualifying lines get `## `.
 */
function preprocessBrandIntel(text: string): string {
  if (!text) return "";
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  const isTitleLine = (raw: string, prevBlank: boolean, nextBlank: boolean): boolean => {
    const line = raw.trim();
    if (line.length === 0 || line.length > 80) return false;
    if (!prevBlank || !nextBlank) return false;
    if (/^[#\-*>]/.test(line) || /^```/.test(line) || /^\d+\.\s/.test(line)) return false;
    if (/[.!?:,;]$/.test(line)) return false;
    const words = line.split(/\s+/);
    if (words.length < 2 || words.length > 10) return false;
    if (!/[A-Z]/.test(line)) return false;
    return true;
  };

  let firstHeadingApplied = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const prevBlank = i === 0 || lines[i - 1].trim() === "";
    const nextBlank = i === lines.length - 1 || lines[i + 1].trim() === "";
    if (isTitleLine(line, prevBlank, nextBlank)) {
      const prefix = firstHeadingApplied ? "## " : "# ";
      firstHeadingApplied = true;
      out.push(prefix + line.trim());
    } else {
      out.push(line);
    }
  }
  return out.join("\n");
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function extractToc(processed: string): Array<{ id: string; text: string; level: 1 | 2 | 3 }> {
  const headings: Array<{ id: string; text: string; level: 1 | 2 | 3 }> = [];
  const seen = new Set<string>();
  for (const line of processed.split("\n")) {
    const m = line.match(/^(#{1,3})\s+(.+)/);
    if (!m) continue;
    const level = m[1].length as 1 | 2 | 3;
    const text = m[2].trim();
    let id = slugify(text);
    let n = 2;
    while (seen.has(id)) id = `${slugify(text)}-${n++}`;
    seen.add(id);
    headings.push({ id, text, level });
  }
  return headings;
}

function readingStats(text: string): { words: number; minutes: number } {
  const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 220));
  return { words, minutes };
}

function joinSections(sections: Section[]): string {
  return sections
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((s) => `## ${s.title}\n\n${s.content || ""}`)
    .join("\n\n---\n\n");
}

export function ClientBrandIntelEditor({ clientSlug }: { clientSlug: string }) {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editPreview, setEditPreview] = useState<"split" | "edit" | "preview">("split");
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const proseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/clients/${clientSlug}/brand-intel`)
      .then((r) => r.json())
      .then((data) => {
        const list: Section[] = Array.isArray(data) ? data : [];
        setSections(list);
        setDraft(joinSections(list));
      })
      .catch(() => setError("Failed to load brand intel"))
      .finally(() => setLoading(false));
  }, [clientSlug]);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editing]);

  const sourceContent = editing ? draft : joinSections(sections);
  const processed = useMemo(() => preprocessBrandIntel(sourceContent), [sourceContent]);
  const toc = useMemo(() => extractToc(processed), [processed]);
  const stats = useMemo(() => readingStats(sourceContent), [sourceContent]);
  const lastUpdated = useMemo(() => {
    if (sections.length === 0) return null;
    return sections
      .map((s) => ((s as unknown as { updatedAt?: string }).updatedAt) || null)
      .filter(Boolean)
      .sort()
      .pop() ?? null;
  }, [sections]);

  const handleEdit = () => {
    setDraft(joinSections(sections));
    setEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setDraft(joinSections(sections));
    setEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // Parse the draft back into sections by splitting on `## ` headings.
      const rawSections = draft.split(/(?=^## )/m).filter((s) => s.trim());
      const parsed = rawSections.map((raw, i) => {
        const lines = raw.trim().split("\n");
        const title = lines[0].replace(/^##\s*/, "").trim();
        const content = lines
          .slice(1)
          .join("\n")
          .replace(/^---\s*$/m, "")
          .trim();
        return { title, content, sortOrder: i };
      });

      // Replace existing sections with the new parse.
      for (const existing of sections) {
        await fetch(`/api/clients/${clientSlug}/brand-intel/${existing.id}`, { method: "DELETE" });
      }
      const newSections: Section[] = [];
      for (const section of parsed) {
        const res = await fetch(`/api/clients/${clientSlug}/brand-intel`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(section),
        });
        if (res.ok) newSections.push(await res.json());
      }
      setSections(newSections);
      setDraft(joinSections(newSections));
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // Scroll-spy for the TOC: track which heading is currently in view.
  const installScrollSpy = useCallback(() => {
    if (!proseRef.current) return;
    const headings = proseRef.current.querySelectorAll("h1[id], h2[id], h3[id]");
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveHeadingId(visible[0].target.id);
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (editing) return;
    const cleanup = installScrollSpy();
    return cleanup;
  }, [editing, processed, installScrollSpy]);

  const hasContent = sections.length > 0 && joinSections(sections).trim().length > 0;

  return (
    <Card className="border-border/70">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/12 ring-1 ring-primary/20">
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-base font-semibold tracking-tight">
              Brand Intelligence Document
            </CardTitle>
            {!editing && (
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                {lastUpdated && (
                  <span>Last updated {new Date(lastUpdated).toLocaleDateString()}</span>
                )}
                {hasContent && (
                  <>
                    <span className="inline-flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {stats.words.toLocaleString()} words
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {stats.minutes} min read
                    </span>
                    {toc.length > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {toc.length} section{toc.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </>
                )}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {editing ? (
            <>
              <div className="hidden md:flex items-center rounded-md border border-border bg-card p-0.5 mr-1">
                <button
                  onClick={() => setEditPreview("edit")}
                  className={cn(
                    "rounded px-2.5 py-1 text-xs font-medium transition-all",
                    editPreview === "edit"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent/40",
                  )}
                >
                  <Code2 className="inline h-3 w-3 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => setEditPreview("split")}
                  className={cn(
                    "rounded px-2.5 py-1 text-xs font-medium transition-all",
                    editPreview === "split"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent/40",
                  )}
                >
                  Split
                </button>
                <button
                  onClick={() => setEditPreview("preview")}
                  className={cn(
                    "rounded px-2.5 py-1 text-xs font-medium transition-all",
                    editPreview === "preview"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent/40",
                  )}
                >
                  <Eye className="inline h-3 w-3 mr-1" />
                  Preview
                </button>
              </div>
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
                {saving ? "Saving…" : "Save"}
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Pencil className="mr-1 h-3.5 w-3.5" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>

      {error && (
        <div className="mx-6 mb-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {error}
        </div>
      )}

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : editing ? (
          <EditView
            draft={draft}
            onChange={setDraft}
            processed={processed}
            mode={editPreview}
            textareaRef={textareaRef}
          />
        ) : hasContent ? (
          <ReadView processed={processed} toc={toc} activeHeadingId={activeHeadingId} proseRef={proseRef} />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Brain className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">
              No brand intelligence document yet.
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={handleEdit}>
              <Pencil className="mr-1 h-3.5 w-3.5" />
              Add Brand Intel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Reading view ─── */

function ReadView({
  processed,
  toc,
  activeHeadingId,
  proseRef,
}: {
  processed: string;
  toc: Array<{ id: string; text: string; level: 1 | 2 | 3 }>;
  activeHeadingId: string | null;
  proseRef: React.RefObject<HTMLDivElement | null>;
}) {
  const showToc = toc.filter((h) => h.level === 2).length >= 3;

  return (
    <div className={cn("relative grid gap-8", showToc ? "lg:grid-cols-[1fr_220px]" : "grid-cols-1")}>
      <article
        ref={proseRef}
        className={cn(
          "max-w-3xl",
          // Base prose
          "prose prose-base dark:prose-invert max-w-none",
          // Headings — DM Sans ultra-thin, primary-coloured, tight tracking (KNR editorial look)
          "prose-headings:font-display prose-headings:font-normal prose-headings:text-primary prose-headings:tracking-tight",
          // h1
          "prose-h1:text-5xl prose-h1:mt-0 prose-h1:mb-2 prose-h1:pb-3 prose-h1:border-b prose-h1:border-primary/15",
          // h2
          "prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-3 prose-h2:scroll-mt-24",
          // h3
          "prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-2 prose-h3:scroll-mt-24",
          // Paragraphs
          "prose-p:text-foreground/85 prose-p:leading-[1.8] prose-p:my-4",
          // First paragraph drop cap — DM Sans ultra-thin, primary-coloured
          "[&>p:first-of-type]:first-letter:font-display [&>p:first-of-type]:first-letter:text-primary [&>p:first-of-type]:first-letter:text-7xl [&>p:first-of-type]:first-letter:leading-[0.85] [&>p:first-of-type]:first-letter:float-left [&>p:first-of-type]:first-letter:mr-3 [&>p:first-of-type]:first-letter:mt-2",
          // Strong / em
          "prose-strong:text-foreground prose-strong:font-semibold",
          "prose-em:text-foreground/90",
          // Lists
          "prose-ul:my-4 prose-ol:my-4 prose-li:my-1.5 prose-li:text-foreground/85 prose-li:leading-relaxed",
          "prose-li:marker:text-primary",
          // Blockquote — gold left border + warm tint
          "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-secondary/40 prose-blockquote:rounded-r-md prose-blockquote:px-4 prose-blockquote:py-1 prose-blockquote:not-italic prose-blockquote:text-foreground/85",
          // Code
          "prose-code:bg-muted prose-code:text-foreground prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[0.9em] prose-code:font-medium prose-code:before:hidden prose-code:after:hidden",
          // Links
          "prose-a:text-primary prose-a:underline-offset-4 hover:prose-a:text-accent",
          // hr — thin gold rule, KNR editorial divider
          "prose-hr:my-12 prose-hr:border-primary/20",
        )}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children, ...props }) => {
              const id = slugify(String(children));
              return (
                <h1 id={id} {...props}>
                  {children}
                </h1>
              );
            },
            h2: ({ children, ...props }) => {
              const id = slugify(String(children));
              return (
                <h2 id={id} {...props}>
                  {children}
                </h2>
              );
            },
            h3: ({ children, ...props }) => {
              const id = slugify(String(children));
              return (
                <h3 id={id} {...props}>
                  {children}
                </h3>
              );
            },
          }}
        >
          {processed}
        </ReactMarkdown>
      </article>

      {showToc && (
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
              On this page
            </p>
            <nav className="flex flex-col gap-1">
              {toc
                .filter((h) => h.level <= 3)
                .map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document
                        .getElementById(h.id)
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                      history.replaceState(null, "", `#${h.id}`);
                    }}
                    className={cn(
                      "block rounded-md px-2.5 py-1.5 text-xs leading-snug transition-all",
                      h.level === 3 && "pl-6",
                      activeHeadingId === h.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
                    )}
                  >
                    {h.text}
                  </a>
                ))}
            </nav>
          </div>
        </aside>
      )}
    </div>
  );
}

/* ─── Edit view ─── */

function EditView({
  draft,
  onChange,
  processed,
  mode,
  textareaRef,
}: {
  draft: string;
  onChange: (s: string) => void;
  processed: string;
  mode: "split" | "edit" | "preview";
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const showEdit = mode === "edit" || mode === "split";
  const showPreview = mode === "preview" || mode === "split";

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
        <span className="font-semibold text-foreground/80">Markdown tips:</span>{" "}
        <code className="font-mono">## Section title</code> ·{" "}
        <code className="font-mono">**bold**</code> ·{" "}
        <code className="font-mono">*italic*</code> ·{" "}
        <code className="font-mono">- list item</code> ·{" "}
        <code className="font-mono">{`> quote`}</code> · sections separated by{" "}
        <code className="font-mono">---</code>. Bare title-lines auto-promote to{" "}
        <code className="font-mono">##</code> in the preview.
      </div>
      <div className={cn("grid gap-3", mode === "split" ? "lg:grid-cols-2" : "grid-cols-1")}>
        {showEdit && (
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => onChange(e.target.value)}
            placeholder="## Voice & Tone&#10;&#10;Describe the brand's core voice…&#10;&#10;---&#10;&#10;## Target Customer&#10;&#10;…"
            className="min-h-[600px] w-full rounded-md border border-input bg-background p-4 text-[13px] font-mono leading-[1.7] outline-none resize-y focus:border-primary/40 focus:ring-2 focus:ring-primary/15 placeholder:text-muted-foreground transition-all"
            spellCheck
          />
        )}
        {showPreview && (
          <div className="min-h-[600px] overflow-auto rounded-md border border-border bg-card p-5 text-sm">
            {processed.trim() ? (
              <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-normal prose-headings:text-primary prose-headings:tracking-tight prose-h1:text-3xl prose-h2:text-xl prose-h2:mt-6 prose-h3:text-base prose-p:text-foreground/85 prose-p:leading-relaxed prose-strong:text-foreground prose-li:marker:text-primary prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-secondary/40 prose-blockquote:rounded-r prose-blockquote:not-italic">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{processed}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm italic text-muted-foreground">
                Preview will render here as you type.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
