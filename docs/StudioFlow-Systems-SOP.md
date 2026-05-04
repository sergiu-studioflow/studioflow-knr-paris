# StudioFlow Creative Portal — Systems Operating Manual

**For: KNR Paris Creative Team**
**Portal URL:** https://studioflow-knr-paris.vercel.app
**Last Updated:** April 2026
**Systems Covered:** Competitor Research, Static Ad System, Video Generation

---

## Table of Contents

1. [Portal Overview](#1-portal-overview)
2. [Getting Started](#2-getting-started)
3. [System 1: Competitor Research](#3-competitor-research)
4. [System 2: Static Ad System](#4-static-ad-system)
5. [System 3: Video Generation](#5-video-generation)
6. [Cross-System Features](#6-cross-system-features)
7. [Tips & Best Practices](#7-tips--best-practices)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Portal Overview

The StudioFlow Creative Portal is your AI-powered creative production hub. It gives you three integrated systems that work together to research competitor advertising, generate static ad creatives, and produce AI-generated video content — all tailored to each of your brands.

### Your Brands

The portal manages 5 brands. Each brand has its own isolated workspace — competitors, ads, videos, and creative assets are completely separate between brands:

| Brand | Category |
|-------|----------|
| Balcon avec Vue | Alpine Illustration Studio |
| DoamaBijoux | Artisan Sculpture Jewellery |
| Eco-Sense | Ecological Consumer Products |
| Modalova | Parisian Fashion Aggregator |
| TAION | Japanese Technical Outerwear |

### Navigation

The left sidebar shows all available systems. When you select a brand using the **Client Switcher** (dropdown below the logos), the sidebar updates to show systems available for that brand, and all data throughout the portal filters to that brand automatically.

**Sidebar items:**
- **Dashboard** — Overview of all systems with quick-access cards
- **Brand Intelligence** — Brand knowledge base and positioning documents
- **Static Ad System** — AI-powered static ad generation
- **Video Generation** — UGC, B-Roll, and A-Roll video creation
- **Competitor Research** — Track and analyze competitor ads across platforms
- **Research Briefs** — AI-generated creative briefs from research insights
- **Settings** — API keys, account settings

---

## 2. Getting Started

### Logging In

1. Go to https://studioflow-knr-paris.vercel.app
2. Enter your email address
3. Click "Send Magic Link"
4. Check your email for the login link from noreply@portal.studio-flow.co
5. Click the link — you'll be logged in automatically

### Switching Between Brands

1. In the left sidebar, look for the **Client Switcher** dropdown just below the StudioFlow and KNR logos
2. Click it to see all 5 brands
3. Select the brand you want to work with
4. Everything in the portal updates to show that brand's data

**Important:** When you switch brands, all systems reload with that brand's specific:
- Products
- Competitors
- Generated ads and videos
- Characters and scenes
- Saved winners
- Research briefs

---

## 3. Competitor Research

The Competitor Research system lets you track and analyze competitor advertising across three platforms: **Meta Ads**, **TikTok**, and **Instagram**. An AI analyzes every scraped ad to extract creative angles, hooks, copy strategies, and performance signals.

### 3.1 Accessing Competitor Research

Click **Competitor Research** in the sidebar. You'll see three platform tabs at the top:
- **Meta Ads** (target icon)
- **TikTok** (music icon)
- **Instagram** (camera icon)

Each platform tab has two sub-tabs:
- **Library** — View and analyze scraped content
- **Competitors** — Manage which competitors or profiles you're tracking

---

### 3.2 Meta Ads

#### Adding a Competitor

1. Go to **Meta Ads** > **Competitors** sub-tab
2. Click the **"+ Add Competitor"** button
3. Fill in:
   - **Competitor Name** — e.g., "Nike France"
   - **Meta Ad Library Link** — paste the full URL from Facebook's Ad Library (e.g., `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=FR&view_all_page_id=123456789&search_type=page&media_type=all`). The system will automatically extract the Page ID from this URL. You can also paste just the raw Page ID.
   - **Country** — select from the dropdown. Choose "ALL" to see ads running in all countries, or pick a specific country (e.g., "FR" for France, "US" for United States)
4. Click **Save**

The competitor now appears as a card showing:
- Name and Active/Inactive status
- Meta Page ID
- Direct link to their Ad Library page

#### Finding the Meta Ad Library Link

1. Go to https://www.facebook.com/ads/library/
2. Search for the competitor's brand or page name
3. Click on their page in the results
4. Copy the URL from your browser's address bar — this is the link you paste into the portal

#### Triggering a Scrape

1. Go to **Meta Ads** > **Library** sub-tab
2. Select a competitor from the dropdown at the top
3. Click the **"Refresh"** button
4. The system will show "Scraping in progress..." — this typically takes 1-3 minutes
5. The page polls automatically every 10 seconds to check for new results
6. When complete, you'll see a "Scrape complete!" message and the ads will appear in the gallery

**What gets scraped:**
- All active ads from the competitor's Meta Ad Library page
- Filtered to the country you selected when adding the competitor
- Last 90 days of ad activity
- Up to 20 ads per scrape

#### Viewing and Analyzing Ads

Once ads appear in the Library, you can:

**Filter ads:**
- **Search bar** — Search across ad copy, headlines, creative angles, and descriptions
- **Media type chips** — Filter by Video, Image, Carousel, or Text-only ads. Each chip shows a count.
- **Sort dropdown:**
  - **Meta Default** — Original order from Meta's Ad Library
  - **Newest First** — Most recently launched ads first
  - **Longest Running** — Ads that have been active the longest (often indicates best performers)

**Browse snapshots:**
- Each scrape creates a "snapshot" — a timestamped collection of ads
- Use the **Snapshot dropdown** to compare how a competitor's ad library changed over time

**View ad details:**
Click any ad card to open the **Full-View Modal**, which shows:

**Left side — Media:**
- Full-size image or video player
- For carousels: navigation arrows and dot indicators to browse each card ("Card 1 of 5")
- If media is unavailable, a link to view it on the original platform

**Right side — AI Analysis:**
- **Creative Angle** — What strategy the ad uses (e.g., "Social proof testimonial", "Problem-solution", "Fear of missing out")
- **Ad Description** — AI-generated summary of what the ad communicates
- **Target Audience** — Who the ad is aimed at
- **Core Motivation** — The psychological driver being leveraged
- **Proof Mechanism** — How the ad establishes credibility
- **Visual Hook** — What catches the eye in the first frame
- **Spoken Hook** — Opening line of video ads
- **Outro/Offer** — How the ad closes and what CTA it uses
- **Full Transcript** — For video ads, the complete spoken text (expandable section)
- **Metadata** — Headline, CTA button text, landing page domain, platforms (Facebook/Instagram), DCO flag

**Actions from the modal:**
- **"Save to Winners"** — Saves the ad image to your Winners Library for use as a reference in the Static Ad System
- **"Generate Brief"** — Creates an AI-powered creative brief based on this ad (see Section 6.1)

---

### 3.3 TikTok

#### Adding a TikTok Profile

1. Go to **TikTok** > **Competitors** sub-tab
2. Click **"+ Add Profile"**
3. Fill in:
   - **Custom Label** — A name for your reference (e.g., "Nike TikTok France")
   - **Profile URL** — The TikTok profile URL (e.g., `https://www.tiktok.com/@nike`)
4. Click **Save**

#### Initializing a Profile

After adding a profile, it shows status **"Not Initialized"**. You need to initialize it to start scraping:

1. Click the **"Initialize"** button on the profile card
2. Select how many posts to scrape: **50**, **100**, or **200**
3. Click to confirm
4. Status changes to **"Processing"** — the system scrapes the profile and analyzes each post with AI
5. This process takes 3-10 minutes depending on post count
6. The page polls every 10 seconds and updates the status automatically
7. When complete, status changes to **"Active"**

#### Viewing TikTok Posts

1. Go to **TikTok** > **Library** sub-tab
2. Select a profile from the dropdown
3. Browse the post gallery

Each post card shows:
- Video thumbnail with duration badge
- View count, like count, comment count
- Content type badge (Video, Carousel)

**Filter and sort options:**
- **Search bar** — Search across captions, hashtags, content angles, and mechanics
- **Content type chips** — Filter by Video or Carousel (with counts)
- **Sort dropdown:** Newest First, Most Views, Most Likes

**Click any post** to open the Full-View Modal:
- Video player (left side)
- AI analysis (right side):
  - **Content Angle** — The strategic approach (e.g., "Tutorial", "Transformation", "Behind-the-scenes")
  - **Content Mechanic** — How the content is structured
  - **Target Viewer** — Who this content resonates with
  - **Value Proposition** — What the viewer gets from watching
  - **Opening Hook** — The first 3 seconds that stop the scroll
  - **Visual Hook** — What's visually compelling
  - **Content Structure** — How the narrative flows
  - **Retention Driver** — What keeps viewers watching to the end
  - **Outro CTA** — How the video closes
  - **Full Transcript** — Complete spoken text
  - **Engagement metrics** — Views, likes, comments, shares, saves
  - **Music info** — Song name, artist, whether it's original audio

**Actions:**
- **"Generate Brief"** — Creates an AI creative brief from this post

#### Managing Profile Status

Each profile card shows status and controls:
- **Active** (green) — Currently tracking, updated daily
- **Paused** (gray) — Temporarily stopped tracking. Click the toggle to resume.
- **Error** (red) — Something went wrong. Click "Retry" to re-initialize.
- **Processing** (spinner) — Currently scraping. Wait for completion.

**Delete a profile:** Click the trash icon on any profile card. This removes the profile AND all its tracked posts.

---

### 3.4 Instagram

Instagram works identically to TikTok:
- Add profiles via the **Competitors** sub-tab
- Initialize with 50/100/200 post options
- View and analyze posts in the **Library** sub-tab
- Same AI analysis fields (content angle, hooks, structure, etc.)
- Same filter, search, and sort options

The only difference is the platform-specific data (Instagram post types include Reels, Carousels, and single Images).

---

## 4. Static Ad System

The Static Ad System generates high-quality static ad creatives using a 3-agent AI pipeline. You provide a product and a reference ad, and the system creates a new ad in your brand's visual style.

### 4.1 Accessing the Static Ad System

Click **Static Ad System** in the sidebar. You'll see four tabs:
- **Create** — Generate new ads
- **Edit** — Modify text on generated ads
- **Gallery** — View all your generated ads
- **Winners** — Your library of winning reference ads

---

### 4.2 Create Tab — Generating a New Ad

This is where you generate new static ads. Follow these steps:

#### Step 1: Select a Product

Click the **Product dropdown** and choose the product you want to feature in the ad. The dropdown shows all products for the currently selected brand, with thumbnails where available.

#### Step 2: Choose a Reference Ad

The reference ad tells the AI what visual style and layout to use. You have three ways to provide one:

**Auto Mode (recommended for beginners):**
- The system automatically selects a high-performing reference from the shared library
- Click **"Select Reference"** to browse the library and pick a different one
- The Inspo Gallery shows references filtered by your brand's relevant industries

**Upload Mode:**
- Click the upload area to pick an image from your computer
- Use this when you have a specific competitor ad or design you want to replicate
- Any image works — the AI will analyze its layout, colors, typography, and composition

**Winners Mode:**
- Click **"Browse Winners"** to select from your saved Winners Library
- These are ads you've previously saved from the Competitor Research system or from your own generated gallery

#### Step 3: Write Your Ad Copy

Type your ad copy in the text area. This is what the ad will SAY — the headline, body text, tagline, etc.

**Tips for great copy:**
- Keep it concise — the AI adapts your message to fit the reference ad's typographic structure
- Include your key message and any specific text you want visible
- If you leave it blank, the AI will generate copy automatically based on your brand DNA
- The copy will be rendered in your brand's visual style (colors, fonts, tone)

#### Step 4: Choose Aspect Ratio

Select the aspect ratio for your ad:
- **1:1** — Square (Instagram feed, Facebook feed)
- **4:5** — Vertical (Instagram feed, recommended for engagement)
- **9:16** — Story/Reel (Instagram Stories, TikTok, Facebook Stories)
- **16:9** — Landscape (YouTube, Facebook video)

#### Step 5: Generate

Click the **"Generate"** button. The system runs a 4-step AI pipeline:

1. **Analyzing reference ad** (~12 seconds) — Agent 1 (Claude Vision) studies every detail of your reference: layout, colors, typography, product placement, lighting, mood
2. **Crafting generation prompt** (~16 seconds) — Agent 2 (Claude) writes a detailed image generation prompt that transplants your brand's DNA into the reference's visual framework
3. **Submitting to image engine** (~2 seconds) — The prompt is sent to Kie AI NanoBanana 2 with the reference image and product image attached
4. **Generating your ad** (~60-120 seconds) — Kie AI renders the final image

You'll see a progress bar with each step updating in real-time. Total generation time is typically 1.5-3 minutes.

#### After Generation

When your ad is ready:
- The generated image appears in a preview
- **"Edit"** — Opens the ad in the Edit tab to modify text elements
- **"Save to Winners"** — Adds this ad to your Winners Library for future reference
- **"Generate Again"** — Resets the form so you can create another ad

If generation fails, you'll see an error message with details. Click **"Generate Again"** to retry.

---

### 4.3 Edit Tab — Modifying Text on Ads

The Edit tab lets you change text on any generated ad without regenerating the entire image.

#### How to Edit

1. Select a **generated ad** from the dropdown (only completed ads appear)
2. The system **extracts text elements** from the image using Claude Vision — this takes a few seconds
3. You'll see the ad image with **text bubbles** overlaid on each detected text element
4. Click any text bubble to **edit its content** — type your new text
5. Click **"Apply"** to regenerate the ad with your text changes

The edit pipeline runs 3 steps:
1. **Generating edit command** — Agent 3 maps your changes to the image
2. **Processing image** — The changes are compiled
3. **Rendering final ad** — Kie AI produces the updated image

#### Tips for Editing

- You can change any text: headlines, subheads, taglines, price copy, CTAs
- The AI preserves the exact position, size, weight, and color of each text element
- Only the TEXT changes — the background, product, and layout stay identical
- After editing, you can save to Winners or edit again

---

### 4.4 Gallery Tab — Viewing Your Ads

The Gallery shows all ads you've generated for the selected brand.

**Filtering:**
- **All** — Show everything
- **Completed** — Only finished ads ready to download
- **Generating** — Ads currently being created (auto-refreshes every 5 seconds)
- **Error** — Failed generations

**Each ad card shows:**
- Thumbnail preview
- Product name
- Status badge (Completed/Generating/Error)
- Creation date

**Click any ad** to open its detail view:
- Full-size image
- Download button (saves as PNG)
- Delete button (with confirmation)

---

### 4.5 Winners Tab — Your Reference Library

The Winners Library is your curated collection of winning ad references. These can be used as references when creating new ads.

**How ads get into Winners:**
1. **From Competitor Research** — Click "Save to Winners" on any competitor ad in the Full-View Modal
2. **From the Gallery** — Save your own generated ads that performed well
3. **Manual upload** — Click the upload button to add any image file

**Each winner card shows:**
- Image thumbnail
- Name
- Product tag (if applicable)
- Delete button (hover to reveal)

---

## 5. Video Generation

The Video Generation system creates AI-powered video content in three formats: UGC (user-generated content), B-Roll (cinematic product footage), and A-Roll (interview and presenter styles).

### 5.1 Accessing Video Generation

Click **Video Generation** in the sidebar. You'll see four tabs:
- **Create** — Generate new videos
- **Gallery** — View all generated videos
- **Characters** — Manage AI talent/presenters
- **Scenes** — Manage virtual backgrounds

---

### 5.2 Create Tab — Generating a New Video

#### Step 1: Choose Video Type

Select one of three main types by clicking its card:

**UGC (User-Generated Content)**
- Creator-style ads featuring a virtual presenter holding or showing your product
- Best for: Social media ads, testimonial-style content, "real person" feel
- Requires: A character and a scene

**B-Roll (Product Hero)**
- Cinematic product footage with dramatic lighting and camera movements
- Best for: Premium brand content, product launches, hero sequences
- No character needed — purely product-focused

**A-Roll (Interview & Presenter)**
- If you select A-Roll, choose a sub-style:
  - **Street Interview** — Two-subject viral street clip format
  - **Talking Head** — Direct-to-camera presenter
  - **Podcast** — Studio podcast clip format
  - **Green Screen** — Presenter with virtual background

#### Step 2: Select a Product

Choose the product to feature from the dropdown. The product's image is used by the AI to ensure visual accuracy.

#### Step 3: Select Character and Scene (for UGC and A-Roll)

**Character:** Choose a virtual presenter from your Characters Library. Each character has a consistent appearance that the AI maintains across videos.

**Scene:** Choose a background environment from your Scenes Library. Scenes provide the setting for the video.

For **B-Roll**, you don't need to select these — the AI generates the environment based on the product.

#### Step 4: Write Your Script

Type or paste the script for the video. This is what the presenter will say (for UGC/A-Roll) or the narrative that guides the visual sequence (for B-Roll).

**Script tips:**
- Keep it concise — 5-second videos need ~15 words, 15-second videos need ~45 words
- For UGC: Write naturally, as if a real person is speaking
- For B-Roll: Describe the visual story you want (the AI interprets this as camera movements and product action)
- For A-Roll: Write the interview question and answer, or the presenter's monologue

#### Step 5: Choose Duration

Click one of the duration buttons:
- **5 seconds** — Quick hook or teaser
- **10 seconds** — Standard social ad length
- **15 seconds** — Extended format for more story

#### Step 6: Choose Aspect Ratio

- **9:16** (portrait) — Instagram Stories/Reels, TikTok
- **16:9** (landscape) — YouTube, Facebook video

#### Step 7: Generate

Click **"Generate"** to start the 5-6 step AI pipeline:

1. **Analyzing product brief** — Claude studies your product and script
2. **Generating video concept** — GPT-4 creates the scene-by-scene video plan
3. **Rendering scenes** — Claude refines the visual direction
4. **Synthesizing voiceover** — AI voice generation (if applicable)
5. **Compositing final video** — Kie AI Seedance 2 renders the video
6. **Optimizing for delivery** — Final output processing

Total generation time varies by duration: ~2-5 minutes for 5s, ~3-7 minutes for 15s.

#### After Generation

- Video preview appears with playback controls
- **"View in Gallery"** — Navigate to the Gallery to see all your videos
- **"Generate Another"** — Reset the form for a new video

---

### 5.3 Gallery Tab — Viewing Your Videos

The Gallery shows all videos generated for the selected brand.

**Each video card shows:**
- Video thumbnail with play button overlay
- Product name
- Duration badge (5s/10s/15s)
- Aspect ratio indicator
- Video type label (UGC/BROLL/AROLL)
- Script snippet (first 2 lines)

**Click any video** to play it inline. Click again or click outside to stop.

The gallery auto-refreshes when you come back from the Create tab with a new generation.

---

### 5.4 Characters Tab — Managing AI Talent

Characters are the virtual presenters that appear in your UGC and A-Roll videos. Each brand has its own character library.

**Pre-loaded characters:** Josh, Lia, Marie, Mike — 4 diverse presenters ready to use.

#### Creating a New Character

1. Click the **"+"** button
2. Upload a reference image of the person you want as a character (a clear face photo works best)
3. Enter a name for the character
4. Optionally add a description
5. Click **Generate**

The AI analyzes the likeness and creates a consistent character that can be used across multiple video generations. Generation takes about 30-60 seconds.

#### Managing Characters

- Each character card shows their avatar, name, and status
- **Ready** (green) — Available for use in videos
- **Generating** (spinner) — AI is still processing
- **Error** (red) — Generation failed
- Click the **trash icon** to delete a character (with confirmation)

---

### 5.5 Scenes Tab — Managing Backgrounds

Scenes are the virtual environments and backgrounds used in videos.

**Pre-loaded scenes:** 5 studio backgrounds ready to use.

#### Adding a New Scene

1. Click the **"+"** button
2. Upload a background image
3. Enter a name for the scene
4. Optionally add a description
5. Click **Upload**

The image is stored and immediately available for use in the Create tab.

#### Managing Scenes

- Each scene card shows the background image and name
- Click the **trash icon** to delete (with confirmation)

---

## 6. Cross-System Features

### 6.1 AI Brief Generation

You can generate an AI-powered creative brief from any competitor ad or organic post. The brief includes:

- **Strategic Hypothesis** — Why this creative approach works
- **Psychology Angle** — The emotional/psychological lever being pulled
- **Primary Hook** — The opening hook recommendation
- **Hook Variations** — Alternative hooks to test
- **Visual Direction** — Art direction guidance
- **Shot List** (for video) — Scene-by-scene breakdown
- **Card Directions** (for carousels) — Per-slide creative direction
- **On-Screen Text** — Recommended text overlays with timing
- **Audio Direction** — Music/voiceover recommendations
- **Brand Voice Lock** — How to maintain your brand voice
- **Compliance Notes** — Regulatory considerations
- **Target Persona** — Detailed audience profile

**How to generate a brief:**
1. Open any ad or post in its Full-View Modal
2. Click **"Generate Brief"**
3. The button changes to "Generating..." (takes ~2-3 minutes — Claude Opus analyzes the content against your brand intelligence)
4. When complete, the button becomes **"View Brief"** (green)
5. Click to see the full brief on the Research Briefs page

**The brief uses your brand intelligence** — the AI reads your brand's positioning, tone of voice, target audience, and compliance rules to generate briefs that are specifically tailored to your brand, not generic.

### 6.2 Save to Winners

The Winners Library bridges Competitor Research and the Static Ad System:

1. **Save competitor ads** as winners from the Competitor Research Full-View Modal
2. **Use winners as references** in the Static Ad System Create tab (Winners mode)
3. **Save your own generated ads** as winners from the Static Ad System Gallery

This creates a feedback loop: research competitors → save the best → use them as creative references → generate your own versions → save the best performers → repeat.

### 6.3 Products Across Systems

Products are shared across all three systems. When you add or update products in the **Brand Intelligence > Products** section (or the client detail page), they immediately appear in:

- **Static Ad System** Create tab — Product dropdown
- **Video Generation** Create tab — Product dropdown
- **9:16 Conversion** — Products with standard images can be bulk-converted to 9:16 portrait format for video use

---

## 7. Tips & Best Practices

### Competitor Research

- **Add 3-5 competitors per brand** for comprehensive coverage
- **Use country "ALL"** to see the broadest ad library, then narrow to specific countries for regional insights
- **Sort by "Longest Running"** to find proven winners — ads running for 30+ days are likely performing well
- **Generate briefs** on the best ads — these become your creative playbook
- **Initialize TikTok/Instagram with 100-200 posts** for meaningful data — 50 is too sparse for trend analysis
- **Refresh Meta scrapes weekly** to track new ad launches and pauses

### Static Ad System

- **Start with Auto reference mode** to see what the AI library recommends
- **Upload competitor ads** as references for the most targeted results
- **Write clear, concise copy** — the AI adapts it to the visual structure, so shorter copy works better in formats with large headlines
- **Generate 3-5 variations** per concept — batch production helps find winners faster
- **Use the Edit tab** to iterate on text without regenerating the entire image
- **Save winners immediately** — build your reference library continuously

### Video Generation

- **Use 9:16 portrait** for social media (TikTok, Instagram Reels, Stories)
- **Use 16:9 landscape** for YouTube or website hero videos
- **Start with 5-second videos** to test concepts quickly before investing in longer formats
- **UGC format works best** for direct response and social ads
- **B-Roll is ideal** for premium brand content and product hero sequences
- **Create multiple characters** to test different presenter demographics
- **Upload brand-specific scenes** for consistent backgrounds across campaigns

---

## 8. Troubleshooting

### Common Issues

**"No products available" in Create tabs**
- Make sure the selected brand has products. Go to the client's detail page and check the Products tab.

**"Failed to trigger scrape" in Competitor Research**
- The scraping service may be temporarily unavailable. Wait 2-3 minutes and try again.
- If the issue persists, contact the StudioFlow team.

**Static ad generation stuck on "Generating..."**
- Generation typically takes 1.5-3 minutes. If it's been longer than 5 minutes, refresh the page and check the Gallery tab — the ad may have completed.

**Video generation fails at a step**
- Check that the selected product has an image. Products without images cannot be used for video generation.
- Try a shorter duration (5s) as a test.
- If the error persists, try a different character or scene.

**Competitor ads not appearing after scrape**
- Make sure you triggered the refresh from the Library sub-tab (not the Competitors sub-tab)
- Wait at least 2-3 minutes and check again
- Try refreshing the page manually

**Brief stuck at "Generating..."**
- Briefs use Claude Opus which can take 2-3 minutes
- If still generating after 5 minutes, the brief may have encountered an error
- Generate a new brief from the same source

**Switching brands doesn't update data**
- Give it a moment — data loads asynchronously when you switch
- If data seems stale, refresh the browser page

### Getting Help

For technical issues or feature requests, contact the StudioFlow team at your usual communication channel. Include:
- Which brand was selected
- Which system you were using
- What action you took
- Any error messages shown
