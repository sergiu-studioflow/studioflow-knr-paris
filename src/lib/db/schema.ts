import { pgTable, text, boolean, timestamp, uuid, jsonb, integer, uniqueIndex, numeric, date } from "drizzle-orm/pg-core";

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

// =============================================
// VIDEO GENERATION SYSTEM
// =============================================

export const characters = pgTable("characters", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description"),
  status: text("status").notNull().default("ready"),
  kieTaskId: text("kie_task_id"),
  sourceImageUrl: text("source_image_url"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const scenes = pgTable("scenes", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const videoGenerations = pgTable("video_generations", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "set null" }),
  userId: uuid("user_id").references(() => users.id),
  productId: uuid("product_id").references(() => clientProducts.id, { onDelete: "set null" }),
  productName: text("product_name"),
  videoType: text("video_type").notNull().default("ugc"),
  arollStyle: text("aroll_style"),
  hasCharacter: boolean("has_character").notNull().default(false),
  script: text("script"),
  duration: integer("duration").notNull().default(15),
  aspectRatio: text("aspect_ratio").notNull().default("9:16"),
  crafterPrompt: text("crafter_prompt"),
  studioFlowPrompt: text("studio_flow_prompt"),
  cleanedPrompt: text("cleaned_prompt"),
  finalPrompt: text("final_prompt"),
  voiceCleanedPrompt: text("voice_cleaned_prompt"),
  muapiRequestId: text("muapi_request_id"),
  videoUrl: text("video_url"),
  status: text("status").notNull().default("pending"),
  errorMessage: text("error_message"),
  currentStep: integer("current_step").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================
// COMPETITOR RESEARCH SYSTEM
// =============================================

export const competitorAds = pgTable("competitor_ads", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "cascade" }),
  adArchiveId: text("ad_archive_id").notNull(),
  adGroupId: text("ad_group_id").notNull(),
  collationId: text("collation_id"),
  competitorPageId: text("competitor_page_id").notNull(),
  brandPageName: text("brand_page_name").notNull(),
  snapshotId: text("snapshot_id").notNull(),
  snapshotLabel: text("snapshot_label").notNull(),
  snapshotDate: date("snapshot_date").notNull(),
  adStartDate: date("ad_start_date").notNull(),
  metaSortRank: integer("meta_sort_rank").notNull().default(0),
  mediaType: text("media_type").notNull(),
  isDco: boolean("is_dco").notNull().default(false),
  primaryThumbnail: text("primary_thumbnail"),
  fullMediaAsset: text("full_media_asset"),
  displayPrimaryText: text("display_primary_text"),
  headlineTitle: text("headline_title"),
  ctaButtonType: text("cta_button_type"),
  destinationUrl: text("destination_url"),
  displayDomain: text("display_domain"),
  adLibraryUrl: text("ad_library_url"),
  publisherPlatforms: text("publisher_platforms").array(),
  platformsDisplay: text("platforms_display"),
  dedupCount: integer("dedup_count").notNull().default(1),
  creativeAngle: text("creative_angle"),
  adDescription: text("ad_description"),
  targetPersona: text("target_persona"),
  coreMotivation: text("core_motivation"),
  proofMechanism: text("proof_mechanism"),
  visualHook: text("visual_hook"),
  spokenHook: text("spoken_hook"),
  outroOffer: text("outro_offer"),
  fullTranscript: text("full_transcript"),
  aiAnalysisStatus: text("ai_analysis_status").notNull(),
  aiErrorMessage: text("ai_error_message"),
  aiLastAnalyzedAt: timestamp("ai_last_analyzed_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const organicProfiles = pgTable("organic_profiles", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  clientId: uuid("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(),
  customLabel: text("custom_label").notNull(),
  profileUrl: text("profile_url").notNull(),
  platformUserId: text("platform_user_id"),
  username: text("username"),
  displayName: text("display_name"),
  bio: text("bio"),
  bioLink: text("bio_link"),
  avatarUrl: text("avatar_url"),
  isVerified: boolean("is_verified"),
  followerCount: integer("follower_count"),
  totalPosts: integer("total_posts"),
  trackingStatus: text("tracking_status").notNull().default("Not Initialized"),
  lastScrapedAt: timestamp("last_scraped_at", { withTimezone: true }),
  profileUpdatedAt: timestamp("profile_updated_at", { withTimezone: true }),
  newestPostDate: timestamp("newest_post_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const organicPosts = pgTable("organic_posts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(),
  postId: text("post_id").notNull(),
  profileRef: integer("profile_ref").references(() => organicProfiles.id),
  username: text("username").notNull(),
  postUrl: text("post_url").notNull(),
  publishDate: timestamp("publish_date", { withTimezone: true }).notNull(),
  contentType: text("content_type").notNull(),
  caption: text("caption"),
  coverUrl: text("cover_url").notNull(),
  videoUrl: text("video_url"),
  videoDuration: numeric("video_duration"),
  slideImages: text("slide_images"),
  slideCount: integer("slide_count").notNull().default(0),
  hashtags: text("hashtags"),
  musicName: text("music_name"),
  musicAuthor: text("music_author"),
  musicIsOriginal: boolean("music_is_original"),
  likes: integer("likes").notNull().default(0),
  comments: integer("comments").notNull().default(0),
  views: integer("views").notNull().default(0),
  shares: integer("shares"),
  saves: integer("saves"),
  contentAngle: text("content_angle"),
  contentMechanic: text("content_mechanic"),
  targetViewer: text("target_viewer"),
  valueProp: text("value_prop"),
  openingHook: text("opening_hook"),
  visualHook: text("visual_hook"),
  contentStructure: text("content_structure"),
  retentionDriver: text("retention_driver"),
  outroCta: text("outro_cta"),
  fullTranscript: text("full_transcript"),
  aiAnalysisStatus: text("ai_analysis_status").notNull(),
  aiErrorMessage: text("ai_error_message"),
  aiLastAnalyzedAt: timestamp("ai_last_analyzed_at", { withTimezone: true }),
  ingestedAt: timestamp("ingested_at", { withTimezone: true }).notNull().defaultNow(),
});

export const researchBriefs = pgTable("research_briefs", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "set null" }),
  userId: uuid("user_id").references(() => users.id),
  sourceType: text("source_type").notNull(),
  sourceId: integer("source_id").notNull(),
  sourceSnapshot: jsonb("source_snapshot"),
  title: text("title").notNull(),
  mediaType: text("media_type").notNull(),
  creativeFormat: text("creative_format"),
  funnelStage: text("funnel_stage"),
  strategicHypothesis: text("strategic_hypothesis"),
  psychologyAngle: text("psychology_angle"),
  primaryHook: text("primary_hook"),
  hookVariations: jsonb("hook_variations"),
  visualDirection: text("visual_direction"),
  shotList: jsonb("shot_list"),
  visualComposition: jsonb("visual_composition"),
  cardDirections: jsonb("card_directions"),
  onScreenText: jsonb("on_screen_text"),
  audioDirection: text("audio_direction"),
  brandVoiceLock: text("brand_voice_lock"),
  complianceRequirements: jsonb("compliance_requirements"),
  targetPersona: text("target_persona"),
  lockedElements: jsonb("locked_elements"),
  variableElements: jsonb("variable_elements"),
  fullBrief: jsonb("full_brief").notNull(),
  status: text("status").notNull().default("pending"),
  errorMessage: text("error_message"),
  aiModel: text("ai_model"),
  generationDurationMs: integer("generation_duration_ms"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
