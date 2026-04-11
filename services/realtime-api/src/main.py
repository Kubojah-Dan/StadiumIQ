import os
import json
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import redis.asyncio as redis

app = FastAPI(title="StadiumIQ Realtime API", version="0.1.0")

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
redis_client = redis.from_url(REDIS_URL, decode_responses=True)

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                self.disconnect(connection)

manager = ConnectionManager()

@app.websocket("/ws/stadium")
async def websocket_stadium_feed(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # heartbeat or client-to-server messages
            data = await websocket.receive_text()
            await websocket.send_text(f"ACK: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)

async def redis_listener():
    pubsub = redis_client.pubsub()
    await pubsub.subscribe("stadium_events")
    async for message in pubsub.listen():
        if message["type"] == "message":
            await manager.broadcast(message["data"])

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(redis_listener())

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "realtime-api"}
