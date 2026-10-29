"""Image analysis module for extracting observable visual signals from uploaded post images."""
from __future__ import annotations

import io
import math
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
from PIL import Image, ImageOps, ImageStat

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False


def compute_aspect_ratio_label(width: int, height: int) -> str:
    """Classify aspect ratio into common Instagram formats or numeric ratio."""
    if width <= 0 or height <= 0:
        return "Unknown"
    
    ratio = width / height
    
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


def extract_dominant_colors(rgb_img: Image.Image, num_colors: int = 4) -> List[Dict[str, Any]]:
    """Extract top dominant colors with HEX code and percentage using adaptive palette quantization."""
    try:
        small = rgb_img.resize((100, 100), Image.Resampling.BOX)
        quantized = small.quantize(colors=num_colors, method=Image.Quantize.MEDIANCUT)
        palette = quantized.getpalette()[:num_colors * 3]
        counts = quantized.getcolors(maxcolors=10000) or []
        total_pixels = sum(c[0] for c in counts) or 10000

        color_results = []
        for count, idx in sorted(counts, key=lambda x: x[0], reverse=True)[:num_colors]:
            r = palette[idx * 3]
            g = palette[idx * 3 + 1]
            b = palette[idx * 3 + 2]
            hex_code = f"#{r:02x}{g:02x}{b:02x}"
            pct = round((count / total_pixels) * 100, 1)
            color_results.append({
                "hex": hex_code,
                "rgb": [int(r), int(g), int(b)],
                "percentage": pct
            })
        return color_results
    except Exception:
        return [
            {"hex": "#4A5568", "rgb": [74, 85, 104], "percentage": 50.0},
            {"hex": "#CBD5E0", "rgb": [203, 213, 224], "percentage": 50.0}
        ]


def compute_laplacian_sharpness(gray_arr: np.ndarray) -> float:
    """Compute image sharpness using Laplacian variance."""
    if CV2_AVAILABLE:
        try:
            return float(cv2.Laplacian(gray_arr.astype(np.uint8), cv2.CV_64F).var())
        except Exception:
            pass
    # Pure numpy fallback convolution with discrete 3x3 Laplacian kernel
    kernel = np.array([[0, 1, 0], [1, -4, 1], [0, 1, 0]], dtype=np.float32)
    # Fast 2D approximation using slice operations
    pad = np.pad(gray_arr, 1, mode="reflect")
    lap = (
        pad[:-2, 1:-1] + pad[2:, 1:-1] +
        pad[1:-1, :-2] + pad[1:-1, 2:] -
        4 * pad[1:-1, 1:-1]
    )
    return float(np.var(lap))


def analyze_image_bytes(image_bytes: bytes, filename: str = "image.jpg") -> Dict[str, Any]:
    """
    Extract observable visual signals and metadata from image bytes.
    Computes verifiable photometric, composition, sharpness, and color properties.
    """
    if not image_bytes:
        return {
            "available": False,
            "error": "Empty image payload",
            "signals": []
        }
    
    try:
        with Image.open(io.BytesIO(image_bytes)) as img:
            img = ImageOps.exif_transpose(img)
            
            width, height = img.size
            img_format = (img.format or filename.split(".")[-1]).upper()
            file_size_kb = round(len(image_bytes) / 1024, 1)
            aspect_ratio_str = compute_aspect_ratio_label(width, height)
            numeric_ratio = round(width / max(height, 1), 3)

            rgb_img = img.convert("RGB")
            
            # Thumbnail for fast statistical computation
            sample_w = 320
            sample_h = max(50, int(sample_w * (height / max(width, 1))))
            sample_img = rgb_img.resize((sample_w, sample_h), Image.Resampling.BILINEAR)
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

            # 4. Color Temperature / Tone
            mean_r = float(np.mean(arr[:, :, 0]))
            mean_b = float(np.mean(arr[:, :, 2]))
            if mean_r > mean_b + 18:
                tone_label = "Warm Tone"
            elif mean_b > mean_r + 18:
                tone_label = "Cool Tone"
            else:
                tone_label = "Neutral Tone"

            # 5. Visual Complexity & Edge Structure
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

            # 6. Sharpness & Blur Indicator (Laplacian Variance)
            sharpness_var = compute_laplacian_sharpness(gray_arr)
            is_sharp = sharpness_var >= 120.0
            is_blurry = sharpness_var < 50.0
            if sharpness_var >= 300:
                sharpness_label = "Crisp / High Definition"
            elif sharpness_var >= 120:
                sharpness_label = "Sharp / Standard Focus"
            elif sharpness_var >= 50:
                sharpness_label = "Moderate Focus"
            else:
                sharpness_label = "Soft / Potential Motion Blur"

            # 7. Text-like Pattern Heuristic
            text_candidate = edge_density > 22 and rms_contrast > 45
            text_detected_label = "Likely Present" if text_candidate else "Low / Minimal"

            # 8. Composition & Rule of Thirds Quadrant Balance
            h_split, w_split = sample_h // 3, sample_w // 3
            center_region = lum[h_split:h_split*2, w_split:w_split*2]
            center_lum = float(np.mean(center_region)) if center_region.size > 0 else mean_brightness
            focal_contrast = round(abs(center_lum - mean_brightness), 1)
            rule_of_thirds_balance = "Centered Focus" if focal_contrast > 15 else "Distributed Composition"

            # 9. Extract Dominant Color Palette
            dominant_palette = extract_dominant_colors(sample_img, num_colors=4)

            # 10. Quality Indicator Composite Score (0-100)
            # Normalizes contrast (ideal ~45-70), sharpness (ideal >120), exposure (ideal 30-75)
            exp_score = max(0.0, 100.0 - abs(brightness_pct - 50.0) * 1.5)
            contrast_score = min(100.0, max(20.0, rms_contrast * 1.4))
            sharpness_score = min(100.0, max(20.0, np.log1p(sharpness_var) * 16.0))
            overall_quality_score = round(0.35 * exp_score + 0.35 * contrast_score + 0.30 * sharpness_score, 1)

            # 11. Observable Signals
            detected_signals: List[str] = []
            
            if "4:5" in aspect_ratio_str or "9:16" in aspect_ratio_str:
                detected_signals.append(f"Optimal vertical framing ({aspect_ratio_str.split(' ')[0]}) for mobile feed visibility.")
            elif "1:1" in aspect_ratio_str:
                detected_signals.append("Square 1:1 format provides standard grid compatibility.")
            elif "Landscape" in aspect_ratio_str or "16:9" in aspect_ratio_str:
                detected_signals.append("Landscape orientation occupies less vertical screen area on mobile devices.")
            
            detected_signals.append(f"{brightness_label} illumination profile ({brightness_pct}% luminance).")
            detected_signals.append(f"{contrast_label} contrast with {sat_label.lower()} color saturation.")
            detected_signals.append(f"{complexity_label} composition ({tone_label.lower()}).")
            detected_signals.append(f"Focus quality: {sharpness_label} (Laplacian variance {round(sharpness_var, 1)}).")

            if text_candidate:
                detected_signals.append("High-contrast overlay patterns detected (check mobile readability).")
            if is_blurry:
                detected_signals.append("Image sharpness is relatively soft — verify clarity before publishing.")

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
                    "text_presence": text_detected_label,
                    "sharpness_var": round(sharpness_var, 1),
                    "sharpness_label": sharpness_label,
                    "is_sharp": is_sharp,
                    "is_blurry": is_blurry,
                    "overall_quality_score": overall_quality_score,
                    "focal_balance": rule_of_thirds_balance
                },
                "dominant_colors": dominant_palette,
                "signals": detected_signals
            }

    except Exception as e:
        return {
            "available": False,
            "error": f"Image processing failed: {str(e)}",
            "signals": []
        }


def analyze_carousel_images(slides_data: List[Tuple[bytes, str]]) -> Dict[str, Any]:
    """
    Analyze multiple images in an Instagram Carousel.
    Extracts per-slide dimensions, aspect ratio, visual metrics, and text presence.
    Computes cross-slide visual consistency, variety, and cover hook quality.
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
    brightness_values = []
    contrast_values = []
    sharpness_values = []

    for idx, (img_bytes, filename) in enumerate(slides_data):
        slide_res = analyze_image_bytes(img_bytes, filename=filename)
        slide_res["slide_index"] = idx + 1
        slide_res["is_first_slide"] = (idx == 0)
        slides_analysis.append(slide_res)
        
        if slide_res.get("available"):
            ar = slide_res.get("dimensions", {}).get("aspect_ratio", "Unknown")
            aspect_ratios.append(ar)
            v_metrics = slide_res.get("visual_metrics", {})
            if v_metrics.get("text_presence") == "Likely Present":
                text_count += 1
            brightness_values.append(v_metrics.get("brightness_pct", 50.0))
            contrast_values.append(v_metrics.get("rms_contrast", 40.0))
            sharpness_values.append(v_metrics.get("sharpness_var", 100.0))

    common_ar = max(set(aspect_ratios), key=aspect_ratios.count) if aspect_ratios else "4:5 (Portrait Feed)"
    
    # Cross-slide consistency metrics
    std_bright = float(np.std(brightness_values)) if brightness_values else 0.0
    consistency_label = "High Color/Exposure Consistency" if std_bright < 12.0 else "Dynamic Varied Exposure" if std_bright < 25.0 else "High Visual Discrepancy"
    
    # First slide (cover) appeal score
    cover_hook_score = 50.0
    if slides_analysis and slides_analysis[0].get("available"):
        cover_metrics = slides_analysis[0].get("visual_metrics", {})
        has_text_hook = cover_metrics.get("text_presence") == "Likely Present"
        cover_contrast = cover_metrics.get("rms_contrast", 40.0)
        cover_hook_score = round(min(100.0, 40.0 + (30.0 if has_text_hook else 10.0) + min(30.0, cover_contrast * 0.4)), 1)

    signals = [
        f"Carousel contains {len(slides_data)} slides (Instagram max is 10).",
        f"Common slide aspect ratio: {common_ar}.",
        f"Visual coherence: {consistency_label} across slides (exposure variation ±{round(std_bright, 1)}%).",
        f"Text overlay patterns detected on {text_count} of {len(slides_data)} slides.",
    ]
    if len(slides_analysis) > 0 and slides_analysis[0].get("visual_metrics", {}).get("text_presence") == "Likely Present":
        signals.append("First slide (Cover) has high-contrast text overlay patterns — optimal mobile feed thumb-stop hook.")

    return {
        "available": True,
        "media_category": "carousel",
        "slide_count": len(slides_data),
        "common_aspect_ratio": common_ar,
        "text_detected_slides": text_count,
        "visual_consistency": {
            "label": consistency_label,
            "exposure_std_dev": round(std_bright, 1),
            "cover_hook_score": cover_hook_score
        },
        "slides": slides_analysis,
        "signals": signals
    }
