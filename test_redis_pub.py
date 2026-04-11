import redis
import json
import time
import os

def run():
    r = redis.Redis(host='localhost', port=6379, decode_responses=True)
    stadium_id = os.getenv("STADIUM_ID", "in-narendra-modi")
    msg = {"stadium_id": stadium_id, "camera_id": "Gate B", "calculated_density": 0.99, "timestamp": time.time()}
    print("Publishing crowd:update...")
    res = r.publish("crowd:update", json.dumps(msg))
    print(f"Subscribers that received it: {res}")

if __name__ == '__main__':
    run()
