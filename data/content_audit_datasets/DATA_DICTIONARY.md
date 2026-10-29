# TrendSkope Content Audit Datasets — Data Dictionary

## 1. Overview and Relational Architecture

The **Content Audit Datasets** directory (`data/content_audit_datasets/`) contains 9 specialized, non-monolithic CSV datasets (5,000 valid records each; **45,000 total records**). These datasets are decoupled from the canonical 15,000-post master engagement dataset (`data/raw/instagram_posts_1000.csv`) to preserve baseline integrity while providing granular training, audit, and diagnostic fixtures.

```
data/content_audit_datasets/
├── image_quality_dataset.csv                     # 5,000 rows (photometric & composition diagnostics)
├── poster_design_audit_dataset.csv               # 5,000 rows (graphic design, typography & layout)
├── video_reel_analysis_dataset.csv               # 5,000 rows (temporal dynamics, cuts & motion)
├── carousel_analysis_dataset.csv                 # 5,000 rows (multi-slide consistency & pacing)
├── caption_analysis_dataset.csv                  # 5,000 rows (NLP metrics, hooks & readability)
├── audio_music_analysis_dataset.csv              # 5,000 rows (loudness, tempo & acoustic profile)
├── content_drawbacks_dataset.csv                 # 5,000 rows (categorized issues & severity)
├── content_improvement_recommendations.csv       # 5,000 rows (actionable fixes & alternatives)
├── multimodal_content_features.csv               # 5,000 rows (linked multimodal feature vectors)
└── DATA_DICTIONARY.md                            # Comprehensive schema & provenance dictionary
```

### Relational Key Structure
- **Master Anchor**: `content_id` maps 1:1 or 1:many to `post_id` in `data/raw/instagram_posts_1000.csv`.
- **Physical Media Assets**: `asset_id` links to physical media assets in `data/metadata/media_assets.csv` when `source_type == "physical_media_extracted"`.
- **Primary Keys**: Every dataset utilizes a strongly-typed prefix key:
  - `image_quality_dataset.csv`: `IQ_REC_00001` .. `IQ_REC_05000`
  - `poster_design_audit_dataset.csv`: `PDA_REC_00001` .. `PDA_REC_05000`
  - `video_reel_analysis_dataset.csv`: `VRA_REC_00001` .. `VRA_REC_05000`
  - `carousel_analysis_dataset.csv`: `CAR_REC_00001` .. `CAR_REC_05000`
  - `caption_analysis_dataset.csv`: `CAP_REC_00001` .. `CAP_REC_05000`
  - `audio_music_analysis_dataset.csv`: `AUD_REC_00001` .. `AUD_REC_05000`
  - `content_drawbacks_dataset.csv`: `DRW_REC_00001` .. `DRW_REC_05000`
  - `content_improvement_recommendations.csv`: `REC_REC_00001` .. `REC_REC_05000`
  - `multimodal_content_features.csv`: `MMF_REC_00001` .. `MMF_REC_05000`

---

## 2. Dataset Schemas

### A. Image Quality Dataset (`image_quality_dataset.csv`)
| Column Name | Data Type | Measurement Type | Description & Bounds |
| :--- | :--- | :--- | :--- |
| `record_id` | `VARCHAR(16)` | Primary Key | Format: `IQ_REC_XXXXX` (Unique) |
| `content_id` | `VARCHAR(32)` | Foreign Key | References `post_id` in master dataset |
| `asset_id` | `VARCHAR(32)` | Foreign Key | Physical or simulation asset ID |
| `image_width` | `INT` | Measured | Pixel width (bounds: 300 to 4000) |
| `image_height` | `INT` | Measured | Pixel height (bounds: 300 to 4000) |
| `aspect_ratio` | `VARCHAR(16)` | Categorical | Formats: `4:5`, `1:1`, `9:16`, `1.91:1` |
| `numeric_aspect_ratio` | `FLOAT` | Derived | Exact ratio `width / height` |
| `file_size_bytes` | `INT` | Measured | File size in bytes |
| `sharpness_score` | `FLOAT` | Measured | Laplacian variance $\sigma^2(\nabla^2 I) \ge 0.0$ |
| `sharpness_label` | `VARCHAR(32)` | Derived | `Sharp / Crisp Details`, `Moderate Clarity`, `Soft / Potential Motion Blur` |
| `brightness_mean` | `FLOAT` | Measured | Average luminance (0.0 to 100.0) |
| `brightness_label` | `VARCHAR(32)` | Derived | `Low Exposure / Dark`, `Balanced`, `High Exposure / Overexposed` |
| `contrast_score` | `FLOAT` | Measured | RMS contrast (0.0 to 100.0) |
| `contrast_label` | `VARCHAR(32)` | Derived | `Low Contrast`, `Balanced Contrast`, `High Dynamic Range` |
| `saturation_pct` | `FLOAT` | Measured | Color saturation percentage (0.0 to 100.0) |
| `dominant_colors_hex` | `VARCHAR(64)`| Measured | Top 4 palette colors separated by semicolons |
| `color_temperature` | `VARCHAR(24)` | Derived | `Warm Tone`, `Cool Tone`, `Neutral Balanced` |
| `ocr_text_present` | `TINYINT` | Measured | `1` if overlay text detected, else `0` |
| `text_coverage_ratio` | `FLOAT` | Derived | Estimated text area fraction (0.0 to 1.0) |
| `rule_of_thirds_balance`| `VARCHAR(32)`| Derived | `Centered Focus`, `Distributed Composition` |
| `overall_quality_score` | `FLOAT` | Derived | Composite score (0.0 to 100.0) based on exposure, contrast, sharpness |
| `analysis_status` | `VARCHAR(24)` | Status | `analyzed_successfully` |
| `source_type` | `VARCHAR(32)` | Provenance | `physical_media_extracted` (24 real files) or `synthetic_simulation_benchmark` |
| `created_at` | `ISO_TIMESTAMP`| Audit | ISO 8601 UTC timestamp |

---

### B. Poster Design Audit Dataset (`poster_design_audit_dataset.csv`)
| Column Name | Data Type | Measurement Type | Description & Bounds |
| :--- | :--- | :--- | :--- |
| `record_id` | `VARCHAR(16)` | Primary Key | Format: `PDA_REC_XXXXX` (Unique) |
| `content_id` | `VARCHAR(32)` | Foreign Key | References `post_id` in master dataset |
| `asset_id` | `VARCHAR(32)` | Foreign Key | Physical or simulation asset ID |
| `poster_category` | `VARCHAR(32)` | Categorical | `Event Announcement`, `Promotional Sale`, `Educational Infographic`, etc. |
| `canvas_dimensions` | `VARCHAR(24)` | Categorical | Canvas format e.g. `1080x1350 (4:5)` |
| `text_density` | `VARCHAR(24)` | Categorical | `Low (<15%)`, `Moderate (15-30%)`, `High (>30%)`, `Crowded` |
| `text_density_pct` | `FLOAT` | Derived | Text coverage percentage (0.0 to 100.0) |
| `heading_contrast_ratio`| `FLOAT` | Measured | Luminance ratio against background (bounds: 1.0 to 21.0) |
| `readability_score` | `FLOAT` | Derived | Composite mobile readability score (0.0 to 100.0) |
| `readability_level` | `VARCHAR(32)` | Derived | `Optimal Mobile Readability`, `Adequate Readability`, `Challenging / Low Contrast` |
| `typography_hierarchy_grade`| `VARCHAR(32)`| Derived | `A (Clear Headline/Body)`, `B (Moderate Distinction)`, `C (Flat Hierarchy)` |
| `visual_clutter_score` | `FLOAT` | Derived | High-frequency edge density score (0.0 to 100.0) |
| `negative_space_ratio` | `FLOAT` | Derived | Empty canvas margin ratio (0.10 to 0.80) |
| `call_to_action_present`| `TINYINT` | Annotated | `1` if graphic CTA button/prompt present, else `0` |
| `call_to_action_type` | `VARCHAR(32)` | Categorical | `Swipe / Tap Below`, `Link in Bio`, `Save for Later`, `Register Now`, `None Detected` |
| `identified_drawbacks` | `VARCHAR(255)`| Annotated | Observed layout issues (e.g., low contrast, margin clutter) |
| `recommended_fixes` | `VARCHAR(255)`| Annotated | Prescriptive design recommendations |
| `compliance_instagram_feed`| `VARCHAR(24)`| Derived | `Compliant`, `Borderline Text Clutter` |
| `source_type` | `VARCHAR(32)` | Provenance | `rule_based_audit_benchmark` |
| `created_at` | `ISO_TIMESTAMP`| Audit | ISO 8601 UTC timestamp |

---

### C. Video and Reel Dataset (`video_reel_analysis_dataset.csv`)
| Column Name | Data Type | Measurement Type | Description & Bounds |
| :--- | :--- | :--- | :--- |
| `record_id` | `VARCHAR(16)` | Primary Key | Format: `VRA_REC_XXXXX` (Unique) |
| `content_id` | `VARCHAR(32)` | Foreign Key | References `post_id` in master dataset |
| `asset_id` | `VARCHAR(32)` | Foreign Key | Physical or simulation video asset ID |
| `duration_seconds` | `FLOAT` | Measured | Total playback duration (bounds: 1.0 to 300.0s) |
| `duration_category` | `VARCHAR(32)` | Categorical | `Short Hook (<15s)`, `Standard Reel (15-30s)`, `Extended Reel (30-60s)` |
| `frame_width` | `INT` | Measured | Pixel width (720 or 1080) |
| `frame_height` | `INT` | Measured | Pixel height (1280 or 1920) |
| `aspect_ratio` | `VARCHAR(32)` | Categorical | `9:16 (Vertical Story/Reel)`, `1:1` |
| `frame_rate` | `FLOAT` | Measured | Frames per second (24.0, 30.0, 60.0) |
| `total_frames` | `INT` | Derived | Total encoded frames (`duration * fps`) |
| `sampled_frame_count`| `INT` | Derived | Number of deterministic frames sampled (6 to 12) |
| `avg_motion_intensity`| `FLOAT` | Measured | Mean absolute inter-frame pixel differences (0.0 to 100.0) |
| `motion_pacing_label` | `VARCHAR(32)` | Derived | `Low Motion / Static Take`, `Moderate Pacing`, `High Motion / Fast-Paced Dynamic` |
| `scene_change_count` | `INT` | Measured | Inter-frame histogram correlation cuts detected |
| `scene_pacing_label` | `VARCHAR(32)` | Derived | `Single Continuous Take`, `Moderate Cuts (2-4 transitions)`, `Rapid Cuts (>5 transitions)` |
| `opening_hook_window_sec`| `FLOAT` | Constant | Hook evaluation window (3.0s) |
| `opening_hook_contrast`| `FLOAT` | Measured | RMS contrast during opening 3.0 seconds |
| `opening_hook_sharpness`| `FLOAT` | Measured | Laplacian variance during opening 3.0 seconds |
| `opening_hook_clarity_grade`| `VARCHAR(32)`| Derived | `High Clarity Hook`, `Moderate Hook`, `Soft / Low-Contrast Hook` |
| `ocr_text_present` | `TINYINT` | Measured | `1` if video text overlays detected |
| `audio_present` | `TINYINT` | Measured | `1` if audio track present |
| `audio_speech_present` | `TINYINT` | Measured | `1` if voiceover detected |
| `analysis_status` | `VARCHAR(24)` | Status | `analyzed_successfully` |
| `source_type` | `VARCHAR(32)` | Provenance | `physical_media_extracted` (12 real MP4s) or `synthetic_simulation_benchmark` |
| `created_at` | `ISO_TIMESTAMP`| Audit | ISO 8601 UTC timestamp |

---

### D. Carousel Dataset (`carousel_analysis_dataset.csv`)
| Column Name | Data Type | Measurement Type | Description & Bounds |
| :--- | :--- | :--- | :--- |
| `record_id` | `VARCHAR(16)` | Primary Key | Format: `CAR_REC_XXXXX` (Unique) |
| `carousel_id` | `VARCHAR(32)` | Identifier | Unique carousel post identifier |
| `content_id` | `VARCHAR(32)` | Foreign Key | References `post_id` in master dataset |
| `slide_count` | `INT` | Measured | Number of slides in carousel (bounds: 2 to 20) |
| `common_aspect_ratio` | `VARCHAR(24)` | Categorical | `4:5 (Portrait Feed)`, `1:1 (Square)` |
| `aspect_ratio_consistency`| `VARCHAR(32)`| Derived | `100% Uniform Framing`, `Mixed Aspect Ratios (May Crop)` |
| `cover_slide_asset_id` | `VARCHAR(32)`| Foreign Key | Asset ID of Slide 1 (cover) |
| `cover_slide_hook_strength`| `FLOAT` | Derived | Cover visual contrast & text hook grade (0.0 to 100.0) |
| `cover_slide_text_presence`| `TINYINT` | Measured | `1` if Slide 1 contains headline text |
| `avg_slide_brightness` | `FLOAT` | Measured | Average luminance across all slides (0.0 to 100.0) |
| `brightness_variance_across_slides`| `FLOAT`| Derived | Cross-slide luminance variance |
| `color_palette_consistency`| `VARCHAR(32)`| Derived | `High Visual Harmony`, `Moderate Consistency`, `Inconsistent Palette` |
| `text_heavy_slide_count`| `INT` | Derived | Slides exceeding 30% text density |
| `storytelling_progression`| `VARCHAR(32)`| Categorical | `Problem -> Solution -> CTA`, `Step-by-Step Tutorial`, etc. |
| `final_slide_has_cta` | `TINYINT` | Annotated | `1` if closing slide contains CTA |
| `carousel_level_findings` | `VARCHAR(255)`| Annotated | Summary findings across slides |
| `recommended_improvements`| `VARCHAR(255)`| Annotated | Recommendations for sequencing & consistency |
| `source_type` | `VARCHAR(32)` | Provenance | `physical_media_extracted` or `synthetic_simulation_benchmark` |
| `created_at` | `ISO_TIMESTAMP`| Audit | ISO 8601 UTC timestamp |

---

### E. Caption Analysis Dataset (`caption_analysis_dataset.csv`)
| Column Name | Data Type | Measurement Type | Description & Bounds |
| :--- | :--- | :--- | :--- |
| `record_id` | `VARCHAR(16)` | Primary Key | Format: `CAP_REC_XXXXX` (Unique) |
| `content_id` | `VARCHAR(32)` | Foreign Key | References `post_id` in master dataset |
| `caption` | `TEXT` | Raw Data | Caption string |
| `character_count` | `INT` | Measured | Total character count |
| `word_count` | `INT` | Measured | Total word count |
| `sentence_count` | `INT` | Measured | Total sentences detected |
| `avg_word_length` | `FLOAT` | Derived | Mean word length in characters |
| `hashtag_count` | `INT` | Measured | Count of `#` tags |
| `mention_count` | `INT` | Measured | Count of `@` handles |
| `url_count` | `INT` | Measured | Count of hyperlinks |
| `emoji_count` | `INT` | Measured | Count of Unicode emoji glyphs |
| `question_count` | `INT` | Measured | Count of `?` |
| `exclamation_count` | `INT` | Measured | Count of `!` |
| `uppercase_ratio` | `FLOAT` | Derived | Uppercase characters / total characters |
| `flesch_reading_ease_est`| `FLOAT` | Derived | Estimated readability ease (0.0 to 100.0) |
| `readability_category` | `VARCHAR(32)` | Derived | `Very Easy / Conversational`, `Standard Readability` |
| `hook_first_line_words`| `INT` | Derived | Word count in opening line |
| `call_to_action_present`| `TINYINT` | Measured | `1` if call-to-action detected |
| `detected_cta_phrase` | `VARCHAR(128)`| Derived | Extracted CTA phrase |
| `identified_issues` | `VARCHAR(255)`| Derived | Structural issues (e.g. hashtag stuffing) |
| `suggested_rewrite` | `TEXT` | Generated | Suggested revision |
| `source_type` | `VARCHAR(32)` | Provenance | `corpus_extracted_nlp` |
| `created_at` | `ISO_TIMESTAMP`| Audit | ISO 8601 UTC timestamp |

---

### F. Audio and Music Analysis Dataset (`audio_music_analysis_dataset.csv`)
| Column Name | Data Type | Measurement Type | Description & Bounds |
| :--- | :--- | :--- | :--- |
| `record_id` | `VARCHAR(16)` | Primary Key | Format: `AUD_REC_XXXXX` (Unique) |
| `content_id` | `VARCHAR(32)` | Foreign Key | References `post_id` in master dataset |
| `asset_id` | `VARCHAR(32)` | Foreign Key | Audio asset ID |
| `audio_track_name` | `VARCHAR(64)` | Metadata | Track identifier name |
| `audio_type` | `VARCHAR(32)` | Categorical | `original`, `instrumental_synth`, `commercial_licensed`, `speech_voiceover` |
| `duration_seconds` | `FLOAT` | Measured | Audio duration (seconds) |
| `sample_rate_hz` | `INT` | Measured | 44100 or 48000 Hz |
| `channel_count` | `INT` | Measured | 1 (mono) or 2 (stereo) |
| `rms_energy` | `FLOAT` | Measured | Root-mean-square amplitude |
| `loudness_dbfs` | `FLOAT` | Measured | Decibels relative to Full Scale (-60.0 to 0.0) |
| `loudness_compliance` | `VARCHAR(48)` | Derived | `Optimal Instagram Loudness (-14 dBFS +/- 3)`, `Quiet / May Need Boost` |
| `tempo_estimate_bpm` | `FLOAT` | Measured | Estimated tempo in beats per minute |
| `tempo_category` | `VARCHAR(32)` | Derived | `Slow / Ambient`, `Mid-Tempo Groove`, `Upbeat / Dance`, `Fast / Driving` |
| `energy_profile` | `VARCHAR(32)` | Derived | `Calm / Relaxed`, `Moderate Dynamic`, `High Energy / Pumping` |
| `speech_detected` | `TINYINT` | Measured | `1` if voiceover detected |
| `speech_to_music_ratio`| `VARCHAR(32)` | Derived | `Voiceover Dominant`, `Background Music with Speech`, `Instrumental Only` |
| `licensed_provenance` | `VARCHAR(48)` | Provenance | `CC0 / MIT Procedural Synthesis`, `Original Creator Track` |
| `analysis_status` | `VARCHAR(24)` | Status | `analyzed_successfully` |
| `source_type` | `VARCHAR(32)` | Provenance | `physical_media_extracted` (12 WAVs) or `synthetic_simulation_benchmark` |
| `created_at` | `ISO_TIMESTAMP`| Audit | ISO 8601 UTC timestamp |

---

### G. Content Drawbacks Dataset (`content_drawbacks_dataset.csv`)
| Column Name | Data Type | Measurement Type | Description & Bounds |
| :--- | :--- | :--- | :--- |
| `record_id` | `VARCHAR(16)` | Primary Key | Format: `DRW_REC_XXXXX` (Unique) |
| `content_id` | `VARCHAR(32)` | Foreign Key | References `post_id` in master dataset |
| `content_type` | `VARCHAR(16)` | Categorical | `image`, `reel`, `carousel`, `caption` |
| `issue_category` | `VARCHAR(32)` | Categorical | `Visual Quality`, `Mobile Framing`, `Text Readability`, `Caption Structure`, etc. |
| `issue_severity` | `VARCHAR(16)` | Categorical | `Critical`, `Moderate`, `Minor`, `Informational` |
| `issue_code` | `VARCHAR(32)` | Standardized Code| `ERR_LOW_SHARPNESS`, `ERR_NON_VERTICAL_REEL`, `ERR_HASHTAG_STUFFING`, etc. |
| `issue_description` | `VARCHAR(255)`| Diagnostic | Detailed description of observed defect |
| `evidence` | `VARCHAR(255)`| Diagnostic | Measured quantitative metric triggering issue |
| `confidence_score` | `FLOAT` | Derived | Detection confidence (0.0 to 1.0) |
| `suggested_fix` | `VARCHAR(255)`| Prescriptive | Actionable resolution guidance |
| `source_type` | `VARCHAR(32)` | Provenance | `rule_based_content_audit` |
| `created_at` | `ISO_TIMESTAMP`| Audit | ISO 8601 UTC timestamp |

---

### H. Content Improvement Recommendations Dataset (`content_improvement_recommendations.csv`)
| Column Name | Data Type | Measurement Type | Description & Bounds |
| :--- | :--- | :--- | :--- |
| `record_id` | `VARCHAR(16)` | Primary Key | Format: `REC_REC_XXXXX` (Unique) |
| `content_id` | `VARCHAR(32)` | Foreign Key | References `post_id` in master dataset |
| `content_type` | `VARCHAR(16)` | Categorical | `image`, `reel`, `carousel`, `caption` |
| `issue_category` | `VARCHAR(32)` | Categorical | `Visual Quality`, `Mobile Framing`, `Hook Enhancement`, etc. |
| `original_observation` | `VARCHAR(255)`| Diagnostic | Observed creative characteristic |
| `recommended_action` | `VARCHAR(255)`| Prescriptive | Prescriptive creative adjustment |
| `alternative_caption` | `TEXT` | Generated | Alternative structured caption copy |
| `alternative_hook` | `VARCHAR(255)`| Generated | Alternative visual/headline hook |
| `alternative_call_to_action`| `VARCHAR(255)`| Generated| Clear next-step prompt |
| `design_change_description`| `VARCHAR(255)`| Prescriptive| Layout or visual styling change |
| `expected_benefit` | `VARCHAR(255)`| Expected Impact| User engagement or mobile scanability benefit |
| `evidence_basis` | `VARCHAR(48)` | Scientific Basis| `Statistical Association (Ridge Coef)`, `Mobile Safe Zone Guidelines`, etc. |
| `priority` | `VARCHAR(16)` | Categorical | `High`, `Medium`, `Low` |
| `source_type` | `VARCHAR(32)` | Provenance | `rule_based_recommendation_engine` |
| `created_at` | `ISO_TIMESTAMP`| Audit | ISO 8601 UTC timestamp |

---

### I. Multimodal Content Features Dataset (`multimodal_content_features.csv`)
| Column Name | Data Type | Measurement Type | Description & Bounds |
| :--- | :--- | :--- | :--- |
| `record_id` | `VARCHAR(16)` | Primary Key | Format: `MMF_REC_XXXXX` (Unique) |
| `content_id` | `VARCHAR(32)` | Foreign Key | References `post_id` in master dataset |
| `media_type` | `VARCHAR(16)` | Categorical | `image`, `reel`, `carousel` |
| `has_image_quality_ref` | `VARCHAR(16)` | Foreign Key | Links to `IQ_REC_...` or empty |
| `has_video_reel_ref` | `VARCHAR(16)` | Foreign Key | Links to `VRA_REC_...` or empty |
| `has_carousel_ref` | `VARCHAR(16)` | Foreign Key | Links to `CAR_REC_...` or empty |
| `has_caption_ref` | `VARCHAR(16)` | Foreign Key | Links to `CAP_REC_...` |
| `has_audio_ref` | `VARCHAR(16)` | Foreign Key | Links to `AUD_REC_...` or empty |
| `available_modalities` | `VARCHAR(32)` | Categorical | `text+image`, `text+video+audio`, `text+carousel` |
| `modality_mask_has_media`| `TINYINT` | Indicator Mask| `1` if media features active |
| `modality_mask_has_text` | `TINYINT` | Indicator Mask| `1` if caption text active |
| `modality_mask_audio_present`| `TINYINT` | Indicator Mask| `1` if audio features active |
| `feature_vector_dimension`| `INT` | Constant | 40 |
| `feature_extraction_version`| `VARCHAR(24)`| Version | `v2.1.0-multimodal` |
| `analysis_status` | `VARCHAR(24)` | Status | `complete` |
| `source_type` | `VARCHAR(32)` | Provenance | `multimodal_feature_pipeline` |
| `created_at` | `ISO_TIMESTAMP`| Audit | ISO 8601 UTC timestamp |

---

## 3. Data Provenance & Real vs. Synthetic Identification

All records explicitly declare their source methodology via the `source_type` column:
- `physical_media_extracted`: Features quantitatively computed from actual physical media files on disk (`data/media/`).
- `synthetic_simulation_benchmark`: Features generated using calibrated Gaussian and Poisson distributions representing creator account variance without data leakage.
- `rule_based_audit_benchmark` / `rule_based_content_audit`: Findings evaluated using codified mobile design standards and Instagram platform specifications.
- `corpus_extracted_nlp`: Linguistic statistics derived directly from caption text strings.
