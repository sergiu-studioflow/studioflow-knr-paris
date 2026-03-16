// Core types — matches the base schema (Better Auth + users + appConfig + brandIntelligence + activityLog)
// Client-specific types are added when new systems are migrated into the portal

export type User = {
  id: string;
  userId: string; // references Better Auth user.id (text)
  displayName: string;
  email: string;
  role: string; // admin, member, viewer
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AppConfig = {
  id: string;
  brandName: string;
  brandColor: string | null;
  logoUrl: string | null;
  portalTitle: string | null;
  features: Record<string, boolean>;
  workflows: Record<string, { webhook_path: string; n8n_base_url?: string }>;
};

export type BrandIntelligence = {
  id: string;
  title: string;
  rawContent: string | null;
  sections: Record<string, unknown> | null;
  airtableRecordId: string | null;
  updatedAt: Date;
  createdAt: Date;
};

// =============================================
// COMPETITOR ANALYSIS + BRIEF GENERATION SYSTEM
// =============================================

export type Brand = {
  id: string;
  brandName: string;
  brandCluster: string | null;
  vertical: string | null;
  language: string;
  isActive: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Competitor = {
  id: string;
  competitorName: string;
  brandId: string | null;
  brandName: string | null;
  metaSearchTerms: string | null;
  metaPageId: string | null;
  tiktokHandle: string | null;
  platforms: string;
  country: string;
  isActive: boolean;
  lastScraped: Date | null;
  notes: string | null;
  createdAt: Date;
};

export type CompetitorLookupRequest = {
  id: string;
  lookupMode: string;
  competitorId: string | null;
  competitorName: string | null;
  category: string | null;
  brandId: string | null;
  brandName: string | null;
  country: string;
  maxAds: number;
  status: string;
  resultReportId: string | null;
  createdAt: Date;
};

export type AnalyzedAd = {
  id: string;
  adTitle: string | null;
  competitorName: string | null;
  brandName: string | null;
  platform: string | null;
  lookupMode: string | null;
  category: string | null;
  mediaType: string | null;
  adCopy: string | null;
  mediaUrl: string | null;
  daysRunning: number | null;
  longevityScore: number | null;
  effectivenessScore: number | null;
  hookUsed: string | null;
  hookType: string | null;
  messagingAngle: string | null;
  visualStyle: string | null;
  psychologyTechniques: string | null;
  longevitySignals: string | null;
  targetAudience: string | null;
  funnelStage: string | null;
  contentFormat: string | null;
  fullAnalysis: string | null;
  differentiationOpportunities: string | null;
  replicableElements: string | null;
  winnerCluster: string | null;
  dateScraped: Date | null;
  week: string | null;
  createdAt: Date;
};

export type IntelligenceReport = {
  id: string;
  reportTitle: string | null;
  reportType: string;
  brandName: string | null;
  lookupMode: string | null;
  competitorName: string | null;
  category: string | null;
  week: string | null;
  executiveSummary: string | null;
  winningPatterns: string | null;
  emergingTrends: string | null;
  hookTrends: string | null;
  visualTrends: string | null;
  longevityWinners: string | null;
  competitorActivity: string | null;
  differentiationRecommendations: string | null;
  ideationSeeds: string | null;
  adsAnalyzedCount: number | null;
  status: string;
  createdAt: Date;
};

export type CreativeBrief = {
  id: string;
  briefTitle: string | null;
  brandName: string | null;
  status: string;
  hypothesis: string | null;
  targetAudience: string | null;
  mainHook: string | null;
  hookVariations: string | null;
  angle: string | null;
  visualDirection: string | null;
  copyDirection: string | null;
  format: string | null;
  platform: string | null;
  funnelStage: string | null;
  language: string;
  complianceNotes: string | null;
  inspiredBy: string | null;
  differentiation: string | null;
  createdAt: Date;
  updatedAt: Date;
};
