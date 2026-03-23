import { BrandIntelPage } from "@/components/brand-intel/brand-intel-page";

export const dynamic = "force-dynamic";

export default function BrandIntelligencePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Brand Intelligence
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Brand knowledge base across all client brands. Synced from Notion.
        </p>
      </div>

      <BrandIntelPage />
    </div>
  );
}
