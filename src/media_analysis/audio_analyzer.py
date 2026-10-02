"""Audio metadata analysis module for Instagram Reels and video content."""
from __future__ import annotations
from typing import Any, Dict, List, Optional


def analyze_audio_metadata(
    audio_present: bool = False,
    audio_name: Optional[str] = None,
    audio_type: Optional[str] = "original",
    audio_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Process audio information provided or detected for video content.
    Maintains scientific validity by not claiming unverified trending status.
    """
    clean_type = (audio_type or "original").strip().lower()
    clean_name = (audio_name or "").strip() or ("Original Audio" if clean_type == "original" else "Selected Audio Track")
    
    signals: List[str] = []
    
    if audio_present or clean_type != "none":
        signals.append(f"Audio configured: {clean_name} ({clean_type.capitalize()}).")
        signals.append("Sound-on playback enabled for Reel viewer engagement.")
    else:
        signals.append("Muted or no audio stream assigned to video.")

    return {
        "available": True,
        "audio_present": bool(audio_present or clean_type != "none"),
        "audio_type": clean_type,
        "audio_name": clean_name,
        "audio_id": audio_id or "Not Specified",
        "trend_status": {
            "status": "External Telemetry Unavailable",
            "explanation": "Real-time audio trend velocity requires an active external audio platform index. TrendSkope analyzes observable pre-publication signals only."
        },
        "signals": signals
    }
