import { pgTable, text, boolean, timestamp, uuid, jsonb, integer } from "drizzle-orm/pg-core";

// =============================================
// BETTER AUTH TABLES (managed by better-auth — do not modify manually)
// =============================================

export const authUser = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const authSession = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => authUser.id, { onDelete: "cascade" }),
});

export const authAccount = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => authUser.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const authVerification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// =============================================
// USERS (portal profile — linked to Better Auth user)
// =============================================

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().unique().references(() => authUser.id, { onDelete: "cascade" }),
  displayName: text("display_name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("member"), // admin, member, viewer
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================
// APP CONFIGURATION (single row)
// =============================================

export const appConfig = pgTable("app_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  brandName: text("brand_name").notNull(),
  brandColor: text("brand_color").default("#b2ff00"),
  logoUrl: text("logo_url"),
  portalTitle: text("portal_title"),
  features: jsonb("features").notNull().default({}),
  workflows: jsonb("workflows").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================
// BRAND INTELLIGENCE (single row)
// =============================================

export const brandIntelligence = pgTable("brand_intelligence", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull().default("Brand Intelligence"),
  rawContent: text("raw_content"),
  sections: jsonb("sections"),
  airtableRecordId: text("airtable_record_id"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================
// ACTIVITY LOG (generic — all portals)
// =============================================

export const activityLog = pgTable("activity_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  action: text("action").notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId: uuid("resource_id"),
  details: jsonb("details"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================
// BRANDS (KNR's client brand portfolio)
// =============================================

export const brands = pgTable("brands", {
  id: uuid("id").primaryKey().defaultRandom(),
  brandName: text("brand_name").notNull(),
  brandCluster: text("brand_cluster"),
  vertical: text("vertical"),
  language: text("language").notNull().default("fr"),
  isActive: boolean("is_active").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================
// COMPETITORS (who to track per brand)
// =============================================

export const competitors = pgTable("competitors", {
  id: uuid("id").primaryKey().defaultRandom(),
  competitorName: text("competitor_name").notNull(),
  brandId: uuid("brand_id").references(() => brands.id, { onDelete: "set null" }),
  metaSearchTerms: text("meta_search_terms"),
  metaPageId: text("meta_page_id"),
  tiktokHandle: text("tiktok_handle"),
  platforms: text("platforms").notNull().default("Meta"),
  country: text("country").notNull().default("FR"),
  isActive: boolean("is_active").notNull().default(true),
  lastScraped: timestamp("last_scraped", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================
// SCRAPED ADS (raw Apify data with scoring)
// =============================================

export const scrapedAds = pgTable("scraped_ads", {
  id: uuid("id").primaryKey().defaultRandom(),
  adId: text("ad_id").notNull(),
  competitorId: uuid("competitor_id").references(() => competitors.id, { onDelete: "set null" }),
  competitorName: text("competitor_name"),
  brandId: uuid("brand_id").references(() => brands.id, { onDelete: "set null" }),
  platform: text("platform"),
  lookupMode: text("lookup_mode"),
  category: text("category"),
  mediaType: text("media_type"),
  adCopy: text("ad_copy"),
  mediaUrl: text("media_url"),
  landingPageUrl: text("landing_page_url"),
  daysRunning: integer("days_running"),
  variationCount: integer("variation_count"),
  longevityScore: integer("longevity_score"),
  qualifiesForAnalysis: boolean("qualifies_for_analysis").default(true),
  analysisStatus: text("analysis_status").notNull().default("Pending"),
  dateScraped: timestamp("date_scraped", { withTimezone: true }),
  week: text("week"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================
// ANALYZED ADS (AI-analyzed with structured intelligence)
// =============================================

export const analyzedAds = pgTable("analyzed_ads", {
  id: uuid("id").primaryKey().defaultRandom(),
  adTitle: text("ad_title"),
  scrapedAdId: uuid("scraped_ad_id").references(() => scrapedAds.id, { onDelete: "set null" }),
  competitorId: uuid("competitor_id").references(() => competitors.id, { onDelete: "set null" }),
  competitorName: text("competitor_name"),
  brandId: uuid("brand_id").references(() => brands.id, { onDelete: "set null" }),
  brandName: text("brand_name"),
  platform: text("platform"),
  lookupMode: text("lookup_mode"),
  category: text("category"),
  mediaType: text("media_type"),
  adCopy: text("ad_copy"),
  mediaUrl: text("media_url"),
  daysRunning: integer("days_running"),
  longevityScore: integer("longevity_score"),
  effectivenessScore: integer("effectiveness_score"),
  hookUsed: text("hook_used"),
  hookType: text("hook_type"),
  messagingAngle: text("messaging_angle"),
  visualStyle: text("visual_style"),
  psychologyTechniques: text("psychology_techniques"),
  longevitySignals: text("longevity_signals"),
  targetAudience: text("target_audience"),
  funnelStage: text("funnel_stage"),
  contentFormat: text("content_format"),
  fullAnalysis: text("full_analysis"),
  differentiationOpportunities: text("differentiation_opportunities"),
  replicableElements: text("replicable_elements"),
  winnerCluster: text("winner_cluster"),
  dateScraped: timestamp("date_scraped", { withTimezone: true }),
  week: text("week"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================
// INTELLIGENCE REPORTS (weekly synthesis)
// =============================================

export const intelligenceReports = pgTable("intelligence_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportTitle: text("report_title"),
  reportType: text("report_type").notNull().default("Weekly"),
  brandId: uuid("brand_id").references(() => brands.id, { onDelete: "set null" }),
  brandName: text("brand_name"),
  lookupMode: text("lookup_mode"),
  competitorName: text("competitor_name"),
  category: text("category"),
  week: text("week"),
  executiveSummary: text("executive_summary"),
  winningPatterns: text("winning_patterns"),
  emergingTrends: text("emerging_trends"),
  hookTrends: text("hook_trends"),
  visualTrends: text("visual_trends"),
  longevityWinners: text("longevity_winners"),
  competitorActivity: text("competitor_activity"),
  differentiationRecommendations: text("differentiation_recommendations"),
  ideationSeeds: text("ideation_seeds"),
  adsAnalyzedCount: integer("ads_analyzed_count"),
  status: text("status").notNull().default("Complete"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================
// COMPETITOR LOOKUP REQUESTS (on-demand lookups)
// =============================================

export const competitorLookupRequests = pgTable("competitor_lookup_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  lookupMode: text("lookup_mode").notNull().default("Competitor"),
  competitorId: uuid("competitor_id").references(() => competitors.id, { onDelete: "set null" }),
  category: text("category"),
  brandId: uuid("brand_id").references(() => brands.id, { onDelete: "set null" }),
  brandName: text("brand_name"),
  country: text("country").notNull().default("FR"),
  maxAds: integer("max_ads").notNull().default(30),
  status: text("status").notNull().default("New"),
  resultReportId: uuid("result_report_id").references(() => intelligenceReports.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================
// CREATIVE BRIEFS (AI-generated briefs from intelligence)
// =============================================

export const creativeBriefs = pgTable("creative_briefs", {
  id: uuid("id").primaryKey().defaultRandom(),
  briefTitle: text("brief_title"),
  brandId: uuid("brand_id").references(() => brands.id, { onDelete: "set null" }),
  brandName: text("brand_name"),
  reportId: uuid("report_id").references(() => intelligenceReports.id, { onDelete: "set null" }),
  status: text("status").notNull().default("Genere"),
  hypothesis: text("hypothesis"),
  targetAudience: text("target_audience"),
  mainHook: text("main_hook"),
  hookVariations: text("hook_variations"),
  angle: text("angle"),
  visualDirection: text("visual_direction"),
  copyDirection: text("copy_direction"),
  format: text("format"),
  platform: text("platform"),
  funnelStage: text("funnel_stage"),
  language: text("language").notNull().default("Francais"),
  complianceNotes: text("compliance_notes"),
  inspiredBy: text("inspired_by"),
  differentiation: text("differentiation"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
