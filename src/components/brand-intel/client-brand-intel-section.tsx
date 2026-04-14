"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Pencil, Save, X, Loader2, ChevronRight } from "lucide-react";
import type { ClientBrandIntel } from "@/lib/types";

export function ClientBrandIntelSection({ clientSlug }: { clientSlug: string }) {
  const [sections, setSections] = useState<ClientBrandIntel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/clients/${clientSlug}/brand-intel`)
      .then((r) => r.json())
      .then(setSections)
      .finally(() => setLoading(false));
  }, [clientSlug]);

  async function handleSave(id: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${clientSlug}/brand-intel/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSections((prev) => prev.map((s) => (s.id === id ? updated : s)));
        setEditingId(null);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Brain className="h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            No brand intelligence sections found for this client.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => {
        const isEditing = editingId === section.id;

        return (
          <Card key={section.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 dark:bg-primary/10">
                  <Brain className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{section.title}</CardTitle>
                  {section.sectionType && (
                    <p className="text-xs text-muted-foreground">{section.sectionType}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(null)}
                      disabled={saving}
                    >
                      <X className="mr-1 h-3 w-3" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSave(section.id)}
                      disabled={saving}
                    >
                      {saving ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <Save className="mr-1 h-3 w-3" />
                      )}
                      Save
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDraft(section.content || "");
                      setEditingId(section.id);
                    }}
                  >
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {isEditing ? (
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write the content for this section..."
                  className="w-full min-h-[200px] rounded-lg border border-input bg-background p-4 text-sm leading-relaxed outline-none resize-y focus:border-foreground/20 transition-colors"
                  autoFocus
                />
              ) : section.content ? (
                <p className="text-sm leading-relaxed text-secondary-foreground whitespace-pre-wrap">
                  {section.content}
                </p>
              ) : (
                <p className="text-sm italic text-muted-foreground">
                  No content yet — click Edit to add.
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
