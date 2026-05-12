"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert, Pencil, Save, X, ChevronRight } from "lucide-react";

export function ClientComplianceEditor({ clientSlug }: { clientSlug: string }) {
  const [rules, setRules] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/clients/${clientSlug}/compliance-rules`)
      .then((r) => r.json())
      .then((data) => {
        const value = typeof data?.complianceRules === "string" ? data.complianceRules : "";
        setRules(value);
        setDraft(value);
      })
      .finally(() => setLoading(false));
  }, [clientSlug]);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.max(280, textareaRef.current.scrollHeight) + "px";
    }
  }, [editing]);

  const handleEdit = () => {
    setEditing(true);
    setCollapsed(false);
  };

  const handleCancel = () => {
    setDraft(rules);
    setEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${clientSlug}/compliance-rules`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complianceRules: draft }),
      });
      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      const value = typeof data?.complianceRules === "string" ? data.complianceRules : "";
      setRules(value);
      setDraft(value);
      setEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save compliance rules. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const hasRules = rules.trim().length > 0;

  return (
    <Card className="border-amber-200/60 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-900/60">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-base font-semibold tracking-tight">
              Compliance Rules
            </CardTitle>
            <p className="mt-0.5 text-xs leading-relaxed text-amber-900/70 dark:text-amber-200/70">
              Non-negotiables every AI generator must honour for this client — claims, language,
              regulated terms, banned imagery. Edits here flow into every brief downstream.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!editing ? (
            <>
              {hasRules && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCollapsed((c) => !c)}
                  className="text-amber-900 hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-950/60"
                >
                  <ChevronRight
                    className={`h-3.5 w-3.5 transition-transform ${collapsed ? "" : "rotate-90"}`}
                  />
                  {collapsed ? "Show" : "Hide"}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="text-amber-900 hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-950/60"
              >
                <Pencil className="h-3.5 w-3.5" />
                {hasRules ? "Edit" : "Add rules"}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={saving}
                className="text-amber-900 hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-950/60"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="bg-amber-600 text-white hover:bg-amber-700"
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save
              </Button>
            </>
          )}
        </div>
      </CardHeader>

      {(!collapsed || editing || !hasRules) && (
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-amber-900/70 dark:text-amber-200/70">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : editing ? (
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="One rule per line. Markdown lists and headings supported."
              className="block w-full resize-none rounded-md border border-amber-300/70 bg-white px-3 py-2.5 font-mono text-[13px] leading-relaxed text-foreground shadow-xs focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-50"
            />
          ) : hasRules ? (
            <div className="prose prose-sm prose-amber max-w-none dark:prose-invert prose-headings:text-amber-900 dark:prose-headings:text-amber-200 prose-li:my-1">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{rules}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-amber-900/70 dark:text-amber-200/70">
              No compliance rules yet. Click <strong>Add rules</strong> to give downstream AI
              generators a non-negotiable guardrail for this client.
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}
