import asyncio
import httpx
import random

async def simulate_events():
    async with httpx.AsyncClient() as client:
        # Simulate Vision feeding
        print("Sending vision feed...")
        await client.post("http://127.0.0.1:8002/analyze/feed", json={
            "camera_id": "Gate B",
            "frame_data": "raw_base64_data_here"
        })
        
        # Simulate Queue prediction
        print("Sending queue update...")
        await client.post("http://127.0.0.1:8002/predict/queue", json={
            "concession_id": "C-2",
            "current_q_length": random.randint(15, 60),
            "local_density": 0.8
        })

        # Simulate Surge
        print("Sending surge prediction...")
        await client.post("http://127.0.0.1:8002/predict/surge", json={
            "zone_id": "Gate B",
            "current_density": 0.95,
            "velocity": 2.1
        })

if __name__ == "__main__":
    asyncio.run(simulate_events())
