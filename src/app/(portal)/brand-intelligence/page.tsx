"use client";

import Image from "next/image";
import { Brain, Building2 } from "lucide-react";
import { ClientBrandIntelEditor } from "@/components/clients/client-brand-intel-editor";
import { ClientComplianceEditor } from "@/components/clients/client-compliance-editor";
import { ClientProductsTable } from "@/components/clients/client-products-table";
import { useClient } from "@/lib/client-context";

export default function BrandIntelligencePage() {
  const { isMultiClient, isAllClients, clientName, clientSlug } = useClient();

  // Multi-client mode with a client selected: show that client's full brand context
  if (isMultiClient && !isAllClients) {
    return (
      <div className="space-y-8">
        <section className="card-accent animate-fade-up relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/8 via-secondary/40 to-background p-5 shadow-card">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_85%_30%,hsla(37,34%,47%,0.10)_0%,transparent_70%)] pointer-events-none" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-card shadow-card ring-1 ring-primary/10">
              <Image
                src="/client-logo.png"
                alt="KNR Paris"
                width={36}
                height={36}
                priority
                className="h-9 w-9 rounded-sm"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.32em] text-primary/80">
                <Brain className="h-3 w-3" />
                {clientName} · Brand Context
              </p>
              <h1 className="mt-1 text-2xl tracking-tight text-foreground sm:text-3xl">
                <span className="font-display text-primary">Brand Intelligence</span>
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Source of truth for every AI system in this studio — {clientName}&apos;s voice,
                customer language, products, and compliance rules. Edit here once, every generation
                downstream picks it up.
              </p>
            </div>
          </div>
        </section>

        <ClientComplianceEditor clientSlug={clientSlug} />
        <ClientBrandIntelEditor clientSlug={clientSlug} />
        <ClientProductsTable clientSlug={clientSlug} />
      </div>
    );
  }

  // All Clients view — empty state pointing the user to pick a client
  return (
    <div className="space-y-8">
      <section className="card-accent animate-fade-up relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/8 via-secondary/40 to-background p-5 shadow-card">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_85%_30%,hsla(37,34%,47%,0.10)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-card shadow-card ring-1 ring-primary/10">
            <Image
              src="/client-logo.png"
              alt="KNR Paris"
              width={36}
              height={36}
              priority
              className="h-9 w-9 rounded-sm"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.32em] text-primary/80">
              <Brain className="h-3 w-3" />
              KNR Paris
            </p>
            <h1 className="mt-1 text-2xl tracking-tight text-foreground sm:text-3xl">
              <span className="font-display text-primary">Brand Intelligence</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Each client&apos;s brand voice, customer language, products, and compliance rules —
              the source of truth every AI system reads. Pick a client from the sidebar to view or
              edit theirs.
            </p>
          </div>
        </div>
      </section>

      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
        <Building2 className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <h2 className="mt-4 text-lg font-semibold text-foreground">Pick a client to view their brand intel</h2>
        <p className="mt-2 max-w-md mx-auto text-sm text-muted-foreground">
          Use the client switcher in the sidebar to select a brand. Each client&apos;s intelligence
          document, compliance rules, and products live here.
        </p>
      </div>
    </div>
  );
}
