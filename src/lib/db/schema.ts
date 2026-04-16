import { pgTable, text, boolean, timestamp, uuid, jsonb, integer, uniqueIndex } from "drizzle-orm/pg-core";

// =============================================
// API KEYS (client-configurable, encrypted at rest)
// =============================================

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  keyName: text("key_name").notNull().unique(),
  encryptedValue: text("encrypted_value").notNull(),
  label: text("label").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  updatedBy: text("updated_by"),
});

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
// BRAND INTELLIGENCE (per-brand, multi-row)
// =============================================

export const brandIntelligence = pgTable("brand_intelligence", {
  id: uuid("id").primaryKey().defaultRandom(),
  brandId: uuid("brand_id").references(() => brands.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  type: text("type"), // Brand Identity, Products, Target Audience, Voice & Tone, Compliance, Visual Direction, Competitive Landscape
  rawContent: text("raw_content"),
  sections: jsonb("sections"),
  notionPageId: text("notion_page_id"),
  ownerName: text("owner_name"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================
// ACTIVITY LOG (generic — all portals)
// =============================================

export const activityLog = pgTable("activity_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  clientId: uuid("client_id"),
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
  clientSlug: text("slug").unique(),
  brandCluster: text("brand_cluster"),
  vertical: text("vertical"),
  language: text("language").notNull().default("fr"),
  website: text("website"),
  category: text("category"),
  primaryMarket: text("primary_market"),
  currency: text("currency"),
  logoUrl: text("logo_url"),
  brandColor: text("brand_color"),
  monthlyAdSpend: integer("monthly_ad_spend"),
  isActive: boolean("is_active").notNull().default(true),
  status: text("status").notNull().default("Active"),
  storagePrefix: text("storage_prefix").notNull().default(""),
  settings: jsonb("settings").notNull().default({}),
  notes: text("notes"),
  provisionedAt: timestamp("provisioned_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Alias: template code references schema.clients
export const clients = brands;

// =============================================
// MULTI-CLIENT MODULE SUB-RESOURCE TABLES
// =============================================

export const clientBrandIntelligence = pgTable("client_brand_intelligence", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content"),
  sectionType: text("section_type"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const clientProducts = pgTable("client_products", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
  productName: text("product_name").notNull(),
  category: text("category"),
  keyBenefits: text("key_benefits"),
  targetUseCase: text("target_use_case"),
  isHeroProduct: boolean("is_hero_product").notNull().default(false),
  price: text("price"),
  productUrl: text("product_url"),
  imageUrl: text("image_url"),
  videoImageUrl: text("video_image_url"),
  status: text("status").notNull().default("Active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const clientUsps = pgTable("client_usps", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
  uspText: text("usp_text").notNull(),
  uspCategory: text("usp_category"),
  isPrimary: boolean("is_primary").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const clientCreativeDna = pgTable("client_creative_dna", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
  attributeName: text("attribute_name").notNull(),
  attributeType: text("attribute_type").notNull(),
  allowedValues: text("allowed_values"),
  defaultValue: text("default_value"),
  isRequired: boolean("is_required").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const clientCompetitors = pgTable("client_competitors", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
  competitorName: text("competitor_name").notNull(),
  metaPageId: text("meta_page_id"),
  metaSearchTerms: text("meta_search_terms"),
  tiktokHandle: text("tiktok_handle"),
  instagramHandle: text("instagram_handle"),
  websiteUrl: text("website_url"),
  competitorType: text("competitor_type"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const clientResearchSources = pgTable("client_research_sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
  sourceType: text("source_type").notNull(),
  identifier: text("identifier").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  lastScrapedAt: timestamp("last_scraped_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================
// STATIC AD GENERATION SYSTEM
// =============================================

export const adStyles = pgTable("ad_styles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  masterPrompt: text("master_prompt").notNull(),
  referenceImageUrl: text("reference_image_url"),
  thumbnailUrl: text("thumbnail_url"),
  aspectRatio: text("aspect_ratio").notNull().default("1:1"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adStylePrompts = pgTable("ad_style_prompts", {
  id: uuid("id").primaryKey().defaultRandom(),
  adStyleId: uuid("ad_style_id").notNull().references(() => adStyles.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => clientProducts.id, { onDelete: "cascade" }),
  prompt: text("prompt").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const staticAdGenerations = pgTable("static_ad_generations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "set null" }),
  adStyleId: uuid("ad_style_id").references(() => adStyles.id),
  productId: uuid("product_id").references(() => clientProducts.id, { onDelete: "set null" }),
  styleName: text("style_name"),
  productName: text("product_name"),
  finalPrompt: text("final_prompt"),
  kieJobId: text("kie_job_id"),
  aspectRatio: text("aspect_ratio").notNull().default("1:1"),
  resolution: text("resolution").default("1K"),
  outputFormat: text("output_format").default("PNG"),
  imageUrl: text("image_url"),
  thumbnailUrl: text("thumbnail_url"),
  status: text("status").notNull().default("pending"),
  errorMessage: text("error_message"),
  mode: text("mode").notNull().default("custom"),
  referenceImageUrl: text("reference_image_url"),
  adCopy: text("ad_copy"),
  analysisJson: text("analysis_json"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const referenceAdLibrary = pgTable("reference_ad_library", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  industry: text("industry").notNull().default("beauty"),
  adType: text("ad_type"),
  brand: text("brand"),
  tags: text("tags"),
  airtableRecordId: text("airtable_record_id").unique(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const winnersLibrary = pgTable("winners_library", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  sourceGenerationId: uuid("source_generation_id"),
  productName: text("product_name"),
  tags: text("tags"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const clientStaticAdConfig = pgTable("client_static_ad_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").notNull().unique().references(() => clients.id, { onDelete: "cascade" }),
  agent1Prompt: text("agent1_prompt").notNull(),
  agent2Prompt: text("agent2_prompt").notNull(),
  brandLogoUrl: text("brand_logo_url"),
  allowedIndustries: text("allowed_industries").default("[]"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
