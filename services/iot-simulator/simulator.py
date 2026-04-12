import asyncio
import json
import random
import os
import redis.asyncio as redis
from fastapi import FastAPI

app = FastAPI()

# Configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
# Smaller subset for demo
STADIUM_IDS = [
    "in-narendra-modi", "in-eden-gardens", "in-wankhede", "in-arun-jaitley",
    "in-m-chinnaswamy", "in-chepauk", "in-hyderabad-uppal", "in-mca-pune"
]
SECTIONS = [101, 102, 114, 204]
GATES = ["North A", "South B", "East C"]

client = None

async def get_redis():
    global client
    if client is None:
        client = redis.from_url(REDIS_URL, decode_responses=True)
    return client

def get_publish_stadium_ids():
    single = os.getenv("STADIUM_ID")
    if single:
        return [single.strip()]
    return STADIUM_IDS

async def run_simulation():
    """Background loop to publish mock IoT data to Redis"""
    redis_client = await get_redis()
    print(f"Starting IoT Sensor Simulator loop (Redis: {REDIS_URL})...")
    
    while True:
        try:
            ts = asyncio.get_event_loop().time()
            for stadium_id in get_publish_stadium_ids():
                # Simulate Section Density Ping
                density_payload = {
                    "type": "CROWD_UPDATE",
                    "stadium_id": stadium_id,
                    "camera_id": f"cam_{random.choice(SECTIONS)}",
                    "calculated_density": random.uniform(0.1, 0.9),
                    "timestamp": ts
                }
                await redis_client.publish("stadium_events", json.dumps(density_payload))
                
                # Simulate Gate Queue Ping (25% chance)
                if random.random() > 0.75:
                    queue_payload = {
                        "type": "QUEUE_UPDATE",
                        "stadium_id": stadium_id,
                        "concession_id": random.choice(GATES),
                        "estimated_wait_time_minutes": random.randint(5, 45),
                        "timestamp": ts
                    }
                    await redis_client.publish("stadium_events", json.dumps(queue_payload))
            
            await asyncio.sleep(2)
        except Exception as e:
            print(f"Simulator error: {e}")
            await asyncio.sleep(5)

@app.on_event("startup")
async def startup_event():
    # Start the simulation loop as a background task
    asyncio.create_task(run_simulation())

@app.get("/")
@app.get("/health")
async def health():
    return {"status": "healthy", "service": "iot-simulator"}
