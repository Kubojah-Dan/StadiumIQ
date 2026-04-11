import asyncio
import websockets
import os

async def listen():
    print("Attempting to connect...", flush=True)
    stadium_id = os.getenv("STADIUM_ID", "in-narendra-modi")
    async with websockets.connect(f"ws://localhost:8001/ws/dashboard?stadium_id={stadium_id}&token=guest") as ws:
        print("Connected!", flush=True)
        while True:
            msg = await ws.recv()
            print(f"Received from WS: {msg}", flush=True)

if __name__ == "__main__":
    asyncio.run(listen())
