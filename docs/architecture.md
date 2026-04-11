# StadiumIQ Architecture

StadiumIQ is an AI-powered crowd intelligence platform built on a 4-layer architecture.

## 1. Physical / Ingestion Layer
- Connects to LiDAR, Cameras (via RTSP/WebRTC), and BLE devices.
- Uses Python microservices (e.g., `services/ingestion`) to normalize IoT payloads before sending to RabbitMQ.

## 2. Real-Time Processing Layer
- **Backend**: FastAPI
- **Database**: PostgreSQL with TimescaleDB (for `sensor_data` time-series).
- **Communication**: WebSockets via FastAPI for live density heatmaps. Redis Pub/Sub used if scaling to multiple FastAPI instances.

## 3. Intelligence Layer
- **Crowd Surge Prediction**: Fetches last 60 minutes of `sensor_data`, applies time-series modeling to output predicted density values.
- Triggers `incidents` automatically on the `services/ai-engine` side.

## 4. Presentation Layer
- **Web Dashboard** (`apps/web`): Written in Next.js 14 App Router, using shadcn/ui.
- **Mobile Fan App** (`apps/mobile`): Written in Expo React Native, with offline-first hydration strategies for navigation graphs.

## Deployment
All services are orchestrated via Turborepo pipelines and Docker Compose for local environments. production deployments use Kubernetes.
