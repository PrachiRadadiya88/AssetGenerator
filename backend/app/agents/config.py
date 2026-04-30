"""
config.py — Configuration for video generation, including all 12 available video types.
"""

VIDEO_TYPES = {
    "problem_solution": {
        "label": "Problem → Solution",
        "description": "Show a pain point, then reveal how the app solves it dramatically.",
        "scene_count": 4,
        "focus": "pain, reveal, transformation",
        "duration": 30,
    },
    "walkthrough": {
        "label": "App Demo / Walkthrough",
        "description": "Clean screen-by-screen tour of the top 3 features.",
        "scene_count": 4,
        "focus": "UI, gestures, features",
        "duration": 30,
    },
    "lifestyle": {
        "label": "Lifestyle / Real-World",
        "description": "Person uses the app naturally in a real-life setting. Soft-sell.",
        "scene_count": 3,
        "focus": "emotion, aspiration",
        "duration": 30,
    },
    "explainer": {
        "label": "Explainer Animation",
        "description": "Animated illustrations explain the problem, then transition to real UI.",
        "scene_count": 3,
        "focus": "clarity, motion graphics",
        "duration": 30,
    },
    "feature_highlight": {
        "label": "Feature Highlight",
        "description": "Fast-paced, beat-synced cuts showcasing features rapidly.",
        "scene_count": 3,
        "focus": "speed, bold captions",
        "duration": 20,
    },
    "before_after": {
        "label": "Before vs After",
        "description": "Split-screen: struggling without the app vs seamless with it.",
        "scene_count": 3,
        "focus": "contrast, transformation",
        "duration": 30,
    },
    "social_proof": {
        "label": "Social Proof",
        "description": "User testimonials, star ratings, and stats build trust.",
        "scene_count": 3,
        "focus": "trust, credibility",
        "duration": 30,
    },
    "narrative": {
        "label": "Story Narrative",
        "description": "Cinematic mini-story: protagonist discovers the app, life transforms.",
        "scene_count": 3,
        "focus": "storytelling, emotion",
        "duration": 30,
    },
    "minimalist": {
        "label": "Minimalist Premium",
        "description": "Elegant, slow-paced showcase on clean white background.",
        "scene_count": 3,
        "focus": "elegance, simplicity",
        "duration": 30,
    },
    "loopable": {
        "label": "Loopable Micro",
        "description": "Seamless 15s loop. No CTA, no logo. Pure motion.",
        "scene_count": 2,
        "focus": "seamless loop",
        "duration": 15,
    },
    "hook_first": {
        "label": "Hook-First Short",
        "description": "Scroll-stopping hook, then proof and CTA. 3 hook variations.",
        "scene_count": 4,
        "focus": "attention, urgency",
        "duration": 30,
    },
    "comparison": {
        "label": "Comparison vs Competitors",
        "description": "Tasteful side-by-side: generic 'other apps' (blurred, clunky) vs your app (smooth, fast).",
        "scene_count": 5,
        "focus": "differentiation, advantages, factual comparison, confident close",
        "duration": 30,
    },
}
