# StadiumIQ 🏟️
AI-powered stadium operations assistant for real-time crowd safety and venue decision support.

## 🚀 Key Features

### 1. Context-Aware Digital Twin
- **Dynamic 3D Heatmap**: Real-time visualization of zone density using Three.js (Singleton Renderer Pattern for 60fps performance).
- **Incident Triage**: Live surge detection with Gemini-powered mitigation recommendations.
- **Smart Analytics**: Reactive charts connected to live gate telemetry.

### 2. Live Intelligence Layer
- **WebSocket Streaming**: Institutional-grade event stream for sub-100ms latency.
- **IoT Simulator**: Integrated telemetry publisher for demonstrating ingress/egress load.
- **Venue Enrichment**: Auto-pulls venue data from Wikipedia and Google Maps.

### 3. Tactical AR Navigation
- **Path Optimization**: Real-time routing through the least congested venue sectors.
- **Interactive Schematics**: Clickable mapping for dual-mode orientation.

### 4. Enterprise Governance
- **Hardened Security**: PBKDF2-SHA256 password hashing and brute-force protection.
- **Two-Factor Authentication**: RFC 6238 compliant TOTP support with QR setup.
- **Modular Design**: Fully decoupled frontend/backend for horizontal scaling.

## 🛠️ Architecture
- `apps/stadium-iq-lite`: Vite + React + Three.js operations hub (V4 Visual Engine).
- `services/realtime`: FastAPI + WebSocket hub for event orchestration.
- `services/ai-engine`: Python inference node for crowd flow prediction.

## ⚡ Setup & Deployment

### 1) Backend Nodes
```bash
# Start Realtime & AI Nodes
uvicorn services.realtime.app.main:app --port 8001
uvicorn services.ai-engine.src.main:app --port 8002
```

### 2) Frontend Dashboard
```bash
cd apps/stadium-iq-lite
npm install
npm run dev
```
Open: `http://localhost:5173`

## 📦 Deployment Constraints
- **Lightweight Source**: Optimized to keep core repository under 1MB (excluding assets).
- **Singleton Performance**: Engineered to run on mobile and low-powered browser nodes.

---
*Optimizing safety for India's 24 premier stadiums.*
