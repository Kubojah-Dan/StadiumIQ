import asyncio
from websockets.sync.client import connect
import threading
import os

def listen_ws():
    stadium_id = os.getenv("STADIUM_ID", "in-narendra-modi")
    with connect(f"ws://localhost:8001/ws/dashboard?stadium_id={stadium_id}&token=guest") as websocket:
        print("Connected to WS. Waiting for messages...")
        for i in range(5):
            message = websocket.recv()
            print(f"Received: {message}")

if __name__ == "__main__":
    listen_ws()
