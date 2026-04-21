"""
prompts.py — Play Store Screenshot Asset Generation Prompts

Generates professional, visually attractive Play Store assets with:
- Bold, styled headlines
- Smartphone mockup with realistic app UI (portrait)
- Text-focused catchy banners with emoji (landscape)

Prompt design principle: Keep prompts concise and focused on WHAT to show,
not micro-managing every pixel. AI image models perform best with clear,
high-level creative direction rather than exhaustive pixel specifications.
"""

# ─────────────────────────────────────────────
# EMOJI INJECTION CONSTANTS
# ─────────────────────────────────────────────

EMOJI_INCLUDE = (
    "VISUAL ACCENT: You MUST add 2-3 large, photorealistic 3D-rendered emoji that relate to the feature. "
    "Place them floating dynamically in the composition (e.g. top-right or near the phone). "
    "Make them prominent and expressive — they should 'pop' and add visual richness to the banner."
)

EMOJI_EXCLUDE = (
    "Do NOT include any emoji or decorative icons. Keep the design clean — text and phone mockup only."
)

# ─────────────────────────────────────────────
# BACKGROUND CONSISTENCY CONSTANTS
# ─────────────────────────────────────────────

BACKGROUND_CONSISTENT = (
    "STRICT BACKGROUND REQUIREMENT: The ENTIRE background area of the canvas must be filled with a solid or gradient "
    "using the {color_theme} exclusively. Do NOT use white or split backgrounds. Every pixel of the background should "
    "be branded with {color_theme}."
)

BACKGROUND_VARIED = (
    "You have creative freedom for the background: you may use either a full {color_theme} background, "
    "or a modern split layout with part white and part {color_theme} for visual variety."
)

# ─────────────────────────────────────────────
# HEADLINE GENERATION PROMPT
# ─────────────────────────────────────────────

GENERATE_HEADLINE_PROMPT = """You are a Play Store marketing copywriter specializing in app screenshot headlines.

Given the app details and feature below, generate ONE compelling headline for a single screenshot asset.

CRITICAL RULES:
- Do NOT invent a different feature — use exactly what the user provided
- Do NOT write subtext, subheader, or any secondary text — headline ONLY
- Do NOT output JSON or any code formatting
- Do NOT include any introductory phrases like "Here is", "Your headline is:", or "Headline: "
- Output the headline text and NOTHING else. Just the characters of the headline.

App Name: {app_name}
App Category: {app_category}
Target Audience: {target_audience}
Brand Style: {brand_style}

Feature to Highlight (use this exactly): {feature_concept}

HEADLINE RULES:
1. Length: 2–7 words maximum (shorter is better)
2. Style: Bold, punchy, immediate value communication. Examples:
   - "Bring your vibe to chats"
   - "Hang out anytime, anywhere"
   - "Get instant AI answers"
   - "Come together with your community"
   - "Connect with your people"
3. Tone: Must match Brand Style: {brand_style}
4. No secondary text, no colon, no periods, no explanations
5. Must directly relate to: {feature_concept}

Output ONLY the headline text — no quotes, no extra formatting, no explanation.
"""

# ─────────────────────────────────────────────
# HERO HEADLINE GENERATION PROMPT (First Asset)
# ─────────────────────────────────────────────

GENERATE_HERO_HEADLINE_PROMPT = """You are a Play Store marketing copywriter specializing in app screenshot headlines.

This is for the main HERO screenshot of the app (the very first asset users see). Instead of focusing on one specific feature, generate ONE compelling, brand-level headline that hooks the user immediately and represents the app's core value proposition.

CRITICAL RULES:
- Do NOT write subtext, subheader, or any secondary text — headline ONLY
- Do NOT output JSON or any code formatting
- Output the headline text and NOTHING else

App Name: {app_name}
App Category: {app_category}
Target Audience: {target_audience}
Brand Style: {brand_style}
Initial Request/Context: {feature_concept}

HEADLINE RULES:
1. Length: 2–6 words maximum (shorter is better)
2. Style: Bold, punchy, immediate value communication. Usually the primary tagline of the app.
3. Tone: Must match Brand Style: {brand_style}
4. No secondary text, no colon, no periods, no explanations

Output ONLY the headline text — no quotes, no extra formatting, no explanation.
"""

GENERATE_FEATURE_LIST_PROMPT = """You are an expert App Store Optimization (ASO) specialist and copywriter.
Your goal is to transform a raw app description into high-converting marketing feature headlines.

Given the app details and description below, extract 5 to 8 unique core features.

STYLE RULES:
- Use strong, active verbs (e.g., "Master", "Sync", "Analyze", "Boost").
- Focus on the USER BENEFIT, not just technical specs (e.g., instead of "Has a calendar", use "Seamlessly plan your productivity").
- Keep each feature between 3 and 7 words.
- Be punchy, modern, and professional.
- No periods at the end of features.

EXAMPLES:
- Good: "Real-time AI health tracking", "Seamless cloud data sync", "Pro-grade retouching tools"
- Bad: "App has health features", "Can sync to cloud", "Edit your photos"

CRITICAL OUTPUT RULE:
- Return ONLY a JSON array of strings.
- Example: ["Feature One", "Feature Two", "Feature Three", "Feature Four", "Feature Five"]

App Name: {app_name}
Category: {app_category}
Target Audience: {target_audience}
Brand Style: {brand_style}

App Description:
{app_description}
"""

# ─────────────────────────────────────────────
# IMAGE GENERATION — PORTRAIT (Phone Mockup)
# ─────────────────────────────────────────────

IMAGE_GENERATION_BLANK_PROMPT_V3 = """Create a premium Google Play Store screenshot marketing asset for the app "{app_name}".

THE APP: "{app_name}" — a {app_category} app.
THE FEATURE TO SHOWCASE: "{feature}"

CANVAS: {width}x{height} pixels (portrait orientation).

LAYOUT INSTRUCTIONS (Top to Bottom):
1. Upper Section (top 25-30% of the canvas):
   - Background: {color_theme} color theme, vibrant and saturated.
   - Display this exact text: {headline}
   - CRITICAL: Do NOT write words like "HEADLINE BANNER" or "PHONE MOCKUP" anywhere in the image.
   - DO NOT add any extra words, labels, introductions, font names, or quotes. Only the exact words above.
   - The text must be massive, bold, and dominant — but it MUST be fully contained within the canvas.
   - ENSURE there is generous padding (at least 60px) between the text and all edges of the image.
   - DO NOT cut off any letters or words. If the headline is long, use multiple lines within the upper section.
   - Color: Use white (#FFFFFF) if {color_theme} is dark/vibrant. Use black (#1A1A1A) if {color_theme} is light/white.
   - Left-aligned with generous padding.
   - If the following line is not empty, display it directly below the headline in a smaller, lighter weight: {subtext}
   - The smaller text must use the same color as the headline.
2. {include_emoji}
3. Lower Section (bottom 65-70% of the canvas):

DEVICE PRESENTATION (VERY IMPORTANT — follow this exactly):
{mockup_style}

{target_os} SCREEN UI REQUIREMENTS (if a phone is required by the style above):
- Design a realistic, production-quality mobile app screen for a {app_category} app perfectly fitted to a {target_os} phone.
- IMPORTANT: The physical {target_os} device MUST be clearly identifiable. 
  - For iOS: Use the latest iPhone style with the Dynamic Island and rounded screen corners.
  - For Android: Use a modern flagship style with a small centered punch-hole camera and slim symmetric bezels.
- The screen UI MUST explicitly demonstrate the functionality described in: {headline}
- Include a status bar (time, battery, signal icons) at the top in the exact style of {target_os}.
- Use real, meaningful content — NO placeholder text, NO lorem ipsum
- Create dynamic visual depth: pop key feature elements out of the screen (3D floating UI cards, overlapping layers, elements bursting out of phone bezel)
- Use {color_theme} as the accent color for buttons, highlights, and active states
- The UI should look like a real shipping app, not a wireframe

FEATURE HIGHLIGHT (subtle but clear):
- Visually highlight the showcased feature inside the mockup using:
  - Soft glow or outline around the feature area
  - Small callout or popup card pointing to it
  - Subtle UI indicator that draws attention
- The highlight must feel natural and integrated, NOT like a red circle annotation

OVERALL STYLE:
- {background_instruction}
- Canvas size: {width}x{height} pixels (portrait)
- Quality level: indistinguishable from Messenger, Spotify, Notion, or Duolingo Play Store screenshots
- Premium, clean, eye-catching — the kind of image that stops users scrolling
- Each screenshot in a set must feel visually unique but consistent as a collection

DO NOT INCLUDE: watermarks, download buttons, star ratings, app store badges, URLs, font names as visible text, or any text other than the headline and optional line below it.
"""


# ─────────────────────────────────────────────
# MOCKUP STYLE VARIATIONS — injected per asset
# ─────────────────────────────────────────────

MOCKUP_STYLES = [
    # Style 0: Hero Banner (No phone, just floating typography and UI)
    """- PURE HERO BANNER LAYOUT: Do NOT draw a full phone mockup.
- Instead, place the app's UI elements (cards, buttons, widgets) floating dynamically in 3D space around the typography.
- This asset is the billboard hero Hook.
- Make it immersive and highly premium, relying on large icons and floating UI components rather than a restricted phone screen.""",

    # Style 1: Slight tilt left
    """- {target_os} phone tilted slightly to the LEFT (about 10-15 degrees)
- Phone placed center-right of the composition
- Soft shadow falling to the right
- Bottom of phone bleeds off the bottom edge of the canvas
- Add subtle floating UI elements on the left side for visual balance""",

    # Style 1: Slight tilt right
    """- Phone tilted slightly to the RIGHT (about 10-15 degrees)
- Phone placed center-left of the composition
- Soft shadow falling to the left
- Bottom of phone bleeds off the bottom edge
- Add 1-2 small floating notification cards beside the phone""",

    # Style 2: Straight zoomed-in / cropped
    """- Phone perfectly STRAIGHT and vertically centered
- ZOOMED IN — phone is larger than usual, edges partially cropped off left and right sides
- This creates an immersive, close-up view of the app UI
- Bottom of phone bleeds off bottom edge
- Focus entirely on the screen content""",

    # Style 3: Bottom-up angle (emerging from bottom)
    """- Phone EMERGING from the bottom of the canvas at a slight upward angle
- Only the top 60-70% of the phone is visible
- Creates a dramatic reveal effect
- Phone is centered horizontally
- Add soft depth-of-field blur at the very bottom edge""",

    # Style 4: Side-cropped (half visible)
    """- Phone placed on the RIGHT side, partially CROPPED — only 60-70% of the phone is visible
- The left portion of the phone extends off the right edge
- This creates an asymmetric, modern editorial layout
- Leaves generous space on the left for the headline to breathe
- Bottom bleeds off canvas""",

    # Style 5: Split layout (text side + phone side)
    """- Clean SPLIT LAYOUT composition
- LEFT 40% of canvas: headline text area (already handled above)
- RIGHT 60%: Phone mockup, straight or with very slight tilt
- Phone should be large and prominent on the right half
- Bottom of phone bleeds off bottom edge
- Creates a balanced, professional billboard-style layout""",

    # Style 6: Overlapping layered phones
    """- TWO phone mockups slightly OVERLAPPING each other
- Front phone shows the main feature screen prominently
- Back phone (slightly behind and offset) shows a secondary related screen
- Both phones have a slight tilt in opposite directions (creates depth)
- Bottom of phones bleed off bottom edge
- This creates a dynamic, feature-rich visual""",

    # Style 7: Floating with shadow
    """- Phone appears to be FLOATING in mid-air with a prominent drop shadow below
- Phone is perfectly straight, centered
- Large soft shadow on the background creates depth
- Add subtle light reflection/gloss on the phone screen
- Bottom of phone does NOT bleed off — instead floats above bottom with shadow
- Clean, Apple-style product photography feel""",
]


# ─────────────────────────────────────────────
# IMAGE GENERATION — LANDSCAPE (Text + Emoji Banner)
# ─────────────────────────────────────────────

IMAGE_GENERATION_LANDSCAPE_PROMPT = """Create a stunning, premium Google Play Store feature graphic / landscape marketing banner for "{app_name}".

THE APP: "{app_name}" — a {app_category} app.
THE FEATURE TO SHOWCASE: "{feature}"

CANVAS: {width}x{height} pixels (landscape orientation).

LAYOUT COMPOSITION:
1. Left Block (60% of canvas) — Marketing text area:
   - Display this exact text as the headline: {headline}
   - CRITICAL: Do NOT write words like "LEFT BLOCK", "RIGHT SIDE", or "PHONE MOCKUP" anywhere in the image.
   - DO NOT add any extra words, labels, introductions, font names, or quotes. Only the exact words above.
   - The headline must be massive, bold, and dominant, yet FULLY VISIBLE and NOT clipped by any edges.
   - Keep it within the left 60% block with comfortable padding from the top and left edges.
   - If the following line is not empty, display it directly below the headline in a smaller, lighter weight: {subtext}
   - Color: Use white (#FFFFFF) if {color_theme} is dark/vibrant. Use black (#1A1A1A) if {color_theme} is light/white.
   - Left-aligned with generous padding.
2. Right Block (40% of canvas) — Device area:
   - Place ONE perfectly vertical (PORTRAIT orientation) {target_os} smartphone mockup.
   - The phone screen must show a premium {app_category} UI that demonstrates: {headline}
   - Pop key elements out of the screen for 3D depth (floating cards, icons).
   - Bottom of the phone bleeds off the bottom edge.
3. BACKGROUND: {background_instruction}

VISUAL ELEMENTS & EMOJI:
- {include_emoji}
- If including emoji, ensure they are LARGE, photorealistic, and contextually relevant to "{feature}".
- Scatter them dynamically around the layout.

QUALITY:
- Billboard-style hero graphic, indistinguishable from Spotify, Duolingo, or Instagram feature graphics.
- Saturated, premium, clean.

DO NOT INCLUDE: landscape-oriented phones, wireframes, watermarks, download buttons, store badges, font names as visible text, or any text other than the headline and optional line below it.
"""

# ─────────────────────────────────────────────
# IMAGE ENHANCEMENT — PORTRAIT (Screenshot Provided)
# ─────────────────────────────────────────────

IMAGE_ENHANCE_PROMPT_V3 = """Create a premium Google Play Store screenshot marketing asset for "{app_name}", using the provided screenshot as a design reference.

THE APP: "{app_name}" — a {app_category} app.
THE FEATURE TO SHOWCASE: "{feature}"

CANVAS: {width}x{height} pixels.

IMPORTANT — SCREENSHOT USAGE:
- Do NOT copy/paste the screenshot directly. Study its color palette, layout structure, UI patterns, and visual style.
- Reimagine and recreate the UI as a significantly more polished, premium version inside the phone mockup.
- Preserve the app's real design language and colors, but elevate spacing, typography, and visual hierarchy.

LAYOUT INSTRUCTIONS (Top to Bottom):
1. Upper Section (top 25-30%):
   - Background: {color_theme} color theme, vibrant and saturated.
   - Display this exact text: {headline}
   - CRITICAL: Do NOT write words like "HEADLINE BANNER" or "PHONE MOCKUP" anywhere in the image.
   - DO NOT add any extra words, labels, introductions, font names, or quotes. Only the exact words above.
   - The text must be massive, bold, and dominant.
   - Color: Use white (#FFFFFF) if {color_theme} is dark/vibrant. Use black (#1A1A1A) if {color_theme} is light/white.
   - If the following line is not empty, display it directly below the headline in a smaller, lighter weight: {subtext}
   - The smaller text must use the same color as the headline.
2. {include_emoji}
3. Lower Section (bottom 65-70%):

DEVICE PRESENTATION (VERY IMPORTANT — follow this exactly):
{mockup_style}

PHONE SCREEN UI:
- Based on the uploaded screenshot's design language but elevated to premium quality.
- IMPORTANT: The physical {target_os} device MUST be clearly identifiable. 
  - For iOS: Use the latest iPhone style with the Dynamic Island and rounded screen corners.
  - For Android: Use a modern flagship style with a small centered punch-hole camera and slim symmetric bezels.
- The screen must explicitly demonstrate: {headline}
- Create dynamic visual depth by popping key feature elements out of the screen (3D floating UI cards, overlapping layers, elements bursting out of the phone bezel)
- Include status bar (time, battery, signal icons) in the exact style of {target_os}.
- All content must be realistic — NO placeholder text
- Use {color_theme} as accent color
- The screen must look like a real, polished, shipping app

OVERALL STYLE:
- {background_instruction}
- Premium quality matching top Play Store apps
- Clean, eye-catching, scroll-stopping

DO NOT INCLUDE: watermarks, download buttons, star ratings, app store badges, URLs, font names as visible text, or any text other than the headline and optional line below it.
"""

# ─────────────────────────────────────────────
# AD VISUAL GENERATOR PROMPTS
# ─────────────────────────────────────────────

GENERATE_ADS_PROMPT = """Create high-converting mobile app ad creatives inspired by real-world Meta (Facebook/Instagram) app campaigns.

App Name: {app_name}
Target Audience: {target_audience}
Features:
{features_list}

Existing Screenshot Assets (Context):
{asset_headlines_and_features}

{existing_ad_hooks}

OBJECTIVE:
Generate scroll-stopping ad concepts that make users pause, feel curious, and click to explore the app.

IMPORTANT AD PRINCIPLES:
- Focus on user psychology (pain, desire, curiosity, transformation)
- Ads should feel like premium startup campaigns
- Avoid generic or robotic language

AD REQUIREMENTS:

- Generate exactly {num_ads} UNIQUE ad creatives.
- Each ad must follow a DIFFERENT angle such as:
  - Problem → Solution
  - Curiosity Hook
  - Feature Highlight
  - Before vs After
  - Emotional Trigger
  - Productivity / Time-saving
  - Social Proof style (without fake claims)

Each ad must include:

- hook: Scroll-stopping line (max 6 words)
- headline: Clear value proposition (max 8 words)
- primary_text: Persuasive supporting copy (15–25 words)
- cta: Short action phrase (2–3 words, e.g., "Try Now", "Get Started")

STRICT RULES:

- DO NOT include phrases like:
  "Download Now", "Install Now", "Explore Now"
- CTA should feel natural and soft (platform handles actual button)
- Keep language simple, human, and benefit-focused
- Avoid buzzwords like "best app", "ultimate", "revolutionary"
- Each ad must feel different in tone and angle
- Do NOT repeat ideas or structure

OUTPUT FORMAT:

CRITICAL: Output MUST be a valid JSON array of exactly {num_ads} objects.

DO NOT use markdown or backticks.
Return ONLY raw JSON.

Example:

[
  {{
    "hook": "...",
    "headline": "...",
    "primary_text": "...",
    "cta": "..."
  }}
]
"""

AD_IMAGE_PROMPT = """You are a world-class creative director designing a high-budget mobile app ad for Meta (Instagram/Facebook).

App Name: "{app_name}"
Category: "{app_category}"  
Target Audience: "{target_audience}"
Hook: "{hook}"
Headline: "{headline}"
Brand Colors: "{color_theme}"
Target Device: {target_os}

Reference Screenshot (if attached):
{asset_context}
{uploaded_screenshots}

TASK:
Generate ONE stunning, scroll-stopping ad creative image (1080x1080 square).
This must look like a REAL paid ad from a top-tier brand — NOT a Play Store screenshot or app listing.

YOU MUST USE THIS EXACT CREATIVE STYLE:

{ad_style}

TEXT RULES:
- Display this exact text as the hook (small): {hook}
- Display this exact text as the headline (large, bold): {headline}
- DO NOT add any extra words, labels, introductions, font names, or quotes.
- Color: Use white (#FFFFFF) if {color_theme} is dark/vibrant. Use black (#1A1A1A) if {color_theme} is light/white.

CRITICAL DESIGN RULES:

1. NEVER make it look like a Play Store screenshot or app listing
2. All phone mockups MUST be {target_os} devices (use the exact device style for {target_os})
3. The phone(s) should show REAL app UI (use attached screenshot if available), not blank/generic screens
4. Keep text minimal but powerful (hook + headline only, no paragraphs)
5. Background must be rich and branded (gradients, textures, patterns) — NOT plain white
6. Add visual depth: shadows, reflections, 3D elements, bokeh
7. Make the overall feel premium, not cheap or template-like
8. The ad should make someone STOP scrolling on Instagram
9. DO NOT add any "Download Now" or "Install" buttons — those are added by the ad platform
10. DO NOT display font names, labels, or instruction text as visible content

OUTPUT: A single 1080x1080 high-quality ad creative image.
"""

# ─────────────────────────────────────────────
# AD CREATIVE STYLE VARIATIONS — cycled per ad
# ─────────────────────────────────────────────

AD_CREATIVE_STYLES = [
    # Style 1: Person holding phone (lifestyle)
    """STYLE: "Person Holding Phone — Lifestyle Shot"
- A real person's hand naturally holding a {target_os} smartphone
- The phone screen clearly shows the app UI demonstrating the feature
- FOCUS: The phone and app are the HERO — the person is secondary (slightly blurred or cropped)
- Background: a softly blurred real-world environment (cafe, office, couch, park) matching the app category
- Warm, natural photography lighting with soft bokeh
- The phone screen must be bright and crisp, drawing the eye immediately
- Hook text placed subtly at top, headline at bottom or side
- Think: lifestyle Instagram ad from brands like Airbnb, Uber, or Headspace""",

    # Style 2: Multi-phone feature showcase (2-3 phones)
    """STYLE: "Multi-Phone Feature Showcase"
- Display 2-3 {target_os} phone mockups side by side or in a dynamic arrangement (fanned out, stacked, or cascading)
- EACH phone shows a DIFFERENT screen/feature of the app
- The center phone is largest and most prominent
- Phones are angled slightly for depth and dynamism
- Rich {color_theme} gradient background
- Minimal text: just the headline placed boldly above or below the phone arrangement
- Think: Apple product launch ads or Samsung Galaxy feature showcases""",

    # Style 3: Hero phone + bold text (classic ad layout)
    """STYLE: "Hero Phone + Bold Typography"
- ONE {target_os} phone mockup tilted at 15-30 degrees, placed on the RIGHT side
- Bold, massive headline text on the LEFT side
- Vibrant gradient or solid {color_theme} background
- Small hook text above the headline
- 3D floating UI elements or relevant icons around the phone for visual richness
- Clean, high-contrast layout with lots of breathing room
- Think: Zedge, Calm, or Headspace ad campaigns""",

    # Style 4: 3D Pop-Out (objects bursting from phone)
    """STYLE: "3D Pop-Out — Objects Bursting from Phone"
- ONE {target_os} phone laying flat at a dramatic angle
- Objects relevant to the app category literally BURSTING OUT of the phone screen in 3D
- Food flying out for food apps, charts for finance, music notes for music, shopping bags for e-commerce, etc.
- Dramatic lighting with depth of field and motion blur on flying objects
- The phone screen shows the app UI as the source of the objects
- Minimal text — the visual tells the story. Only headline placed at top or bottom.
- Think: Swiggy ad with food popping out, or Spotify with music exploding from phone""",

    # Style 5: Split Layout Billboard
    """STYLE: "Split Layout Billboard"
- Clean split composition: LEFT side has massive bold headline + hook text
- RIGHT side has a person's hand holding OR a floating {target_os} phone showing the app
- Solid {color_theme} background with subtle texture or pattern
- Professional, corporate-premium feel
- Clear visual hierarchy: text area and phone area are balanced
- Think: LinkedIn, Notion, or Slack ad campaigns""",

    # Style 6: Flat Lay / Top-Down
    """STYLE: "Flat Lay / Top-Down View"
- Bird's-eye view of a {target_os} phone laying on a styled surface
- Around the phone: relevant lifestyle objects (coffee cup, notebook, plants, earbuds — matching the app category)
- The phone screen clearly displays the app UI
- Soft, even lighting like a product photography flat lay
- Headline text overlaid at top or bottom with a semi-transparent banner
- Clean, Instagram-worthy aesthetic
- Think: Product flat lay posts from brands like Apple, Moleskine, or Muji""",
]

# ─────────────────────────────────────────────
# PLAY STORE DESCRIPTION GENERATOR PROMPT
# ─────────────────────────────────────────────

GENERATE_PLAY_STORE_DESCRIPTION_PROMPT = """You are an expert App Store Optimization (ASO) specialist and conversion-focused copywriter.
Your goal is to write a high-converting Play Store listing description for the app "{app_name}".

APP CONTEXT:
- Name: {app_name}
- Category: {app_category}
- Target Audience: {target_audience}
- Brand Style: {brand_style}
- User-Provided Description: {app_description}
- Core Features:
{features_list}

STRICT EMOJI RULE:
{emoji_instruction}

YOUR TASK:
Generate two parts of the listing:
1. SHORT DESCRIPTION (max 80 characters):
   - This is the most important piece of text.
   - It must be ultra-punchy, benefit-driven, and fit within the character limit.
   - NO exclamation marks (Play Store policy often flags them).
   - Must hook the user immediately.

2. FULL DESCRIPTION (optimized for engagement and SEO):
   - Introduction (2-3 sentences): Hook the user with the core problem/solution. Use the User-Provided Description as a base if it contains specific details.
   - Key Benefits/Features (bullet points): Use the provided features list to create engaging, benefit-focused bullet points (e.g. "🚀 Feature Name: The user benefit").
   - Detailed Explanation (1-2 paragraphs): Expand on the app's value.
   - Social Proof/Trust (optional but good).
   - Call to Action (CTA).

STRICT OUTPUT RULE:
- Return ONLY a JSON object with the following keys:
  - "short_description": (string, max 80 chars)
  - "full_description": (string, markdown formatted for the full listing)

DO NOT use markdown backticks in the root output. Return raw JSON.

Output Format Example:
{{
  "short_description": "The easiest way to track your daily goals and stay productive.",
  "full_description": "Are you struggling with productivity?...\\n\\nKey Features:\\n- ✅ Smart Tracking: ...\\n- ☁️ Cloud Sync: ..."
}}
"""