"""Evidence-based suggestion rules for pre-publication content improvement."""
from __future__ import annotations
from typing import Any, Dict, List


def evaluate_suggestions(
    caption_analysis: Dict[str, Any],
    media_analysis: Optional[Dict[str, Any]],
    context: Dict[str, Any],
    prediction_result: Dict[str, Any],
) -> List[Dict[str, str]]:
    """
    Generate evidence-based pre-publication suggestions using cautious, professional phrasing.
    """
    suggestions: List[Dict[str, str]] = []
    
    cap_metrics = caption_analysis.get("metrics", {})
    cap_struct = caption_analysis.get("structure", {})
    
    char_count = cap_metrics.get("characters", 0)
    word_count = cap_metrics.get("words", 0)
    ht_count = cap_metrics.get("hashtags", 0)
    has_cta = cap_struct.get("has_cta", False)
    has_question = cap_struct.get("has_question", False)
    upper_ratio = cap_metrics.get("uppercase_ratio", 0.0)
    
    media_type = context.get("media_type", "image").lower()
    posting_hour = context.get("posting_hour", 19)
    is_weekend = context.get("is_weekend", 0)
    
    # 1. Caption Suggestions
    if ht_count > 12:
        suggestions.append({
            "category": "Caption Strategy",
            "title": "Consolidate Hashtags",
            "suggestion": "Your caption contains over 12 hashtags. Consider selecting 3 to 7 tightly targeted niche tags.",
            "reason": "Dense hashtag blocks can dilute context and are less common in modern high-engagement posts.",
            "impact_level": "Medium"
        })
    elif ht_count == 0:
        suggestions.append({
            "category": "Caption Strategy",
            "title": "Add Discoverability Tags",
            "suggestion": "Consider adding 2 to 5 relevant topic hashtags to assist topic categorization.",
            "reason": "Topical hashtags provide clear metadata signals for initial content indexing.",
            "impact_level": "Medium"
        })
        
    if not has_cta and not has_question and word_count > 10:
        suggestions.append({
            "category": "Caption Strategy",
            "title": "Include an Engagement Prompt",
            "suggestion": "Consider closing your caption with an open-ended question or direct prompt (e.g. 'What do you think?').",
            "reason": "Posts with explicit dialogue prompts historically correlate with higher comment interaction rates.",
            "impact_level": "High"
        })
        
    if upper_ratio > 0.4:
        suggestions.append({
            "category": "Caption Strategy",
            "title": "Normalize Letter Casing",
            "suggestion": "A high portion of your caption is uppercase. Consider reserving caps for key emphasis words.",
            "reason": "Standard sentence casing improves mobile legibility and reader retention.",
            "impact_level": "Low"
        })

    # 2. Visual / Media Suggestions
    if media_analysis and media_analysis.get("available"):
        dims = media_analysis.get("dimensions", {})
        aspect = dims.get("aspect_ratio", "")
        
        if media_type == "image":
            if "1.91:1" in aspect or "16:9" in aspect or "Landscape" in aspect:
                suggestions.append({
                    "category": "Visual Formatting",
                    "title": "Optimize for Vertical Screen Area",
                    "suggestion": "Consider cropping your image to portrait 4:5 instead of horizontal landscape.",
                    "reason": "Portrait 4:5 images occupy ~25% more screen area in vertical mobile feeds than horizontal formats.",
                    "impact_level": "High"
                })
            
            vm = media_analysis.get("visual_metrics", {})
            if vm.get("brightness_label") == "Low / Moody":
                suggestions.append({
                    "category": "Visual Quality",
                    "title": "Check Shadow Detail on Mobile",
                    "suggestion": "The image has a relatively dark luminance profile. Test whether key details remain legible on dimmed mobile screens.",
                    "reason": "High ambient light on mobile devices can obscure subtle dark gradients.",
                    "impact_level": "Low"
                })
                
                
        elif media_type == "carousel":
            slide_cnt = media_analysis.get("slide_count", 0)
            if slide_cnt < 2:
                suggestions.append({
                    "category": "Carousel Structure",
                    "title": "Add Minimum 2 Slides",
                    "suggestion": "Instagram carousels require at least 2 slides to enable swipe interactions.",
                    "reason": "Single-image posts should use standard Photo format instead.",
                    "impact_level": "High"
                })
            elif slide_cnt > 8:
                suggestions.append({
                    "category": "Carousel Structure",
                    "title": "Streamline Slide Progression",
                    "suggestion": "With 8+ slides, place your strongest hook on Slide 1 and a clear call-to-action on the final slide.",
                    "reason": "Audience swipe completion rate decreases slightly on long carousels unless each slide delivers focused value.",
                    "impact_level": "Medium"
                })
            
            slides = media_analysis.get("slides", [])
            if slides and slides[0].get("visual_metrics", {}).get("text_presence") == "Likely Present":
                suggestions.append({
                    "category": "Carousel Hook",
                    "title": "Verify Cover Slide Hook Readability",
                    "suggestion": "The first slide contains high-contrast text overlay patterns. Check mobile feed readability.",
                    "reason": "The cover slide acts as the primary feed thumbnail determining whether users swipe.",
                    "impact_level": "Medium"
                })

        elif media_type == "reel":
            if "9:16" not in aspect:
                suggestions.append({
                    "category": "Video Framing",
                    "title": "Use Full-Screen 9:16 Ratio",
                    "suggestion": "Your video is not 9:16 vertical. Consider reframing to 1080×1920 for full-screen immersion.",
                    "reason": "Non-vertical Reels display with black letterbox borders in the Reels feed.",
                    "impact_level": "High"
                })
            
            audio_info = media_analysis.get("audio", {})
            if not audio_info.get("audio_detected"):
                suggestions.append({
                    "category": "Audio Strategy",
                    "title": "Assign Video Audio Track",
                    "suggestion": "No audio stream was detected. Consider attaching a music track or spoken voiceover.",
                    "reason": "Audio playback is a primary engagement vector in video content discovery.",
                    "impact_level": "Medium"
                })

    # 3. Publishing Timing Suggestions
    # Model distribution shows evening windows (17:00-21:00) have stronger density
    if posting_hour < 6 or posting_hour > 23:
        suggestions.append({
            "category": "Publishing Schedule",
            "title": "Evaluate Active Audience Windows",
            "suggestion": "Your scheduled time falls in late night / early morning hours (UTC). Check if your primary audience is active at this time.",
            "reason": "Initial early engagement velocity historically benefits from publishing when the primary follower demographic is online.",
            "impact_level": "Medium"
        })

    return suggestions
