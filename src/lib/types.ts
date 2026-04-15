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
// MULTI-CLIENT (BRANDS/CLIENTS)
// =============================================

export type Brand = {
  id: string;
  brandName: string;
  clientSlug: string | null;
  brandCluster: string | null;
  vertical: string | null;
  language: string;
  website: string | null;
  category: string | null;
  primaryMarket: string | null;
  currency: string | null;
  logoUrl: string | null;
  brandColor: string | null;
  monthlyAdSpend: number | null;
  isActive: boolean;
  status: string;
  storagePrefix: string;
  settings: Record<string, unknown>;
  notes: string | null;
  provisionedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Client = Brand & { clientName: string; cluster?: string | null };

export type ClientBrandIntel = { id: string; clientId: string; title: string; content: string | null; sectionType: string | null; sortOrder: number; createdAt: Date; updatedAt: Date };
export type ClientProduct = { id: string; clientId: string; productName: string; category: string | null; keyBenefits: string | null; targetUseCase: string | null; isHeroProduct: boolean; price: string | null; productUrl: string | null; imageUrl: string | null; videoImageUrl: string | null; status: string; createdAt: Date; updatedAt: Date };
export type ClientUsp = { id: string; clientId: string; uspText: string; uspCategory: string | null; isPrimary: boolean; notes: string | null; createdAt: Date; updatedAt: Date };
export type ClientCompetitor = { id: string; clientId: string; competitorName: string; metaPageId: string | null; metaSearchTerms: string | null; tiktokHandle: string | null; instagramHandle: string | null; websiteUrl: string | null; competitorType: string | null; isActive: boolean; createdAt: Date; updatedAt: Date };
export type ClientCreativeDna = { id: string; clientId: string; attributeName: string; attributeType: string; allowedValues: string | null; defaultValue: string | null; isRequired: boolean; createdAt: Date; updatedAt: Date };
export type ClientResearchSource = { id: string; clientId: string; sourceType: string; identifier: string; isActive: boolean; lastScrapedAt: Date | null; createdAt: Date; updatedAt: Date };

