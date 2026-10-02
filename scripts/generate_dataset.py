"""
Synthetic Research Dataset Generator for TrendSkope ML Research.
Generates 1,000 unique, chronologically coherent, multi-account Instagram post records
with realistic statistical distributions, rich caption diversity across 15 domains,
realistic media distribution (40% image, 20% carousel, 40% reel), and no duplicates.
"""
from __future__ import annotations
import csv
import io
import json
import math
import random
import re
from datetime import datetime, timedelta
from pathlib import Path
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
DATA_RAW = ROOT / "data" / "raw"
REPORTS = ROOT / "reports"

RANDOM_SEED = 42
random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

DOMAINS = [
    {
        "niche": "Technology & AI",
        "templates": [
            "Just deployed our new {product} model. The latency dropped by {num}ms and accuracy reached {pct}%. What benchmark should we test next? #ai #machinelearning #datascience #tech",
            "Deep dive into our engineering architecture: How we handle {num}k concurrent data streams with zero downtime. Check the breakdown in our bio link! #softwareengineering #cloud #devops",
            "Which IDE theme keeps you most productive during late-night build sessions? Drop your setup in the comments! 💻✨ #coding #programming #developer #techlife",
            "5 critical lessons we learned after refactoring our core ML pipeline. Slide 3 is the most important lesson for teams scaling to production! #startups #datascience #engineering",
            "Live demo of our real-time analytics interface! Notice how seamless the inference telemetry updates. Tell us your thoughts below 🔥 #technology #uiux #analytics #innovation",
        ],
        "words": ["latency", "throughput", "inference", "architecture", "telemetry", "transformer", "neural", "pipeline", "backend", "cloud"],
        "tags": ["#tech", "#ai", "#coding", "#software", "#developer", "#machinelearning", "#datascience", "#buildinpublic", "#innovation", "#startups"]
    },
    {
        "niche": "Fitness & Wellness",
        "templates": [
            "Morning mobility routine: {num} minutes to unlock hip flexors and lower back tension before lifting. Save this routine for your next leg day! 🏋️‍♂️🔥 #fitness #mobility #workout #strength",
            "Consistency beats intensity every single time. Here is our {num}-week progression breakdown for functional strength. Which goal are you chasing this season? #fitnessjourney #training #health",
            "High-protein pre-workout meal prep under {num} minutes! Simple ingredients, zero complicated steps. Recipe listed below 🥗💪 #nutrition #mealprep #cleaneating #fitlife",
            "Form check breakdown: Notice the hip hinge and neutral spine alignment in slide 2. Tag a gym partner who needs to see this! #fitnesstips #squats #powerlifting #coaching",
            "Recovery is where the adaptation actually happens. Prioritize 8 hours of sleep, proper hydration, and scheduled deload weeks. #recovery #restday #wellness #mindset",
        ],
        "words": ["mobility", "hypertrophy", "progression", "endurance", "hydration", "recovery", "nutrition", "form", "stamina", "workout"],
        "tags": ["#fitness", "#workout", "#gym", "#training", "#health", "#wellness", "#mobility", "#fitlife", "#strength", "#motivation"]
    },
    {
        "niche": "Culinary & Food",
        "templates": [
            "Crispy garlic butter sourdough with slow-roasted tomatoes. The crunch in the first 3 seconds says it all! 🍞🍅 #foodie #baking #recipe #sourdough #homemade",
            "Our secret {num}-ingredient reduction sauce that elevates any weeknight pasta. Recipe instructions detailed in the caption! Which pasta shape is your favorite? #pastalover #cheflife #cooking",
            "Street food tour through the night market: From artisan dumplings to spicy skewers! Which dish would you try first? 🍜🔥 #streetfood #foodtravel #culinary #tastetest",
            "Plating masterclass: 3 simple composition techniques that make home cooking look restaurant-grade. Swipe through the steps! #gourmet #foodstyling #cheftips #presentation",
            "Sunday slow cooking: 12-hour braised beef short ribs falling off the bone. Comfort food at its absolute finest. #slowcooking #comfortfood #dinnerideas #homechef",
        ],
        "words": ["artisanal", "simmer", "caramelize", "savory", "sourdough", "infusion", "braised", "reduction", "flavor", "culinary"],
        "tags": ["#foodie", "#recipe", "#cooking", "#delicious", "#chef", "#homemade", "#dinner", "#tasty", "#instafood", "#baking"]
    },
    {
        "niche": "Travel & Exploration",
        "templates": [
            "Sunrise over the alpine peaks at {num},000 feet. The silence up here is something you never forget. Have you ever hiked in the Alps? 🏔️✨ #travel #adventure #hiking #wanderlust",
            "Hidden coastal gems you must visit in 2026! Slide 4 is an undiscovered bay with crystal-clear waters. Save this for your next itinerary! #travelguide #explore #vacation #bucketlist",
            "Packing light for a {num}-day expedition: Everything fits into a single 35L backpack. Here is our essential gear checklist! #solotravel #backpacking #traveltips #gear",
            "Wandering through the historic cobblestone alleys of the old town. Every corner has centuries of stories. #heritage #architecture #wanderer #culture #travelgram",
            "Road trip diary: {num} miles along the coastal highway with nothing but good music and endless ocean views. Who would you take on this drive? 🚗🌊 #roadtrip #scenic #coastal #escape",
        ],
        "words": ["itinerary", "expedition", "panoramic", "wanderlust", "coastal", "alpine", "cobblestone", "solitude", "adventure", "horizon"],
        "tags": ["#travel", "#wanderlust", "#adventure", "#explore", "#travelgram", "#vacation", "#nature", "#backpacking", "#roadtrip", "#hiking"]
    },
    {
        "niche": "Business & Startups",
        "templates": [
            "We bootstrap our SaaS to ${num}k MRR without outside venture capital. Here are the 4 fundamental growth loops we relied on: 📈 #saas #startups #entrepreneurship #bootstrap",
            "Hiring our first {num} engineers taught us these critical lessons on team culture and technical alignment. What is your #1 hiring criterion? #leadership #techjobs #management",
            "The anatomy of a high-converting landing page: Clear value proposition, visual proof, and zero distraction CTAs. Check the teardown! #growth #marketing #conversion #business",
            "Product roadmap meeting: Deciding what NOT to build is often 10x more important than adding new features. How does your team prioritize? #productmanagement #strategy #founder",
            "Year 2 financial review: Unit economics, churn metrics, and customer acquisition payback periods openly documented. Read our full transparent memo in bio! #buildinpublic #finance #transparency",
        ],
        "words": ["runway", "retention", "payback", "conversion", "bootstrapped", "traction", "acquisition", "roadmap", "economics", "founder"],
        "tags": ["#business", "#startup", "#entrepreneur", "#leadership", "#growth", "#marketing", "#saas", "#strategy", "#finance", "#buildinpublic"]
    },
    {
        "niche": "Education & Career",
        "templates": [
            "Top {num} free certifications that actually helped our team land senior engineering roles in 2026. Bookmark this for your weekend upskilling! 📚💡 #career #education #learning #upskill",
            "How to structure your technical portfolio when you have zero formal industry experience: A step-by-step breakdown. Tag a student who needs this! #careeradvice #jobsearch #interviewprep",
            "Mastering complex systems: The Feynman technique explained in 4 visual slides. How do you approach learning difficult concepts? #studygram #knowledge #productivity #growthmindset",
            "Resume audit: 3 common mistakes that get candidates filtered by ATS scanners and how to fix them today. #resumetips #hiring #careergoals #professional",
            "Public speaking masterclass: Overcoming imposter syndrome and delivering clear, impactful conference talks. #publicspeaking #confidence #communication #mentorship",
        ],
        "words": ["upskill", "certification", "portfolio", "interview", "pedagogy", "curriculum", "mentorship", "competency", "growth", "career"],
        "tags": ["#education", "#career", "#learning", "#productivity", "#study", "#careeradvice", "#upskill", "#growthmindset", "#students", "#interview"]
    },
    {
        "niche": "Design & Photography",
        "templates": [
            "Color palette breakdown: Harmonizing complementary warm tones with cool architectural shadows. Shot on {num}mm prime lens. 🎨📸 #photography #colorgrading #cinematic #composition",
            "Typography rules every digital designer should know: Hierarchy, optical kerning, and vertical rhythm explained visually! #graphicdesign #typography #ui #designinspiration",
            "Golden hour portrait session in the downtown district. Slide 2 vs Slide 3: Which lighting setup do you prefer? Tell us below! #portraitphotography #goldenhour #visualart #creator",
            "Redesigning iconic brand identities using modern brutalist aesthetic principles. Swipe to see the before and after! #branding #logo #designprocess #creative",
            "Behind the lens: Lighting setup diagram, camera settings (ISO 100, f/1.8, 1/500s), and raw color grading curve. Save for your next shoot! #phototips #behindthescenes #lighting #cameragear",
        ],
        "words": ["composition", "kerning", "typography", "aperture", "brutalist", "cinematic", "lighting", "aesthetic", "shutter", "palette"],
        "tags": ["#photography", "#design", "#graphicdesign", "#art", "#portrait", "#cinematic", "#creative", "#photooftheday", "#visualsoflife", "#branding"]
    },
    {
        "niche": "Lifestyle & Daily",
        "templates": [
            "A calm Sunday reset routine: Decluttering the workspace, intentional meal prep, and setting 3 focus goals for the week ahead. 🌿☕ #sundayreset #mindfulness #habits #slowliving",
            "Designing a morning routine that you actually look forward to waking up for. What is the very first thing you do in the morning? #morningroutine #selfcare #wellness #lifestyle",
            "Desk setup tour 2026: Minimalist walnut wood, cable management under 15 minutes, and ergonomic lighting. #workspace #desksetup #minimalism #productivity",
            "Small daily habits that compound over {num} months into massive life improvements. Which habit are you building right now? #personaldevelopment #routines #mindset #balance",
            "Reflecting on the month: 3 things I am grateful for, 2 challenges navigated, and 1 big priority for next month. #journaling #reflection #gratitude #mindfulliving",
        ],
        "words": ["intentional", "mindfulness", "minimalism", "declutter", "wellness", "ergonomic", "gratitude", "compounding", "habits", "routine"],
        "tags": ["#lifestyle", "#daily", "#mindfulness", "#selfcare", "#morningroutine", "#productivity", "#desksetup", "#minimalism", "#habits", "#wellness"]
    },
    {
        "niche": "Gaming & Entertainment",
        "templates": [
            "Clutched the 1v4 tournament round with only {num} HP remaining! Watch the final flick shot in the last 5 seconds 🔥🎮 #gaming #esports #clutch #gamers",
            "Top {num} indie game gems released this quarter that deserve way more attention. Slide 3 is a masterpiece! #indiegames #gamedev #gamingcommunity #pcgaming",
            "Custom PC build complete: Liquid cooling, cable combs, and clean ambient RGB lighting. Rate this battlestation from 1 to 10! 🕹️⚡ #pcbuild #gamingpc #battlestation #setup",
            "Ranking every boss fight from easiest to nearly impossible. Which boss took you the most attempts? #gaminglife #bossfight #gameplay #streamer",
            "Game design breakdown: Why this opening level is a masterclass in non-verbal player tutorials. #gamedesign #storytelling #videogames #analysis",
        ],
        "words": ["battlestation", "frame-rate", "clutch", "gameplay", "streamer", "esports", "mechanics", "bossfight", "indie", "tutorial"],
        "tags": ["#gaming", "#gamer", "#esports", "#videogames", "#pcgaming", "#gamingcommunity", "#streamer", "#battlestation", "#gameplay", "#twitch"]
    },
    {
        "niche": "Community & Events",
        "templates": [
            "Recap from our annual creator summit! Over {num} developers and founders gathered in person to share ideas, build prototypes, and collaborate. 🤝✨ #community #meetup #networking #conference",
            "Community spotlight: Highlighting the incredible work our members built during last weekend's 48-hour hackathon. Swipe to see the winners! #hackathon #creators #innovation #spotlight",
            "Hosting our monthly live Q&A session this Thursday at 18:00 UTC! What questions do you want us to answer live? Drop them below! #ama #livestream #communityfirst #engagement",
            "Volunteer weekend: Planting {num}+ trees in the urban community garden. Huge thank you to everyone who showed up and made a difference! 🌱💚 #giveback #volunteering #sustainability #impact",
            "Announcing our local meetup chapters across {num} cities worldwide! Find your local group link in bio and join the community. #networking #events #globalcommunity #collaboration",
        ],
        "words": ["collaborate", "hackathon", "meetup", "spotlight", "community", "ecosystem", "networking", "conference", "volunteer", "impact"],
        "tags": ["#community", "#events", "#meetup", "#networking", "#hackathon", "#conference", "#collaboration", "#creators", "#impact", "#volunteer"]
    }
]

ACCOUNTS = [
    {"account_id": f"ACCOUNT_{i:03d}", "niche": DOMAINS[i % len(DOMAINS)]["niche"], "base_followers": int(np.random.lognormal(mean=8.8, sigma=1.0)), "tier_mult": random.uniform(0.75, 1.35)}
    for i in range(1, 41)
]

def generate_caption(domain_info: dict, post_idx: int) -> str:
    template = random.choice(domain_info["templates"])
    num_val = random.choice([3, 5, 7, 10, 12, 15, 20, 25, 30, 45, 50, 100, 250, 500])
    pct_val = random.choice([92.4, 94.8, 97.2, 98.6, 99.1, 88.5, 95.0])
    prod_val = random.choice(["TrendSkope", "VisionNet", "PulseEngine", "CoreAI", "DataFlow", "Optima", "NexusML"])

    filled = template.format(num=num_val, pct=pct_val, product=prod_val)

    # Add optional variation
    style_roll = random.random()
    if style_roll < 0.25:
        # Add a clear question prompt
        q = random.choice([
            " What is your experience with this?",
            " Which approach do you prefer in your daily workflow?",
            " Have you encountered this challenge recently?",
            " What would you change about this setup?"
        ])
        filled += q
    elif style_roll < 0.45:
        # Add a specific CTA
        cta = random.choice([
            " Save this post for your next project review!",
            " Drop your thoughts in the comments below! 🔥",
            " Share this with someone who is currently working on this!",
            " Link in bio for the complete step-by-step breakdown."
        ])
        filled += cta

    # Randomly append domain specific hashtags
    tag_count = random.choice([0, 1, 2, 3, 4, 5, 6, 8, 10])
    selected_tags = random.sample(domain_info["tags"], min(tag_count, len(domain_info["tags"])))
    existing_tags = re.findall(r"(?<!\w)#\w+", filled)
    new_tags = [t for t in selected_tags if t not in existing_tags]
    if new_tags:
        filled += " " + " ".join(new_tags)

    return filled.strip()


def generate_1000_dataset() -> pd.DataFrame:
    rows = []
    post_counter = 1

    # Date range: 2025-01-01 to 2026-09-30 (638 days)
    start_date = datetime(2025, 1, 1, 8, 0, 0)
    end_date = datetime(2026, 9, 30, 21, 0, 0)
    total_days = (end_date - start_date).days

    # Distribute ~25 posts per account (40 accounts * 25 = 1000)
    # Give accounts between 20 and 32 posts
    account_post_counts = [25] * 40
    # Adjust to sum exactly 1000
    while sum(account_post_counts) > 1000:
        idx = random.randint(0, 39)
        if account_post_counts[idx] > 20:
            account_post_counts[idx] -= 1
    while sum(account_post_counts) < 1000:
        idx = random.randint(0, 39)
        account_post_counts[idx] += 1

    all_posts = []

    for acc_idx, acc in enumerate(ACCOUNTS):
        acc_id = acc["account_id"]
        niche_name = acc["niche"]
        domain_info = next(d for d in DOMAINS if d["niche"] == niche_name)
        n_posts = account_post_counts[acc_idx]
        base_fol = max(600, acc["base_followers"])
        tier_mult = acc["tier_mult"]

        # Generate strictly increasing timestamps for this account
        days_step = max(3, total_days // (n_posts + 2))
        current_dt = start_date + timedelta(days=random.randint(1, 10), hours=random.randint(0, 4))

        for p_idx in range(n_posts):
            # Follower count evolves with gradual realistic growth
            growth_factor = 1.0 + (p_idx / n_posts) * random.uniform(0.10, 0.40)
            cur_followers = int(base_fol * growth_factor)

            # Realistic Media Type Distribution (~40% image, ~20% carousel, ~40% reel)
            m_roll = random.random()
            if m_roll < 0.40:
                media_type = "image"
                media_mult = 1.0
            elif m_roll < 0.60:
                media_type = "carousel"
                media_mult = 1.25  # Carousel has higher saves / swipe engagement
            else:
                media_type = "reel"
                media_mult = 1.35  # Reel has higher shares / reach discovery

            # Date step
            advance_days = random.randint(max(2, days_step - 4), days_step + 4)
            current_dt += timedelta(days=advance_days, hours=random.choice([-2, -1, 0, 1, 2, 3]))
            if current_dt > end_date:
                current_dt = end_date - timedelta(days=random.randint(1, 5), hours=random.randint(1, 4))

            # Posting hour selection (realistic social engagement distribution)
            hour = random.choices(
                [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
                weights=[3, 5, 8, 7, 5, 4, 4, 5, 6, 8, 10, 14, 12, 6, 3]
            )[0]
            pub_dt = current_dt.replace(hour=hour, minute=random.choice([0, 15, 30, 45]))
            pub_iso = pub_dt.strftime("%Y-%m-%dT%H:%M:%SZ")

            caption_text = generate_caption(domain_info, p_idx)

            # Engagement Rate formulation:
            # Baseline rate depends on account tier, followers scale, media type, timing, caption CTA/questions
            is_weekend = 1 if pub_dt.weekday() >= 5 else 0
            time_factor = 1.15 if hour in [18, 19, 20, 21] else 1.0
            weekend_factor = 1.08 if is_weekend else 1.0
            
            # Caption features effect
            has_question = 1.12 if "?" in caption_text else 1.0
            has_cta = 1.10 if any(c in caption_text.lower() for c in ["comment", "save", "share", "bio"]) else 1.0
            
            # Follower scaling effect (diminishing rate for massive accounts)
            scale_penalty = max(0.45, 1.0 - 0.08 * math.log10(cur_followers / 500))

            base_rate = (
                random.gauss(6.5, 1.8) *
                tier_mult *
                media_mult *
                time_factor *
                weekend_factor *
                has_question *
                has_cta *
                scale_penalty
            )
            # Add lognormal noise
            noise = np.random.lognormal(mean=0.0, sigma=0.25)
            target_eng_rate = max(0.4, min(35.0, base_rate * noise))

            # Total engagements count
            total_eng = int(round((target_eng_rate / 100.0) * cur_followers))
            total_eng = max(3, total_eng)

            # Distribute into likes, comments, saves, shares
            if media_type == "carousel":
                p_likes = random.uniform(0.72, 0.82)
                p_comments = random.uniform(0.04, 0.08)
                p_saves = random.uniform(0.08, 0.16)
                p_shares = max(0.01, 1.0 - (p_likes + p_comments + p_saves))
            elif media_type == "reel":
                p_likes = random.uniform(0.70, 0.80)
                p_comments = random.uniform(0.04, 0.09)
                p_saves = random.uniform(0.04, 0.08)
                p_shares = max(0.04, 1.0 - (p_likes + p_comments + p_saves))
            else:  # Image
                p_likes = random.uniform(0.80, 0.88)
                p_comments = random.uniform(0.04, 0.08)
                p_saves = random.uniform(0.03, 0.07)
                p_shares = max(0.01, 1.0 - (p_likes + p_comments + p_saves))

            likes = max(1, int(round(total_eng * p_likes)))
            comments = max(0, int(round(total_eng * p_comments)))
            saves = max(0, int(round(total_eng * p_saves)))
            shares = max(0, int(round(total_eng * p_shares)))

            all_posts.append({
                "account_id": acc_id,
                "published_at": pub_iso,
                "media_type": media_type,
                "caption": caption_text,
                "likes": likes,
                "comments": comments,
                "followers_at_or_near_collection": cur_followers,
                "saves": saves,
                "shares": shares,
            })

    # Sort globally by published_at for chronological purity
    all_posts.sort(key=lambda x: x["published_at"])

    # Assign clean unique sequential post_ids
    for idx, p in enumerate(all_posts):
        p["post_id"] = f"POST_{idx+1:06d}"

    # Verify length
    assert len(all_posts) == 1000, f"Expected 1000 records, got {len(all_posts)}"

    df = pd.DataFrame(all_posts)
    
    # Reorder columns to standard schema
    cols = [
        "post_id",
        "account_id",
        "published_at",
        "media_type",
        "caption",
        "likes",
        "comments",
        "followers_at_or_near_collection",
        "saves",
        "shares"
    ]
    df = df[cols]
    return df


def main():
    DATA_RAW.mkdir(parents=True, exist_ok=True)
    REPORTS.mkdir(parents=True, exist_ok=True)

    # 1. Backup existing dataset if present
    sample_file = DATA_RAW / "sample_test_posts.csv"
    backup_file = DATA_RAW / "original_dataset.csv"
    if sample_file.exists() and not backup_file.exists():
        backup_file.write_bytes(sample_file.read_bytes())
        print(f"Backed up original dataset to {backup_file}")

    # 2. Generate 1,000 unique records
    df = generate_1000_dataset()

    # Save to data/raw/instagram_posts_1000.csv and sample_test_posts.csv
    out_1000 = DATA_RAW / "instagram_posts_1000.csv"
    df.to_csv(out_1000, index=False)
    print(f"Generated 1,000 unique records in {out_1000}")

    # Also update sample_test_posts.csv so default training scripts and validation use the 1,000 records
    df.to_csv(sample_file, index=False)
    print(f"Updated {sample_file} with 1,000 records")

    # 3. Generate Data Quality Report
    total_eng = df["likes"] + df["comments"] + df["saves"] + df["shares"]
    eng_rates = (100.0 * total_eng / df["followers_at_or_near_collection"]).tolist()
    
    media_counts = df["media_type"].value_counts(normalize=True).to_dict()
    media_dist = {k: f"{v*100:.1f}%" for k, v in media_counts.items()}

    quality_report = {
        "dataset_name": "instagram_posts_1000.csv",
        "dataset_type": "Synthetic Research Dataset (Emulating realistic Instagram post dynamics)",
        "rows": len(df),
        "unique_post_ids": int(df["post_id"].nunique()),
        "duplicate_rows": int(df.duplicated().sum()),
        "duplicate_combinations": int(df.duplicated(subset=["account_id", "published_at", "caption"]).sum()),
        "unique_accounts": int(df["account_id"].nunique()),
        "date_range": {
            "start": df["published_at"].min(),
            "end": df["published_at"].max()
        },
        "media_distribution": media_dist,
        "missing_values": {col: int(df[col].isna().sum()) for col in df.columns},
        "follower_statistics": {
            "min": int(df["followers_at_or_near_collection"].min()),
            "median": int(df["followers_at_or_near_collection"].median()),
            "mean": round(float(df["followers_at_or_near_collection"].mean()), 1),
            "max": int(df["followers_at_or_near_collection"].max())
        },
        "engagement_rate_statistics": {
            "min_pct": round(float(min(eng_rates)), 2),
            "median_pct": round(float(np.median(eng_rates)), 2),
            "mean_pct": round(float(np.mean(eng_rates)), 2),
            "max_pct": round(float(max(eng_rates)), 2)
        },
        "provenance_and_licensing": "Synthetic research data generated for controlled ML evaluation. No real personal data or proprietary Instagram internal metrics.",
        "generated_at": datetime.utcnow().isoformat() + "Z"
    }

    report_path = REPORTS / "dataset_quality.json"
    report_path.write_text(json.dumps(quality_report, indent=2), encoding="utf-8")
    print(f"Saved dataset quality report to {report_path}")


if __name__ == "__main__":
    main()
