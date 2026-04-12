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
STADIUM_IDS = ["in-narendra-modi", "in-eden-gardens", "in-wankhede"]
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
                # DENSITY_UPDATE (Crowd)
                density_payload = {
                    "type": "CROWD_UPDATE",
                    "stadium_id": stadium_id,
                    "camera_id": f"cam_{random.choice(SECTIONS)}",
                    "calculated_density": random.uniform(0.1, 0.95),
                    "timestamp": ts
                }
                await redis_client.publish("stadium_events", json.dumps(density_payload))
                
                # QUEUE_UPDATE
                if random.random() > 0.8:
                    queue_payload = {
                        "type": "QUEUE_UPDATE",
                        "stadium_id": stadium_id,
                        "concession_id": random.choice(GATES),
                        "estimated_wait_time_minutes": random.randint(5, 50),
                        "timestamp": ts
                    }
                    await redis_client.publish("stadium_events", json.dumps(queue_payload))
            
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
