import os
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel

from .redis_client import init_redis, close_redis, publish_event
from .ml_models import predict_surge as model_predict_surge
from .ml_models import predict_queue as model_predict_queue
from .ml_models import optimize_navigation, analyze_crowd_vision
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request

app = FastAPI(title="StadiumIQ AI Inference Engine", version="0.2.0")
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

class SurgeRequest(BaseModel):
    zone_id: str
    current_density: float
    velocity: float

class FeedRequest(BaseModel):
    camera_id: str
    frame_data: str

class QueueRequest(BaseModel):
    concession_id: str
    current_q_length: int
    local_density: float

class RouteRequest(BaseModel):
    start_zone: str
    end_zone: str

@app.on_event("startup")
async def startup_event():
    await init_redis()

@app.on_event("shutdown")
async def shutdown_event():
    await close_redis()

@app.get("/health")
async def health():
    return {"status": "ok", "models_loaded": ["surge", "vision", "queue", "navigation"]}

@app.post("/predict/surge")
@limiter.limit("50/minute")
async def predict_surge(req: SurgeRequest, bg_tasks: BackgroundTasks, request: Request):
    result = model_predict_surge(req.zone_id, req.current_density, req.velocity)
    
    if result["alert_level"] in ["Warning", "Critical"]:
        # Publish to event bus for realtime delivery
        bg_tasks.add_task(publish_event, "surge:alert", result)
        
    return result

@app.post("/analyze/feed")
@limiter.limit("30/minute")
async def analyze_video_feed(req: FeedRequest, bg_tasks: BackgroundTasks, request: Request):
    result = analyze_crowd_vision(req.camera_id)
    
    # Broadcast crowd update
    bg_tasks.add_task(publish_event, "crowd:update", result)
    return result

@app.post("/predict/queue")
@limiter.limit("50/minute")
async def predict_queue(req: QueueRequest, bg_tasks: BackgroundTasks, request: Request):
    result = model_predict_queue(req.concession_id, req.current_q_length, req.local_density)
    
    bg_tasks.add_task(publish_event, "queue:update", result)
    return result

@app.post("/navigation/route")
@limiter.limit("100/minute")
async def navigation_route(req: RouteRequest, request: Request):
    result = optimize_navigation(req.start_zone, req.end_zone)
    return result
