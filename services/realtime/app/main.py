from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time
import json
import asyncio
import os
import redis.asyncio as redis
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from dataclasses import dataclass
from typing import Optional

DEFAULT_STADIUM_ID = os.getenv("DEFAULT_STADIUM_ID", "in-narendra-modi")


def make_initial_twin_state():
    return {
        "zones": {
            "Gate A": {"density": 0.4, "alertLevel": "Normal"},
            "Gate B": {"density": 0.6, "alertLevel": "Normal"},
            "Gate C": {"density": 0.2, "alertLevel": "Normal"},
        },
        "queues": {
            "C-1": {"wait_time": 5},
            "C-2": {"wait_time": 10},
        },
    }


# In-memory per-stadium state (demo/local development)
digital_twin_state_by_stadium: dict[str, dict] = {}


def get_or_create_state(stadium_id: Optional[str]):
    sid = stadium_id or DEFAULT_STADIUM_ID
    if sid not in digital_twin_state_by_stadium:
        digital_twin_state_by_stadium[sid] = make_initial_twin_state()
    return sid, digital_twin_state_by_stadium[sid]

app = FastAPI(
    title="StadiumIQ Realtime API",
    description="Realtime and core backend services for StadiumIQ platform.",
    version="0.2.0",
)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Global Exception Handled: {exc}")
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error", "error_code": "STADIUM_ERR_500"}
    )

# We are now using slowapi instead of the simple IP-based rate limiter


class ConnectionManager:
    def __init__(self):
        self.active_connections: list["ConnCtx"] = []

    async def connect(self, websocket: WebSocket, stadium_id: str):
        await websocket.accept()
        self.active_connections.append(ConnCtx(websocket=websocket, stadium_id=stadium_id))
        # Send initial state
        _, state = get_or_create_state(stadium_id)
        await websocket.send_text(json.dumps({
            "type": "twin:state_sync",
            "stadium_id": stadium_id,
            "data": state
        }))

    def disconnect(self, websocket: WebSocket):
        self.active_connections = [c for c in self.active_connections if c.websocket != websocket]

    async def broadcast(self, message: str, stadium_id: Optional[str] = None):
        for connection in self.active_connections:
            if stadium_id and connection.stadium_id != stadium_id:
                continue
            try:
                await connection.websocket.send_text(message)
            except:
                pass # Handle dead connection


@dataclass(frozen=True)
class ConnCtx:
    websocket: WebSocket
    stadium_id: str


manager = ConnectionManager()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
redis_client = None
pubsub = None

# Legacy simulator compatibility:
# The local `services/iot-simulator/simulator.py` publishes to `stadium_events` with
# message types `DENSITY_UPDATE` and `QUEUE_UPDATE`. The newer realtime pipeline
# expects `crowd:update`, `queue:update`, and `surge:alert`.
SECTION_TO_CAMERA = {
    101: "cameraA",
    102: "cameraB",
    114: "cameraC",
    204: "cameraA",
}
GATE_TO_CONCESSION = {
    "Gate A": "C-1",
    "Gate B": "C-2",
    "Gate C": "C-3",
}

@app.on_event("startup")
async def startup():
    global redis_client, pubsub
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)
    pubsub = redis_client.pubsub()
    await pubsub.subscribe("surge:alert", "crowd:update", "queue:update", "stadium_events")
    
    # Start Redis listener task
    asyncio.create_task(redis_listener_loop())

@app.on_event("shutdown")
async def shutdown():
    global pubsub, redis_client
    if pubsub:
        await pubsub.unsubscribe()
        await pubsub.close()
    if redis_client:
        await redis_client.close()

async def redis_listener_loop():
    while True:
        try:
            message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
            if message:
                channel = message['channel']
                data = json.loads(message['data'])
                stadium_id = data.get("stadium_id") or DEFAULT_STADIUM_ID

                # Translate legacy simulator feed into new event types
                if channel == "stadium_events":
                    event_type = data.get("type")
                    if event_type == "DENSITY_UPDATE" or event_type == "CROWD_UPDATE":
                        section_id = data.get("section_id")
                        count = float(data.get("count", 0))
                        camera_id = SECTION_TO_CAMERA.get(section_id, "cameraA")
                        # Roughly normalize count into [0, 1]
                        calculated_density = max(min(count / 450.0, 1.0), 0.0)
                        data = {
                            "stadium_id": stadium_id,
                            "camera_id": camera_id,
                            "headcount": int(count),
                            "calculated_density": round(calculated_density, 2),
                            "timestamp": data.get("timestamp"),
                        }
                        channel = "crowd:update"
                    elif event_type == "QUEUE_UPDATE":
                        gate_id = data.get("gate_id") or data.get("concession_id") or "Gate A"
                        # Normalize zone name
                        zone = "Gate " + str(gate_id).strip()[-1].upper() if gate_id else "Gate A"
                        concession_id = data.get("concession_id") or GATE_TO_CONCESSION.get(zone, "C-1")
                        wait_time_sec = float(data.get("wait_time_sec", 0)) if "wait_time_sec" in data else float(data.get("estimated_wait_time_minutes", 0)) * 60
                        data = {
                            "stadium_id": stadium_id,
                            "concession_id": concession_id,
                            "estimated_wait_time_minutes": round(max(wait_time_sec / 60.0, 0.0), 1),
                            "timestamp": data.get("timestamp"),
                        }
                        channel = "queue:update"
                    else:
                        # Unknown legacy event; ignore
                        continue

                # Ensure we have a stadium state to mutate
                _, digital_twin_state = get_or_create_state(stadium_id)
                
                # Update Twin State based on event
                if channel == "crowd:update":
                    # Assume camera maps to a zone (simplified)
                    zone = "Gate " + str(data.get("camera_id", "A"))[-1].upper()
                    if zone not in digital_twin_state["zones"]:
                        digital_twin_state["zones"][zone] = {"density": 0.0, "alertLevel": "Normal"}
                    density = float(data.get("calculated_density", 0) or 0)
                    digital_twin_state["zones"][zone]["density"] = density

                    # Generate a lightweight synthetic surge alert for the legacy simulator path.
                    # (The full AI engine can publish real `surge:alert` events separately.)
                    if channel == "crowd:update" and density >= 0.65:
                        surge_probability = min(max(density + 0.1, 0.0), 1.0)
                        alert_level = "Critical" if surge_probability >= 0.85 else "Warning"
                        digital_twin_state["zones"][zone]["alertLevel"] = alert_level
                        synthetic_alert = {
                            "stadium_id": stadium_id,
                            "zone_id": zone,
                            "surge_probability": round(surge_probability, 2),
                            "alert_level": alert_level,
                            "estimated_surge_time": time.time() + 15 * 60,
                            "mitigation_recommendation": f"Redirect ingress traffic away from {zone}" if alert_level == "Critical" else f"Monitor {zone} closely",
                        }
                        await manager.broadcast(json.dumps({"type": "surge:alert", "data": synthetic_alert}), stadium_id=stadium_id)
                        
                elif channel == "surge:alert":
                    stadium_id = data.get("stadium_id") or stadium_id
                    zone = data.get("zone_id", "Gate A")
                    if zone in digital_twin_state["zones"]:
                        digital_twin_state["zones"][zone]["alertLevel"] = data.get("alert_level", "Normal")
                        digital_twin_state["zones"][zone]["surge_prob"] = data.get("surge_probability")

                elif channel == "queue:update":
                    stadium_id = data.get("stadium_id") or stadium_id
                    cid = data.get("concession_id")
                    if cid not in digital_twin_state["queues"]:
                        digital_twin_state["queues"][cid] = {"wait_time": 0}
                    digital_twin_state["queues"][cid]["wait_time"] = data.get("estimated_wait_time_minutes")
                
                # Broadcast the event
                payload = json.dumps({
                    "type": channel,
                    "data": data
                })
                await manager.broadcast(payload, stadium_id=stadium_id)
            else:
                await asyncio.sleep(0.1)
        except Exception as e:
            print(f"Redis listener error: {e}")
            await asyncio.sleep(1)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "realtime", "redis": "connected"}

@app.get("/state/twin")
@limiter.limit("100/minute")
def get_twin_state(request: Request, stadium_id: str = DEFAULT_STADIUM_ID):
    _, state = get_or_create_state(stadium_id)
    return state

@app.websocket("/ws/dashboard")
async def websocket_dashboard(websocket: WebSocket, token: str = "guest", stadium_id: str = DEFAULT_STADIUM_ID):
    # Basic token validation mock
    if token != "guest" and token != "admin":
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, stadium_id=stadium_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle client messages if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket)
