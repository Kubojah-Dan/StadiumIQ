import asyncio
import json
import random
import datetime

async def generate_mock_sensor_data():
    zones = ["Gate A", "Gate B", "Main Concourse", "Restroom C1", "Concession D"]
    while True:
        data = {
            "timestamp": datetime.datetime.now().isoformat(),
            "sensor_type": random.choice(["camera", "lidar"]),
            "zone": random.choice(zones),
            "value": round(random.uniform(0.1, 0.9), 2),
            "metadata": {"confidence": 0.95}
        }
        print(f"Publishing: {json.dumps(data)}")
        # In a real app, publish to RabbitMQ or Redis
        await asyncio.sleep(2)

if __name__ == "__main__":
    try:
        asyncio.run(generate_mock_sensor_data())
    except KeyboardInterrupt:
        print("Mock generator stopped.")
