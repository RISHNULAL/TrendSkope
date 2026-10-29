"""Video and Reel analyzer module for extracting observable metadata and frame signals using OpenCV and container parsing."""
from __future__ import annotations

import os
import struct
import tempfile
from typing import Any, Dict, List, Optional
import numpy as np
from PIL import Image

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False

from .image_analyzer import compute_aspect_ratio_label, analyze_image_bytes


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
                size = struct.unpack(">Q", video_bytes[offset+8:offset+16])[0]
                content_offset = offset + 16
            else:
                content_offset = offset + 8
                
            if size <= 0:
                break
                
            atom_end = min(offset + size, length)
                
            if atom_name == "moov":
                sub_offset = content_offset
                while sub_offset + 8 <= atom_end:
                    sub_size, sub_name = struct.unpack(">I4s", video_bytes[sub_offset:sub_offset+8])
                    sub_atom = sub_name.decode("ascii", errors="ignore")
                    
                    if sub_size <= 0:
                        break
                    sub_end = min(sub_offset + sub_size, atom_end)
                    
                    if sub_atom == "mvhd" and sub_offset + 32 <= sub_end:
                        version = video_bytes[sub_offset + 8]
                        if version == 0:
                            timescale, duration = struct.unpack(">II", video_bytes[sub_offset+20:sub_offset+28])
                        else:
                            timescale, duration = struct.unpack(">IQ", video_bytes[sub_offset+28:sub_offset+40])
                        if timescale > 0:
                            res["timescale"] = timescale
                            res["duration_sec"] = round(duration / timescale, 2)
                            
                    elif sub_atom == "trak":
                        track_offset = sub_offset + 8
                        while track_offset + 8 <= sub_end:
                            t_size, t_name = struct.unpack(">I4s", video_bytes[track_offset:track_offset+8])
                            t_atom = t_name.decode("ascii", errors="ignore")
                            if t_size <= 0:
                                break
                            t_end = min(track_offset + t_size, sub_end)
                            
                            if t_atom == "tkhd" and track_offset + 88 <= t_end:
                                w_fixed = struct.unpack(">I", video_bytes[t_end-8:t_end-4])[0]
                                h_fixed = struct.unpack(">I", video_bytes[t_end-4:t_end])[0]
                                w = int(w_fixed >> 16)
                                h = int(h_fixed >> 16)
                                if w > 0 and h > 0 and res["width"] == 0:
                                    res["width"] = w
                                    res["height"] = h
                                    
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


def extract_video_frames_and_signals(
    temp_path: str,
    duration_hint: float = 15.0
) -> Dict[str, Any]:
    """
    Open video via OpenCV, sample representative frames across duration,
    and compute motion intensity, shot transitions, and opening hook visual metrics.
    """
    if not CV2_AVAILABLE:
        return {"cv2_available": False}

    cap = cv2.VideoCapture(temp_path)
    if not cap.isOpened():
        return {"cv2_available": False, "error": "Could not open video stream"}

    try:
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = float(cap.get(cv2.CAP_PROP_FPS)) or 24.0
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        calc_duration = round(total_frames / max(fps, 1.0), 2)
        duration_sec = calc_duration if calc_duration > 0.5 else duration_hint

        # Sample timestamps (in seconds): opening (0), early hooks (1s, 2s, 3s), mid, end
        sample_times = [0.0]
        for t in [1.0, 2.0, 3.0]:
            if t < duration_sec:
                sample_times.append(t)
        mid_t = duration_sec / 2.0
        if mid_t not in sample_times and mid_t < duration_sec:
            sample_times.append(mid_t)
        end_t = max(0.0, duration_sec - 0.5)
        if end_t not in sample_times:
            sample_times.append(end_t)
        sample_times.sort()

        sampled_frames_rgb: List[np.ndarray] = []
        sampled_frames_gray: List[np.ndarray] = []
        frame_metrics: List[Dict[str, Any]] = []

        for st in sample_times:
            frame_idx = min(int(st * fps), max(0, total_frames - 1))
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
            ret, frame_bgr = cap.read()
            if ret and frame_bgr is not None:
                # Resize for consistent, fast frame analysis (standard mobile height 480)
                fh, fw = frame_bgr.shape[:2]
                scale = 480 / max(fh, 1)
                resized_bgr = cv2.resize(frame_bgr, (int(fw * scale), 480), interpolation=cv2.INTER_AREA)
                rgb = cv2.cvtColor(resized_bgr, cv2.COLOR_BGR2RGB)
                gray = cv2.cvtColor(resized_bgr, cv2.COLOR_BGR2GRAY)
                
                sampled_frames_rgb.append(rgb)
                sampled_frames_gray.append(gray)

                # Compute frame-level brightness, contrast, and sharpness
                lum_mean = float(np.mean(gray))
                rms_cont = float(np.std(gray))
                sharp_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
                frame_metrics.append({
                    "time_sec": round(st, 1),
                    "brightness_pct": round((lum_mean / 255.0) * 100, 1),
                    "rms_contrast": round(rms_cont, 1),
                    "sharpness_var": round(sharp_var, 1)
                })

        # Calculate motion intensity between consecutive sampled frames
        motion_deltas = []
        scene_changes = 0
        for i in range(1, len(sampled_frames_gray)):
            diff = cv2.absdiff(sampled_frames_gray[i], sampled_frames_gray[i-1])
            delta = float(np.mean(diff))
            motion_deltas.append(delta)
            
            # Histogram correlation check for scene/cut detection
            hist1 = cv2.calcHist([sampled_frames_gray[i-1]], [0], None, [32], [0, 256])
            hist2 = cv2.calcHist([sampled_frames_gray[i]], [0], None, [32], [0, 256])
            cv2.normalize(hist1, hist1)
            cv2.normalize(hist2, hist2)
            corr = float(cv2.compareHist(hist1, hist2, cv2.HISTCMP_CORREL))
            if corr < 0.65 or delta > 45.0:
                scene_changes += 1

        avg_motion = float(np.mean(motion_deltas)) if motion_deltas else 18.0
        if avg_motion > 32:
            motion_label = "High Motion / Fast-Paced"
        elif avg_motion > 15:
            motion_label = "Moderate Pacing / Smooth Motion"
        else:
            motion_label = "Low Motion / Static Composition"

        # Opening hook analysis (first 3 seconds)
        hook_frames = [fm for fm in frame_metrics if fm["time_sec"] <= 3.0]
        hook_contrast = float(np.mean([f["rms_contrast"] for f in hook_frames])) if hook_frames else 45.0
        hook_sharpness = float(np.mean([f["sharpness_var"] for f in hook_frames])) if hook_frames else 120.0
        hook_brightness = float(np.mean([f["brightness_pct"] for f in hook_frames])) if hook_frames else 50.0

        hook_clarity = "High Clarity Hook" if hook_contrast > 45 and hook_sharpness > 80 else "Soft / Low-Contrast Hook"

        return {
            "cv2_available": True,
            "width": width,
            "height": height,
            "fps": round(fps, 2),
            "total_frames": total_frames,
            "duration_sec": duration_sec,
            "sampled_frames_count": len(sampled_frames_rgb),
            "motion_intensity": {
                "score": round(avg_motion, 1),
                "label": motion_label
            },
            "scene_changes": {
                "count": scene_changes,
                "label": "Dynamic Multi-Cut Reel" if scene_changes >= 2 else "Single Scene / Continuous Take"
            },
            "hook_analysis": {
                "window_sec": min(3.0, duration_sec),
                "hook_contrast": round(hook_contrast, 1),
                "hook_sharpness": round(hook_sharpness, 1),
                "hook_brightness": round(hook_brightness, 1),
                "clarity_label": hook_clarity
            },
            "frame_samples": frame_metrics
        }
    finally:
        cap.release()


def analyze_video_bytes(video_bytes: bytes, filename: str = "reel.mp4") -> Dict[str, Any]:
    """
    Extract technical, structural, and frame-level computer vision metadata from video/Reel bytes.
    Extracts actual sampled frames, motion dynamics, scene transitions, and audio availability.
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

    # 1. Parse MP4 header container in pure Python
    parsed = parse_mp4_metadata(video_bytes)
    has_audio = parsed["has_audio"]
    pure_py_dur = parsed["duration_sec"]
    pure_py_w = parsed["width"]
    pure_py_h = parsed["height"]

    # 2. Extract frames and motion features using OpenCV via temporary file
    cv_res: Dict[str, Any] = {}
    temp_file = None
    try:
        with tempfile.NamedTemporaryFile(suffix=f".{ext}", delete=False) as f:
            f.write(video_bytes)
            temp_path = f.name
        temp_file = temp_path

        cv_res = extract_video_frames_and_signals(temp_path, duration_hint=pure_py_dur or 15.0)
    except Exception:
        cv_res = {"cv2_available": False}
    finally:
        if temp_file and os.path.exists(temp_file):
            try:
                os.remove(temp_file)
            except Exception:
                pass

    # Resolve dimensional properties
    width = cv_res.get("width") or pure_py_w or 1080
    height = cv_res.get("height") or pure_py_h or 1920
    duration_sec = cv_res.get("duration_sec") or pure_py_dur or 15.0
    fps = cv_res.get("fps") or 24.0
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

    # Motion and hook information
    motion_info = cv_res.get("motion_intensity", {"score": 20.0, "label": "Moderate Pacing"})
    scene_info = cv_res.get("scene_changes", {"count": 1, "label": "Standard Take"})
    hook_info = cv_res.get("hook_analysis", {
        "window_sec": 3.0,
        "hook_contrast": 45.0,
        "hook_sharpness": 120.0,
        "hook_brightness": 50.0,
        "clarity_label": "Standard Clarity Hook"
    })

    # Observable structural & visual signals
    detected_signals: List[str] = []
    
    if "9:16" in aspect_ratio_str or height > width:
        detected_signals.append("Full-screen vertical framing (9:16) maximizes immersive Reel playback.")
    elif "1:1" in aspect_ratio_str:
        detected_signals.append("Square format displays with letterboxing in standard Reel view.")
    else:
        detected_signals.append("Horizontal video orientation may reduce vertical screen presence in Reels.")

    detected_signals.append(f"{duration_label} duration ({duration_sec}s total playback at {fps} fps).")
    detected_signals.append(f"Visual dynamics: {motion_info['label']} (motion intensity score {motion_info['score']}).")
    detected_signals.append(f"Scene pacing: {scene_info['label']} ({scene_info['count']} shot transitions detected).")
    detected_signals.append(f"Opening 3-second hook: {hook_info['clarity_label']} (contrast {hook_info['hook_contrast']}, sharpness {hook_info['hook_sharpness']}).")
    
    if has_audio:
        detected_signals.append("Embedded audio stream detected in media container.")
    else:
        detected_signals.append("No embedded audio stream detected (pair with recommended audio).")

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
            "fps": fps,
            "label": duration_label
        },
        "motion": motion_info,
        "scene_structure": scene_info,
        "hook_analysis": hook_info,
        "audio": {
            "audio_detected": has_audio,
            "status": "Embedded Audio Stream Present" if has_audio else "No Audio Stream"
        },
        "frame_analysis_available": cv_res.get("cv2_available", False),
        "sampled_frames_count": cv_res.get("sampled_frames_count", 0),
        "signals": detected_signals
    }
