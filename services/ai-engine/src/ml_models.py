import random
from datetime import datetime, timedelta, timezone

def predict_surge(zone_id: str, current_density: float, velocity: float) -> dict:
    # Simulated ML prediction model (e.g. LSTM/Prophet)
    
    # Simple mock logic: if current density is high or velocity is moving towards it, high surge probalitiy
    base_prob = current_density
    if velocity > 1.5:
        base_prob += 0.2
        
    prob = min(max(base_prob + random.uniform(-0.1, 0.1), 0.0), 1.0)
    
    alert_level = "Normal"
    mitigation = None
    if prob > 0.8:
        alert_level = "Critical"
        mitigation = f"Redirect ingress traffic away from {zone_id}"
    elif prob > 0.6:
        alert_level = "Warning"
        mitigation = f"Monitor {zone_id} closely"
        
    surge_time = (datetime.now(timezone.utc) + timedelta(minutes=random.randint(10, 30))).isoformat()
    return {
        "zone_id": zone_id,
        "surge_probability": round(prob, 2),
        "alert_level": alert_level,
        "estimated_surge_time": surge_time,
        "mitigation_recommendation": mitigation
    }

def predict_queue(concession_id: str, current_q_length: int, local_density: float) -> dict:
    # Simulated model (e.g. Regression) for queue time in minutes
    # Assumption: Every 5 people = ~2 minutes, adjusted by local area density
    base_time = (current_q_length / 5.0) * 2
    density_factor = 1.0 + local_density
    
    wait_time = max(base_time * density_factor + random.uniform(-1, 2), 0)
    alternate = f"C-{(int(concession_id.split('-')[-1]) + 1) if '-' in concession_id else '2'}"
    
    return {
        "concession_id": concession_id,
        "estimated_wait_time_minutes": round(wait_time, 1),
        "alternate_concession_id": alternate
    }

def optimize_navigation(start_zone: str, end_zone: str) -> dict:
    # Simulated Graph/A* avoiding high density
    zones = ["Z-North", "Z-South", "Z-East", "Z-West", "Gate A", "Gate B", "M1", "M2"]
    
    # Just a fake routing
    route = [start_zone]
    if start_zone != "M1" and end_zone != "M1":
        route.append("M1")
    route.append(end_zone)
    
    return {
        "start": start_zone,
        "end": end_zone,
        "route_zones": route,
        "estimated_transit_time_minutes": len(route) * 3 + random.randint(1, 4)
    }

def analyze_crowd_vision(camera_id: str) -> dict:
    # Simulated YOLOv8 inference result
    headcount = random.randint(10, 300)
    # assume max cap for a camera view is 350
    density = min(headcount / 350.0, 1.0)
    
    return {
        "camera_id": camera_id,
        "headcount": headcount,
        "calculated_density": round(density, 2)
    }
