"""Caption analysis module for linguistic, structural, and engagement prompt signals."""
from __future__ import annotations
import re
from typing import Any, Dict, List
import numpy as np


def analyze_caption_text(caption: str) -> Dict[str, Any]:
    """
    Compute linguistic metrics, structural properties, and pre-publication text signals.
    """
    text = (caption or "").strip()
    char_count = len(text)
    words = re.findall(r"\b\w+\b", text)
    word_count = len(words)
    
    # Regular expressions for syntactic features
    hashtags = re.findall(r"(?<!\w)#\w+", text)
    mentions = re.findall(r"(?<!\w)@\w+", text)
    urls = re.findall(r"https?://\S+|www\.\S+", text)
    emojis = re.findall(r"[^\x00-\x7F]", text)
    questions = re.findall(r"\?", text)
    exclamations = re.findall(r"!", text)
    sentences = re.split(r"[.!?]+", text)
    sentence_count = len([s for s in sentences if s.strip()]) or 1
    
    # Uppercase ratio
    alphas = [c for c in text if c.isalpha()]
    uppers = [c for c in alphas if c.isupper()]
    uppercase_ratio = round(len(uppers) / max(len(alphas), 1), 3)
    
    # Average word length
    avg_word_len = round(float(np.mean([len(w) for w in words])) if words else 0.0, 2)
    
    # Hashtag density assessment
    ht_count = len(hashtags)
    if ht_count == 0:
        ht_label = "No Hashtags"
    elif ht_count <= 4:
        ht_label = "Focused (1–4)"
    elif ht_count <= 10:
        ht_label = "Moderate (5–10)"
    else:
        ht_label = "Dense (11+)"

    # Length category
    if word_count == 0:
        length_label = "Empty"
    elif word_count <= 25:
        length_label = "Short & Punchy (<25 words)"
    elif word_count <= 80:
        length_label = "Medium Length (25–80 words)"
    elif word_count <= 180:
        length_label = "Detailed Storytelling (80–180 words)"
    else:
        length_label = "Long-form (>180 words)"

    # Call-to-Action (CTA) detection
    cta_patterns = [
        r"\b(comment|drop a comment|let us know|tell us|thoughts|what do you think)\b",
        r"\b(save this|bookmark|save for later)\b",
        r"\b(share with|send to|tag a friend|tag someone)\b",
        r"\b(link in bio|link in description|tap the link|check out)\b",
        r"\b(follow for more|follow us|subscribe)\b",
    ]
    detected_ctas: List[str] = []
    for pat in cta_patterns:
        match = re.search(pat, text, re.IGNORECASE)
        if match:
            detected_ctas.append(match.group(0))

    has_cta = len(detected_ctas) > 0
    has_question = len(questions) > 0

    # Observable Signals
    signals: List[str] = []
    
    if length_label != "Empty":
        signals.append(f"{length_label} caption structure ({char_count} chars, {word_count} words).")
    
    signals.append(f"Hashtag allocation: {ht_label} ({ht_count} hashtags detected).")
    
    if len(emojis) > 0:
        signals.append(f"Visual text formatting: {len(emojis)} emoji{'s' if len(emojis) > 1 else ''} included.")
        
    if has_question:
        signals.append("Interactive question format included in caption text.")
        
    if has_cta:
        signals.append("Explicit call-to-action prompt detected.")
        
    if uppercase_ratio > 0.35:
        signals.append("Elevated uppercase character frequency detected.")

    return {
        "available": True,
        "raw_text": text,
        "metrics": {
            "characters": char_count,
            "words": word_count,
            "hashtags": ht_count,
            "mentions": len(mentions),
            "emojis": len(emojis),
            "urls": len(urls),
            "questions": len(questions),
            "exclamations": len(exclamations),
            "uppercase_ratio": uppercase_ratio,
            "avg_word_length": avg_word_len,
            "sentences": sentence_count
        },
        "structure": {
            "length_label": length_label,
            "hashtag_density": ht_label,
            "has_cta": has_cta,
            "detected_ctas": detected_ctas,
            "has_question": has_question,
        },
        "signals": signals
    }
