import pytest
from httpx import AsyncClient, ASGITransport
from src.main import app

@pytest.mark.asyncio
async def test_predict_queue():
    # ASGITransport avoids needing a live Redis server just to test the contract format!
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.post(
            "/predict/queue",
            json={
                "concession_id": "C-1",
                "current_q_length": 30,
                "local_density": 0.8
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "concession_id" in data
        assert data["concession_id"] == "C-1"
        assert "estimated_wait_time_minutes" in data
        assert isinstance(data["estimated_wait_time_minutes"], (int, float))

@pytest.mark.asyncio
async def test_predict_surge():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.post(
            "/predict/surge",
            json={
                "zone_id": "Gate A",
                "current_density": 0.95,
                "velocity": 2.5
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "zone_id" in data
        assert data["alert_level"] in ["Normal", "Warning", "Critical"]
        assert "surge_probability" in data
