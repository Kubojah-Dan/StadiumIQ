import redis.asyncio as redis
import json
import os

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# Global variables for Redis connection
redis_client = None

async def init_redis():
    global redis_client
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)

async def close_redis():
    global redis_client
    if redis_client:
        await redis_client.close()

async def publish_event(topic: str, data: dict):
    if redis_client:
        await redis_client.publish(topic, json.dumps(data))
