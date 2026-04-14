# 🏟️ StadiumIQ Lite - Next-Gen Venue Intelligence

StadiumIQ Lite is a production-grade, AI-powered stadium operations management platform. It transforms raw telemetry from IoT sensors into actionable 3D visualizations, strategic heatmaps, and real-time navigation for elite venue management teams.

---

## 🚀 Core Features

### 1. 🌐 Tactical 3D Digital Twin
- **Procedural 3D Stadium**: A high-fidelity Three.js visualization of the venue canopy and sections.
- **Dynamic Heatmaps**: Vertical towers that scale and change color (Blue → Yellow → Red) in real-time based on zone density.
- **Strategic Rotation**: 360-degree tactical rotation for full venue situational awareness.

### 2. ⚡ Autonomous Queue Manager
- **Multi-Category Optimization**: Dynamic monitoring for Food, Restrooms, and Merch.
- **Smart Re-routing**: AI-driven logic that identifies long queues and suggests the fastest alternatives to fans.
- **Wait-time Telemetry**: Real-time simulated wait times categorized by service point.

### 3. 📍 AR Navigation Nexus
- **Immersive AR View**: Simulated camera feed with 3D path overlays pointing directly to sections.
- **Operational Map**: Toggleable top-down schematic view for high-level orientation.
- **Voice Assistant**: Integrated text-to-speech engine providing stadium-specific navigation instructions.

### 4. 🚨 Emergency Response Hub
- **Instant Lockdown**: Single-touch emergency mode that locks the dashboard into critical response.
- **Incident Feed**: A high-priority Triage list showing critical surges and incidents with probability scores.
- **Dynamic Alerts**: Real-time popups for security and operations staff.

### 5. 📊 Advanced Analytics & Sustainability
- **Occupancy Distribution**: Deep-dive into stand congestion and premium suite utilization.
- **Green Metrics**: Tracking carbon offsets and renewable energy intensity per event.
- **Loyalty Ecosystem**: Dynamic fan rewards system tied to venue interaction.

---

## 🛠️ Technology Stack

- **Framework**: [React 18](https://reactjs.org/) with [Vite](https://vitejs.dev/)
- **3D Engine**: [Three.js](https://threejs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Glassmorphism + Neon Aesthetics)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State**: React Context (Stadium Location + Global State)

---

## 📦 Installation & Setup

1. **Clone & Install**:
   ```bash
   npm install
   ```

2. **Development Mode**:
   ```bash
   npm run dev
   ```

3. **Production Build**:
   ```bash
   npm run build
   ```

---

## 📂 Repository Structure

- `src/components/`: Modular UI components (3D Twin, Analytics, etc.)
- `src/hooks/`: Custom hooks for Real-time Simulation and Stadium Context.
- `src/context/`: Global state management for venue selection and profiles.
- `src/types/`: TypeScript definitions for operational telemetry.

---

## ⚖️ Performance Optimization

- Capped 3D Pixel Ratio (1.5x) for low-latency responsiveness.
- Optimized Three.js loop with pre-instantiated color and geometry objects.
- Mobile-first responsive design with fixed safe-area nav components.

---

**Developed for the StadiumIQ Elite Operations Suite.**
*Hardened and Polished by Antigravity AI.*
