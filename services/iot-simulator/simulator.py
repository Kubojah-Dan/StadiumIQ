import time
import json
import random
import os
import redis

# Simulator for local development
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
client = redis.from_url(REDIS_URL, decode_responses=True)

SECTIONS = [101, 102, 114, 204]
GATES = ["North A", "South B", "East C"]

# Stadium IDs used by the web dashboard selector (demo list).
# Override with `STADIUM_ID=<id>` to publish to a single stadium,
# or `STADIUM_IDS=id1,id2,...` to publish to a subset.
STADIUM_IDS = [
    "in-narendra-modi",
    "in-eden-gardens",
    "in-wankhede",
    "in-arun-jaitley",
    "in-m-chinnaswamy",
    "in-chepauk",
    "in-hyderabad-uppal",
    "in-mca-pune",
    "in-pca-mohali",
    "in-sawai-mansingh",
    "in-green-park",
    "in-ekana-lucknow",
    "in-hpca-dharamshala",
    "in-holkar",
    "in-barsapara",
    "in-barabati",
    "in-jsca-ranchi",
    "in-vidarbha-nagpur",
    "in-nehru-stadium-kochi",
    "in-saltlake",
    "in-kanteerava",
    "in-jln-delhi",
    "in-marine-drive-mumbai",
    "in-gmc-balewadi",
]

def pick_stadium_id():
    single = os.getenv("STADIUM_ID")
    if single:
        return single.strip()
    subset = os.getenv("STADIUM_IDS")
    if subset:
        ids = [s.strip() for s in subset.split(",") if s.strip()]
        if ids:
            return random.choice(ids)
    return random.choice(STADIUM_IDS)

def get_publish_stadium_ids():
    single = os.getenv("STADIUM_ID")
    if single:
        return [single.strip()]
    subset = os.getenv("STADIUM_IDS")
    if subset:
        ids = [s.strip() for s in subset.split(",") if s.strip()]
        return ids if ids else STADIUM_IDS
    return STADIUM_IDS

def simulate():
    print("Starting IoT Sensor Simulator...")
    while True:
        ts = time.time()
        for stadium_id in get_publish_stadium_ids():
            # Simulate Section Density Ping
            section = random.choice(SECTIONS)
            density_payload = {
                "type": "DENSITY_UPDATE",
                "stadium_id": stadium_id,
                "section_id": section,
                "count": random.randint(50, 450),
                "timestamp": ts
            }
            client.publish("stadium_events", json.dumps(density_payload))
            
            # Simulate Gate Queue Ping
            if random.random() > 0.75:
                gate = random.choice(GATES)
                queue_payload = {
                    "type": "QUEUE_UPDATE",
                    "stadium_id": stadium_id,
                    "gate_id": gate,
                    "wait_time_sec": random.randint(120, 1800),
                    "timestamp": ts
                }
                client.publish("stadium_events", json.dumps(queue_payload))

        time.sleep(2) # Ping every 2 seconds

if __name__ == "__main__":
    simulate()
