import cv2
import os
import json
import asyncio
from pathlib import Path
from google import genai
from google.genai import types
from dotenv import load_dotenv

ENV_PATH = Path(__file__).with_name(".env")
load_dotenv(dotenv_path=ENV_PATH)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

PRIMARY_MODEL = "models/gemini-2.5-pro"
FALLBACK_MODEL = "models/gemini-2.5-flash"


# -----------------------------
# SPORT-SPECIFIC CONTEXT ONLY
# -----------------------------

def basketball_context():
    return {
        "sport": "basketball",
        "rules": """
        - Rule 1: A made basket counts only if the ball is released before the game/shot clock expires.
        - Rule 2: A player is out of bounds if they touch the boundary line or anything outside the court.
        - Rule 3: A blocking foul occurs when a defender illegally impedes an offensive player without legal guarding position.
        - Rule 4: A charging foul occurs when an offensive player runs into a defender who already has legal guarding position.
        - Rule 5: A shooting foul occurs when illegal contact affects a player during a shot attempt.
        - Rule 6: A reach-in foul occurs when a defender makes illegal arm/hand contact while trying to steal the ball.
        - Rule 7: A holding foul occurs when a player restricts an opponent's movement by grabbing or holding.
        - Rule 8: A pushing foul occurs when a player displaces an opponent with hands, arms, or body.
        - Rule 9: An illegal screen occurs when a screener moves into contact or does not give enough space.
        - Rule 10: Over-the-back contact is illegal if a player gains advantage by contacting an opponent from behind during a rebound.
        - Rule 11: A travel occurs when a player moves illegally with the ball without dribbling.
        - Rule 12: A double dribble occurs when a player dribbles, stops, then dribbles again.
        - Rule 13: A carry/palming violation occurs when the player places the hand under the ball and continues dribbling.
        - Rule 14: Goaltending occurs when a player touches a shot on its downward path toward the basket.
        - Rule 15: Basket interference occurs when a player touches the ball or rim while the ball is on or above the cylinder.
        - Rule 16: If evidence is unclear, the verdict must be Inconclusive.
        """,
        "visual_focus": """
        Focus on body contact, legal guarding position, foot placement, ball release timing,
        shot clock/game clock, dribble control, cylinder/rim contact, and whether contact affected the play.
        """
    }


def baseball_context():
    return {
        "sport": "baseball",
        "rules": """
        - Rule 1: A runner is out if tagged while not touching a base.
        - Rule 2: A force out occurs when the ball reaches the forced base before the runner.
        - Rule 3: A catch is valid if the fielder securely controls the ball before it touches the ground.
        - Rule 4: A fair ball lands or is touched in fair territory, or passes first/third base in fair territory.
        - Rule 5: A foul ball lands or is touched in foul territory before passing first/third base.
        - Rule 6: A runner is safe if they reach the base before the tag or force play.
        - Rule 7: Interference occurs when an offensive player illegally hinders a defender.
        - Rule 8: Obstruction occurs when a defender without the ball illegally impedes a runner.
        - Rule 9: If evidence is unclear, the verdict must be Inconclusive.
        - Rule 10: It is NOT a foul if contact was made after the shot was attempted.
        """,
        "visual_focus": """
        Focus on ball control, glove/tag timing, runner/base contact, foul lines, first touch location,
        and whether the ball or runner arrived first.
        """
    }


def soccer_context():
    return {
        "sport": "soccer",
        "rules": """
        - Rule 1: A goal counts only if the entire ball crosses the entire goal line.
        - Rule 2: The ball is out of play only when the entire ball crosses the entire touchline or goal line.
        - Rule 3: A foul occurs when a player carelessly, recklessly, or excessively trips, pushes, charges, kicks, or holds an opponent.
        - Rule 4: A handball occurs when a player illegally handles the ball with the hand or arm.
        - Rule 5: Offside requires an attacking player to be in an offside position and become involved in active play.
        - Rule 6: A slide tackle is legal if the player fairly plays the ball without illegal contact.
        - Rule 7: If evidence is unclear, the verdict must be Inconclusive.
        """,
        "visual_focus": """
        Focus on ball crossing lines, player contact, timing of the pass for offside,
        arm/hand contact, tackle direction, and whether the player played the ball or opponent.
        """
    }


def football_context():
    return {
        "sport": "football",
        "rules": """
        - Rule 1: A catch requires control of the ball and completion of the catching process.
        - Rule 2: A player is out of bounds if any body part other than hand or foot touches out of bounds.
        - Rule 3: A touchdown occurs when the ball breaks the plane of the goal line while controlled by a player.
        - Rule 4: A runner is down when a body part other than hand or foot touches the ground after contact.
        - Rule 5: Pass interference occurs when a player illegally restricts an opponent's opportunity to catch a pass.
        - Rule 6: Holding occurs when a player illegally grabs or restricts an opponent.
        - Rule 7: Roughing/contact fouls occur when illegal contact is made after the ball is thrown, kicked, or the play is over.
        - Rule 8: A fumble occurs when a player loses possession before being down.
        - Rule 9: If evidence is unclear, the verdict must be Inconclusive.
        """,
        "visual_focus": """
        Focus on possession, feet/body in bounds, ball crossing the plane, knee/elbow contact,
        timing of contact, and whether the player had control before losing the ball.
        """
    }


def hockey_context():
    return {
        "sport": "hockey",
        "rules": """
        - Rule 1: A goal counts only if the puck completely crosses the goal line.
        - Rule 2: No goal if the puck is intentionally kicked, thrown, or illegally directed into the net.
        - Rule 3: Offside occurs when an attacking player enters the offensive zone before the puck.
        - Rule 4: Icing occurs when a player shoots the puck across both the center red line and opposing goal line without a legal touch.
        - Rule 5: Tripping occurs when a player uses stick, leg, or body to cause an opponent to fall.
        - Rule 6: Hooking occurs when a player uses the stick to restrain an opponent.
        - Rule 7: Interference occurs when a player impedes an opponent who does not have the puck.
        - Rule 8: High-sticking occurs when a stick makes illegal contact above normal shoulder height.
        - Rule 9: Goalie interference occurs when contact prevents the goalie from playing their position.
        - Rule 10: If evidence is unclear, the verdict must be Inconclusive.
        """,
        "visual_focus": """
        Focus on puck crossing the line, skate/stick contact, zone entry timing,
        goalie contact, stick position, and whether contact affected the play.
        """
    }


def volleyball_context():
    return {
        "sport": "volleyball",
        "rules": """
        - Rule 1: A ball is in if it touches any part of the boundary line.
        - Rule 2: A ball is out if it lands completely outside the boundary lines.
        - Rule 3: A team may contact the ball up to three times before returning it.
        - Rule 4: A double contact occurs when one player contacts the ball twice illegally in succession.
        - Rule 5: A lift/carry occurs when the ball is caught, thrown, or held instead of cleanly hit.
        - Rule 6: A net fault occurs when a player illegally touches the net during play.
        - Rule 7: A foot fault occurs when a server steps on or over the service line during the serve.
        - Rule 8: A centerline fault occurs when a player illegally crosses under the net and interferes with the opponent.
        - Rule 9: If evidence is unclear, the verdict must be Inconclusive.
        """,
        "visual_focus": """
        Focus on ball landing location, line contact, number of team touches,
        hand contact quality, net contact, service foot placement, and centerline crossing.
        """
    }


def tennis_context():
    return {
        "sport": "tennis",
        "rules": """
        - Rule 1: A ball touching any part of a boundary line is IN.
        - Rule 2: A ball is OUT only if it lands completely outside the line.
        - Rule 3: A net cord during a rally is legal if the ball lands in.
        - Rule 4: A serve that hits the net and lands in the correct service box is a let.
        - Rule 5: A double bounce means the player failed to return the ball legally.
        - Rule 6: A player loses the point if they touch the net while the ball is in play.
        - Rule 7: A player loses the point if the ball touches them before bouncing.
        - Rule 8: If evidence is unclear, the verdict must be Inconclusive.
        """,
        "visual_focus": """
        Focus on ball bounce location, line contact, double bounce timing,
        net contact, player contact, and whether the decisive moment is clearly visible.
        """
    }


SPORT_CONTEXTS = {
    "baseball": baseball_context,
    "basketball": basketball_context,
    "soccer": soccer_context,
    "football": football_context,
    "hockey": hockey_context,
    "volleyball": volleyball_context,
    "tennis": tennis_context,
}

# -----------------------------
# GENERIC HELPERS
# -----------------------------

def timestamp_to_seconds(timestamp):
    try:
        parts = timestamp.strip().split(":")
        minutes = int(parts[0])
        seconds = float(parts[1])
        return minutes * 60 + seconds
    except Exception:
        return None


def extract_frame_at_timestamp(video_path, timestamp, output_path):
    seconds = timestamp_to_seconds(timestamp)

    if seconds is None:
        return None

    cap = cv2.VideoCapture(video_path)

    fps = cap.get(cv2.CAP_PROP_FPS)

    if fps <= 0:
        cap.release()
        return None

    frame_number = int(seconds * fps)

    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)

    ret, frame = cap.read()
    cap.release()

    if not ret:
        return None

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    cv2.imwrite(output_path, frame)

    return {
        "frame_number": frame_number,
        "image_path": output_path
    }

def validate_video(video_path):
    if not video_path.lower().endswith(".mp4"):
        return "Only .mp4 video files are supported."

    if not os.path.exists(video_path):
        return f"Video not found: {video_path}"

    return None


def safe_json_parse(response):
    fallback = {
        "verdict": "Inconclusive",
        "event_identified": "Unable to parse model response",
        "decisive_timestamp": "unknown",
        "decisive_frame_number": "unknown",
        "decisive_moment": "Unable to determine decisive moment",
        "reasoning": "EVIDENCE: Model did not return valid JSON.\nRULE: Invalid response format.\nCONCLUSION: Inconclusive.",
        "rule_reference": "N/A",
        "timestamps": "unknown",
        "certainty": "0%"
    }

    try:
        if response.parsed:
            return response.parsed
    except Exception:
        pass

    raw_text = ""

    try:
        raw_text = response.text.strip()
    except Exception:
        return fallback

    try:
        return json.loads(raw_text)
    except Exception:
        pass

    # Remove markdown code fences if Gemini wraps JSON
    cleaned = raw_text.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(cleaned)
    except Exception:
        pass

    # Extract first JSON object from messy text
    start = cleaned.find("{")
    end = cleaned.rfind("}")

    if start != -1 and end != -1 and end > start:
        candidate = cleaned[start:end + 1]

        try:
            return json.loads(candidate)
        except Exception:
            pass

    return fallback

def normalize_final_json(raw):
    required = {
        "verdict": "Inconclusive",
        "event_identified": "Unknown event",
        "decisive_timestamp": "unknown",
        "decisive_frame_number": "unknown",
        "decisive_moment": "Unknown decisive moment",
        "reasoning": "EVIDENCE: Insufficient evidence.\nRULE: Cannot apply rule confidently.\nCONCLUSION: Inconclusive.",
        "rule_reference": "N/A",
        "timestamps": "unknown",
        "certainty": "0%"
    }

    if not isinstance(raw, dict):
        return required

    for key in required:
        if key not in raw or raw[key] in [None, ""]:
            raw[key] = required[key]

    if raw["verdict"] not in ["Fair Call", "Bad Call", "Inconclusive"]:
        raw["verdict"] = "Inconclusive"

    return {
        "verdict": str(raw["verdict"]),
        "event_identified": str(raw["event_identified"]),
        "decisive_timestamp": str(raw["decisive_timestamp"]),
        "decisive_frame_number": str(raw["decisive_frame_number"]),
        "decisive_moment": str(raw["decisive_moment"]),
        "reasoning": str(raw["reasoning"]),
        "rule_reference": str(raw["rule_reference"]),
        "timestamps": str(raw["timestamps"]),
        "certainty": str(raw["certainty"])
    }

async def loading_indicator(stop_event):
    start_time = asyncio.get_event_loop().time()

    messages = [
        "Uploading and reading video...",
        "Finding the decisive moment...",
        "Applying sport-specific rules...",
        "Waiting for Gemini response...",
        "Still working..."
    ]

    i = 0

    while not stop_event.is_set():
        await asyncio.sleep(10)

        if not stop_event.is_set():
            elapsed = int(asyncio.get_event_loop().time() - start_time)

            print("\n  > [RefCheck AI] STATUS UPDATE")
            print("  > Elapsed Time:", str(elapsed), "seconds")
            print("  > Current Step:", messages[i % len(messages)])

            i += 1

def generate_with_fallback(video_upload, prompt):
    models_to_try = [
        PRIMARY_MODEL,
        FALLBACK_MODEL
    ]

    last_error = None

    for model_name in models_to_try:
        try:
            print("\nTrying model:", model_name)

            response = client.models.generate_content(
                model=model_name,
                contents=[video_upload, prompt],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.0
                )
            )

            print("Model succeeded:", model_name)
            return response

        except Exception as exc:
            print("Model failed:", model_name)
            print("Reason:", str(exc))
            last_error = exc

    raise Exception(last_error)

def get_video_duration_seconds(video_path):
    cap = cv2.VideoCapture(video_path)

    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)

    cap.release()

    if fps <= 0:
        return None

    return frame_count / fps

def is_suspicious_timestamp(timestamp, video_duration):
    seconds = timestamp_to_seconds(timestamp)

    if seconds is None:
        return True

    if video_duration and seconds > video_duration:
        return True

    # Reject near-zero timestamp unless the video is extremely short
    if seconds < 0.25 and video_duration and video_duration > 2:
        return True

    return False

# -----------------------------
# GENERIC ANALYSIS ENGINE
# -----------------------------

async def analyze_play(video_path, sport, claimed_call=None, debug=True):
    sport = sport.lower().strip()

    error = validate_video(video_path)
    if error:
        return {"error": error}

    if sport not in SPORT_CONTEXTS:
        return {"error": "Sport '" + sport + "' is not supported."}

    context = SPORT_CONTEXTS[sport]()

    if debug:
        print("Uploading video for " + sport + " analysis...")

    video_upload = client.files.upload(file=video_path)

    while client.files.get(name=video_upload.name).state.name == "PROCESSING":
        await asyncio.sleep(2)

    claimed_call_text = claimed_call if claimed_call else "No explicit call was provided. Infer the original call only if it is clearly visible or audible. If the original call cannot be determined, return Inconclusive."
    video_duration = get_video_duration_seconds(video_path)

    prompt = f"""
    ROLE:
    You are a generic AI replay referee. You are not a tennis-only, basketball-only, or football-only model.
    Your job is to judge whether the original referee/player call was correct using ONLY the video evidence
    and the sport-specific rules provided below.

    SPORT:
    {context["sport"]}

    ORIGINAL CALL TO CHECK:
    {claimed_call_text}

    SPORT-SPECIFIC RULES:
    {context["rules"]}

    SPORT-SPECIFIC VISUAL FOCUS:
    {context["visual_focus"]}

    UNIVERSAL OFFICIATING PROCEDURE:

    Step 1 — Identify the decisive moment.
    Find the most important instant in the clip where the disputed play is decided.
    This may include (but is not exclusive to):
    - player contact
    - ball bounce
    - ball crossing a line
    - ball release
    - catch moment
    - tag moment
    - puck crossing line
    - foot placement
    - boundary interaction
    - net contact
    - possession change

    Step 2 — Analyze temporal context.
    Carefully inspect the frames immediately BEFORE, DURING, and AFTER the decisive moment. (Could be more than one frame)
    Do not judge the play using a single isolated frame.

    Step 3 — Determine the relevant interaction.
    Identify:
    - timing
    - contact
    - possession
    - line/boundary relationship
    - body positioning
    - ball/object trajectory
    - sequence of events

    Step 4 — Apply ONLY the relevant sport-specific rules.
    Ignore unrelated rules.

    Step 5 — Return a verdict.
    - Fair Call = original call was correct
    - Bad Call = original call was incorrect
    - Inconclusive = evidence is insufficient

    You must identify ONE decisive timestamp.
    This is the timestamp where the disputed call is best resolved.
    Do not send an image.
    Only return the timestamp as text in decisive_timestamp.

    VIDEO TIMING:
    The uploaded video starts at 00:00.00.
    All timestamps must be measured from the beginning of this uploaded MP4.
    The full video duration is approximately {video_duration:.2f} seconds.
    Do not use broadcast/game-clock time.
    Do not use relative time from the decisive moment.

    You must return the decisive timestamp measured from the start of the uploaded MP4.

    You must also estimate the decisive frame number.

    Example:
    If the decisive moment occurs around 3 seconds into a 25 fps video, return:
    "decisive_timestamp": "00:03.00"
    "decisive_frame_number": 75

    Do not return "00:00.02" unless the decisive moment truly happens within the first 0.02 seconds of the uploaded video.    

    REQUIRED JSON FORMAT:
    {{
        "verdict": "Fair Call" | "Bad Call" | "Inconclusive",
        "event_identified": "A concise title",
        "decisive_timestamp": "MM:SS.SS or unknown",
        "decisive_frame_number": "integer frame number from start of uploaded MP4 or unknown",
        "decisive_moment": "The exact moment that best resolves the disputed call",
        "reasoning": "EVIDENCE: [Timestamp + physical observation]\\nRULE: [Relevant sport-specific rule]\\nCONCLUSION: [Why the call is Fair, Bad, or Inconclusive]",
        "rule_reference": "The specific rule from the provided sport context",
        "timestamps": "MM:SS.SS or unknown",
        "certainty": "XX%"
    }}
    """

    stop_loading = asyncio.Event()
    loading_task = asyncio.create_task(loading_indicator(stop_loading))

    try:
        response = generate_with_fallback(video_upload, prompt)

        parsed = safe_json_parse(response)
        final_result = normalize_final_json(parsed)

        decisive_timestamp = final_result.get("decisive_timestamp", "unknown")

        if decisive_timestamp != "unknown" and is_suspicious_timestamp(decisive_timestamp, video_duration):
            print("Suspicious timestamp from model:", decisive_timestamp)
            final_result["timestamp_warning"] = "Model returned a suspicious timestamp."
            final_result["decisive_frame_number"] = None
            final_result["decisive_frame_url"] = None
            return final_result

        if decisive_timestamp != "unknown":
            output_dir = "static/evidence_frames"
            output_filename = "decisive_frame.jpg"
            output_path = os.path.join(output_dir, output_filename)

            frame_info = extract_frame_at_timestamp(
                video_path,
                decisive_timestamp,
                output_path
            )

            if frame_info:
                final_result["model_decisive_frame_number"] = final_result.get("decisive_frame_number", "unknown")
                final_result["decisive_frame_number"] = frame_info["frame_number"]
                final_result["decisive_frame_url"] = "/" + output_path.replace("\\", "/")
            else:
                final_result["decisive_frame_number"] = None
                final_result["decisive_frame_url"] = None
        else:
            final_result["decisive_frame_number"] = None
            final_result["decisive_frame_url"] = None

        return final_result

    except Exception as exc:
        return {"error": "Analysis failed: " + str(exc)}

    finally:
        stop_loading.set()
        await loading_task

# -----------------------------
# TERMINAL DEBUGGING
# -----------------------------

if __name__ == "__main__":
    target_video = "videos/BBClip4.mp4"
    sport = "basketball"

    # Optional but strongly recommended:
    # examples: "The player/referee called the ball OUT"
    #           "The referee called a foul"
    #           "The shot was ruled after the buzzer"
    claimed_call = ""

    print("--- Starting RefCheck AI ---")
    print("Video:", target_video)
    print("Sport:", sport)
    print("Claimed call:", claimed_call)

    result = asyncio.run(
        analyze_play(
            video_path=target_video,
            sport=sport,
            claimed_call=claimed_call,
            debug=True
        )
    )

    print("\n--- FINAL VERDICT ---")
    print(json.dumps(result, indent=2))

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# -----------------------------
# CORS (IMPORTANT for React)
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# API ENDPOINT
# -----------------------------
@app.post("/analyze")
async def analyze_endpoint(
    file: UploadFile = File(...),
    sport: str = Form(...)
):
    # Save uploaded video temporarily
    video_path = f"temp_{file.filename}"

    with open(video_path, "wb") as f:
        f.write(await file.read())

    try:
        result = await analyze_play(
            video_path=video_path,
            sport=sport,
            claimed_call=""
        )
        return result

    finally:
        # cleanup file
        if os.path.exists(video_path):
            os.remove(video_path)
 