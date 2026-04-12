FROM python:3.11-slim

WORKDIR /app

# Install dependencies
RUN pip install redis fastapi uvicorn

# Copy the simulator script
COPY simulator.py .

# Run the simulator using uvicorn to provide a health check endpoint on port 8080
CMD ["uvicorn", "simulator.py:app", "--host", "0.0.0.0", "--port", "8080"]
