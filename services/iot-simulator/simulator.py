import asyncio
import json
import random
import os
import sys
import redis.asyncio as redis
from fastapi import FastAPI

app = FastAPI()

# Configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
STADIUM_IDS = [
    "in-narendra-modi", "in-eden-gardens", "in-wankhede", "in-arun-jaitley", 
    "in-m-chinnaswamy", "in-chepauk", "in-hyderabad-uppal", "in-mca-pune", 
    "in-pca-mohali", "in-sawai-mansingh", "in-ekana-lucknow", "in-hpca-dharamshala", 
    "in-vca-nagpur", "in-jsca-ranchi", "in-aca-vdca-vizag", "in-sca-rajkot", 
    "in-holkar-indore", "in-greenfield-tvm", "in-barsapara-guwahati", "in-svns-raipur", 
    "in-barabati-cuttack", "in-green-park-kanpur", "in-dy-patil-mumbai", "in-brabourne-mumbai"
]
SECTIONS = [101, 102, 114, 204]
GATES = ["North A", "South B", "East C"]

client = None

async def get_redis():
    global client
    if client is None:
        print(f"Connecting to Redis at {REDIS_URL}...")
        client = redis.from_url(REDIS_URL, decode_responses=True)
    return client

async def run_simulation():
    """Background loop to publish mock IoT data to Redis"""
    print("Simulator starting...")
    try:
        redis_client = await get_redis()
        # Test connection
        await redis_client.ping()
        print("Redis connection successful!")
    except Exception as e:
        print(f"FAILED to connect to Redis: {e}")
        return

    while True:
        try:
            ts = asyncio.get_event_loop().time()
            for stadium_id in STADIUM_IDS:
                # CROWD_UPDATE
                density_payload = {
                    "type": "CROWD_UPDATE",
                    "stadium_id": stadium_id,
                    "zone_id": f"Zone {random.choice(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'])}",
                    "calculated_density": random.uniform(0.1, 0.98),
                    "timestamp": ts
                }
                await redis_client.publish("stadium_events", json.dumps(density_payload))
                
                # TOILET_UPDATE
                if random.random() > 0.5:
                    toilet_payload = {
                        "type": "TOILET_UPDATE",
                        "stadium_id": stadium_id,
                        "toilet_id": random.choice(["North T1", "South T2", "East T3", "West T4"]),
                        "occupancy": random.randint(0, 100),
                        "status": random.choice(["open", "busy", "maintenance"]),
                        "is_accessible": True,
                        "timestamp": ts
                    }
                    await redis_client.publish("stadium_events", json.dumps(toilet_payload))

                # FOOD_UPDATE
                if random.random() > 0.4:
                    food_payload = {
                        "type": "FOOD_UPDATE",
                        "stadium_id": stadium_id,
                        "stall_id": random.choice(["Alpha Grill", "Stadium Snacks", "Chai Hub", "Curry Corner"]),
                        "wait_time": random.randint(2, 45),
                        "service_load": random.uniform(0.1, 0.95),
                        "status": "active",
                        "timestamp": ts
                    }
                    await redis_client.publish("stadium_events", json.dumps(food_payload))

                # GATE_UPDATE
                gate_payload = {
                    "type": "GATE_UPDATE",
                    "stadium_id": stadium_id,
                    "gate_id": random.choice(GATES),
                    "congestion": random.uniform(0, 1),
                    "status": random.choice(["open", "restricted"]),
                    "timestamp": ts
                }
                await redis_client.publish("stadium_events", json.dumps(gate_payload))

                # EMERGENCY_ALERT (Rare)
                if random.random() > 0.98:
                    alert_payload = {
                        "type": "EMERGENCY_ALERT",
                        "stadium_id": stadium_id,
                        "severity": "CRITICAL",
                        "message": "Localized surge at Gate 4. Rerouting required.",
                        "scope": "Gate 4",
                        "timestamp": ts
                    }
                    await redis_client.publish("stadium_events", json.dumps(alert_payload))

                # EVENT_UPDATE
                event_payload = {
                    "type": "EVENT_UPDATE",
                    "stadium_id": stadium_id,
                    "phase": "LIVE",
                    "score": f"{random.randint(50, 200)} / {random.randint(0, 5)}",
                    "clock": f"{random.randint(5, 50)} overs",
                    "timestamp": ts
                }
                await redis_client.publish("stadium_events", json.dumps(event_payload))
            
            await asyncio.sleep(2)
        except Exception as e:
            print(f"Simulator error in loop: {e}")
            await asyncio.sleep(5)

@app.on_event("startup")
async def startup_event():
    print("FastAPI startup: Launching simulation task...")
    asyncio.create_task(run_simulation())

@app.get("/")
@app.get("/health")
async def health():
    return {"status": "healthy", "service": "iot-simulator"}
