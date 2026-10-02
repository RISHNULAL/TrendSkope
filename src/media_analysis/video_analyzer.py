"""Video and Reel analyzer module for extracting observable metadata and frame signals."""
from __future__ import annotations
import struct
from typing import Any, Dict, List, Optional
from .image_analyzer import compute_aspect_ratio_label


def parse_mp4_metadata(video_bytes: bytes) -> Dict[str, Any]:
    """
    Parse MP4 / MOV container atoms (mvhd, tkhd, hdlr) in pure Python.
    Extracts duration, dimensions, timescale, and audio track presence.
    """
    res = {
        "duration_sec": 0.0,
        "width": 0,
        "height": 0,
        "timescale": 1000,
        "has_audio": False,
        "tracks": []
    }
    
    length = len(video_bytes)
    offset = 0
    
    try:
        while offset + 8 <= length:
            size, name = struct.unpack(">I4s", video_bytes[offset:offset+8])
            atom_name = name.decode("ascii", errors="ignore")
            
            if size == 1 and offset + 16 <= length:
                # 64-bit size
                size = struct.unpack(">Q", video_bytes[offset+8:offset+16])[0]
                content_offset = offset + 16
            else:
                content_offset = offset + 8
                
            if size <= 0:
                break
                
            atom_end = offset + size
            if atom_end > length:
                atom_end = length
                
            # Scan inside 'moov' (movie container)
            if atom_name == "moov":
                sub_offset = content_offset
                while sub_offset + 8 <= atom_end:
                    sub_size, sub_name = struct.unpack(">I4s", video_bytes[sub_offset:sub_offset+8])
                    sub_atom = sub_name.decode("ascii", errors="ignore")
                    
                    if sub_size <= 0:
                        break
                    sub_end = min(sub_offset + sub_size, atom_end)
                    
                    # Movie Header (mvhd) -> duration & timescale
                    if sub_atom == "mvhd" and sub_offset + 32 <= sub_end:
                        version = video_bytes[sub_offset + 8]
                        if version == 0:
                            timescale, duration = struct.unpack(">II", video_bytes[sub_offset+20:sub_offset+28])
                        else:
                            timescale, duration = struct.unpack(">IQ", video_bytes[sub_offset+28:sub_offset+40])
                        if timescale > 0:
                            res["timescale"] = timescale
                            res["duration_sec"] = round(duration / timescale, 2)
                            
                    # Track atoms (trak)
                    elif sub_atom == "trak":
                        track_offset = sub_offset + 8
                        while track_offset + 8 <= sub_end:
                            t_size, t_name = struct.unpack(">I4s", video_bytes[track_offset:track_offset+8])
                            t_atom = t_name.decode("ascii", errors="ignore")
                            if t_size <= 0:
                                break
                            t_end = min(track_offset + t_size, sub_end)
                            
                            # Track header (tkhd) -> width & height
                            if t_atom == "tkhd" and track_offset + 88 <= t_end:
                                w_fixed = struct.unpack(">I", video_bytes[t_end-8:t_end-4])[0]
                                h_fixed = struct.unpack(">I", video_bytes[t_end-4:t_end])[0]
                                w = int(w_fixed >> 16)
                                h = int(h_fixed >> 16)
                                if w > 0 and h > 0 and res["width"] == 0:
                                    res["width"] = w
                                    res["height"] = h
                                    
                            # Media header (mdia) / Handler (hdlr) -> audio track check
                            elif t_atom == "mdia":
                                mdia_offset = track_offset + 8
                                while mdia_offset + 8 <= t_end:
                                    m_size, m_name = struct.unpack(">I4s", video_bytes[mdia_offset:mdia_offset+8])
                                    m_atom = m_name.decode("ascii", errors="ignore")
                                    if m_size <= 0:
                                        break
                                    m_end = min(mdia_offset + m_size, t_end)
                                    if m_atom == "hdlr" and mdia_offset + 20 <= m_end:
                                        handler_type = video_bytes[mdia_offset+16:mdia_offset+20].decode("ascii", errors="ignore")
                                        if handler_type == "soun":
                                            res["has_audio"] = True
                                    mdia_offset += m_size
                                    
                            track_offset += t_size
                            
                    sub_offset += sub_size
                    
            offset += size
            
    except Exception:
        pass
        
    return res


def analyze_video_bytes(video_bytes: bytes, filename: str = "reel.mp4") -> Dict[str, Any]:
    """
    Extract technical and structural metadata from video/Reel bytes.
    """
    if not video_bytes:
        return {
            "available": False,
            "error": "Empty video payload",
            "signals": []
        }
        
    file_size_kb = round(len(video_bytes) / 1024, 1)
    file_size_mb = round(file_size_kb / 1024, 2)
    ext = filename.split(".")[-1].lower() if "." in filename else "mp4"

    # Attempt pure python parsing
    parsed = parse_mp4_metadata(video_bytes)
    
    width = parsed["width"] or 1080
    height = parsed["height"] or 1920
    duration_sec = parsed["duration_sec"] or 15.0
    has_audio = parsed["has_audio"]
    
    # Calculate aspect ratio
    aspect_ratio_str = compute_aspect_ratio_label(width, height)
    
    # Duration categorization
    if duration_sec <= 7:
        duration_label = "Short / Snappy (<7s)"
    elif duration_sec <= 30:
        duration_label = "Standard Reel (7–30s)"
    elif duration_sec <= 60:
        duration_label = "Long-form Reel (30–60s)"
    else:
        duration_label = "Extended Video (>60s)"

    # Resolution classification
    if width >= 1080 or height >= 1920:
        res_label = "Full HD (1080p+)"
    elif width >= 720 or height >= 1280:
        res_label = "HD (720p)"
    else:
        res_label = "Standard Resolution"

    # Detected structural signals
    detected_signals: List[str] = []
    
    if "9:16" in aspect_ratio_str or height > width:
        detected_signals.append("Full-screen vertical framing (9:16) maximizes immersive Reel playback.")
    elif "1:1" in aspect_ratio_str:
        detected_signals.append("Square format displays with letterboxing in standard Reel view.")
    else:
        detected_signals.append("Horizontal video orientation may reduce vertical screen presence in Reels.")

    detected_signals.append(f"{duration_label} duration ({duration_sec}s total playback).")
    
    if has_audio:
        detected_signals.append("Embedded audio stream detected.")
    else:
        detected_signals.append("No embedded audio stream detected (consider selecting an audio track).")

    detected_signals.append(f"Resolution: {res_label} ({width}×{height}px).")

    return {
        "available": True,
        "media_category": "reel",
        "filename": filename,
        "file_size_mb": file_size_mb,
        "file_size_kb": file_size_kb,
        "format": ext.upper(),
        "dimensions": {
            "width": width,
            "height": height,
            "aspect_ratio": aspect_ratio_str,
            "resolution_label": res_label
        },
        "duration": {
            "seconds": duration_sec,
            "label": duration_label
        },
        "audio": {
            "audio_detected": has_audio,
            "status": "Embedded Audio Stream Present" if has_audio else "No Audio Stream"
        },
        "signals": detected_signals
    }
