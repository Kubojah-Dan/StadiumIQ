import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  ArrowUpRight,
  Clock,
  MapPin,
  Box,
  Fingerprint,
  Zap,
  Navigation
} from 'lucide-react';
import * as THREE from 'three';
// @ts-ignore - GLTFLoader path can be fickle in some build pipelines
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { motion } from 'framer-motion';
import { useStadium } from '../context/StadiumContext';
import { useRealtime } from '../hooks/useRealtime';
import StadiumIntelCard from './StadiumIntelCard';
import AssistantCard from './AssistantCard';

// Global Singleton Renderer for Three.js to prevent WebGL Context Leaks
let globalRenderer: THREE.WebGLRenderer | null = null;
const getRenderer = () => {
  if (!globalRenderer) {
    globalRenderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true, 
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false 
    });
    globalRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  }
  return globalRenderer;
};

export default function Dashboard() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { stadiumId, stadium } = useStadium();
  const { twinState, alerts, connected, connectionStatus } = useRealtime();
  
  const [isDigitalTwin, setIsDigitalTwin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Derived states from realtime hook
  const zonesArray = useMemo(() => Object.entries(twinState.zones || {}), [twinState.zones]);
  const avgDensity = useMemo(() => 
    zonesArray.length > 0 ? zonesArray.reduce((acc, [, z]) => acc + (z.density || 0), 0) / zonesArray.length : 0, 
    [zonesArray]
  );
  
  const activeAlerts = useMemo(() => 
    alerts.filter(a => a.alert_level === 'Critical' || a.alert_level === 'Warning').length, 
    [alerts]
  );

  // Three.js Scene Persistence Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const zoneMeshesRef = useRef<Record<string, THREE.Mesh>>({});
  const stadiumGroupRef = useRef<THREE.Group | null>(null);
  const frameIdRef = useRef<number | null>(null);

  // Phase 1: Initialization
  useEffect(() => {
    if (!mountRef.current) return;

    const cleanup = () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      if (rendererRef.current) {
         if (rendererRef.current.domElement && mountRef.current?.contains(rendererRef.current.domElement)) {
           mountRef.current.removeChild(rendererRef.current.domElement);
         }
      }
      if (sceneRef.current) {
        sceneRef.current.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
            else obj.material.dispose();
          }
        });
        sceneRef.current = null;
      }
    };

    cleanup();

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = null;
    
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 30, 45);
    camera.lookAt(0, 0, 0);

    const renderer = getRenderer();
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    const stadiumGroup = new THREE.Group();
    stadiumGroupRef.current = stadiumGroup;
    const zoneMeshes: Record<string, THREE.Mesh> = {};

    // Build Stadium geometry
    const standGeo = new THREE.TorusGeometry(22, 6, 16, 64);
    const standMat = new THREE.MeshPhongMaterial({ 
      color: 0x1e293b, 
      transparent: true, 
      opacity: 0.2, 
      shininess: 100 
    });
    const stand = new THREE.Mesh(standGeo, standMat);
    stand.rotation.x = Math.PI / 2;
    stadiumGroup.add(stand);

    const pitchGeo = new THREE.PlaneGeometry(28, 38);
    const pitchMat = new THREE.MeshPhongMaterial({ 
      color: 0x064e3b, 
      transparent: true, 
      opacity: 0.6, 
      emissive: 0x059669, 
      emissiveIntensity: 0.3,
      side: THREE.DoubleSide
    });
    const pitch = new THREE.Mesh(pitchGeo, pitchMat);
    pitch.rotation.x = -Math.PI / 2;
    stadiumGroup.add(pitch);

    const zoneLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    zoneLetters.forEach((letter, i) => {
      const id = `Zone ${letter}`;
      const angle = (i / zoneLetters.length) * Math.PI * 2;
      const radius = 24;
      
      const zoneGeo = new THREE.BoxGeometry(4.5, 3, 4.5);
      const zoneMat = new THREE.MeshStandardMaterial({ 
        color: 0x06b6d4, 
        transparent: true, 
        opacity: 0.9, 
        emissive: 0x06b6d4, 
        emissiveIntensity: 0.6 
      });
      const mesh = new THREE.Mesh(zoneGeo, zoneMat);
      
      mesh.position.set(Math.cos(angle) * radius, 1.5, Math.sin(angle) * radius);
      mesh.lookAt(0, 1.5, 0);
      
      stadiumGroup.add(mesh);
      zoneMeshes[id] = mesh;
    });
    zoneMeshesRef.current = zoneMeshes;

    scene.add(stadiumGroup);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const pointLight = new THREE.PointLight(0x06b6d4, 2, 100);
    pointLight.position.set(0, 20, 0);
    scene.add(pointLight);

    setLoading(false);

    const animate = () => {
      if (stadiumGroupRef.current) stadiumGroupRef.current.rotation.y += 0.002;
      if (rendererRef.current && sceneRef.current) {
        rendererRef.current.render(sceneRef.current, camera);
      }
      frameIdRef.current = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cleanup();
    };
  }, [stadiumId]);

  useEffect(() => {
    const targetColor = new THREE.Color();
    const meshes = zoneMeshesRef.current;
    
    Object.entries(meshes).forEach(([id, mesh]) => {
      const data = twinState.zones[id];
      if (data && mesh.material instanceof THREE.MeshStandardMaterial) {
        const density = data.density;
        
        if (density > 0.8) targetColor.set(0xef4444);
        else if (density > 0.6) targetColor.set(0xf97316);
        else targetColor.set(0x06b6d4);
        
        mesh.material.color.lerp(targetColor, 0.15);
        mesh.material.emissive.lerp(targetColor, 0.15);
        mesh.material.emissiveIntensity = 0.2 + density * 1.5;
        mesh.scale.y = 1 + density * 8;
        mesh.position.y = (1 + density * 8) / 2;
      }
    });
  }, [twinState.zones]);

  return (
    <div className="flex flex-col gap-6 md:gap-8 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* 3D Heatmap Main Section */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-card aspect-video w-full overflow-hidden relative group border-white/5 min-h-[300px] md:min-h-[500px]">
              <div className="absolute top-4 left-4 md:top-8 md:left-8 z-10">
                  <h2 className="text-lg md:text-2xl font-bold flex items-center gap-2 md:gap-3 text-white font-display">
                      <Activity className="text-stadium-neon" size={20} />
                      Live Venue Twin
                  </h2>
                  <div className="flex items-center gap-2 md:gap-4 mt-1 md:mt-2">
                      <p className="text-[8px] md:text-[10px] text-slate-500 uppercase tracking-widest font-bold bg-white/5 px-2 py-0.5 rounded">
                          Tactical Overseer • v4.3
                      </p>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${connected ? 'bg-stadium-success/10 text-stadium-success' : 'bg-stadium-error/10 text-stadium-error'}`}>
                          {connectionStatus}
                      </span>
                  </div>
              </div>
              
              <div className="absolute top-4 right-4 md:top-8 md:right-8 z-10">
              <button 
                  onClick={() => setIsDigitalTwin(!isDigitalTwin)}
                  className={`px-3 py-1.5 md:px-5 md:py-2.5 glass border rounded-xl text-[10px] md:text-xs font-bold transition-all flex items-center gap-2 tap-target ${
                  isDigitalTwin ? 'bg-stadium-neon text-white border-stadium-neon shadow-lg shadow-cyan-500/20' : 'text-slate-400 border-white/5 hover:bg-white/5'
                  }`}
              >
                  <Box size={14} className="md:w-4 md:h-4" />
                  <span className="hidden xs:inline">{isDigitalTwin ? 'TWIN ACTIVE' : '3D VIEW'}</span>
              </button>
              </div>

              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-stadium-dark z-20">
                    <div className="text-center">
                    <div className="w-8 h-8 border-2 border-stadium-neon border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Ingesting telemetry...</p>
                    </div>
                </div>
              )}

              <div ref={mountRef} className="w-full h-full" />
              
              {/* Heatmap Legend - Responsive Layout */}
              <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-auto z-10 flex flex-wrap items-center gap-3 md:gap-6 bg-stadium-dark/60 backdrop-blur-xl p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5 shadow-2xl">
                  <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-stadium-neon"></div>
                      <span className="text-[9px] md:text-[10px] font-bold uppercase text-slate-400 tracking-wider">Low</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-stadium-warning"></div>
                      <span className="text-[9px] md:text-[10px] font-bold uppercase text-slate-400 tracking-wider">Moderate</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-stadium-error"></div>
                      <span className="text-[9px] md:text-[10px] font-bold uppercase text-slate-400 tracking-wider">High Risk</span>
                  </div>
              </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <MetricCard label="Global Density" value={`${(avgDensity * 100).toFixed(0)}%`} trend={avgDensity > 0.6 ? 'HIGH' : 'STABLE'} />
              <MetricCard label="Live Alerts" value={activeAlerts.toString()} trend="ACTIVE" />
              <MetricCard label="Link Health" value={connected ? '100%' : 'OFFLINE'} trend={connected ? 'OPT' : 'ERR'} />
              <MetricCard label="Est. Triage" value="3m" trend="FAST" />
          </div>
        </div>

        {/* Right Sidebar: Intelligence & Alerts */}
        <div className="flex flex-col gap-6 md:gap-8">
          <StadiumIntelCard stadium={stadium} />
          <AssistantCard stadiumId={stadiumId} context={{ avgDensity, totalAlerts: activeAlerts, connected }} />
          
          {/* Triage Alerts - Optimized for Mobile Scrolling */}
          <div className="glass-card flex-1 p-5 md:p-8 border-white/5 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden flex flex-col min-h-[400px]">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-stadium-neon/5 blur-[80px]" />
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Zap size={14} className="text-stadium-neon" />
                  Signal Triage
              </h2>
              <span className="text-[8px] bg-white/5 px-2 py-0.5 rounded font-bold opacity-60">LIVE FEED</span>
            </div>

            <div className="flex-1 space-y-3 md:space-y-4 overflow-y-auto pr-1 custom-scrollbar">
              {alerts.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-700 py-10">
                      <Navigation size={32} className="opacity-10 mb-4" />
                      <p className="text-[9px] uppercase font-bold tracking-widest">Scanning Gate Arrays...</p>
                  </div>
              ) : (
                  alerts.map((p, i) => (
                  <motion.div 
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 md:p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-stadium-neon/20 transition-all"
                  >
                      <div className="flex justify-between items-start mb-2 md:mb-3">
                        <h3 className="font-bold text-xs md:text-sm text-white">{p.zone_id}</h3>
                        <span className={`text-[8px] md:text-[9px] px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider ${
                            p.alert_level === 'Critical' ? 'bg-stadium-error/10 text-stadium-error border border-stadium-error/20' : 
                            p.alert_level === 'Warning' ? 'bg-stadium-warning/10 text-stadium-warning border border-stadium-warning/20' : 'bg-stadium-neon/10 text-stadium-neon border border-stadium-neon/20'
                        }`}>
                            {p.alert_level}
                        </span>
                      </div>
                      <p className="text-[10px] md:text-[11px] text-slate-400 leading-relaxed mb-3 md:mb-4 line-clamp-2">{p.message || 'Anomaly detected in sector telemetry.'}</p>
                      <div className="flex items-center justify-between text-[8px] md:text-[10px]">
                        <span className="text-slate-500 font-bold uppercase">{p.estimated_surge_time ? `ETA: ${p.estimated_surge_time}` : 'TRIAL STATUS'}</span>
                        <span className="text-stadium-neon font-bold">{(Number(p.surge_probability || 1) * 100).toFixed(0)}% PROB</span>
                      </div>
                  </motion.div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, trend }: { label: string, value: string, trend: string }) {
  const isNegative = trend === 'HIGH' || trend === 'ERR';
  const isPositive = trend === 'STABLE' || trend === 'OPT' || trend === 'ACTIVE';

  return (
    <div className="glass-card p-4 md:p-6 border-white/5 hover:bg-white/5 transition-all relative group overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-stadium-neon/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <p className="text-[8px] md:text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1 md:mb-2">{label}</p>
      <div className="flex items-end justify-between gap-2">
        <p className="text-lg md:text-2xl font-bold text-white truncate">{value}</p>
        <span className={`text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
            isNegative ? 'bg-stadium-error/10 text-stadium-error' : 
            isPositive ? 'bg-stadium-success/10 text-stadium-success' : 'bg-slate-800 text-slate-400'
        }`}>
            {trend}
        </span>
      </div>
    </div>
  );
}
