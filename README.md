# 🏁 RefCheck AI: Multimodal Replay Referee

RefCheck AI is an advanced video analysis tool designed to assist in sports officiating. Using Google's Gemini 2.5 multimodal models, it analyzes video clips to determine if a referee's call was correct, applying specific rulebooks and visual focus parameters for different sports.

---

# 🚀 Core Features

- **Hybrid Rule Engine:** Uses a fast, static rule set for standard sports and a high-fidelity PDF-based rulebook for Tennis.

- **Gemini Context Caching:** Implements explicit caching for the Tennis rulebook (`TennisRules.pdf`), reducing latency and token costs by 90% for repeated analysis.

- **Decisive Moment Identification:** Automatically locates the exact timestamp and frame where a play is decided (e.g., ball bounce, player contact).

- **Frame Extraction:** Uses OpenCV to extract and save the "decisive frame" as visual evidence for the front end.

- **Safety Constraints:** Includes a mandatory 30-second video limit to ensure efficient processing and prevent API overages.

---

# 🛠 Tech Stack

- **AI Model:** Google Gemini 2.5 Pro (Primary) & Gemini 2.5 Flash (Fallback)

- **Computer Vision:** OpenCV (`cv2`) for frame manipulation and metadata extraction

- **Runtime:** Python 3.10+ with `asyncio` for non-blocking analysis

- **Environment:** `python-dotenv` for secure API key management

---

# 📂 Project Structure

```plaintext
REFCheckAI/
├── BackEnd/
│   ├── main.py                # Core analysis engine & API logic
│   └── .env                   # API Keys (GEMINI_API_KEY)
├── Rules/
│   └── TennisRules.pdf        # Cached rulebook for Tennis analysis
├── static/
│   └── evidence_frames/       # Extracted "decisive moment" JPEGs
├── videos/                    # Local storage for uploaded MP4s
└── README.md
```

---

# 🏀 Supported Sports

| Sport | Methodology | Focus Areas |
|---|---|---|
| Tennis | Cached PDF Rulebook | Line contact, double bounces, net touches |
| Basketball | Static Rule Logic | Shot clock, out of bounds, shooting fouls |
| Soccer | Static Rule Logic | Goal line technology, offsides, handballs |
| Football | Static Rule Logic | Catch completion, down-by-contact, goal plane |
| Hockey | Static Rule Logic | Crease violations, high-sticking, icing |

---

# 🔍 How It Works

1. **Validation:**  
   The system checks if the video is an `.mp4` and confirms it is ≤ 30 seconds.

2. **Context Loading:**  
   - For standard sports, it loads a predefined list of rules.  
   - For Tennis, it checks for an existing Context Cache on the Gemini server. If not found, it uploads `TennisRules.pdf` and creates a 1-hour cache.

3. **Analysis:**  
   The video is sent to Gemini 2.5 Pro. The model performs a temporal analysis (checking frames before, during, and after the event).

4. **Evidence Extraction:**  
   The model returns a JSON response containing a `decisive_timestamp`. The system then uses OpenCV to "screenshot" that exact moment from the video.

5. **Verdict:**  
   A final JSON object is returned with the verdict (`Fair Call`, `Bad Call`, or `Inconclusive`), reasoning, and a URL to the evidence frame.

---

# ⚠️ Important Notes

- **API Limits:**  
  Large PDF files and videos consume tokens. Tennis analysis uses caching to minimize this, but ensure your Gemini API quota is sufficient.

- **Suspicious Timestamps:**  
  The engine includes a "Suspicious Timestamp" filter that flags model hallucinations (e.g., if the model suggests a timestamp that occurs after the video has ended).

> [!TIP]
> Setup instructions are coming soon! We will cover environment variables, virtual environments, and required system dependencies (like FFmpeg for OpenCV).
