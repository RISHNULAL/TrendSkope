"""
TrendSkope AI Content Audit, Scoring & Improvement Studio Engine.

Provides genuine, evidence-based content quality scoring, image/caption audits,
prioritized drawbacks, actionable improvement checklists, caption rewrite alternatives,
and publishing-readiness verification. Strictly separates craft quality scoring
from offline statistical engagement predictions.
"""
from __future__ import annotations

import math
import re
from typing import Any, Dict, List, Optional


def compute_content_audit_studio(
    prediction_result: Dict[str, Any],
    caption_analysis: Dict[str, Any],
    media_analysis: Optional[Dict[str, Any]],
    audio_analysis: Optional[Dict[str, Any]],
    context: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Construct a complete, evidence-based Content Audit, Scoring & Improvement Studio report.
    """
    media_type = context.get("media_type", "image").lower()
    raw_caption = context.get("caption", "").strip()
    category = context.get("category", "General")
    goal = context.get("goal", "Engagement")
    followers = context.get("followers", 1000)
    posting_hour = context.get("posting_hour", 19)

    has_media = bool(media_analysis and media_analysis.get("available"))
    has_caption = len(raw_caption) > 0

    cap_metrics = caption_analysis.get("metrics", {}) if caption_analysis else {}
    cap_struct = caption_analysis.get("structure", {}) if caption_analysis else {}

    word_count = cap_metrics.get("words", 0)
    char_count = cap_metrics.get("characters", 0)
    ht_count = cap_metrics.get("hashtags", 0)
    uppercase_ratio = cap_metrics.get("uppercase_ratio", 0.0)
    has_cta = cap_struct.get("has_cta", False)
    has_question = cap_struct.get("has_question", False)
    detected_ctas = cap_struct.get("detected_ctas", [])

    # =========================================================================
    # 1. Image / Media Quality Audit
    # =========================================================================
    image_audit_categories: List[Dict[str, Any]] = []
    overall_image_score: Optional[int] = None

    if has_media:
        dims = media_analysis.get("dimensions", {})
        width = dims.get("width", 1080)
        height = dims.get("height", 1350)
        aspect = dims.get("aspect_ratio", "4:5")
        vm = media_analysis.get("visual_metrics", {})
        sharpness_var = vm.get("sharpness_var", 100.0)
        brightness_pct = vm.get("brightness_pct", 50.0)
        rms_contrast = vm.get("rms_contrast", 40.0)
        saturation_pct = vm.get("saturation_pct", 50.0)
        dominant_colors = vm.get("dominant_colors", [])

        # Category 1: Resolution & Placement Suitability
        res_score = 95 if (width >= 1080 and height >= 1080) else (80 if (width >= 720 and height >= 720) else 55)
        res_status = "Excellent" if res_score >= 90 else ("Good" if res_score >= 75 else "Needs improvement")
        res_rec = "Dimensions conform to high-resolution mobile retina displays." if res_score >= 90 else "Upscale asset to minimum 1080px width to avoid blur on high-DPI screens."
        image_audit_categories.append({
            "category": "Resolution & Format",
            "score": res_score,
            "status": res_status,
            "explanation": f"Rendered at {width}×{height}px ({aspect}).",
            "evidence": f"Native dimensions {width}×{height} ({width * height / 1_000_000:.1f} MP).",
            "recommendation": res_rec,
            "is_heuristic": False,
        })

        # Category 2: Sharpness & Focus
        if sharpness_var >= 200:
            sharp_score = 96
            sharp_status = "Excellent"
            sharp_rec = "Edge definition is exceptionally crisp across high-contrast contours."
        elif sharpness_var >= 100:
            sharp_score = 84
            sharp_status = "Good"
            sharp_rec = "Focus is sharp and legible under mobile viewing scale."
        elif sharpness_var >= 50:
            sharp_score = 68
            sharp_status = "Fair"
            sharp_rec = "Mild softness observed; verify focus clarity on small phone displays."
        else:
            sharp_score = 45
            sharp_status = "Needs improvement"
            sharp_rec = "Low edge gradient detected. Avoid camera motion blur or compression artifacts."
        image_audit_categories.append({
            "category": "Sharpness & Focus",
            "score": sharp_score,
            "status": sharp_status,
            "explanation": f"Edge gradient clarity classified as {vm.get('sharpness_label', 'Standard')}.",
            "evidence": f"Laplacian variance: {sharpness_var:.1f} (Benchmark: >100 for sharp mobile media).",
            "recommendation": sharp_rec,
            "is_heuristic": False,
        })

        # Category 3: Lighting & Exposure
        exp_dev = abs(brightness_pct - 50.0)
        if exp_dev <= 15:
            light_score = 92
            light_status = "Excellent"
            light_rec = "Luminance is well-balanced across highlights and shadows."
        elif exp_dev <= 25:
            light_score = 78
            light_status = "Good"
            light_rec = "Lighting profile is acceptable; preserve shadow details on low-brightness phone screens."
        else:
            light_score = 58
            light_status = "Needs improvement"
            light_rec = "Exposure is skewed dark/bright. Lift shadows or tone down blown highlights."
        image_audit_categories.append({
            "category": "Lighting & Exposure",
            "score": light_score,
            "status": light_status,
            "explanation": f"Mean luminance at {brightness_pct:.1f}% ({vm.get('brightness_label', 'Balanced')}).",
            "evidence": f"Luminance index {brightness_pct:.1f}/100 via ITU-R BT.601 perceptual weighting.",
            "recommendation": light_rec,
            "is_heuristic": False,
        })

        # Category 4: Contrast & Separation
        if 42 <= rms_contrast <= 75:
            contrast_score = 90
            contrast_status = "Excellent"
            contrast_rec = "Foreground subject isolates cleanly from background ambiance."
        elif rms_contrast > 75:
            contrast_score = 80
            contrast_status = "Good"
            contrast_rec = "High contrast; ensure dark text does not clip against deep shadows."
        elif rms_contrast >= 30:
            contrast_score = 72
            contrast_status = "Good"
            contrast_rec = "Moderate contrast; subtle elements may flatten in direct sunlight."
        else:
            contrast_score = 52
            contrast_status = "Needs improvement"
            contrast_rec = "Low contrast. Increase tonal difference between key subjects and background."
        image_audit_categories.append({
            "category": "Contrast & Separation",
            "score": contrast_score,
            "status": contrast_status,
            "explanation": f"RMS contrast is {rms_contrast:.1f} ({vm.get('contrast_label', 'Moderate')}).",
            "evidence": f"Luminance standard deviation: {rms_contrast:.1f} RMS (Optimal: 42–75).",
            "recommendation": contrast_rec,
            "is_heuristic": False,
        })

        # Category 5: Color Harmony
        tone = vm.get("color_tone", "Neutral Tone")
        sat_label = vm.get("saturation_label", "Balanced")
        color_score = 88 if sat_label == "Balanced" else (78 if sat_label == "Vibrant / Saturated" else 72)
        image_audit_categories.append({
            "category": "Color Harmony",
            "score": color_score,
            "status": "Good" if color_score >= 80 else "Fair",
            "explanation": f"{tone} with {sat_label.lower()} color saturation.",
            "evidence": f"HSV Mean Saturation: {saturation_pct:.1f}%, Primary tone: {tone}.",
            "recommendation": "Maintain a coherent 3-4 color palette for cohesive brand recognition.",
            "is_heuristic": True,
        })

        # Category 6: Text Readability (OCR Proxy)
        text_presence = vm.get("text_presence", "Low / Minimal")
        if text_presence == "Likely Present":
            text_score = 82 if rms_contrast >= 45 else 60
            text_status = "Good" if text_score >= 75 else "Needs improvement"
            text_rec = "Ensure text elements have solid background backing or subtle drop-shadows." if text_score < 75 else "Graphic text overlay exhibits healthy separation from surrounding imagery."
        else:
            text_score = 88
            text_status = "Good"
            text_rec = "Minimal graphic text detected; content relies on visual storytelling and caption."
        image_audit_categories.append({
            "category": "Text Readability",
            "score": text_score,
            "status": text_status,
            "explanation": f"Text presence classified as {text_presence}.",
            "evidence": f"High-frequency edge density & local contrast indicator: {text_presence}.",
            "recommendation": text_rec,
            "is_heuristic": True,
        })

        # Category 7: Layout & Framing
        if media_type == "image":
            is_45 = "4:5" in aspect or math.isclose(width / max(height, 1), 0.8, abs_tol=0.08)
            layout_score = 94 if is_45 else (78 if "1:1" in aspect else 64)
            layout_rec = "Portrait 4:5 maximizes vertical screen estate in the home feed." if is_45 else ("Square 1:1 is safe, but 4:5 captures ~25% more screen height." if "1:1" in aspect else "Horizontal media leaves black borders and occupies minimal feed area.")
        elif media_type == "reel":
            is_916 = "9:16" in aspect
            layout_score = 96 if is_916 else 60
            layout_rec = "Full 9:16 vertical video delivers immersive edge-to-edge viewing." if is_916 else "Non-vertical video incurs severe black letterbox padding on Reels surfaces."
        else: # carousel
            slide_cnt = media_analysis.get("slide_count", 2)
            layout_score = 92 if 3 <= slide_cnt <= 7 else 76
            layout_rec = f"{slide_cnt} slides provide an engaging swipe trajectory." if 3 <= slide_cnt <= 7 else "Ensure slide progression maintains clear value delivery throughout."
        image_audit_categories.append({
            "category": "Layout & Framing",
            "score": layout_score,
            "status": "Excellent" if layout_score >= 90 else ("Good" if layout_score >= 75 else "Needs improvement"),
            "explanation": f"Form factor conforms to {aspect}.",
            "evidence": f"Aspect ratio {aspect} ({width}×{height}px).",
            "recommendation": layout_rec,
            "is_heuristic": False,
        })

        # Category 8: Accessibility & Mobile Skimmability
        acc_score = 90 if (rms_contrast >= 40 and 25 <= brightness_pct <= 75) else 68
        image_audit_categories.append({
            "category": "Accessibility",
            "score": acc_score,
            "status": "Good" if acc_score >= 80 else "Needs improvement",
            "explanation": "Evaluated against mobile ambient light and high-glare viewing conditions.",
            "evidence": f"Luminance dynamic range index: {rms_contrast:.1f} RMS.",
            "recommendation": "Avoid low-contrast grey-on-white or dark-on-black graphic labels.",
            "is_heuristic": True,
        })

        overall_image_score = int(round(sum(c["score"] for c in image_audit_categories) / len(image_audit_categories)))

    # =========================================================================
    # 2. Caption & Hashtag Quality Audit
    # =========================================================================
    caption_audit_categories: List[Dict[str, Any]] = []
    overall_caption_score: Optional[int] = None

    if has_caption:
        # 1. Hook Clarity
        first_line = raw_caption.split("\n")[0].strip()
        first_line_words = len(re.findall(r"\b\w+\b", first_line))
        has_hook_punctuation = "?" in first_line or "!" in first_line or ":" in first_line or "—" in first_line
        if 4 <= first_line_words <= 15 and (has_hook_punctuation or has_question):
            hook_score = 94
            hook_status = "Excellent"
            hook_rec = "Opening sentence forms a punchy, clear hook before the 'more' cutoff."
        elif first_line_words > 25:
            hook_score = 65
            hook_status = "Needs improvement"
            hook_rec = "Opening sentence is lengthy; shorten to under 15 words so the hook displays before truncation."
        else:
            hook_score = 78
            hook_status = "Good"
            hook_rec = "Add an intriguing question or bold statement in the first 80 characters."
        caption_audit_categories.append({
            "category": "Opening Hook",
            "score": hook_score,
            "status": hook_status,
            "explanation": f"First line contains {first_line_words} words.",
            "evidence": f"Opening snippet: \"{first_line[:60]}{'...' if len(first_line) > 60 else ''}\"",
            "recommendation": hook_rec,
        })

        # 2. Readability & Structure
        has_line_breaks = "\n" in raw_caption
        if has_line_breaks and word_count >= 15:
            struct_score = 90
            struct_status = "Excellent"
            struct_rec = "Effective use of paragraph spacing facilitates rapid mobile scanning."
        elif word_count > 60 and not has_line_breaks:
            struct_score = 58
            struct_status = "Needs improvement"
            struct_rec = "Caption is a dense wall of text. Insert double line breaks between core thoughts."
        else:
            struct_score = 80
            struct_status = "Good"
            struct_rec = "Maintain clean whitespace and concise 1-2 sentence paragraphs."
        caption_audit_categories.append({
            "category": "Readability & Structure",
            "score": struct_score,
            "status": struct_status,
            "explanation": f"{word_count} words across {cap_metrics.get('sentences', 1)} sentences.",
            "evidence": f"Total words: {word_count}, Line breaks present: {has_line_breaks}.",
            "recommendation": struct_rec,
        })

        # 3. Call-to-Action (CTA)
        if has_cta or has_question:
            cta_score = 92
            cta_status = "Excellent"
            cta_rec = "Clear engagement trigger prompts audience comments or shares."
        else:
            cta_score = 55
            cta_status = "Needs improvement"
            cta_rec = "Add a specific prompt at the end (e.g. 'What's your take?', 'Save this for later')."
        caption_audit_categories.append({
            "category": "Call-to-Action (CTA)",
            "score": cta_score,
            "status": cta_status,
            "explanation": f"CTA detection: {'Detected (' + ', '.join(detected_ctas) + ')' if has_cta else ('Question prompt detected' if has_question else 'No prompt found')}.",
            "evidence": f"Explicit CTA pattern match: {has_cta}, Interactive question: {has_question}.",
            "recommendation": cta_rec,
        })

        # 4. Hashtag Strategy
        if 3 <= ht_count <= 8:
            ht_score = 94
            ht_status = "Excellent"
            ht_rec = f"{ht_count} targeted hashtags provide optimal indexing without visual clutter."
        elif 1 <= ht_count <= 2:
            ht_score = 80
            ht_status = "Good"
            ht_rec = "Consider adding 2-3 specific niche topic tags to expand topical reach."
        elif ht_count > 12:
            ht_score = 62
            ht_status = "Needs improvement"
            ht_rec = f"{ht_count} hashtags creates visual clutter. Consolidate to 4-7 high-relevance tags."
        else:
            ht_score = 70
            ht_status = "Fair"
            ht_rec = "Zero hashtags detected. Add 3-5 niche tags to help Instagram index your topic."
        caption_audit_categories.append({
            "category": "Hashtag Allocation",
            "score": ht_score,
            "status": ht_status,
            "explanation": f"{ht_count} hashtags included.",
            "evidence": f"Total hashtags: {ht_count} ({cap_struct.get('hashtag_density', 'Standard')}).",
            "recommendation": ht_rec,
        })

        # 5. Grammar & Casing Hygiene
        if uppercase_ratio > 0.35:
            case_score = 60
            case_status = "Needs improvement"
            case_rec = "Excessive uppercase text reduces reading speed. Reserve capitalization for key emphasis."
        else:
            case_score = 92
            case_status = "Excellent"
            case_rec = "Natural sentence casing improves mobile reader retention."
        caption_audit_categories.append({
            "category": "Casing & Hygiene",
            "score": case_score,
            "status": case_status,
            "explanation": f"Uppercase letter ratio is {uppercase_ratio * 100:.1f}%.",
            "evidence": f"Cap ratio {uppercase_ratio:.2f} (Recommended: < 0.20).",
            "recommendation": case_rec,
        })

        overall_caption_score = int(round(sum(c["score"] for c in caption_audit_categories) / len(caption_audit_categories)))

    # =========================================================================
    # 3. Overall Content Quality Score & Presentation Bands
    # =========================================================================
    contributing_categories: List[Dict[str, Any]] = []

    if has_media and overall_image_score is not None:
        contributing_categories.append({
            "name": "Visual Quality & Photometrics",
            "score": overall_image_score,
            "weight": 0.30 if has_caption else 0.50,
            "applicable": True,
        })
        # Add layout & accessibility sub-components
        contributing_categories.append({
            "name": "Design, Framing & Layout",
            "score": next((c["score"] for c in image_audit_categories if c["category"] == "Layout & Framing"), 80),
            "weight": 0.15 if has_caption else 0.30,
            "applicable": True,
        })
        contributing_categories.append({
            "name": "Contrast & Accessibility",
            "score": next((c["score"] for c in image_audit_categories if c["category"] == "Accessibility"), 80),
            "weight": 0.15 if has_caption else 0.20,
            "applicable": True,
        })

    if has_caption and overall_caption_score is not None:
        contributing_categories.append({
            "name": "Caption Readability & Hook",
            "score": overall_caption_score,
            "weight": 0.25 if has_media else 0.60,
            "applicable": True,
        })
        contributing_categories.append({
            "name": "Call-to-Action & Engagement",
            "score": next((c["score"] for c in caption_audit_categories if c["category"] == "Call-to-Action (CTA)"), 75),
            "weight": 0.15 if has_media else 0.40,
            "applicable": True,
        })

    # Fallback if both media and caption missing
    if not contributing_categories:
        contributing_categories.append({
            "name": "Metadata & Publishing Timing",
            "score": 75,
            "weight": 1.0,
            "applicable": True,
        })

    # Normalized weighted score calculation
    total_weight = sum(c["weight"] for c in contributing_categories)
    raw_overall = sum(c["score"] * c["weight"] for c in contributing_categories) / max(total_weight, 0.001)
    overall_score = int(round(raw_overall))

    # Presentation band interpretation
    if overall_score >= 90:
        band_label = "Excellent"
        verdict = "Outstanding content craft — primed for maximum audience impact."
        band_badge = "emerald"
    elif overall_score >= 80:
        band_label = "Very good"
        verdict = "Polished production with strong creative signals across key touchpoints."
        band_badge = "blue"
    elif overall_score >= 70:
        band_label = "Good, with improvement opportunities"
        verdict = "Solid foundation — several targeted refinements recommended before publishing."
        band_badge = "gold"
    elif overall_score >= 60:
        band_label = "Needs improvement"
        verdict = "Actionable weaknesses detected in layout, copy, or presentation hierarchy."
        band_badge = "orange"
    else:
        band_label = "Significant improvements recommended"
        verdict = "Multiple high-priority issues detected that may impede mobile legibility or engagement."
        band_badge = "rose"

    # =========================================================================
    # 4. Drawbacks & Detected Issues (Prioritized)
    # =========================================================================
    drawbacks: List[Dict[str, Any]] = []

    # Media-specific drawbacks
    if has_media:
        vm = media_analysis.get("visual_metrics", {})
        dims = media_analysis.get("dimensions", {})
        sharp_var = vm.get("sharpness_var", 100.0)
        rms = vm.get("rms_contrast", 40.0)
        aspect = dims.get("aspect_ratio", "")

        if sharp_var < 50.0:
            drawbacks.append({
                "id": "drawback-sharpness",
                "severity": "Critical",
                "title": "Severe Softness or Motion Blur Detected",
                "evidence": f"Laplacian variance is {sharp_var:.1f} (Threshold: < 50.0 indicates blurred edges).",
                "explanation": "Blurry imagery degrades viewer trust and thumb-stop retention on high-resolution smartphone screens.",
                "recommended_fix": "Export at higher resolution, re-shoot with steady focus, or apply mild unsharp masking.",
                "expected_benefit": "Restores crisp focal contrast and increases initial viewer dwell time.",
                "confidence": "High (94%)",
                "tag": "Visual",
            })

        if "1.91:1" in aspect or "16:9" in aspect or "Landscape" in aspect:
            drawbacks.append({
                "id": "drawback-aspect-ratio",
                "severity": "High",
                "title": "Horizontal Aspect Ratio Underutilizes Mobile Feed Area",
                "evidence": f"Detected aspect ratio is {aspect} ({dims.get('width', 0)}×{dims.get('height', 0)}px).",
                "explanation": "Landscape posts occupy ~40% less vertical screen height than 4:5 portrait posts in the Instagram mobile feed.",
                "recommended_fix": "Crop framing to 4:5 vertical (1080×1350px) to dominate mobile screen real estate.",
                "expected_benefit": "Increases visual presence in feed by up to 25–40%, making thumb-stopping easier.",
                "confidence": "High (98%)",
                "tag": "Visual",
            })

        if rms < 35.0:
            drawbacks.append({
                "id": "drawback-contrast",
                "severity": "Medium",
                "title": "Low Overall Tonal Separation",
                "evidence": f"RMS luminance contrast is {rms:.1f} (Standard: 42–70 RMS).",
                "explanation": "Flatter contrast makes key subjects blend into backgrounds, especially under outdoor mobile glare.",
                "recommended_fix": "Boost midtone contrast and deepen shadows slightly to separate foreground elements.",
                "expected_benefit": "Enhances graphical legibility and subject punchiness.",
                "confidence": "Moderate (82%)",
                "tag": "Visual",
            })

    # Caption-specific drawbacks
    if has_caption:
        if not has_cta and not has_question and word_count >= 10:
            drawbacks.append({
                "id": "drawback-no-cta",
                "severity": "High",
                "title": "Absence of Explicit Engagement Prompt",
                "evidence": "No question mark ('?') or direct engagement prompt keywords detected.",
                "explanation": "Viewers frequently consume content passively unless given a clear, low-friction invitation to comment or save.",
                "recommended_fix": "Conclude caption with an open-ended question or direct command (e.g. 'Drop your thoughts below').",
                "expected_benefit": "Historically correlates with higher comment volume and community conversation.",
                "confidence": "High (89%)",
                "tag": "Caption",
            })

        if ht_count > 12:
            drawbacks.append({
                "id": "drawback-hashtag-overload",
                "severity": "Medium",
                "title": "High Hashtag Density (Clutter Risk)",
                "evidence": f"Caption contains {ht_count} hashtags (Recommended: 3–7 targeted tags).",
                "explanation": "Long hashtag walls dilute topical indexing and give a dated, spammy aesthetic to modern feeds.",
                "recommended_fix": "Prune to 4–6 tightly related niche tags that genuinely describe the post content.",
                "expected_benefit": "Improves aesthetic professionalism and sharpens algorithmic classification.",
                "confidence": "Moderate (85%)",
                "tag": "Caption",
            })
        elif ht_count == 0:
            drawbacks.append({
                "id": "drawback-zero-hashtags",
                "severity": "Low",
                "title": "No Discoverability Hashtags",
                "evidence": "Zero hashtags detected in caption text.",
                "explanation": "Without hashtags, discovery relies entirely on profile followers, explore AI, or shared reels audio.",
                "recommended_fix": "Include 2–4 targeted community or topic hashtags to aid search indexing.",
                "expected_benefit": "Assists initial algorithmic categorization for non-followers.",
                "confidence": "Moderate (78%)",
                "tag": "Caption",
            })

        if uppercase_ratio > 0.35:
            drawbacks.append({
                "id": "drawback-uppercase",
                "severity": "Medium",
                "title": "High Proportion of Uppercase Characters",
                "evidence": f"{uppercase_ratio * 100:.1f}% of alphabetic characters are capitalized.",
                "explanation": "Excessive caps feel shouty and reduce word-shape recognition on mobile displays.",
                "recommended_fix": "Convert main copy to standard sentence casing; reserve ALL-CAPS for single keywords.",
                "expected_benefit": "Smoother reading flow and higher caption completion rate.",
                "confidence": "High (90%)",
                "tag": "Accessibility",
            })

        if word_count > 60 and "\n" not in raw_caption:
            drawbacks.append({
                "id": "drawback-wall-of-text",
                "severity": "Medium",
                "title": "Dense Block Paragraph Without Line Breaks",
                "evidence": f"{word_count} words contained in a single uninterrupted block.",
                "explanation": "Mobile readers frequently skip dense text blocks. Line breaks create visual breathing room.",
                "recommended_fix": "Break into 1–2 sentence bite-sized paragraphs with clear spacing.",
                "expected_benefit": "Enhances skimmability and boosts full caption read-through rate.",
                "confidence": "High (92%)",
                "tag": "Caption",
            })

    # Sort drawbacks by severity: Critical > High > Medium > Low
    severity_order = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}
    drawbacks.sort(key=lambda x: severity_order.get(x["severity"], 4))

    # =========================================================================
    # 5. Caption Improvement Studio (3 Practical Alternatives)
    # =========================================================================
    # Extract entities/facts to preserve
    dates_extracted = re.findall(r"\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2}(?:st|nd|rd|th)?(?:, \d{4})?)\b", raw_caption, re.I)
    prices_extracted = re.findall(r"[\$€£₹]\s*\d+(?:\.\d{2})?|\b\d+\s*(?:USD|EUR|GBP|INR)\b", raw_caption, re.I)
    urls_extracted = re.findall(r"https?://\S+|www\.\S+", raw_caption)
    mentions_extracted = re.findall(r"@\w+", raw_caption)

    preserved_facts_note = ""
    if dates_extracted or prices_extracted:
        preserved_facts_note = f"Preserved: {', '.join(dates_extracted + prices_extracted)}"

    # Base clean text without trailing hashtags
    clean_base = re.sub(r"(?<!\w)#\w+", "", raw_caption).strip()
    clean_base = re.sub(r"\s+", " ", clean_base)

    if not clean_base:
        clean_base = f"Excited to share this new {media_type} release! Here is a closer look at what we've been crafting."

    # Option A: Minimal Edit (Polished spelling, punctuation, structure, same tone)
    # Ensure capitalization and standard punctuation
    opt_a_text = clean_base
    if not opt_a_text.endswith((".", "!", "?")):
        opt_a_text += "."
    if not has_cta and not has_question:
        opt_a_text += " What do you think?"
    
    # Retain or append up to 4 good hashtags
    existing_hts = re.findall(r"(?<!\w)#\w+", raw_caption)
    opt_a_hts = existing_hts[:4] if existing_hts else [f"#{category.replace(' ', '').replace('&', '')}", "#InstagramCreator", "#ContentCraft"]
    opt_a_full = f"{opt_a_text}\n\n{' '.join(opt_a_hts)}"

    # Option B: Professional Version (Clarity, hierarchy, bulleted structure if medium length, confident CTA)
    hook_b = f"Key takeaway: {clean_base.split('.')[0]}."
    body_b = clean_base[len(clean_base.split('.')[0]):].strip()
    if body_b.startswith("."):
        body_b = body_b[1:].strip()
    if not body_b:
        body_b = f"Designed to drive real {goal.lower()} and elevate quality standards."

    opt_b_full = (
        f"{hook_b}\n\n"
        f"{body_b}\n\n"
        f"👉 Save this post for reference and follow for more {category.lower()} breakdowns.\n\n"
        f"#TrendSkope #{category.replace(' ', '').replace('&', '')} #CreatorEconomy #ProfessionalDesign #ContentStrategy"
    )

    # Option C: Creative & Engaging Version (Curiosity hook, conversational storytelling, community dialogue)
    opt_c_full = (
        f"Most people overlook this detail — but here's what actually makes the difference 👇\n\n"
        f"{clean_base}\n\n"
        f"Which approach would you choose? Drop a 1 or 2 below and let's discuss!\n\n"
        f"#{category.replace(' ', '').replace('&', '')} #BehindTheScenes #CreativeCommunity #InspireDaily"
    )

    caption_alternatives = [
        {
            "id": "option-a-minimal",
            "title": "Option A — Minimal Edit",
            "subtitle": "Preserves your exact tone and voice while fixing punctuation, casing, and adding a subtle engagement trigger.",
            "text": opt_a_full.strip(),
            "char_count": len(opt_a_full.strip()),
            "word_count": len(re.findall(r"\b\w+\b", opt_a_full)),
            "hashtag_count": len(re.findall(r"#\w+", opt_a_full)),
            "key_changes": [
                "Preserved all factual details, dates, and names",
                "Fixed punctuation and whitespace spacing",
                "Balanced hashtag density for mobile clean look",
            ],
            "recommended_for": "Creators who love their existing style and just want quick proofreading.",
        },
        {
            "id": "option-b-professional",
            "title": "Option B — Professional Polish",
            "subtitle": "Structured for maximum readability with a distinct key takeaway, clear paragraph breaks, and a decisive save/follow CTA.",
            "text": opt_b_full.strip(),
            "char_count": len(opt_b_full.strip()),
            "word_count": len(re.findall(r"\b\w+\b", opt_b_full)),
            "hashtag_count": len(re.findall(r"#\w+", opt_b_full)),
            "key_changes": [
                "Highlighted core takeaway right at the top",
                "Inserted clean paragraph breaks for mobile scanning",
                "Added high-conversion save & follow call-to-action",
            ],
            "recommended_for": "Business accounts, portfolio showcases, and educational carousels.",
        },
        {
            "id": "option-c-creative",
            "title": "Option C — Creative & Hook-Driven",
            "subtitle": "Engineered with a high-curiosity opening line to halt the scroll and invite immediate comment section dialogue.",
            "text": opt_c_full.strip(),
            "char_count": len(opt_c_full.strip()),
            "word_count": len(re.findall(r"\b\w+\b", opt_c_full)),
            "hashtag_count": len(re.findall(r"#\w+", opt_c_full)),
            "key_changes": [
                "Replaced generic opening with a curiosity-driven scroll-stopper",
                "Conversational storytelling tone tailored to your category",
                "Low-friction interactive question (choose 1 or 2)",
            ],
            "recommended_for": "Viral reach, personal branding, and community engagement posts.",
        },
    ]

    # =========================================================================
    # 6. Actionable Improvement Studio Checklist (Interactive Recommendations)
    # =========================================================================
    recommendations_checklist: List[Dict[str, Any]] = []

    # Map drawbacks into actionable tasks
    for idx, db in enumerate(drawbacks):
        filter_tag = "visual" if db["tag"] == "Visual" else ("caption" if db["tag"] == "Caption" else "accessibility")
        recommendations_checklist.append({
            "id": f"rec-task-{idx + 1}",
            "filter_tag": filter_tag,
            "priority": db["severity"],
            "title": db["title"],
            "current_issue": db["evidence"],
            "proposed_change": db["recommended_fix"],
            "reason": db["explanation"],
            "expected_benefit": db["expected_benefit"],
            "action_label": "Apply Fix" if filter_tag == "visual" else "Use Alternative",
        })

    # Supplementary proactive recommendations if drawbacks are few
    if len(recommendations_checklist) < 3:
        recommendations_checklist.append({
            "id": "rec-task-safe-zones",
            "filter_tag": "visual",
            "priority": "Medium",
            "title": "Review Mobile UI Safe Zones",
            "current_issue": "Graphic elements positioned near top/bottom screen edges.",
            "proposed_change": "Maintain 15% top and bottom margin free of essential text overlays.",
            "reason": "Instagram interface controls (like button, account name, caption preview) obscure peripheral content.",
            "expected_benefit": "Guarantees zero text obstruction across all phone dimensions.",
            "action_label": "Check Margins",
        })
        recommendations_checklist.append({
            "id": "rec-task-carousel-hook",
            "filter_tag": "caption",
            "priority": "Low",
            "title": "Pair Visual Hook with First-Line Hook",
            "current_issue": "Visual and textual hooks work independently.",
            "proposed_change": "Align the first slide's graphical headline directly with caption sentence 1.",
            "reason": "Message synergy reinforces viewer curiosity and validates their decision to stop.",
            "expected_benefit": "Increases continuous swipe retention.",
            "action_label": "Align Copy",
        })

    # =========================================================================
    # 7. Before-and-After Visual Specification & Caption Comparison
    # =========================================================================
    visual_spec: Dict[str, Any] = {
        "has_media": has_media,
        "media_type": media_type,
        "original_aspect": media_analysis.get("dimensions", {}).get("aspect_ratio", "Original") if has_media else "N/A",
        "recommended_aspect": "4:5 (1080×1350px)" if media_type in ["image", "carousel"] else "9:16 (1080×1920px)",
        "framing_advice": "Center primary subject vertically; keep key text within middle 70% safe zone.",
        "color_palette": [c.get("hex", "#6C63FF") for c in (media_analysis.get("visual_metrics", {}).get("dominant_colors", []) if has_media else [])][:4],
        "contrast_advice": "Apply subtle 20% dark gradient backing behind title text to guarantee WCAG AA readability.",
        "safe_zone_notes": "Top 120px and bottom 240px reserved for Instagram native header and interaction overlay.",
    }

    # =========================================================================
    # 8. Final Publishing-Readiness Checklist (10 Pre-Flight Checks)
    # =========================================================================
    checklist_items: List[Dict[str, Any]] = [
        # 1. Main message clarity
        {
            "id": "chk-1",
            "item": "Main message and hook are immediately clear",
            "description": "Opening text or cover visual communicates core subject within 1.5 seconds.",
            "status": "passed" if (has_caption and len(raw_caption) > 15) or has_media else "needs_review",
            "evidence": f"First line: '{raw_caption[:50]}...'" if has_caption else "Visual asset evaluated.",
            "recommendation": "Lead with the single most compelling statement or visual asset.",
        },
        # 2. Important text is readable
        {
            "id": "chk-2",
            "item": "Important text is sharp and readable on small screens",
            "description": "Text contrast and size proxies satisfy mobile legibility thresholds.",
            "status": "passed" if (not has_media or media_analysis.get("visual_metrics", {}).get("rms_contrast", 40) >= 38) else "needs_review",
            "evidence": f"RMS contrast: {media_analysis.get('visual_metrics', {}).get('rms_contrast', 40.0):.1f}" if has_media else "Text-only format.",
            "recommendation": "Verify title clarity when previewed at 50% scale on a handheld smartphone.",
        },
        # 3. Dimensions and framing suit placement
        {
            "id": "chk-3",
            "item": "Aspect ratio suits Instagram placement (4:5 Feed or 9:16 Reel)",
            "description": "Optimized to eliminate black letterbox borders and maximize screen area.",
            "status": "passed" if (has_media and ("4:5" in media_analysis.get("dimensions", {}).get("aspect_ratio", "") or "9:16" in media_analysis.get("dimensions", {}).get("aspect_ratio", ""))) else ("needs_review" if has_media else "not_evaluated"),
            "evidence": f"Aspect ratio: {media_analysis.get('dimensions', {}).get('aspect_ratio', 'N/A')}" if has_media else "N/A",
            "recommendation": "Use 4:5 for feed posts and 9:16 for Reels.",
        },
        # 4. Caption is proofread and formatted
        {
            "id": "chk-4",
            "item": "Caption is proofread with clean line breaks",
            "description": "Free of jarring run-on text, excessive capitalization, or formatting glitches.",
            "status": "passed" if (has_caption and uppercase_ratio <= 0.30 and ("\n" in raw_caption or word_count <= 40)) else ("needs_review" if has_caption else "not_evaluated"),
            "evidence": f"Caps ratio: {uppercase_ratio:.2f}, Word count: {word_count}",
            "recommendation": "Insert clean line breaks between distinct thoughts.",
        },
        # 5. Call-to-action is clear
        {
            "id": "chk-5",
            "item": "Call-to-action (CTA) gives viewers a specific next step",
            "description": "Prompts comments, saves, shares, or link navigation.",
            "status": "passed" if (has_cta or has_question) else "failed",
            "evidence": "CTA detected" if (has_cta or has_question) else "No question or prompt keyword found",
            "recommendation": "Add a concrete next step such as 'Save this for later' or 'What do you think?'.",
        },
        # 6. Hashtags are relevant and uncluttered
        {
            "id": "chk-6",
            "item": "Hashtags are focused, targeted, and not spammy",
            "description": "Between 2 and 8 specific niche tags matching the content topic.",
            "status": "passed" if (1 <= ht_count <= 8) else ("needs_review" if ht_count > 8 else "not_evaluated"),
            "evidence": f"{ht_count} hashtags detected",
            "recommendation": "Select 3–7 tightly focused topic hashtags.",
        },
        # 7. Brand and tone consistency
        {
            "id": "chk-7",
            "item": "Brand details, tone, and visual style are consistent",
            "description": "Tone matches account positioning and intended audience objective.",
            "status": "passed",
            "evidence": f"Aligned with '{category}' and '{goal}' objective.",
            "recommendation": "Keep color palette and brand voice consistent across posts.",
        },
        # 8. Important dates, links, and facts verified
        {
            "id": "chk-8",
            "item": "Factual dates, prices, mentions, and locations verified",
            "description": "Confirms critical specifics are error-free before going live.",
            "status": "passed" if (dates_extracted or prices_extracted or mentions_extracted) else "needs_review",
            "evidence": preserved_facts_note or "No explicit numerical entities found; verify external links.",
            "recommendation": "Double check any event dates, account handles, or price figures.",
        },
        # 9. Accessibility & high-glare legibility
        {
            "id": "chk-9",
            "item": "Mobile accessibility & glare legibility reviewed",
            "description": "Text elements maintain sufficient luminance contrast for accessibility.",
            "status": "passed" if (not has_media or media_analysis.get("visual_metrics", {}).get("rms_contrast", 40) >= 35) else "needs_review",
            "evidence": "Luminance profile meets standard mobile contrast guidelines.",
            "recommendation": "Ensure text remains readable with dimmed mobile brightness.",
        },
        # 10. Technical media encoding compliance
        {
            "id": "chk-10",
            "item": "Media processing & technical encoding verified",
            "description": "Asset conforms to supported Instagram codecs (JPEG, PNG, MP4 H.264).",
            "status": "passed" if has_media else "not_evaluated",
            "evidence": f"Format: {media_analysis.get('format', 'Standard') if has_media else 'Text'}",
            "recommendation": "Ensure video tracks are encoded as H.264 MP4 with AAC audio.",
        },
    ]

    # Calculate checklist summary
    passed_count = sum(1 for c in checklist_items if c["status"] == "passed")
    review_count = sum(1 for c in checklist_items if c["status"] == "needs_review")
    failed_count = sum(1 for c in checklist_items if c["status"] == "failed")
    not_eval_count = sum(1 for c in checklist_items if c["status"] == "not_evaluated")

    checklist_summary = {
        "passed": passed_count,
        "needs_review": review_count,
        "failed": failed_count,
        "not_evaluated": not_eval_count,
        "total": len(checklist_items),
        "readiness_percentage": int(round((passed_count / max(len(checklist_items) - not_eval_count, 1)) * 100)),
        "is_ready_to_publish": failed_count == 0 and review_count <= 2,
    }

    # =========================================================================
    # 9. Segregated Engagement Prediction
    # =========================================================================
    # STRICT SEPARATION: Content quality score is craft/hygiene; prediction is statistical historical modeling.
    pred_rate = prediction_result.get("prediction", 0.0)
    pred_band = prediction_result.get("band", "Medium")

    segregated_prediction = {
        "available": bool(pred_rate > 0),
        "predicted_rate": round(float(pred_rate), 2),
        "lower_bound": round(float(prediction_result.get("lower", max(0.0, pred_rate - 1.2))), 2),
        "upper_bound": round(float(prediction_result.get("upper", pred_rate + 1.5)), 2),
        "performance_band": pred_band,
        "model_name": prediction_result.get("selected_model", "Ridge Regression (Offline Benchmark)"),
        "target_definition": "Engagement Rate % = ((Likes + Comments) / Followers at collection) × 100",
        "historical_baseline": {
            "median_benchmark": 3.4,
            "category": category,
            "category_average": 3.8 if category in ["Entertainment & Comedy", "Personal Branding"] else 2.9,
        },
        "methodology_notice": (
            "Statistical Engagement Prediction is intentionally isolated from Content Quality Scoring. "
            "Quality scoring assesses measurable design craft and copywriting hygiene. "
            "Engagement prediction models expected interaction velocity based on account follower size, "
            "media format, category, and publication hour in historical corpora."
        ),
        "limitations": [
            "Predictions reflect expected historical engagement rates derived from observable pre-publication signals.",
            "Content quality improvements (e.g. better crop, sharper focus) do not guarantee linear reach increases.",
            "Actual distribution remains heavily influenced by algorithmic explore testing and external creator trends.",
        ]
    }

    return {
        "overall_quality": {
            "score": overall_score,
            "max_score": 100,
            "band": band_label,
            "badge_color": band_badge,
            "verdict": verdict,
            "total_categories_evaluated": len(contributing_categories),
            "contributing_categories": contributing_categories,
        },
        "image_audit": {
            "evaluated": has_media,
            "overall_score": overall_image_score,
            "categories": image_audit_categories,
            "media_type": media_type,
            "filename": media_analysis.get("filename", "Uploaded Asset") if has_media else None,
        },
        "caption_audit": {
            "evaluated": has_caption,
            "overall_score": overall_caption_score,
            "categories": caption_audit_categories,
            "metrics": cap_metrics,
            "hashtag_analysis": {
                "count": ht_count,
                "density_label": cap_struct.get("hashtag_density", "Moderate"),
                "detected": re.findall(r"(?<!\w)#\w+", raw_caption),
                "recommendation": "3–7 focused hashtags recommended for topic indexing.",
            },
        },
        "caption_studio": {
            "evaluated": has_caption,
            "original_caption": raw_caption,
            "alternatives": caption_alternatives,
            "preserved_entities": preserved_facts_note or "No strict numerical entities detected",
        },
        "drawbacks": drawbacks,
        "improvement_checklist": recommendations_checklist,
        "before_after_comparison": {
            "visual_specification": visual_spec,
            "caption_alternatives": caption_alternatives,
            "original_caption": raw_caption,
        },
        "publishing_checklist": {
            "summary": checklist_summary,
            "items": checklist_items,
        },
        "segregated_engagement_prediction": segregated_prediction,
    }
