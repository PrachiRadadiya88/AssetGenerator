"""
image_service.py — Image composition and text overlay for Play Store assets.

Uses Pillow to composite final screenshot images with text overlays,
gradient backgrounds, and proper Play Store dimensions.
"""

import os
import logging
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont, ImageFilter

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
# Constants
# ─────────────────────────────────────────────

PORTRAIT_SIZE = (1080, 1920)
LANDSCAPE_SIZE = (1920, 1080)

# Font sizes (relative to image width)
HEADLINE_FONT_RATIO = 0.090
SUBTEXT_FONT_RATIO = 0.026


def _hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    """Convert hex color string to RGB tuple. Handles gradient strings by extracting the first hex."""
    import re
    # Extract first hex color from string (handles both '#8B5E3C' and 'gradient from #8B5E3C to #D4A574')
    match = re.search(r'#([0-9a-fA-F]{6})', hex_color)
    if match:
        hex_str = match.group(1)
        return tuple(int(hex_str[i:i + 2], 16) for i in (0, 2, 4))
    # Fallback
    hex_color = hex_color.lstrip("#")
    if len(hex_color) >= 6 and all(c in '0123456789abcdefABCDEF' for c in hex_color[:6]):
        return tuple(int(hex_color[i:i + 2], 16) for i in (0, 2, 4))
    return (139, 94, 60)  # Default brown


def _darken(rgb: tuple[int, int, int], factor: float = 0.6) -> tuple[int, int, int]:
    """Darken an RGB color by a factor."""
    return tuple(max(0, int(c * factor)) for c in rgb)


def _lighten(rgb: tuple[int, int, int], factor: float = 0.3) -> tuple[int, int, int]:
    """Lighten an RGB color by blending with white."""
    return tuple(min(255, int(c + (255 - c) * factor)) for c in rgb)


def _get_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    """
    Get a font at the specified size.
    Falls back to default font if system fonts aren't available.
    """
    # Try common system font paths
    font_candidates = []
    
    if bold:
        font_candidates = [
            "C:/Windows/Fonts/segoeui.ttf",      # Windows Segoe UI
            "C:/Windows/Fonts/arialbd.ttf",       # Windows Arial Bold
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",  # Linux
            "/System/Library/Fonts/Helvetica.ttc",  # macOS
        ]
    else:
        font_candidates = [
            "C:/Windows/Fonts/segoeui.ttf",      # Windows Segoe UI
            "C:/Windows/Fonts/arial.ttf",         # Windows Arial
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",  # Linux
            "/System/Library/Fonts/Helvetica.ttc",  # macOS
        ]

    for font_path in font_candidates:
        if os.path.exists(font_path):
            try:
                return ImageFont.truetype(font_path, size)
            except Exception:
                continue

    # Fallback to default
    try:
        return ImageFont.truetype("arial.ttf", size)
    except Exception:
        return ImageFont.load_default()


def _draw_gradient(
    draw: ImageDraw.Draw,
    width: int,
    height: int,
    color_top: tuple[int, int, int],
    color_bottom: tuple[int, int, int],
):
    """Draw a vertical gradient on the image."""
    for y in range(height):
        ratio = y / height
        r = int(color_top[0] + (color_bottom[0] - color_top[0]) * ratio)
        g = int(color_top[1] + (color_bottom[1] - color_top[1]) * ratio)
        b = int(color_top[2] + (color_bottom[2] - color_top[2]) * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))


def _wrap_text(text: str, font: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    """Word-wrap text to fit within max_width pixels."""
    words = text.split()
    lines = []
    current_line = ""

    for word in words:
        test_line = f"{current_line} {word}".strip()
        bbox = font.getbbox(test_line)
        text_width = bbox[2] - bbox[0]
        if text_width <= max_width:
            current_line = test_line
        else:
            if current_line:
                lines.append(current_line)
            current_line = word

    if current_line:
        lines.append(current_line)

    return lines


def compose_asset(
    headline: str,
    color_theme: str,
    orientation: str = "portrait",
    ai_generated_path: str | None = None,
    uploaded_path: str | None = None,
    output_path: str = "output.png",
) -> str:
    """
    Compose a final Play Store screenshot asset.
    
    Takes a background image (generated or uploaded), overlays headline
    with proper styling, gradients, and typography.
    
    Args:
        headline: Main headline text (2-7 words)
        color_theme: Hex color for the theme
        orientation: "portrait" or "landscape"
        ai_generated_path: Path to the AI generated image (if successful)
        uploaded_path: Path to user's uploaded screenshot (used if AI fails)
        output_path: Where to save the final composited image
    
    Returns:
        The output_path where the image was saved
    """
    # Determine dimensions
    if orientation == "landscape":
        width, height = LANDSCAPE_SIZE
    else:
        width, height = PORTRAIT_SIZE

    accent_rgb = _hex_to_rgb(color_theme)

    # ─── Check AI Generated ───
    if ai_generated_path and os.path.exists(ai_generated_path):
        # AI generated the full asset with text and mockup natively
        import shutil
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        shutil.copy2(ai_generated_path, output_path)
        logger.info(f"AI generated asset saved to: {output_path}")
        return output_path
    
    # ─── Fallback Execution ───
    # Generate a gradient background since AI failed
    bg = Image.new("RGBA", (width, height))
    draw = ImageDraw.Draw(bg)
    _draw_gradient(draw, width, height, _lighten(accent_rgb, 0.4), _darken(accent_rgb, 0.7))

    # Paste uploaded screenshot into a mock device frame if available
    if uploaded_path and os.path.exists(uploaded_path):
        try:
            screenshot = Image.open(uploaded_path).convert("RGBA")
            target_width = int(width * 0.75)
            aspect = screenshot.height / screenshot.width
            target_height = int(target_width * aspect)
            
            # Constrain height to not overlap with text too much
            max_height = int(height * 0.65)
            if target_height > max_height:
                target_height = max_height
                target_width = int(target_height / aspect)

            screenshot = screenshot.resize((target_width, target_height), Image.LANCZOS)

            x_offset = (width - target_width) // 2
            y_offset = height - target_height - int(height * 0.05) # 5% from bottom buffer

            # Draw basic shadow framing
            shadow = Image.new("RGBA", bg.size, (0,0,0,0))
            shadow_draw = ImageDraw.Draw(shadow)
            shadow_box = [x_offset - 12, y_offset - 12, x_offset + target_width + 12, y_offset + target_height + 12]
            shadow_draw.rounded_rectangle(shadow_box, radius=24, fill=(0,0,0,80))
            bg = Image.alpha_composite(bg, shadow)

            # Paste image
            bg.paste(screenshot, (x_offset, y_offset), screenshot)
        except Exception as e:
            logger.warning(f"Failed to embed uploaded screenshot in fallback: {e}")

    # ─── Create overlay for text area ───
    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)

    # Gradient overlay at top for text readability
    text_area_height = int(height * 0.30)
    for y in range(text_area_height):
        alpha = int(180 * (1 - y / text_area_height))
        overlay_draw.line(
            [(0, y), (width, y)],
            fill=(accent_rgb[0] // 3, accent_rgb[1] // 3, accent_rgb[2] // 3, alpha),
        )

    bg = Image.alpha_composite(bg, overlay)

    # ─── Draw text ───
    draw = ImageDraw.Draw(bg)
    
    headline_size = int(width * HEADLINE_FONT_RATIO)
    headline_font = _get_font(headline_size, bold=True)

    padding_x = int(width * 0.08)
    text_max_width = width - (padding_x * 2)

    # Headline
    headline_lines = _wrap_text(headline, headline_font, text_max_width)
    y_cursor = int(height * 0.08)

    for line in headline_lines:
        line_bbox = headline_font.getbbox(line)
        line_width = line_bbox[2] - line_bbox[0]
        # Center align
        x_pos = (width - line_width) // 2
        
        # Thicker shadow for better visibility
        draw.text(
            (x_pos + 3, y_cursor + 3),
            line,
            font=headline_font,
            fill=(0, 0, 0, 140),
        )
        draw.text(
            (x_pos - 1, y_cursor - 1),
            line,
            font=headline_font,
            fill=(0, 0, 0, 140),
        )
        # Draw text
        draw.text(
            (x_pos, y_cursor),
            line,
            font=headline_font,
            fill=(255, 255, 255, 255),
        )
        y_cursor += (line_bbox[3] - line_bbox[1]) + int(headline_size * 0.3)
    # ─── Save final image ───
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    final = bg.convert("RGB")
    final.save(output_path, "PNG", quality=95)
    logger.info(f"Composed asset saved to: {output_path}")

    return output_path


def compose_ad_asset(
    hook: str,
    headline: str,
    primary_text: str,
    cta: str,
    color_theme: str,
    ai_generated_path: str | None = None,
    output_path: str = "output_ad.png",
) -> str:
    """
    Compose a final Ad Creative.
    
    Since the AI prompt now generates the complete ad with typography,
    this function uses the AI image directly (resized to 1080x1080).
    Only falls back to gradient + PIL text if AI generation failed.
    """
    AD_SIZE = (1080, 1080)
    accent_rgb = _hex_to_rgb(color_theme)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # ─── AI image available: use directly ───
    if ai_generated_path and os.path.exists(ai_generated_path):
        bg = Image.open(ai_generated_path).convert("RGB")
        bg = bg.resize(AD_SIZE, Image.LANCZOS)
        bg.save(output_path, "PNG", quality=95)
        logger.info(f"Ad asset (AI pass-through) saved to: {output_path}")
        return output_path

    # ─── Fallback: gradient + text overlay ───
    width, height = AD_SIZE
    bg = Image.new("RGBA", (width, height))
    draw = ImageDraw.Draw(bg)
    _draw_gradient(draw, width, height, _lighten(accent_rgb, 0.3), _darken(accent_rgb, 0.6))

    padding_x = int(width * 0.08)
    text_max_width = width - (padding_x * 2)

    # Hook
    hook_font_size = int(width * 0.04)
    hook_font = _get_font(hook_font_size, bold=True)
    y_cursor = int(height * 0.12)

    hook_lines = _wrap_text(hook.upper(), hook_font, text_max_width)
    if hook_lines:
        line = hook_lines[0]
        bbox = hook_font.getbbox(line)
        line_w = bbox[2] - bbox[0]
        line_h = bbox[3] - bbox[1]
        pad_x, pad_y = 14, 8
        x_pos = padding_x
        draw.rounded_rectangle(
            [x_pos - pad_x, y_cursor - pad_y, x_pos + line_w + pad_x, y_cursor + line_h + pad_y],
            radius=8,
            fill=(accent_rgb[0], accent_rgb[1], accent_rgb[2], 255),
        )
        draw.text((x_pos, y_cursor), line, font=hook_font, fill=(255, 255, 255, 255))
        y_cursor += line_h + (pad_y * 2) + 24

    # Headline
    headline_font_size = int(width * 0.09)
    headline_font = _get_font(headline_font_size, bold=True)

    headline_lines = _wrap_text(headline, headline_font, text_max_width)
    for line in headline_lines:
        bbox = headline_font.getbbox(line)
        draw.text((padding_x + 2, y_cursor + 2), line, font=headline_font, fill=(0, 0, 0, 100))
        draw.text((padding_x, y_cursor), line, font=headline_font, fill=(255, 255, 255, 255))
        y_cursor += (bbox[3] - bbox[1]) + 12

    y_cursor += 16

    # Primary Text
    primary_font_size = int(width * 0.038)
    primary_font = _get_font(primary_font_size, bold=False)

    primary_lines = _wrap_text(primary_text, primary_font, text_max_width)
    for line in primary_lines:
        bbox = primary_font.getbbox(line)
        draw.text((padding_x, y_cursor), line, font=primary_font, fill=(220, 220, 220, 255))
        y_cursor += (bbox[3] - bbox[1]) + 8

    # CTA Button
    cta_font_size = int(width * 0.042)
    cta_font = _get_font(cta_font_size, bold=True)
    cta_text = cta.upper()
    cta_bbox = cta_font.getbbox(cta_text)
    cta_w = cta_bbox[2] - cta_bbox[0]
    cta_h = cta_bbox[3] - cta_bbox[1]

    btn_pad_x, btn_pad_y = 44, 18
    btn_w = cta_w + (btn_pad_x * 2)
    btn_h = cta_h + (btn_pad_y * 2)
    btn_x = (width - btn_w) // 2
    btn_y = height - btn_h - int(height * 0.10)

    draw.rounded_rectangle(
        [btn_x, btn_y, btn_x + btn_w, btn_y + btn_h],
        radius=int(btn_h / 2),
        fill=(255, 255, 255, 255),
    )
    draw.text((btn_x + btn_pad_x, btn_y + btn_pad_y), cta_text, font=cta_font, fill=accent_rgb)

    final = bg.convert("RGB")
    final.save(output_path, "PNG", quality=95)
    logger.info(f"Composed fallback ad asset saved to: {output_path}")

    return output_path

