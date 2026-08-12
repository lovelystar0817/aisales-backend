import os
import sys
import logging
import httpx
import json
from dotenv import load_dotenv
import asyncio
from typing import Dict, Any, Optional
import psutil
import multiprocessing
from datetime import datetime

# Add current directory to Python path to ensure local imports work
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from livekit.agents import AgentSession, Agent, RoomInputOptions, JobContext, WorkerOptions, cli, JobProcess
from livekit.plugins import elevenlabs, openai, silero, noise_cancellation, google, speechmatics, cartesia, xai
from livekit.agents.worker import JobExecutorType
from livekit.agents import metrics, MetricsCollectedEvent
from livekit import api
from openai.types.beta.realtime.session import TurnDetection

# Import heartbeat monitoring module
from heartbeat_monitor import initialize_monitor, get_monitor


logger = logging.getLogger(__name__)
logger.info("Starting LiveKit worker...")

# Determine environment and set logging level accordingly
ENVIRONMENT = os.getenv("ENVIRONMENT", "prod")
log_level = logging.DEBUG if ENVIRONMENT.lower() == "dev" else logging.WARNING

logging.basicConfig(
    level=log_level,
    format="%(asctime)s %(levelname)-8s %(name)s: %(message)s"
)

# Suppress debug logs from third-party libraries
logging.getLogger("openai").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)

# Load appropriate .env file
dotenv_file = ".env.dev" if ENVIRONMENT.lower() == "dev" else ".env"
load_dotenv(dotenv_path=dotenv_file)
logger.info(f"ENVIRONMENT: {ENVIRONMENT}")
logger.info(f"DOTENV_FILE: {dotenv_file}")

# Environment variables
BASE_URL = os.getenv("BASE_URL")
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENTYPHOON_API_KEY = os.getenv("OPENTYPHOON_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")
LIVEKIT_URL = os.getenv("LIVEKIT_URL")
AGENT_NAME = os.getenv("AGENT_NAME")
AZURE_SPEECH_KEY = os.getenv("AZURE_SPEECH_KEY")
AZURE_SPEECH_REGION = os.getenv("AZURE_SPEECH_REGION")
GOOGLE_CREDENTIALS = os.getenv("GOOGLE_CREDENTIALS")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
SPEECHMATICS_API_KEY = os.getenv("SPEECHMATICS_API_KEY")
CARTESIA_API_KEY = os.getenv("CARTESIA_API_KEY")
XAI_API_KEY = os.getenv("XAI_API_KEY")

# Recording configuration
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "ap-southeast-1")
AWS_BUCKET = os.getenv("AWS_BUCKET")

# Constants
MAX_RETRIES = 3
RETRY_DELAY = 5  # seconds

# Thai Voice Actor
CARTESIA_KT_AXA_ROLEPLAY_MALE_VOICE_ID = "9dab21a5-fe7a-4a49-8f2f-d1f3da0fc2a2"
CARTESIA_KT_AXA_ROLEPLAY_FEMALE_VOICE_ID = "40a7bd17-1b70-4a6f-b5f8-f784aed25839"

# Personas that use KT-AXA roleplay voice (Thai)
KT_AXA_ROLEPLAY_PERSONAS = {
    'piya-freelancer-ktaxa-easy',
    'piya-freelancer-ktaxa-medium',
    'korn-content-creator',
}

# Female personas that use KT-AXA roleplay female voice (Thai)
KT_AXA_ROLEPLAY_FEMALE_PERSONAS = {
    'supaporn-banker-ktaxa-medium',
    'jintana-shop-owner-ktaxa-fna-easy',
    'jintana-shop-owner-ktaxa-fna-medium',
    'sirion-training-executive',
    'saji-hostel-owner',
    'naruemon-executive',
}

# AIA Korea Cartesia voice mappings (professional voice clones)
# Maps persona friendly IDs to their specific Cartesia voice configurations
# TODO: Replace placeholder voice IDs with professional clones once ready
AIA_KOREA_VOICE_MAPPINGS = {
    'kim-woo-jung-early-insurance-interest-aia-ko': {
        'platform': 'cartesia',
        'voice_id': 'd51643a1-4cf3-4265-9eb7-17fd023ddf9b',  # Male 50s clone
        'model': 'sonic-3-2025-10-27',
    },
    'choi-sun-ho-unaware-necessity-aia-ko': {
        'platform': 'cartesia',
        'voice_id': 'b1d019e4-57f9-4950-861c-af50df558d96',  # Male 60s clone
        'model': 'sonic-3-2025-10-27',
    },
    'lee-soon-young-medical-history-concern-aia-ko': {
        'platform': 'cartesia',
        'voice_id': 'f2b877cc-ac26-4c6d-9143-2660ca709129',  # Female 60s clone
        'model': 'sonic-3-2025-10-27',
    },
}

# AIA Korea ElevenLabs v3 voice mappings (per-persona custom voices)
AIA_KOREA_11LABS_VOICE_MAPPINGS = {
    'kim-woo-jung-early-insurance-interest-aia-ko': 'Ori1rnHIeeysIxrsFZ2X',
    'choi-sun-ho-unaware-necessity-aia-ko': 'fFtdAHycbczdli79p3pk',
    'lee-soon-young-medical-history-concern-aia-ko': 'bOFHo7Lo7txoKRrUb1kp',
}

# Initialize connection pool for HTTP requests
http_client = httpx.AsyncClient(
    timeout=30.0,
    limits=httpx.Limits(
        max_keepalive_connections=20,
        max_connections=100,
        keepalive_expiry=30,
    )
)

def get_language_config(lang: str, voice_config: Optional[str] = None) -> tuple[str, str, str, str, str, bool, bool]:
    """
    Returns: (initial_message, tts_language, stt_language, language_name, model, use_openai_realtime, use_xai_realtime)
    """
    if voice_config == 'thai14' and lang.lower() == 'th':
        return ('สวัสดี!', 'th', 'th', 'Thai', 'gpt-realtime', True, False)

    if voice_config == 'thai5' and lang.lower() == 'th':
          return ('สวัสดี!', 'th-TH', 'th', 'Thai', 'eleven_flash_v2_5', False, False)

    if (voice_config == 'thai6' or voice_config == 'thai7' or voice_config == 'thai8' or voice_config == 'thai9' or voice_config == 'thai10' or voice_config == 'thai11' or voice_config == 'thai12' or voice_config == 'thai13') and lang.lower() == 'th':
          return ('สวัสดี!', 'th', 'th', 'Thai', 'cartesia', False, False)

    if (voice_config == 'thai15' and lang.lower() == 'th'):
        return ('สวัสดี!', 'th', 'th', 'Thai', 'cartesia', False, False)

    if voice_config == 'alibaba1' and lang.lower() == 'en':
        return ('Hey!', 'en', 'en', 'English', 'eleven_flash_v2_5', False, False)

    if voice_config == 'aiako-gpt-realtime' and lang.lower() == 'ko':
        return ('안녕하세요!', 'ko', 'ko', 'Korean', 'gpt-realtime', True, False)

    if voice_config == 'aiako-gpt52-cartesia' and lang.lower() == 'ko':
        return ('안녕하세요!', 'ko', 'ko', 'Korean', 'cartesia', False, False)

    if voice_config == 'aiako-gpt52-turbo' and lang.lower() == 'ko':
        return ('안녕하세요!', 'ko', 'ko', 'Korean', 'eleven_flash_v2_5', False, False)

    if voice_config == 'aiako-gpt41mini-turbo' and lang.lower() == 'ko':
        return ('안녕하세요!', 'ko', 'ko', 'Korean', 'eleven_flash_v2_5', False, False)

    configs = {
        'en': ('Hey!', 'en', 'en', 'English', 'eleven_flash_v2_5', False, False),
        'tl': ('Kumusta?', 'fil', 'fil', 'Tagalog', 'eleven_turbo_v2_5', False, False),
        'vi': ('Chào!', 'vi', 'vie', 'Vietnamese', 'eleven_flash_v2_5', False, False),
        'th': ('สวัสดี!', 'th', 'th', 'Thai', 'cartesia', False, False),
        'ceb': ('Kumusta!', 'ceb', 'ceb', 'Cebuano', 'gpt-realtime', True, False),  # Cebuano with OpenAI Realtime
        # 'ceb': ('Kumusta!', 'fil', 'ceb', 'eleven_turbo_v2_5', False),  # Cebuano: TTS uses Tagalog (fil), STT uses Cebuano (ceb)
        'yue': ('你好！', 'yue', 'yue', 'Cantonese', 'gpt-realtime', True, False),  # Cantonese with gpt-realtime
    }

    return configs.get(lang.lower(), configs['en'])


class ResourceMonitor:
    """Monitor system resources and log warnings when thresholds are exceeded."""

    def __init__(self):
        self._monitoring_task = None

    def start_monitoring(self):
        """Start monitoring in the current event loop."""
        if self._monitoring_task is None:
            self._monitoring_task = asyncio.create_task(self._monitor_loop())

    async def _monitor_loop(self):
        while True:
            try:
                cpu_percent = psutil.cpu_percent(interval=1)
                memory = psutil.virtual_memory()
                active_processes = len(psutil.pids())

                if memory.percent > 85:
                    logger.warning(f"⚠️ High memory usage: {memory.percent}%")
                if cpu_percent > 90:
                    logger.warning(f"⚠️ High CPU usage: {cpu_percent}%")

                logger.debug(f"📊 CPU: {cpu_percent}%, Memory: {memory.percent}%, Processes: {active_processes}")
            except Exception as e:
                logger.error(f"Resource monitoring error: {e}")

            await asyncio.sleep(30)  # Check every 30 seconds


# Initialize resource monitor (but don't start it yet)
monitor = ResourceMonitor()

# Global flag to ensure heartbeat starts only once across all worker processes
heartbeat_lock = multiprocessing.Lock()
heartbeat_started = multiprocessing.Value('b', False)  # Shared boolean


async def fetch_session_data(session_id: str, language: str = 'en') -> Dict[str, Any]:
    """
    Fetch session data for a given session with retry logic.

    Args:
        session_id: The session identifier
        language: Language code for the session (default: 'en')

    Returns:
        Dict containing session data including voice and persona

    Raises:
        httpx.HTTPStatusError: For HTTP errors after all retries
        httpx.RequestError: For network errors after all retries
        ValueError: For JSON parsing errors
        KeyError: If expected data structure is missing
    """
    url = f"{BASE_URL}/livekit/{session_id}/roleplay"

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Accept-Language": language,
                "X-Internal-Service": "livekit-agent",
                "User-Agent": "LiveKit-Agent/1.0"
            }

            resp = await http_client.get(
                url,
                params={"medium": "voice"},
                headers=headers
            )

            if resp.status_code == 404:
                logger.error(f"❌ 404 Not Found - URL might be incorrect: {url}")
                logger.error(f"❌ Response text: {resp.text}")

            resp.raise_for_status()

            # Parse and validate response
            data = resp.json()
            logger.info(f"✅ Successfully parsed JSON response")

            # Parse and validate response
            if "session" not in data:
                logger.error(f"❌ No 'session' key in response. Keys found: {list(data.keys())}")
                raise KeyError("No 'session' key in response")

            logger.info(f"✅ Session data retrieved successfully")
            return data["session"]

        except httpx.HTTPStatusError as e:
            logger.error(f"❌ HTTP error on attempt {attempt}: {e.response.status_code}")
            logger.error(f"❌ Response URL: {e.response.url}")
            logger.error(f"❌ Response text: {e.response.text}")
            if attempt == MAX_RETRIES:
                return None

        except httpx.RequestError as e:
            logger.error(f"❌ Network error on attempt {attempt}: {e}")
            if attempt == MAX_RETRIES:
                return None

        except Exception as e:
            logger.error(f"❌ Unexpected error on attempt {attempt}: {e}")
            if attempt == MAX_RETRIES:
                return None

        if attempt < MAX_RETRIES:
            logger.info(f"⏳ Retrying in {RETRY_DELAY} seconds...")
            await asyncio.sleep(RETRY_DELAY)

    return None


async def start_audio_recording(room_name: str) -> Optional[str]:
    """
    Start audio-only recording of the conversation with S3 upload

    Args:
        room_name: The name of the LiveKit room to record

    Returns:
        The egress ID if recording started successfully, None otherwise
    """
    try:
        # Create LiveKit API client
        lkapi = api.LiveKitAPI(
            url=LIVEKIT_URL,
            api_key=LIVEKIT_API_KEY,
            api_secret=LIVEKIT_API_SECRET
        )

        # Check AWS credentials
        if not AWS_ACCESS_KEY_ID or not AWS_SECRET_ACCESS_KEY:
            logger.error("❌ AWS credentials not configured")
            await lkapi.aclose()
            return None

        if not AWS_BUCKET:
            logger.error("❌ AWS bucket not configured")
            await lkapi.aclose()
            return None

        # Create S3 upload configuration
        s3_upload = api.S3Upload(
            access_key=AWS_ACCESS_KEY_ID,
            secret=AWS_SECRET_ACCESS_KEY,
            region=AWS_REGION,
            bucket=AWS_BUCKET
        )

        # Create file output with S3 upload and timestamp placeholder
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filepath = f"conversations-sales/{room_name}/{timestamp}-{{time}}.ogg"

        file_output = api.EncodedFileOutput(
            file_type=api.EncodedFileType.OGG,  # Audio-only format
            filepath=filepath,
            s3=s3_upload
        )

        # Create room composite egress request
        req = api.RoomCompositeEgressRequest(
            room_name=room_name,
            audio_only=True,  # Important: audio-only, no video
            file_outputs=[file_output]
        )

        # Start the recording
        res = await lkapi.egress.start_room_composite_egress(req)
        await lkapi.aclose()

        logger.info(f"✅ Recording started successfully!")
        logger.info(f"📹 Egress ID: {res.egress_id}")
        logger.info(f"📁 File path: {filepath}")

        return res.egress_id

    except Exception as e:
        logger.error(f"❌ Failed to start recording: {e}")
        import traceback
        traceback.print_exc()
        return None


async def stop_recording(egress_id: str) -> bool:
    """
    Stop an ongoing recording

    Args:
        egress_id: The egress ID returned from start_audio_recording

    Returns:
        True if recording stopped successfully, False otherwise
    """
    try:
        logger.info(f"🛑 Stopping recording: {egress_id}")

        lkapi = api.LiveKitAPI(
            url=LIVEKIT_URL,
            api_key=LIVEKIT_API_KEY,
            api_secret=LIVEKIT_API_SECRET
        )

        await lkapi.egress.stop_egress(
            api.StopEgressRequest(egress_id=egress_id)
        )
        await lkapi.aclose()

        logger.info(f"✅ Recording stopped successfully: {egress_id}")
        return True

    except Exception as e:
        logger.error(f"❌ Failed to stop recording: {e}")
        return False


def prewarm(ctx: JobProcess):
    """Prewarm the pipeline by loading models."""
    logger.info("Prewarming pipeline...")

    # Start heartbeat only once when first worker process is ready
    # Use multiprocessing lock to ensure only one heartbeat thread across all processes
    global heartbeat_started, heartbeat_lock
    with heartbeat_lock:
        if not heartbeat_started.value:
            heartbeat_started.value = True
            # Initialize and start heartbeat monitor
            hb_monitor = initialize_monitor(BASE_URL, ENVIRONMENT, AGENT_NAME)
            hb_monitor.start()
            logger.info("🎯 First worker process - starting heartbeat")
        else:
            logger.info("♻️ Additional worker process - heartbeat already running")

    # Load VAD with optimized settings
    ctx.userdata["vad"] = silero.VAD.load(
        min_speech_duration=0.1,  # Faster response
        min_silence_duration=0.2,  # Reduced from 0.3 for faster turn detection
    )
    logger.info("Prewarm complete")


def build_voice_persona_prompt(age, gender):
    """Build a voice persona prompt section for GPT Realtime sessions.

    GPT Realtime can adjust voice characteristics based on prompt instructions.
    This function generates age/gender-appropriate voice styling directives.
    """
    if not age:
        return ""

    if age <= 25:
        voice_style = "young, cheerful, and energetic"
    elif age <= 35:
        voice_style = "youthful and professional"
    elif age <= 50:
        voice_style = "mature and confident"
    else:
        voice_style = "experienced and authoritative"

    return (
        f"\n\n[VOICE PERSONA]\n"
        f"You are a {age}-year-old {gender}. "
        f"Speak with a {voice_style} voice appropriate for your age. "
        f"Do NOT sound older or younger than your character."
    )


async def entrypoint(ctx: JobContext):
    """Main entrypoint for the LiveKit agent."""
    should_track_session = True  # Track all session attempts for monitoring
    agent_initialized = False
    recording_id: Optional[str] = None
    try:
        # Log environment again at agent start
        logger.warning(f"🤖 Agent starting - Environment: {ENVIRONMENT.upper()}")

        # Start resource monitoring now that we have an event loop
        monitor.start_monitoring()

        await ctx.connect()
        session_id = ctx.room.name
        logger.info(f"Starting agent for session: {session_id}")
        logger.info(f"AGENT_NAME: {AGENT_NAME}")

        # Start recording when agent joins the room
        recording_id = await start_audio_recording(ctx.room.name)
        if recording_id:
            logger.info(f"✅ Recording started: {recording_id}")
        else:
            logger.warning("⚠️ Failed to start recording")

        # Extract language from metadata
        metadata_json = ctx.job.metadata
        logger.info(f"Metadata JSON: {metadata_json}")
        if metadata_json:
            metadata = json.loads(metadata_json)
            language = metadata.get("language", "en")
            voice_config = metadata.get("voiceConfig", "")
            first_message_override = metadata.get("firstMessage", "")
            logger.info(f"Language from job metadata: {language}")
            logger.info(f"Voice config from job metadata: {voice_config}")
            logger.info(f"First message override: {first_message_override}")
            logger.info(f"job metadata: {metadata}")
        else:
            language = "en"
            voice_config = ""
            first_message_override = ""

        logger.info(f"Language: {language}")
        session_data = await fetch_session_data(session_id, language)

        # Extract instruction and voice configuration
        instruction = "You are a helpful assistant"  # default
        voice_id = "6qpxBH5KUSDb40bij36w"  # default
        gender = "male"
        persona_age = None
        company_friendly_id = None

        if session_data:
            # Get instruction from voice prompt
            voice_data = session_data.get("voice")
            if voice_data and voice_data.get("prompt") and voice_data["prompt"].get("main"):
                instruction = voice_data["prompt"]["main"]
                logger.info("✅ Custom system prompt loaded")

            # Get voice ID from persona
            persona = session_data.get("persona")
            if persona and persona.get("voiceId"):
                voice_id = persona["voiceId"]
                logger.info(f"✅ Custom voice ID loaded: {voice_id}")
            if persona and persona.get("gender"):
                gender = persona["gender"]
                logger.info(f"✅ Custom gender loaded: {gender}")
            if persona and persona.get("age"):
                persona_age = persona["age"]
                logger.info(f"✅ Persona age loaded: {persona_age}")

            # Get company data
            company = session_data.get("company") or {}
            company_friendly_id = company.get("friendlyId")
            if company_friendly_id:
                logger.info(f"✅ Company loaded: {company.get('name')} ({company_friendly_id})")
        else:
            logger.warning("⚠️ Using default configuration - session data unavailable")

        # Get language config early to determine if using realtime
        initial_message, tts_language, stt_language, language_name, model, use_openai_realtime, use_xai_realtime = get_language_config(language, voice_config)

        # Use firstMessage from session data if provided (mirrors 11labs behavior)
        if first_message_override:
            initial_message = first_message_override
            logger.info(f"Using firstMessage override: {initial_message[:50]}...")

        # Company-specific pronunciation guides for GPT Realtime
        # (Cartesia TTS uses its own pronunciation dictionary, but Realtime needs prompt-based guides)
        REALTIME_PRONUNCIATION_GUIDES = {
            "kt-axa": (
                "\n\nPRONUNCIATION GUIDE:\n"
                "- Pronounce 'CI123' as 'see eye one two three'\n"
                "- Pronounce 'CI-123' as 'see eye one two three'\n"
                "- Pronounce 'KT-AXA' as 'kay tee act za'\n"
                "- Pronounce 'KTAXA' as 'kay tee act za'\n"
                "- Pronounce '1159' as 'one one five nine'\n"
                "- When you see '+' or 'with addon' in product names, pronounce it as 'พร้อมสัญญาเพิ่มเติม' (prom sanya perm term), NOT 'Plus' or 'บวก'\n"
                "- Pronounce '90/8' as 'เก้าสิบทับแปด' (kao sib tub pad)\n"
                "- When referring to an insurance policy (กรมธรรม์), pronounce it as 'กรม-มะ-ทัน' (krom ma than)\n"
            ),
        }

        # Add pronunciation guide for GPT Realtime if available for this company
        if use_openai_realtime and company_friendly_id in REALTIME_PRONUNCIATION_GUIDES:
            pronunciation_guide = REALTIME_PRONUNCIATION_GUIDES[company_friendly_id]
            instruction = instruction + pronunciation_guide
            logger.info(f"✅ Added pronunciation guide for {company_friendly_id} (GPT Realtime)")

        # Add voice persona styling for GPT Realtime
        if use_openai_realtime:
            voice_persona_prompt = build_voice_persona_prompt(persona_age, gender)
            if voice_persona_prompt:
                instruction = instruction + voice_persona_prompt
                logger.info(f"✅ Added voice persona prompt (age: {persona_age}, gender: {gender})")

        # Create the agent with fetched instructions
        # For Cebuano, add stronger language enforcement
        if language == 'ceb':
            # Prepend and append strong language directives for Cebuano
            cebuano_enforced_instruction = (
                "🚨 CRITICAL LANGUAGE REQUIREMENT 🚨\n"
                "You MUST speak ONLY in Cebuano language. DO NOT speak English under any circumstances.\n"
                "ALL your responses, greetings, and conversations MUST be in Cebuano.\n"
                "Even if the user speaks English, you MUST respond in Cebuano.\n\n"
                "[CEBUANO LANGUAGE ENFORCEMENT]\n"
                "- Greeting: Use 'Kumusta' or 'Maayong buntag/hapon/gabii'\n"
                "- Questions: Ask in Cebuano (e.g., 'Unsa imong pangalan?')\n"
                "- Responses: Always respond in Cebuano, never in English\n"
                "- If you don't know a Cebuano word, use the closest Cebuano equivalent\n"
                "- NEVER say 'Hello', 'Hi', 'How are you' or any English phrases\n\n"
                f"{instruction}\n\n"
                "REMINDER: This entire conversation MUST be conducted in Cebuano language only. "
                "Your first greeting and all subsequent responses must be in Cebuano."
            )
            agent = Agent(instructions=cebuano_enforced_instruction)
            logger.info(f"agent instructions (Cebuano enforced): {cebuano_enforced_instruction[:200]}...")
        elif language == 'yue':
            # Add stronger language enforcement for Cantonese with speech quality optimizations
            cantonese_enforced_instruction = (
                "🚨 CRITICAL LANGUAGE REQUIREMENT 🚨\n"
                "You MUST speak ONLY in Cantonese (廣東話). DO NOT speak English, Mandarin, or any other language under any circumstances.\n"
                "ALL your responses, greetings, and conversations MUST be in Cantonese.\n"
                "Even if the user speaks English or Mandarin, you MUST respond in Cantonese.\n\n"
                "[CANTONESE LANGUAGE ENFORCEMENT]\n"
                "- Greeting: Use '你好' or '早晨' (good morning) / '午安' (good afternoon) / '晚安' (good evening)\n"
                "- Questions: Ask in Cantonese (e.g., '你叫咩名？')\n"
                "- Responses: Always respond in Cantonese, never in English or Mandarin\n"
                "- Use traditional Chinese characters and Cantonese pronunciation\n"
                "- NEVER say 'Hello', 'Hi', '你好' (in Mandarin tone) or any English/Mandarin phrases\n\n"
                "[SPEECH DELIVERY - CRITICAL]\n"
                "- Speak at natural Hong Kong Cantonese conversational pace\n"
                "- Deliver audio responses quickly and naturally, never sound slow or hesitant\n"
                "- Match the energetic, fast-paced speaking style common in Hong Kong business conversations\n"
                "- Avoid stuttering, unnecessary pauses between words, or drawn-out syllables\n"
                "- Speak smoothly and confidently without sounding rushed\n"
                "- Use natural rhythm and intonation typical of native Hong Kong Cantonese speakers\n\n"
                "[NUMBER PRONUNCIATION]\n"
                "- Pronounce numbers CLEARLY and distinctly in Cantonese\n"
                "- 三 (saam1) must be distinctly different from 七 (chat1)\n"
                "- For important numbers (like dates, amounts, IDs), slightly emphasize each digit\n"
                "- Always use standard Hong Kong Cantonese number pronunciation\n"
                "- Speak numbers at a steady, clear pace to ensure accurate transcription\n\n"
                "[RESPONSE CONSISTENCY]\n"
                "- Ensure your spoken words EXACTLY match your intended text response\n"
                "- Never add filler words or sounds not in your planned response\n"
                "- Keep responses concise and clear to minimize transcription errors\n"
                "- Speak each word cleanly without mumbling or trailing off\n"
                "- Maintain consistent audio quality throughout your response\n\n"
                f"{instruction}\n\n"
                "REMINDER: Speak naturally at Hong Kong conversational pace in Cantonese (廣東話). "
                "Your delivery should sound confident, professional, and match the energetic style of native HK speakers."
            )
            agent = Agent(instructions=cantonese_enforced_instruction)
            logger.info(f"agent instructions (Cantonese enforced): {cantonese_enforced_instruction[:200]}...")
        elif voice_config == 'aiako-gpt-realtime' and language == 'ko':
            # AIA Korea GPT Realtime: voice delivery instructions for older personas
            if gender == 'male':
                voice_delivery = (
                    "[VOICE DELIVERY - CRITICAL]\n"
                    "You are voicing an elderly man in his 50s-60s. Your delivery MUST reflect this:\n"
                    "- Speak with a deep, gravelly, aged voice — low-pitched with rough edges that come with age\n"
                    "- Pace yourself slowly and deliberately, as if each word carries weight\n"
                    "- Your tone should be flat and detached, like someone who doesn't feel the need to impress\n"
                    "- Convey a tired, world-weary quality — the sound of a man who has seen it all\n"
                    "- Pause naturally between thoughts, never rush\n"
                    "- Do NOT sound young, energetic, or enthusiastic\n"
                )
            else:
                voice_delivery = (
                    "[VOICE DELIVERY - CRITICAL]\n"
                    "You are voicing an elderly woman in her 50s-60s. Your delivery MUST reflect this:\n"
                    "- Speak with a low, slightly hoarse, weathered voice — worn from decades of life\n"
                    "- Your pace should be calm and deliberate, the way a grandmother would talk\n"
                    "- Your voice should carry gentle warmth but also quiet worry\n"
                    "- Speak slowly and carefully, with occasional breathiness\n"
                    "- Pause naturally between thoughts, never rush\n"
                    "- Do NOT sound young, perky, or overly energetic\n"
                )
            aiako_realtime_instruction = (
                "🚨 CRITICAL LANGUAGE REQUIREMENT 🚨\n"
                "You MUST speak ONLY in Korean (한국어). DO NOT speak English under any circumstances.\n"
                "ALL your responses, greetings, and conversations MUST be in Korean.\n"
                "Even if the user speaks English, you MUST respond in Korean.\n\n"
                f"{voice_delivery}\n"
                f"{instruction}\n\n"
                "REMINDER: This entire conversation MUST be conducted in Korean (한국어) only. "
                "Maintain the aged, mature vocal delivery throughout the entire conversation."
            )
            agent = Agent(instructions=aiako_realtime_instruction)
            logger.info(f"agent instructions (AIA Korea GPT Realtime): {aiako_realtime_instruction[:200]}...")
        elif voice_config in ('aiako-gpt52-cartesia', 'aiako-gpt52-turbo', 'aiako-gpt41mini-turbo') and language == 'ko':
            # AIA Korea ElevenLabs: tone guidance for older persona text generation
            if gender == 'male':
                tone_guidance = (
                    "[CHARACTER TONE - CRITICAL]\n"
                    "You are a man in his 50s-60s. Your speech patterns MUST reflect this:\n"
                    "- Use short, blunt sentences. No filler, no pleasantries beyond basic courtesy\n"
                    "- Sound tired, skeptical, and unimpressed. You've heard every sales pitch before\n"
                    "- Never use exclamation marks. Never sound excited or enthusiastic\n"
                    "- Respond with sighs, reluctance, and mild irritation when pushed\n"
                    "- Use older Korean speech patterns and vocabulary appropriate for a 50-60 year old man\n"
                    "- Keep responses brief and guarded. Do NOT volunteer information eagerly\n"
                    "- Your default mood is weary indifference, not friendliness\n"
                )
            else:
                tone_guidance = (
                    "[CHARACTER TONE - CRITICAL]\n"
                    "You are a woman in her 50s-60s. Your speech patterns MUST reflect this:\n"
                    "- Speak carefully and slowly, like a grandmother choosing her words\n"
                    "- Sound cautious and worried, not cheerful. You carry the weight of life experience\n"
                    "- Never use exclamation marks. Never sound excited or bubbly\n"
                    "- Express gentle concern and quiet hesitation, not enthusiasm\n"
                    "- Use older Korean speech patterns and vocabulary appropriate for a 50-60 year old woman\n"
                    "- Keep responses measured and thoughtful. Do NOT sound eager or accommodating\n"
                    "- Your default mood is quiet wariness, not warmth\n"
                )
            aiako_google_instruction = (
                f"{tone_guidance}\n"
                f"{instruction}\n\n"
                "REMINDER: Maintain the reserved, aged character tone throughout. "
                "Never break character by sounding young, cheerful, or overly cooperative."
            )
            agent = Agent(instructions=aiako_google_instruction)
            logger.info(f"agent instructions (AIA Korea Google TTS): {aiako_google_instruction[:200]}...")
        else:
            agent = Agent(instructions=instruction)
            logger.info(f"agent instructions: {instruction[:200]}...")

        # Experimental Thai configurations
        # default = gpt-realtime
        # thai5 = speechmatics STT + gpt4.1 + elevenlabs TTS
        # thai6 = cartesia STT + gpt4.1 + cartesia TTS
        # thai7 = cartesia STT + typhoon LLM + cartesia TTS
        # thai8 = speechmatics STT + typhoon LLM + google TTS
        # thai9 = cartesia STT + typhoon LLM + google TTS
        # thai10 = typhoon ASR + typhoon LLM + google TTS
        # thai11 = typhoon ASR + gpt4.1 + google TTS
        # thai12 = typhoon ASR + gpt4.1 + cartesia TTS
        # thai13 = typhoon ASR + typhoon LLM + cartesia TTS

        # Nov 6 Update: thai12 is now the new default for Thai
        # default = typhoon ASR + gpt4.1 + cartesia TTS
        # thai14 = gpt-realtime

        # Jan 7, 2026 update
        # thai15 = elevenlabs STT + gpt4.1 + cartesia TTS

        # Create optimized agent session with OpenAI Realtime for Cebuano
        if use_openai_realtime and OPENAI_API_KEY:

            # Select voice based on gender and voice config
            if voice_config == 'aiako-gpt-realtime':
                # AIA Korea: use deeper/mature voices for older personas
                realtime_voice = "echo" if gender == "male" else "sage"
            else:
                realtime_voice = "echo" if gender == "male" else "shimmer"
            logger.info(f"Using OpenAI Realtime voice: {realtime_voice} (gender: {gender}, voice_config: {voice_config})")

            # Use OpenAI Realtime API with semantic VAD to prevent AI from interrupting users
            # Semantic VAD uses AI to understand when the user is done speaking (not just silence detection)
            realtime_speed = 0.85 if voice_config == 'aiako-gpt-realtime' else None
            session = AgentSession(
                llm=openai.realtime.RealtimeModel(
                    api_key=OPENAI_API_KEY,
                    model=model,
                    voice=realtime_voice,
                    **({"speed": realtime_speed} if realtime_speed else {}),
                    turn_detection=TurnDetection(
                        type="semantic_vad",
                        # eagerness="low",  # Less likely to interrupt; waits for user to finish speaking
                        eagerness="high",  # More aggressive in detecting user turns, can start generating response sooner but may risk interrupting if user is still speaking
                        create_response=True,
                        interrupt_response=True,
                    )
                ),
                preemptive_generation=True,  # Start generating response while user finishes speaking
            )
        elif use_xai_realtime and XAI_API_KEY:
            # Use xAI Realtime API for Cantonese (Yue)
            # Select voice based on gender - xAI supports voices like "Ara", "Jace", "Charon", "Nova"
            # Using "Charon" for male (masculine voice) and "Ara" for female (feminine voice)
            realtime_voice = "Charon" if gender == "male" else "Ara"
            logger.info(f"Using xAI Realtime voice: {realtime_voice} (gender: {gender})")

            # Use xAI Realtime API for Cantonese
            session = AgentSession(
                llm=xai.realtime.RealtimeModel(
                    api_key=XAI_API_KEY,
                    voice=realtime_voice,
                ),
            )
        else: # configure tts/stt/llm separately

            # Configure LLM based on language and voice config
            if voice_config in ('aiako-gpt52-cartesia', 'aiako-gpt52-turbo'):
                llm_provider = openai.LLM(
                    api_key=OPENAI_API_KEY,
                    model="gpt-5.2",
                    temperature=0.5,
                )
            elif voice_config == 'aiako-gpt41mini-turbo':
                llm_provider = openai.LLM(
                    api_key=OPENAI_API_KEY,
                    model="gpt-4.1-mini",
                    temperature=0.5,
                )
            elif (voice_config == 'thai7' or voice_config == 'thai8' or voice_config == 'thai9' or voice_config == 'thai10' or voice_config == 'thai13') and language == 'th':
                llm_provider = openai.LLM(
                    api_key=OPENTYPHOON_API_KEY,
                    model="typhoon-v2.5-30b-a3b-instruct",
                    temperature=0.7,
                    base_url="https://api.opentyphoon.ai/v1",
                )
            else:
                llm_provider = openai.LLM(
                    api_key=OPENAI_API_KEY,
                    model="gpt-4.1",
                    temperature=0.5,  # Reduced from 0.7 for faster, more deterministic responses
                )

            # Check for AIA Korea Cartesia voice override (Kevin persona only)
            # Company friendly ID should be "aia-ko"
            persona_friendly_id = persona.get("friendlyId", "") if persona else ""
            aia_korea_voice_config = None
            if company_friendly_id == 'aia-ko' and persona_friendly_id in AIA_KOREA_VOICE_MAPPINGS:
                aia_korea_voice_config = AIA_KOREA_VOICE_MAPPINGS[persona_friendly_id]
                logger.info(f"✅ Using AIA Korea Cartesia voice for {persona_friendly_id}")

            # Configure TTS based on language and voice config
            if voice_config == 'aiako-gpt52-cartesia' and aia_korea_voice_config:
                # AIA Korea Plan B: Cartesia TTS with professional voice clones
                persona_age = persona.get("age") if persona else None
                tts_speed = 0.85 if persona_age and persona_age >= 50 else None
                if tts_speed:
                    logger.info(f"Using slower TTS speed ({tts_speed}) for older persona (age {persona_age})")
                tts_provider = cartesia.TTS(
                    api_key=CARTESIA_API_KEY,
                    model=aia_korea_voice_config['model'],
                    voice=aia_korea_voice_config['voice_id'],
                    language='ko',
                    **({"speed": tts_speed} if tts_speed else {}),
                )
                logger.info(f"Using Cartesia TTS (Plan B) for AIA Korea: {aia_korea_voice_config['voice_id']} (persona: {persona_friendly_id})")
            elif voice_config == 'aiako-gpt52-turbo' or voice_config == 'aiako-gpt41mini-turbo':
                eleven_ko_voice = AIA_KOREA_11LABS_VOICE_MAPPINGS.get(
                    persona_friendly_id,
                    voice_id,
                )
                logger.info(f"Using ElevenLabs v3 TTS for AIA Korea: {eleven_ko_voice} (persona: {persona_friendly_id})")
                tts_provider = elevenlabs.TTS(
                    api_key=ELEVENLABS_API_KEY,
                    voice_id=eleven_ko_voice,
                    model="eleven_flash_v2_5",
                    language="ko",
                    voice_settings=elevenlabs.VoiceSettings(
                        stability=0.8,
                        similarity_boost=0.5,
                        style=0.0,
                        use_speaker_boost=True
                    ),
                    streaming_latency=1,
                    enable_ssml_parsing=False,
                    chunk_length_schedule=[100, 200, 500],
                )
            elif aia_korea_voice_config and aia_korea_voice_config['platform'] == 'cartesia':
                # Legacy: Cartesia fallback for unmapped configs (when no ?config= param)
                tts_provider = cartesia.TTS(
                    api_key=CARTESIA_API_KEY,
                    model=aia_korea_voice_config['model'],
                    voice=aia_korea_voice_config['voice_id'],
                    language='ko',
                )
                logger.info(f"Using Cartesia TTS for AIA Korea: {aia_korea_voice_config['voice_id']}")
            elif (voice_config == 'thai8' or voice_config == 'thai9' or voice_config == 'thai10' or voice_config == 'thai11') and language == 'th': # voice_config == 'thai8' also uses this
                credentials_path = GOOGLE_CREDENTIALS or "/app/google-credentials.json"
                logger.info(f"Using Google voice: {voice_id} with credentials: {credentials_path}")
                tts_provider = google.TTS(
                    credentials_file=credentials_path,
                    language='th-TH',
                    voice_name=voice_id,
                )
            elif (voice_config == 'thai6' or voice_config == 'thai7' or voice_config == 'thai12' or voice_config == 'thai13') or language == 'th': # 'or' is intentional as it's default now
                # Use Cartesia TTS for thai6 and thai10

                if persona_friendly_id in KT_AXA_ROLEPLAY_PERSONAS:
                    voice = CARTESIA_KT_AXA_ROLEPLAY_MALE_VOICE_ID
                    logger.info(f"Using KT-AXA roleplay male voice for persona: {persona_friendly_id}")
                elif persona_friendly_id in KT_AXA_ROLEPLAY_FEMALE_PERSONAS:
                    voice = CARTESIA_KT_AXA_ROLEPLAY_FEMALE_VOICE_ID
                    logger.info(f"Using KT-AXA roleplay female voice for persona: {persona_friendly_id}")
                else:
                    # Default: Somchai Star for male or Suda - Fortune Teller for female
                    voice = "5de076e9-7b28-4442-b279-e7d80d573505" if gender == "male" else "ccc7bb22-dcd0-42e4-822e-0731b950972f"
                    logger.info(f"Using Cartesia TTS for Thai with voice: {voice}")

                # Slower speed for older personas (age 50+)
                tts_speed = 0.85 if persona_age and persona_age >= 50 else None
                if tts_speed:
                    logger.info(f"Using slower TTS speed ({tts_speed}) for older persona (age {persona_age})")

                # Company-specific pronunciation dictionaries
                PRONUNCIATION_DICTIONARIES = {
                    "kt-axa": "pdict_zwMGT5uegv7bfrvq91xwYV",
                    # Add more companies here as needed
                }
                pronunciation_dict_id = PRONUNCIATION_DICTIONARIES.get(company_friendly_id)
                if pronunciation_dict_id:
                    logger.info(f"✅ Using pronunciation dictionary for {company_friendly_id}")

                tts_provider = cartesia.TTS(
                    api_key=CARTESIA_API_KEY,
                    model="sonic-3",
                    voice=voice,
                    language="th",
                    **({"pronunciation_dict_id": pronunciation_dict_id} if pronunciation_dict_id else {}),
                    **({"speed": tts_speed} if tts_speed else {}),
                )
            elif voice_config == 'alibaba1' and language == 'en':
                # Use ElevenLabs TTS for Alibaba with Tsing Lu's voice
                alibaba_voice_id = "sla02gCKN0hNfNn9ORJN"  # Tsing Lu's voice
                logger.info(f"Using ElevenLabs TTS for Alibaba with voice: {alibaba_voice_id}")

                tts_provider = elevenlabs.TTS(
                    api_key=ELEVENLABS_API_KEY,
                    voice_id=alibaba_voice_id,
                    model="eleven_flash_v2_5",
                    language="en",
                    voice_settings=elevenlabs.VoiceSettings(
                        stability=0.8,
                        similarity_boost=0.5,
                        style=0.0,
                        use_speaker_boost=True
                    ),
                    streaming_latency=1,  # Keep low latency
                    enable_ssml_parsing=False,  # Disable if not needed
                    chunk_length_schedule=[100, 200, 500],  # Optimize chunk sizes
                )
            else:
                tts_provider = elevenlabs.TTS(
                    api_key=ELEVENLABS_API_KEY,
                    voice_id=voice_id,
                    model=model,
                    language=tts_language,
                    voice_settings=elevenlabs.VoiceSettings(
                        stability=0.8,
                        similarity_boost=0.5,
                        style=0.0,
                        use_speaker_boost=True
                    ),
                    streaming_latency=1,  # Keep low latency
                    enable_ssml_parsing=False,  # Disable if not needed
                    chunk_length_schedule=[100, 200, 500],  # Optimize chunk sizes
                )

            # Configure STT based on language
            if (voice_config == 'thai6' or voice_config == 'thai7' or voice_config == 'thai9') and language == 'th':
                # Use Cartesia STT for thai6 and thai7
                logger.info(f"Using Cartesia STT for Thai")

                stt_provider = cartesia.STT(
                    api_key=CARTESIA_API_KEY,
                    model="ink-whisper",
                    language="th",
                )
            elif (voice_config == 'thai15' and language == 'th'):
                # Use ElevenLabs STT for thai15
                logger.info(f"Using ElevenLabs STT for Thai")

                stt_provider = elevenlabs.STT(
                    api_key=ELEVENLABS_API_KEY,
                    language_code="th",
                    tag_audio_events=False,
                )
            elif voice_config == 'alibaba1' and language == 'en':
                # Use ElevenLabs STT for Alibaba
                logger.info(f"Using ElevenLabs STT for Alibaba")

                stt_provider = elevenlabs.STT(
                    api_key=ELEVENLABS_API_KEY,
                    language_code="en",
                    tag_audio_events=False,
                )

            elif (voice_config == 'thai10' or voice_config == 'thai11' or voice_config == 'thai12' or voice_config == 'thai13') or language == 'th': # 'or' is intentional as it's default now
                # Use Typhoon ASR for thai9 and thai10 (experimental - may not work for streaming)
                logger.info(f"Using Typhoon ASR for Thai (experimental)")

                # Prompt with common English product names and terms for code-switching
                code_switching_prompt = (
                    "PruLife PRULife PruShield PRUShield DentiPlus "
                    "UOB Prudential "
                    "client verification customer verification "
                    "portfolio investment coverage premium policy "
                    "sum assured beneficiary maturity "
                )

                stt_provider = openai.STT(
                    api_key=OPENTYPHOON_API_KEY,
                    model="typhoon-isan-asr-realtime",
                    language="th",
                    base_url="https://api.opentyphoon.ai/v1",
                    prompt=code_switching_prompt,
                )
            # elif language == 'th':
            #     stt_provider = speechmatics.STT(
            #         api_key=SPEECHMATICS_API_KEY,
            #         language="th",
            #         operating_point="enhanced",  # Use enhanced model for highest accuracy
            #         enable_partials=True,  # Enable partial transcripts for real-time feedback
            #     )
            elif voice_config in ('aiako-gpt52-cartesia', 'aiako-gpt52-turbo', 'aiako-gpt41mini-turbo'):
                logger.info(f"Using ElevenLabs STT for AIA Korea (Korean)")
                stt_provider = elevenlabs.STT(
                    api_key=ELEVENLABS_API_KEY,
                    language_code="ko",
                    tag_audio_events=False,
                    model_id="scribe_v2_realtime",
                )
            else:
                stt_provider = openai.STT(
                    api_key=OPENAI_API_KEY,
                    model="gpt-4o-transcribe",
                    language=stt_language,
                )

            session = AgentSession(
                vad=ctx.proc.userdata["vad"],
                stt=stt_provider,
                llm=llm_provider,
                tts=tts_provider,
                min_endpointing_delay=0.4,  # Reduced from 0.6 for faster turn-taking
            )

        # Setup metrics collection
        usage_collector = metrics.UsageCollector()

        @session.on("metrics_collected")
        def _on_metrics_collected(ev: MetricsCollectedEvent):
            metrics.log_metrics(ev.metrics)
            usage_collector.collect(ev.metrics)

        async def log_usage():
            summary = usage_collector.get_summary()
            memory_percent = psutil.virtual_memory().percent
            logger.info(f"Usage: {summary}, Memory: {memory_percent}%")
            if memory_percent > 90:
                logger.warning("⚠️ Memory usage critical!")

        async def cleanup_recording():
            """Stop recording on shutdown"""
            if recording_id:
                logger.info(f"Stopping recording before cleanup: {recording_id}")
                await stop_recording(recording_id)

        ctx.add_shutdown_callback(log_usage)
        ctx.add_shutdown_callback(cleanup_recording)

        # Start the session
        await session.start(
            room=ctx.room,
            agent=agent,
            room_input_options=RoomInputOptions(
                noise_cancellation=noise_cancellation.BVC(),
            ),
        )

        # Send initial greeting
        if use_openai_realtime and OPENAI_API_KEY:
            # For OpenAI Realtime, trigger initial greeting with generate_reply
            logger.info(f"🤖 Triggering OpenAI Realtime greeting: {initial_message}")
            try:
                await asyncio.sleep(0.1)  # Small delay to ensure session is ready
                sanitized_greeting = initial_message.strip()
                quoted_greeting = sanitized_greeting.replace('"', '\\"')
                greeting_instruction = (
                    f'IMPORTANT: Start by greeting the user with this exact sentence in {language_name}: "{quoted_greeting}". '
                    "Speak the sentence out loud as your very first response, then pause to let the user reply. "
                    "Do not add any other words beyond that sentence."
                )
                await session.generate_reply(
                    instructions=greeting_instruction,
                    allow_interruptions=False
                )
                logger.info("🤖 OpenAI Realtime greeting: " + greeting_instruction)
                logger.info("✅ OpenAI Realtime greeting triggered successfully")
            except Exception as e:
                logger.error(f"❌ Error triggering OpenAI Realtime greeting: {e}")
        elif use_xai_realtime and XAI_API_KEY:
            # For xAI Realtime, trigger initial greeting with generate_reply
            logger.info(f"🤖 Triggering xAI Realtime greeting: {initial_message}")
            try:
                await asyncio.sleep(0.1)  # Small delay to ensure session is ready
                sanitized_greeting = initial_message.strip()
                quoted_greeting = sanitized_greeting.replace('"', '\\"')
                greeting_instruction = (
                    f'IMPORTANT: Start by greeting the user with this exact sentence in {language_name}: "{quoted_greeting}". '
                    "Speak the sentence out loud as your very first response, then pause to let the user reply. "
                    "Do not add any other words beyond that sentence."
                )
                await session.generate_reply(
                    instructions=greeting_instruction,
                    allow_interruptions=False
                )
                logger.info("🤖 xAI Realtime greeting: " + greeting_instruction)
                logger.info("✅ xAI Realtime greeting triggered successfully")
            except Exception as e:
                logger.error(f"❌ Error triggering xAI Realtime greeting: {e}")
        else:
            await session.say(
                initial_message,
                allow_interruptions=True,
            )

        logger.info("Agent ready and running")
        agent_initialized = True  # Agent successfully set up and running

        # Record successful session
        heartbeat_monitor = get_monitor()
        if heartbeat_monitor:
            heartbeat_monitor.record_session(success=True)
            logger.info("✅ Session completed successfully")

    except Exception as e:
        logger.error(f"Agent error: {e}", exc_info=True)

        # Record failed session attempt for monitoring
        if should_track_session:
            heartbeat_monitor = get_monitor()
            if heartbeat_monitor:
                error_msg = str(e)[:200]  # Truncate error message
                failure_stage = "initialization" if not agent_initialized else "runtime"
                full_error = f"[{failure_stage}] {error_msg}"
                heartbeat_monitor.record_session(success=False, error=full_error)
                logger.error(f"❌ Session failed during {failure_stage}: {error_msg}")

        # Graceful cleanup
        if 'session' in locals():
            try:
                await session.aclose()
            except AttributeError:
                # Session may not have aclose method in some versions
                pass
        raise


async def cleanup():
    """Cleanup function to close HTTP client."""
    await http_client.aclose()



if __name__ == "__main__":
    # Run the LiveKit worker with optimized configuration
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            api_key=LIVEKIT_API_KEY,
            api_secret=LIVEKIT_API_SECRET,
            ws_url=LIVEKIT_URL,
            agent_name=AGENT_NAME,
            prewarm_fnc=prewarm,
            num_idle_processes=6,  # Good balance for 5.6 CPUs
            job_executor_type=JobExecutorType.PROCESS,
            load_threshold=0.8,  # Balanced threshold
            job_memory_limit_mb=800,  # 800MB per agent for 55 users
        )
    )
