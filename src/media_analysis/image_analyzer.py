"""Image analysis module for extracting observable visual signals from uploaded post images."""
from __future__ import annotations
import io
import math
from typing import Any, Dict, List, Optional
import numpy as np
from PIL import Image, ImageStat, ImageOps


def compute_aspect_ratio_label(width: int, height: int) -> str:
    """Classify aspect ratio into common Instagram formats or numeric ratio."""
    if width <= 0 or height <= 0:
        return "Unknown"
    
    ratio = width / height
    
    # Common Instagram ratios with tolerance
    if math.isclose(ratio, 1.0, abs_tol=0.06):
        return "1:1 (Square)"
    elif math.isclose(ratio, 4 / 5, abs_tol=0.06):
        return "4:5 (Portrait Feed)"
    elif math.isclose(ratio, 9 / 16, abs_tol=0.06):
        return "9:16 (Story / Vertical)"
    elif math.isclose(ratio, 1.91 / 1, abs_tol=0.1):
        return "1.91:1 (Landscape Feed)"
    elif math.isclose(ratio, 16 / 9, abs_tol=0.08):
        return "16:9 (Widescreen)"
    elif ratio < 0.8:
        return f"{ratio:.2f}:1 (Tall Vertical)"
    elif ratio > 1.2:
        return f"{ratio:.2f}:1 (Wide Landscape)"
    else:
        return f"{ratio:.2f}:1"


def analyze_image_bytes(image_bytes: bytes, filename: str = "image.jpg") -> Dict[str, Any]:
    """
    Extract observable visual signals and metadata from image bytes.
    Only computes verifiable mathematical and visual properties.
    """
    if not image_bytes:
        return {
            "available": False,
            "error": "Empty image payload",
            "signals": []
        }
    
    try:
        with Image.open(io.BytesIO(image_bytes)) as img:
            # Auto-orient based on EXIF tag if present
            img = ImageOps.exif_transpose(img)
            
            width, height = img.size
            img_format = (img.format or filename.split(".")[-1]).upper()
            file_size_kb = round(len(image_bytes) / 1024, 1)
            aspect_ratio_str = compute_aspect_ratio_label(width, height)
            numeric_ratio = round(width / max(height, 1), 3)

            # Convert to RGB for photometric analysis
            rgb_img = img.convert("RGB")
            
            # Thumbnail for fast statistical computation
            sample_size = (300, int(300 * (height / max(width, 1))))
            sample_img = rgb_img.resize((max(50, sample_size[0]), max(50, sample_size[1])), Image.Resampling.LANCZOS)
            
            # Convert to numpy array for fast statistics
            arr = np.array(sample_img, dtype=np.float32)
            
            # 1. Luminance / Brightness (ITU-R BT.601)
            lum = 0.299 * arr[:, :, 0] + 0.587 * arr[:, :, 1] + 0.114 * arr[:, :, 2]
            mean_brightness = float(np.mean(lum))
            brightness_pct = round((mean_brightness / 255.0) * 100, 1)
            
            if brightness_pct < 28:
                brightness_label = "Low / Moody"
            elif brightness_pct > 72:
                brightness_label = "High / Bright"
            else:
                brightness_label = "Balanced"

            # 2. Contrast (RMS Contrast / Standard Deviation of Luminance)
            rms_contrast = float(np.std(lum))
            if rms_contrast < 35:
                contrast_label = "Low / Soft"
            elif rms_contrast > 68:
                contrast_label = "High / Punchy"
            else:
                contrast_label = "Moderate"

            # 3. Saturation (HSV Color Space)
            hsv_img = sample_img.convert("HSV")
            hsv_arr = np.array(hsv_img, dtype=np.float32)
            sat_channel = hsv_arr[:, :, 1]
            mean_sat = float(np.mean(sat_channel))
            sat_pct = round((mean_sat / 255.0) * 100, 1)
            
            if sat_pct < 22:
                sat_label = "Muted / Neutral"
            elif sat_pct > 65:
                sat_label = "Vibrant / Saturated"
            else:
                sat_label = "Balanced"

            # 4. Color Temperature / Palette Tone
            mean_r = float(np.mean(arr[:, :, 0]))
            mean_b = float(np.mean(arr[:, :, 2]))
            if mean_r > mean_b + 18:
                tone_label = "Warm Tone"
            elif mean_b > mean_r + 18:
                tone_label = "Cool Tone"
            else:
                tone_label = "Neutral Tone"

            # 5. Visual Complexity & Edge Structure (Sobel/Gradient Proxy)
            gray_arr = lum
            grad_x = np.diff(gray_arr, axis=1)
            grad_y = np.diff(gray_arr, axis=0)
            grad_magnitude = np.sqrt(grad_x[:-1, :] ** 2 + grad_y[:, :-1] ** 2)
            edge_density = float(np.mean(grad_magnitude))
            
            if edge_density < 14:
                complexity_label = "Clean / Minimalist"
            elif edge_density > 34:
                complexity_label = "High / Detailed"
            else:
                complexity_label = "Moderate"

            # 6. Text-like Pattern Heuristic (High-frequency horizontal variance clusters)
            text_candidate = edge_density > 22 and rms_contrast > 45
            text_detected_label = "Likely Present" if text_candidate else "Low / Minimal"

            # 7. Collect Observable Signals
            detected_signals: List[str] = []
            
            # Aspect ratio signals
            if "4:5" in aspect_ratio_str or "9:16" in aspect_ratio_str:
                detected_signals.append(f"Optimal vertical framing ({aspect_ratio_str.split(' ')[0]}) for mobile feed visibility.")
            elif "1:1" in aspect_ratio_str:
                detected_signals.append("Square 1:1 format provides standard grid compatibility.")
            elif "Landscape" in aspect_ratio_str or "16:9" in aspect_ratio_str:
                detected_signals.append("Landscape orientation occupies less vertical screen area on mobile devices.")
            
            # Exposure signals
            detected_signals.append(f"{brightness_label} illumination profile ({brightness_pct}% luminance).")
            detected_signals.append(f"{contrast_label} contrast with {sat_label.lower()} color saturation.")
            detected_signals.append(f"{complexity_label} composition ({tone_label.lower()}).")

            if text_candidate:
                detected_signals.append("High-contrast overlay patterns detected (check mobile readability).")

            return {
                "available": True,
                "media_category": "image",
                "filename": filename,
                "file_size_kb": file_size_kb,
                "format": img_format,
                "dimensions": {
                    "width": width,
                    "height": height,
                    "aspect_ratio": aspect_ratio_str,
                    "numeric_ratio": numeric_ratio
                },
                "visual_metrics": {
                    "brightness_pct": brightness_pct,
                    "brightness_label": brightness_label,
                    "contrast_label": contrast_label,
                    "rms_contrast": round(rms_contrast, 1),
                    "saturation_pct": sat_pct,
                    "saturation_label": sat_label,
                    "color_tone": tone_label,
                    "visual_complexity": complexity_label,
                    "text_presence": text_detected_label
                },
                "signals": detected_signals
            }

    except Exception as e:
        return {
            "available": False,
            "error": f"Image processing failed: {str(e)}",
            "signals": []
        }


def analyze_carousel_images(slides_data: List[tuple[bytes, str]]) -> Dict[str, Any]:
    """
    Analyze multiple images in an Instagram Carousel.
    Extracts per-slide dimensions, aspect ratio, visual metrics, and text presence.
    Generates a structured Carousel summary.
    """
    if not slides_data:
        return {
            "available": False,
            "media_category": "carousel",
            "slide_count": 0,
            "error": "No carousel slides provided.",
            "signals": []
        }

    slides_analysis = []
    text_count = 0
    aspect_ratios = []

    for idx, (img_bytes, filename) in enumerate(slides_data):
        slide_res = analyze_image_bytes(img_bytes, filename=filename)
        slide_res["slide_index"] = idx + 1
        slide_res["is_first_slide"] = (idx == 0)
        slides_analysis.append(slide_res)
        
        if slide_res.get("available"):
            ar = slide_res.get("dimensions", {}).get("aspect_ratio", "Unknown")
            aspect_ratios.append(ar)
            if slide_res.get("visual_metrics", {}).get("text_presence") == "Likely Present":
                text_count += 1

    common_ar = max(set(aspect_ratios), key=aspect_ratios.count) if aspect_ratios else "4:5 (Portrait Feed)"
    
    signals = [
        f"Carousel contains {len(slides_data)} slides (Instagram max is 10).",
        f"Common slide aspect ratio: {common_ar}.",
        f"Text overlay patterns detected on {text_count} of {len(slides_data)} slides.",
    ]
    if len(slides_analysis) > 0 and slides_analysis[0].get("visual_metrics", {}).get("text_presence") == "Likely Present":
        signals.append("First slide (Cover) has high-contrast text overlay patterns — check mobile feed thumb-stop readability.")

    return {
        "available": True,
        "media_category": "carousel",
        "slide_count": len(slides_data),
        "common_aspect_ratio": common_ar,
        "text_detected_slides": text_count,
        "slides": slides_analysis,
        "signals": signals
    }

