FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY simulator.py .
RUN pip install redis

# Run the simulator
CMD ["python", "simulator.py"]
