"""
config.py — Configuration for video generation, including available video types.
"""

VIDEO_TYPES = {
    "cinematic": {
        "label": "Cinematic / Brand Story",
        "description": "An emotional, narrative-driven video that creates a brand connection. Uses dramatic lighting, smooth transitions, and storytelling.",
        "scene_count": 5,
        "focus": "emotion, brand identity, aspirational lifestyle",
    },
    "walkthrough": {
        "label": "App Walkthrough / UI Demo",
        "description": "A screen-by-screen tour of the app's key features. Shows real UI interactions with smooth scroll and tap animations.",
        "scene_count": 4,
        "focus": "functionality, UI beauty, feature highlights",
    },
    "tutorial": {
        "label": "How-To / Tutorial",
        "description": "A step-by-step guide explaining how to use the app. Educational and clear, with on-screen annotations and text overlays.",
        "scene_count": 4,
        "focus": "clarity, step-by-step guidance, problem-solving",
    },
    "feature_highlight": {
        "label": "Feature Spotlight",
        "description": "A fast-paced, punchy video that highlights 3-4 killer features with bold text and dynamic transitions.",
        "scene_count": 4,
        "focus": "speed, impact, key features, bold typography",
    },
    "before_after": {
        "label": "Before & After / Transformation",
        "description": "Shows the user's life/workflow BEFORE the app vs AFTER. Dramatic contrast to demonstrate value.",
        "scene_count": 4,
        "focus": "contrast, transformation, problem-solution, dramatic reveal",
    },
}
