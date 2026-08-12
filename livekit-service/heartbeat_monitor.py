"""
Heartbeat monitoring and session health tracking for LiveKit agent service.
"""

import asyncio
import logging
import threading
from datetime import datetime
from typing import Dict, Any, Optional
import httpx
import psutil

logger = logging.getLogger(__name__)


class SessionHealthTracker:
    """Track health of agent sessions for monitoring."""

    def __init__(self):
        self.lock = threading.Lock()
        self.last_session = None
        self.recent_sessions = {"total": 0, "successful": 0, "failed": 0}
        self.consecutive_failures = 0
        self.session_history = []  # Keep last 10 sessions

    def record_session(self, success: bool, error: str = None):
        """Record a session attempt."""
        with self.lock:
            timestamp = datetime.utcnow().isoformat() + "Z"
            session = {
                "timestamp": timestamp,
                "success": success,
                "error": error
            }

            self.last_session = session
            self.session_history.append(session)

            # Keep only last 10 sessions
            if len(self.session_history) > 10:
                self.session_history.pop(0)

            # Update counters
            self.recent_sessions["total"] += 1
            if success:
                self.recent_sessions["successful"] += 1
                self.consecutive_failures = 0
            else:
                self.recent_sessions["failed"] += 1
                self.consecutive_failures += 1

            # Recalculate recent sessions based on history
            if len(self.session_history) >= 10:
                # Keep rolling window of last 10
                self.recent_sessions["total"] = 10
                self.recent_sessions["successful"] = sum(1 for s in self.session_history if s["success"])
                self.recent_sessions["failed"] = sum(1 for s in self.session_history if not s["success"])

            logger.info(f"📊 Session recorded: success={success}, consecutive_failures={self.consecutive_failures}")

    def get_health_data(self) -> Dict[str, Any]:
        """Get current health data for heartbeat."""
        with self.lock:
            return {
                "last_session": self.last_session.copy() if self.last_session else None,
                "recent_sessions": self.recent_sessions.copy(),
                "consecutive_failures": self.consecutive_failures
            }


class HeartbeatMonitor:
    """Manages heartbeat sending to backend monitoring endpoint."""

    def __init__(
        self,
        base_url: str,
        environment: str,
        agent_name: Optional[str] = None,
        interval_seconds: int = 30
    ):
        self.base_url = base_url
        self.environment = environment
        self.agent_name = agent_name
        self.interval = interval_seconds
        self.session_health = SessionHealthTracker()
        self._heartbeat_thread = None

    def record_session(self, success: bool, error: str = None):
        """Record a session result for health tracking."""
        self.session_health.record_session(success, error)

    def start(self):
        """Start heartbeat monitoring in a background thread."""
        if self._heartbeat_thread is not None:
            logger.warning("Heartbeat monitoring already started")
            return

        def run_heartbeat_loop():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

            # Create HTTP client for this thread
            heartbeat_http_client = httpx.AsyncClient(
                timeout=5.0,
                limits=httpx.Limits(max_keepalive_connections=5, max_connections=10)
            )

            async def heartbeat_loop():
                logger.info("💓 Starting heartbeat sender (worker ready)")
                while True:
                    try:
                        await self._send_heartbeat(heartbeat_http_client)
                    except Exception as e:
                        logger.error(f"Worker heartbeat loop error: {e}")

                    await asyncio.sleep(self.interval)

            loop.run_until_complete(heartbeat_loop())

        # Start heartbeat thread as daemon so it doesn't prevent shutdown
        self._heartbeat_thread = threading.Thread(target=run_heartbeat_loop, daemon=True)
        self._heartbeat_thread.start()
        logger.info("✅ Heartbeat thread started (worker initialized successfully)")

    async def _send_heartbeat(self, http_client: httpx.AsyncClient):
        """Send a single heartbeat to the backend."""
        try:
            # Gather system metrics
            memory = psutil.virtual_memory()
            cpu_percent = psutil.cpu_percent(interval=0.1)

            # Get session health data
            health_data = self.session_health.get_health_data()

            heartbeat_data = {
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "memory_percent": memory.percent,
                "cpu_percent": cpu_percent,
                "environment": self.environment,
                "agent_name": self.agent_name,
                # Session health metrics
                "last_session": health_data["last_session"],
                "recent_sessions": health_data["recent_sessions"],
                "consecutive_failures": health_data["consecutive_failures"]
            }

            # Send heartbeat
            url = f"{self.base_url}/monitoring/livekit-agent/heartbeat"
            await http_client.post(
                url,
                json=heartbeat_data,
                timeout=5.0,
                headers={"X-Internal-Service": "livekit-agent"}
            )

            # Log with session info
            sessions_info = f"sessions={health_data['recent_sessions']['total']}"
            if health_data['recent_sessions']['total'] > 0:
                success_rate = (health_data['recent_sessions']['successful'] /
                              health_data['recent_sessions']['total'] * 100)
                sessions_info += f" (success={success_rate:.0f}%)"

            logger.debug(f"💓 Worker heartbeat sent: mem={memory.percent:.1f}%, cpu={cpu_percent:.1f}%, {sessions_info}")

        except Exception as e:
            logger.debug(f"Worker heartbeat send failed: {e}")


# Global singleton instance (will be initialized in main module)
heartbeat_monitor: Optional[HeartbeatMonitor] = None


def initialize_monitor(base_url: str, environment: str, agent_name: Optional[str] = None) -> HeartbeatMonitor:
    """Initialize the global heartbeat monitor instance."""
    global heartbeat_monitor
    if heartbeat_monitor is not None:
        logger.warning("Heartbeat monitor already initialized")
        return heartbeat_monitor

    heartbeat_monitor = HeartbeatMonitor(base_url, environment, agent_name)
    return heartbeat_monitor


def get_monitor() -> Optional[HeartbeatMonitor]:
    """Get the global heartbeat monitor instance."""
    return heartbeat_monitor