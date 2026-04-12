FROM python:3.11-slim

WORKDIR /app

# Install dependencies
RUN pip install redis fastapi uvicorn

# Copy only the necessary file
COPY simulator.py .

# Standard Cloud Run port is 8080. 
# Using "simulator:app" (module:app) instead of "simulator.py:app"
CMD ["uvicorn", "simulator:app", "--host", "0.0.0.0", "--port", "8080"]
