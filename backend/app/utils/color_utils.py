"""
color_utils.py — Helper functions for color conversion.
"""

# ─── Color code → natural name mapping ───────────────────────────
COLOR_MAP = {
    "#FF0000": "red", "#FF4500": "orange-red", "#FF6347": "tomato red",
    "#FF8C00": "dark orange", "#FFA500": "orange", "#FFD700": "gold",
    "#FFFF00": "yellow", "#ADFF2F": "green-yellow", "#7CFC00": "lawn green",
    "#00FF00": "green", "#32CD32": "lime green", "#228B22": "forest green",
    "#006400": "dark green", "#00CED1": "dark turquoise", "#00FFFF": "cyan",
    "#4169E1": "royal blue", "#0000FF": "blue", "#000080": "navy blue",
    "#4B0082": "indigo", "#8B00FF": "violet", "#9400D3": "dark violet",
    "#FF00FF": "magenta", "#FF1493": "deep pink", "#FF69B4": "hot pink",
    "#8B5E3C": "warm brown", "#D4A574": "light tan", "#A0522D": "sienna brown",
    "#FFFFFF": "white", "#000000": "black", "#808080": "gray",
    "#C0C0C0": "silver", "#F5F5DC": "beige", "#FFE4C4": "bisque",
}

def hex_to_color_name(hex_code: str) -> str:
    """Convert a hex color code to a natural language color name."""
    hex_upper = hex_code.strip().upper()
    if hex_upper in COLOR_MAP:
        return COLOR_MAP[hex_upper]
    try:
        h = hex_upper.lstrip("#")
        r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    except (ValueError, IndexError):
        return "vibrant"
    
    if r > 200 and g < 100 and b < 100: return "red"
    if r > 200 and g > 100 and b < 80: return "orange"
    if r > 200 and g > 200 and b < 100: return "yellow"
    if r < 100 and g > 180 and b < 100: return "green"
    if r < 100 and g > 180 and b > 180: return "teal"
    if r < 100 and g < 100 and b > 180: return "blue"
    if r > 150 and g < 100 and b > 150: return "purple"
    if r > 200 and g < 100 and b > 150: return "pink"
    if r > 150 and g > 100 and b < 100: return "brown"
    if r > 200 and g > 200 and b > 200: return "light gray"
    if r < 80 and g < 80 and b < 80: return "dark charcoal"
    return "muted warm"

def color_theme_to_name(color_theme: str) -> str:
    """Convert a color_theme string (solid hex or gradient) to natural name."""
    import re
    gradient_match = re.match(
        r"gradient\s+from\s+(#[0-9a-fA-F]{6})\s+to\s+(#[0-9a-fA-F]{6})",
        color_theme.strip(), re.IGNORECASE,
    )
    if gradient_match:
        start = hex_to_color_name(gradient_match.group(1))
        end = hex_to_color_name(gradient_match.group(2))
        return f"a {start} to {end} gradient"
    return hex_to_color_name(color_theme)
