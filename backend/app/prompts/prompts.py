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
Language: {language}
User Vision/Creative Direction: {user_vision}

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
6. MUST BE WRITTEN IN THIS LANGUAGE: {language}

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
Language: {language}
User Vision/Creative Direction: {user_vision}
Initial Request/Context: {feature_concept}

HEADLINE RULES:
1. Length: 2–6 words maximum (shorter is better)
2. Style: Bold, punchy, immediate value communication. Usually the primary tagline of the app.
3. Tone: Must match Brand Style: {brand_style}
4. No secondary text, no colon, no periods, no explanations
5. MUST BE WRITTEN IN THIS LANGUAGE: {language}

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
Language: {language}

App Description:
{app_description}

OUTPUT LANGUAGE RULE:
- ALL generated features MUST be written in this language: {language}.
"""

# ─────────────────────────────────────────────
# IMAGE GENERATION — PORTRAIT (Phone Mockup)
# ─────────────────────────────────────────────

IMAGE_GENERATION_BLANK_PROMPT_V3 = """Create a premium Google Play Store screenshot marketing asset for the app "{app_name}".

THE APP: "{app_name}" — a {app_category} app.
THE FEATURE TO SHOWCASE: "{feature}"
USER CREATIVE VISION: "{user_vision}"

CANVAS: {width}x{height} pixels (portrait orientation).

MANDATORY HARD-CONSTRAINTS (CRITICAL):
- STRICT LANGUAGE REQUIREMENT: The entire image, including the headline "{headline}", subtext "{subtext}", and ALL UI elements inside the phone mockup, MUST be written in the following language: {language}. 
- ZERO ENGLISH TOLERANCE: DO NOT use any English words anywhere in the image (except for universal symbols like 'Aa' or '...'). Even if the app name "{app_name}" is in English, you MUST translate it or represent it in {language} characters. 
- All names, buttons, labels, and small text inside the app mockup MUST be in {language}.
- STRICT DEVICE IDENTITY: You MUST follow these hardware specifications: {os_details}
- NO-OVERLAP RULE: The typography MUST be confined to the top 25% of the canvas. It MUST NOT touch, hide behind, or overlap the phone mockup.
- DYNAMIC TEXT SCALING: Reduce font size for headlines "{headline}" longer than 5 words to keep them in the top section.
- PROHIBITED ELEMENTS: No Apple logos, no pill-shaped cutouts (if Android), no watermarks.

VISUAL FIDELITY & PREMIUM DESIGN (MANDATORY):
- The final asset MUST be visually stunning, high-fidelity, and "wow" the user at first glance.
- AVOID SIMPLE OR FLAT DESIGNS. Use rich textures, dynamic lighting, subtle gradients, and depth.
- The composition should feel alive and premium, similar to top-tier app marketing (e.g., Duolingo, Revolut, or Airbnb).
- STRICT VISION ADHERENCE: If a "USER CREATIVE VISION" is provided, you MUST use it as your primary stylistic and conceptual anchor. Every detail should reflect that vision.

LAYOUT INSTRUCTIONS (Top to Bottom):
1. Upper Section (top 35-40% of the canvas):
   - Background: {color_theme} color theme, vibrant and saturated.
   - Display this exact text: {headline}
   - CRITICAL: Do NOT write words like "HEADLINE BANNER" or "PHONE MOCKUP" anywhere in the image.
   - DO NOT add any extra words, labels, introductions, font names, or quotes. Only the exact words above.
   - The headline must be massive, extra-bold, modern sans-serif typography with a deep shade, subtle gradient, and a strong drop shadow to make it pop and look highly premium. It must be FULLY VISIBLE and NOT clipped by any edges.
   - NO-OVERLAP RULE: The text MUST be confined to the top 35-40% of the canvas. It MUST NOT touch or hide behind the phone mockup.
   - DYNAMIC TEXT SCALING: If the headline "{headline}" is long (more than 5 words), reduce the font size to ensure it fits perfectly with generous padding.
   - ENSURE there is generous padding (at least 60px) between the text and all edges of the image.
   - DO NOT cut off any letters or words. If the headline is long, use multiple lines within the upper section.
   - Color: You MUST use {text_color} (Hex Code) for the text. NO EXCEPTIONS. You may highlight key words in a bright, glowing accent color matching the {color_theme}.
   - Left-aligned with generous padding.
   - If the following line is not empty, display it directly below the headline in a smaller, lighter weight: {subtext}
   - The smaller text must use the same color as the headline.
   - The subtext must also scale down if the headline is long.
2. {include_emoji}
3. Lower Section (bottom 65-70% of the canvas):
   - ADD FLOATING ELEMENTS: Floating pill-shaped feature chips (white cards with a small icon and 1-2 words) scattered dynamically around the phone. Each chip MUST display a DIFFERENT feature or benefit of the app.
   - ADD 3D OBJECT: A large, relevant 3D object (e.g., matching the app category) placed prominently behind or beside the phone.
   - ADD BOTTOM ICONS: A horizontal row of 3-4 simple feature icons scattered near the bottom or below the typography. These icons MUST represent DIFFERENT, distinct features of the app.

DEVICE PRESENTATION (VERY IMPORTANT — follow this exactly):
{mockup_style}

{target_os} SCREEN UI REQUIREMENTS (if a phone is required by the style above):
- Design a realistic, production-quality mobile app screen for a {app_category} app perfectly fitted to the specified {target_os} hardware.
- IMPORTANT: The physical device MUST be clearly identifiable as {target_os} using these details: {os_details}
- STRICT DEVICE IDENTITY: NO MIXING BRANDS. If {target_os} is Android, DO NOT use an iPhone. If {target_os} is iOS, DO NOT use an Android. You MUST follow the hardware details of {target_os} strictly.
- The screen UI MUST explicitly demonstrate the functionality described in: {headline}
- ALL text on the screen (buttons, menus, content, names, labels) MUST be in: {language}
- TRANSLATE EVERYTHING: Any text that would normally be in English (like "Settings", "Profile", "Shared Album") MUST be translated into {language}.
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
USER CREATIVE VISION: "{user_vision}"

CANVAS: {width}x{height} pixels (landscape orientation).

MANDATORY HARD-CONSTRAINTS (Banner Layout):
- STRICT LANGUAGE REQUIREMENT: All text in the banner (headline, subtext, UI, CTA, and feature chips) MUST be written in: {language}.
- ZERO ENGLISH TOLERANCE: No English words allowed anywhere. Translate all UI labels and app names into {language}.
- STRICT DEVICE IDENTITY: You MUST follow these hardware specifications: {os_details}
- NO-OVERLAP (STRICT): The headline text MUST NOT overlap with the phone frame to ensure readability.
- PROHIBITED: If {target_os} is Android, NO Apple branding. If {target_os} is iOS, NO Android branding.

VISUAL FIDELITY & PREMIUM ARCHITECTURE (MANDATORY):
- You MUST replicate a highly specific, premium architecture for this banner:
  1. LEFT SIDE: Massive, extra-bold headline and subtext. The font MUST be a modern sans-serif typography with a deep shade, subtle gradient, and a strong drop shadow to make it pop and look highly premium.
  2. BOTTOM LEFT: A horizontal row of 3-4 simple feature icons, each with a very short 1-2 word label underneath. These icons MUST represent DIFFERENT, distinct features of the app (do not just repeat the main feature).
  3. RIGHT SIDE: A large {target_os} smartphone mockup, standing on a 3D glowing pedestal or platform.
  4. FLOATING ELEMENTS: Floating pill-shaped feature chips (white cards with a small icon and 1-2 words) scattered dynamically around the phone. Each chip MUST display a DIFFERENT feature or benefit of the app.
  5. 3D OBJECT: A large, relevant 3D object (e.g., matching the app category) placed prominently to the right or behind the phone.
- COLORS AND SHADES: The typography shade, feature icons, and floating chips MUST be colored using the {color_theme} or its complementary shades.
- STRICT VISION ADHERENCE: Prioritize and explicitly implement the "USER CREATIVE VISION" in the atmosphere, styling, and color logic.

LAYOUT COMPOSITION:
1. Left Block (55% of canvas) — Marketing text area:
   - Display this exact text as the headline: {headline}
   - CRITICAL: Do NOT write words like "LEFT BLOCK", "RIGHT SIDE", or "PHONE MOCKUP" anywhere in the image.
   - DO NOT add any extra words, labels, introductions, font names, or quotes. Only the exact words above for the headline.
   - The headline must be massive, extra-bold, modern sans-serif typography with a deep shade, subtle gradient, and a strong drop shadow. It must be FULLY VISIBLE and NOT clipped by any edges.
   - If the following line is not empty, display it directly below the headline in a smaller, lighter weight: {subtext}
   - Color: The headline MUST use a striking DUAL-COLOR scheme to attract attention. Make the first half or base words a solid color (e.g., deep navy/black or white) and highlight the key words in a bright, glowing accent color matching the {color_theme}.
   - Below the subtext, at the bottom-left, place the row of 3-4 feature icons and text labels.
   - Left-aligned with generous padding.

2. Right Block (45% of canvas) — Device & 3D area:
   - Place ONE perfectly vertical (PORTRAIT orientation) {target_os} smartphone mockup on the 3D glowing pedestal.
   - STRICT DEVICE IDENTITY: If {target_os} is Android, DO NOT use an iPhone or Dynamic Island. Use a centered punch-hole camera and symmetric bezels.
   - POSITION: Keep the phone strictly within the right 45% of the banner.
   - The phone screen must show a premium {app_category} UI that demonstrates: {headline}
   - ALL screen UI text (including names, menus, and labels) must be in: {language}
   - ZERO ENGLISH TOLERANCE: No English text on the screen.
   - The typography MUST NOT overlap with the phone mockup.
   - Surround the phone with the floating feature chips (pill-shaped cards with icon + text).
   - Add the large 3D symbolic object related to the app category on the right.

MANDATORY TEXT BOUNDARIES (Landscape):
- SAFE-ZONE: The headline {headline} MUST be confined to the horizontal range of 5% to 55% of the canvas width. 
- LINE WRAPPING: If the headline is long, wrap it into 2 or 3 lines to ensure it never touches the right-side device mockup.
- NO CLIPPING: No part of any letter should be hidden behind the phone or cut off by the left/top edges.
- Use a maximum font size that leaves at least 150px of empty space between the end of the text and the phone frame.
3. BACKGROUND: {background_instruction}. Add highly detailed background graphics related to the app (e.g., faint world maps, glowing network lines, dotted patterns, data nodes, and dynamic swooping waves). It MUST NOT be a simple plain gradient; it needs rich, thematic detailing.

VISUAL ELEMENTS & EMOJI:
- {include_emoji}
- Ensure floating feature chips and bottom icons explicitly represent DIFFERENT, distinct aspects or benefits of the app, rather than just repeating "{feature}".

QUALITY:
- Billboard-style hero graphic, indistinguishable from top-tier utility app Play Store feature graphics.
- Saturated, premium, clean.

DO NOT INCLUDE: landscape-oriented phones, wireframes, watermarks, download buttons from app stores, call-to-action buttons (e.g. "Connect Now", "Download"), store badges, font names as visible text.

FINAL LANGUAGE ENFORCEMENT (CRITICAL):
- EVERY PIECE OF TEXT IN THE ENTIRE IMAGE MUST BE IN: {language}
- ZERO ENGLISH TOLERANCE: No English words allowed anywhere.
- TRANSLATE ALL UI LABELS, APP NAMES, AND DESCRIPTIONS INTO {language}.
"""

# ─────────────────────────────────────────────
# IMAGE ENHANCEMENT — PORTRAIT (Screenshot Provided)
# ─────────────────────────────────────────────

IMAGE_ENHANCE_PROMPT_V3 = """Create a premium Google Play Store screenshot marketing asset for "{app_name}", using the provided screenshot as a design reference.

THE APP: "{app_name}" — a {app_category} app.
THE FEATURE TO SHOWCASE: "{feature}"
USER CREATIVE VISION: "{user_vision}"

CANVAS: {width}x{height} pixels.

IMPORTANT — SCREENSHOT USAGE & LANGUAGE:
- STRICT LANGUAGE REQUIREMENT: All text in the generated image (headline, subtext, and recreated UI) MUST be in: {language}.
- ZERO ENGLISH TOLERANCE: Translate everything, including names and labels that are in English in the original screenshot.
- Do NOT copy/paste the screenshot directly. Study its color palette, layout structure, UI patterns, and visual style.
- Reimagine and recreate the UI as a significantly more polished, premium version inside the phone mockup.
- Preserve the app's real design language and colors, but elevate spacing, typography, and visual hierarchy.

LAYOUT INSTRUCTIONS (Top to Bottom):
1. Upper Section (top 35-40%):
   - Background: {color_theme} color theme, vibrant and saturated.
   - Display this exact text: {headline}
   - CRITICAL: Do NOT write words like "HEADLINE BANNER" or "PHONE MOCKUP" anywhere in the image.
   - DO NOT add any extra words, labels, introductions, font names, or quotes. Only the exact words above.
   - The text must be massive, extra-bold, modern sans-serif typography. Apply a deep shade, subtle gradient, and a strong drop shadow to make it pop and look highly premium.
   - NO-OVERLAP RULE: The text MUST be confined to the top 35-40% of the canvas. It MUST NOT touch or hide behind the phone mockup.
   - DYNAMIC TEXT SCALING: If the headline "{headline}" is long (more than 5 words), reduce the font size to ensure it fits perfectly with generous padding.
   - ENSURE there is generous padding (at least 60px) between the text and all edges.
   - Color: You MUST use {text_color} (Hex Code) for the text. NO EXCEPTIONS. You may highlight key words in a bright, glowing accent color matching the {color_theme}.
   - If the following line is not empty, display it directly below the headline in a smaller, lighter weight: {subtext}
   - The smaller text must use the same color as the headline.
   - The subtext must also scale down if the headline is long.
2. {include_emoji}
3. Lower Section (bottom 65-70%):
   - ADD FLOATING ELEMENTS: Floating pill-shaped feature chips (white cards with a small icon and 1-2 words) scattered dynamically around the phone. Each chip MUST display a DIFFERENT feature or benefit of the app.
   - ADD 3D OBJECT: A large, relevant 3D object (e.g., matching the app category) placed prominently behind or beside the phone.
   - ADD BOTTOM ICONS: A horizontal row of 3-4 simple feature icons scattered near the bottom or below the typography. These icons MUST represent DIFFERENT, distinct features of the app.

DEVICE PRESENTATION (VERY IMPORTANT — follow this exactly):
{mockup_style}

PHONE SCREEN UI:
- Based on the uploaded screenshot's design language but elevated to premium quality.
- IMPORTANT: The physical {target_os} device MUST be clearly identifiable from these details: {os_details}
- STRICT DEVICE IDENTITY: NO MIXING BRANDS. If {target_os} is Android, DO NOT use an iPhone. If {target_os} is iOS, DO NOT use an Android. You MUST follow the hardware details of {target_os} strictly.
- The screen must explicitly demonstrate: {headline}
- ALL text on the screen MUST be in: {language}
- Create dynamic visual depth by popping key feature elements out of the screen (3D floating UI cards, overlapping layers, elements bursting out of the phone bezel)
- Include status bar (time, battery, signal icons) in the exact style of {target_os}.
- All content must be realistic — NO placeholder text
- Use {color_theme} as the primary accent color for buttons and UI highlights.
- The screen must look like a real, polished, shipping app.

VISUAL FIDELITY & PREMIUM DESIGN (MANDATORY):
- This asset MUST feel like a high-end editorial marketing piece (e.g., Apple Store style).
- NO SIMPLE OR GENERIC DESIGNS. Use sophisticated lighting, layered 3D UI cards, and rich background details.
- STRICT VISION ADHERENCE: The "USER CREATIVE VISION" is your core stylistic instruction. If provided, the final output MUST be a direct and high-fidelity reflection of that vision's tone, style, and concept.

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

TEXT & LANGUAGE RULES:
- STRICT LANGUAGE REQUIREMENT: All text in the ad (hook, headline, and phone UI) MUST be written in: {language}.
- ZERO ENGLISH TOLERANCE: No English text anywhere. Translate all UI labels and brand names into {language}.
- Display this exact text as the hook (small): {hook}
- Display this exact text as the headline (large, bold): {headline}
- DO NOT add any extra words, labels, introductions, font names, or quotes.
- Color: You MUST use {text_color} (Hex Code) for the text. NO EXCEPTIONS.

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

FINAL LANGUAGE ENFORCEMENT (CRITICAL):
- EVERY PIECE OF TEXT IN THE ENTIRE IMAGE MUST BE IN: {language}
- ZERO ENGLISH TOLERANCE: No English words allowed anywhere.
- TRANSLATE ALL UI LABELS, BRAND NAMES, AND DESCRIPTIONS INTO {language}.
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
- Output Language: {language}
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
   - Natural incorporation of the core features and keywords.
   - Clean formatting: use bullet points or short paragraphs for readability.
   - Play Store style formatting is encouraged (e.g. bolding key phrases or using emojis).

STRICT OUTPUT RULE:
- Return ONLY a JSON object with the following keys:
  - "short_description": (string, max 80 chars)
  - "full_description": (string, markdown formatted for the full listing)
  - ENTIRE DESCRIPTION MUST BE WRITTEN IN: {language}

RETURN ONLY THE JSON. No introduction, no markdown backticks, no markdown blocks. Just valid JSON.

Output Format Example:
{
  "short_description": "The easiest way to track your daily goals and stay productive.",
  "full_description": "Are you struggling with productivity?...\\n\\nKey Features:\\n- ✅ Smart Tracking: ...\\n- ☁️ Cloud Sync: ..."
}
"""

# ─────────────────────────────────────────────
# VIDEO VISION GENERATOR PROMPT
# ─────────────────────────────────────────────

GENERATE_VIDEO_VISION_PROMPT = """You are an expert Play Store video marketing strategist.
Based on the app details below, write a detailed VIDEO VISION — a visual scenario
description for a promotional video that would appear on the Play Store.

APP NAME: {app_name}
CATEGORY: {app_category}
DESCRIPTION: {app_description}
TARGET AUDIENCE: {target_audience}
FEATURES:
{features_text}
VIDEO STYLE: {video_type}

Write a 3-5 sentence VIDEO VISION that describes:
1. WHO is using the app (a person in a real-world setting)
2. WHAT specific features they demonstrate on their phone screen
3. WHERE the scenes take place (real locations that match the app's purpose)
4. The EMOTIONAL journey — how the person feels before and after using the app

RULES:
- ONLY reference the features listed above — never invent features
- Describe real people in real settings using the app on a phone
- Make it feel like a professional Play Store promotional video
- Write in {language}
- Keep it concise: 3-5 sentences maximum
- Focus on visual scenarios, not marketing copy

Return ONLY the video vision text. No quotes, no labels, no explanation."""
