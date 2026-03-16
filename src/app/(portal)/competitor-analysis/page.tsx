"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CompetitorsManager } from "@/components/competitor-analysis/competitors-manager";
import { LookupRequests } from "@/components/competitor-analysis/lookup-requests";
import { AnalyzedAdsTable } from "@/components/competitor-analysis/analyzed-ads-table";
import { ReportViewer } from "@/components/competitor-analysis/report-viewer";
import { BriefViewer } from "@/components/competitor-analysis/brief-viewer";

export default function CompetitorAnalysisPage() {
  const [activeTab, setActiveTab] = useState("lookups");

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Competitor Analysis
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Scrape Meta Ad Library &amp; TikTok, analyze proven winners with AI,
          generate intelligence reports and creative briefs for KNR brands.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="lookups">Lookups</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="analyzed-ads">Analyzed Ads</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="briefs">Briefs</TabsTrigger>
        </TabsList>

        <TabsContent value="lookups" className="mt-6">
          <LookupRequests />
        </TabsContent>

        <TabsContent value="competitors" className="mt-6">
          <CompetitorsManager />
        </TabsContent>

        <TabsContent value="analyzed-ads" className="mt-6">
          <AnalyzedAdsTable />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <ReportViewer />
        </TabsContent>

        <TabsContent value="briefs" className="mt-6">
          <BriefViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
}
