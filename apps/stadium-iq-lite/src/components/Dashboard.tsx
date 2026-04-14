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

  const topIncidents = useMemo(() => 
    alerts.slice(0, 3), 
    [alerts]
  );

  // Three.js Scene Persistence Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const zoneMeshesRef = useRef<Record<string, THREE.Mesh>>({});
  const stadiumGroupRef = useRef<THREE.Group | null>(null);
  const frameIdRef = useRef<number | null>(null);

  // Phase 1: Initialization (Only once per mount or stadiumId change)
  useEffect(() => {
    if (!mountRef.current) return;

    // Strict Cleanup of any existing renderer before creating new one
    const cleanup = () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      if (rendererRef.current) {
         rendererRef.current.dispose();
         if (rendererRef.current.domElement && mountRef.current?.contains(rendererRef.current.domElement)) {
           mountRef.current.removeChild(rendererRef.current.domElement);
         }
         rendererRef.current = null;
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

    // Base Structures - Enhanced Realism
    const standGeo = new THREE.TorusGeometry(22, 6, 16, 64);
    const standMat = new THREE.MeshPhongMaterial({ 
      color: 0x1e293b, 
      transparent: true, 
      opacity: 0.2, 
      wireframe: false,
      shininess: 100 
    });
    const stand = new THREE.Mesh(standGeo, standMat);
    stand.rotation.x = Math.PI / 2;
    stadiumGroup.add(stand);

    // Tier 2 Stand
    const upperTierGeo = new THREE.TorusGeometry(26, 3, 16, 64);
    const upperTier = new THREE.Mesh(upperTierGeo, standMat);
    upperTier.rotation.x = Math.PI / 2;
    upperTier.position.y = 8;
    stadiumGroup.add(upperTier);

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

    // Zone Towers Connected to Data
    const zoneLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    zoneLetters.forEach((letter, i) => {
      const id = `Zone ${letter}`;
      const angle = (i / zoneLetters.length) * Math.PI * 2;
      const radius = 24;
      
      const zoneGeo = new THREE.BoxGeometry(4.5, 3, 4.5);
      const zoneMat = new THREE.MeshStandardMaterial({ 
        color: 0x3b82f6, 
        transparent: true, 
        opacity: 0.9, 
        emissive: 0x3b82f6, 
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
    const pointLight = new THREE.PointLight(0x3b82f6, 2, 100);
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

  // Phase 2: Reactive Updates (Mesh density/color only)
  useEffect(() => {
    const targetColor = new THREE.Color();
    const meshes = zoneMeshesRef.current;
    
    Object.entries(meshes).forEach(([id, mesh]) => {
      const data = twinState.zones[id];
      if (data && mesh.material instanceof THREE.MeshStandardMaterial) {
        const density = data.density;
        
        // Inline color logic for speed
        if (density > 0.8) targetColor.set(0xef4444);
        else if (density > 0.6) targetColor.set(0xeab308);
        else targetColor.set(0x3b82f6);
        
        mesh.material.color.lerp(targetColor, 0.15);
        mesh.material.emissive.lerp(targetColor, 0.15);
        mesh.material.emissiveIntensity = 0.2 + density * 1.5;
        mesh.scale.y = 1 + density * 8;
        mesh.position.y = (1 + density * 8) / 2;
      }
    });
  }, [twinState.zones]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full font-sans tracking-tight">
      {/* 3D Heatmap Main Section */}
      <div className="lg:col-span-2 flex flex-col gap-8">
        <div className="flex-1 glass-card overflow-hidden relative group border-white/5">
            <div className="absolute top-10 left-10 z-10">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                    <Activity className="text-stadium-neon" />
                    Live Strategy Hub
                </h2>
                <div className="flex items-center gap-4 mt-2">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold bg-white/5 px-2 py-0.5 rounded">
                        Visual Twin Engine • v4.2.0
                    </p>
                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest ${connected ? 'bg-stadium-success/10 text-stadium-success' : 'bg-stadium-emergency/10 text-stadium-emergency'}`}>
                        {connectionStatus}
                    </span>
                </div>
            </div>
            
            <div className="absolute top-10 right-10 z-10 flex gap-4">
            <button 
                onClick={() => setIsDigitalTwin(!isDigitalTwin)}
                className={`px-5 py-2.5 glass border rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isDigitalTwin ? 'bg-stadium-neon text-white border-stadium-neon shadow-lg shadow-blue-500/20' : 'text-slate-400 border-white/5 hover:bg-white/5'
                }`}
            >
                <Box size={16} />
                {isDigitalTwin ? 'Digital Twin: ACTIVE' : '3D View: ON'}
            </button>
            </div>

            {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-stadium-dark z-20">
                <div className="text-center">
                <div className="w-10 h-10 border-2 border-stadium-neon border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Bridging Venue Feed...</p>
                </div>
            </div>
            )}

            <div ref={mountRef} className="w-full h-full min-h-[500px]" />
            
            {/* Heatmap Legend */}
            <div className="absolute bottom-8 left-10 z-10 flex items-center gap-6 bg-stadium-dark/40 backdrop-blur-xl p-4 rounded-2xl border border-white/5 shadow-2xl">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                    <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">Low Density</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                    <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">Moderate</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-stadium-emergency"></div>
                    <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">High Congestion</span>
                </div>
            </div>
        </div>

        {/* Footer Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard label="Avg. Density" value={`${(avgDensity * 100).toFixed(0)}%`} trend={avgDensity > 0.6 ? 'HIGH' : 'STABLE'} />
            <MetricCard label="Active Alerts" value={activeAlerts.toString()} trend="Live" />
            <MetricCard label="Gate Pressure" value="NORMAL" trend="Stable" />
            <MetricCard label="Signal Health" value={connected ? '100%' : '0%'} trend={connected ? 'ONLINE' : 'ERROR'} />
        </div>
      </div>

      <div className="space-y-8 h-full flex flex-col">
        <StadiumIntelCard stadium={stadium} />
        <AssistantCard stadiumId={stadiumId} context={{ avgDensity, totalAlerts: activeAlerts, connected }} />
        
        {/* Triage Alerts */}
        <div className="glass-card flex-1 p-8 border-white/5 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-stadium-neon/5 blur-[80px]" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Zap size={16} className="text-stadium-neon" />
                Live Incident Feed
            </div>
            <span className="text-[8px] bg-slate-800 px-2 py-0.5 rounded font-bold opacity-60">AUTO-REFRESH</span>
          </h2>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-3 custom-scrollbar">
            {alerts.length === 0 ? (
                <div className="h-60 flex flex-col items-center justify-center text-slate-700">
                    <Navigation size={40} className="opacity-10 mb-4" />
                    <p className="text-[10px] uppercase font-bold tracking-widest">Monitoring Gate Telemetry</p>
                </div>
            ) : (
                alerts.map((p, i) => (
                <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-white/5 rounded-2xl border border-white/5 group/alert hover:bg-white/10 transition-all cursor-default"
                >
                    <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-sm text-white group-hover/alert:text-stadium-neon transition-colors">
                        {p.zone_id}
                    </h3>
                    <span className={`text-[9px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider ${
                        p.alert_level === 'Critical' ? 'bg-stadium-emergency/10 text-stadium-emergency border border-stadium-emergency/20' : 
                        p.alert_level === 'Warning' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-stadium-neon/10 text-stadium-neon border border-stadium-neon/20'
                    }`}>
                        {p.alert_level}
                    </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-4">{String(p.message || 'Localized surge detected in primary concourse.')}</p>
                    <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 font-bold uppercase">{p.estimated_surge_time ? `ETA: ${p.estimated_surge_time}` : 'Active Status'}</span>
                    <span className="text-stadium-neon font-bold">{(Number(p.surge_probability || 1) * 100).toFixed(0)}% Certainty</span>
                    </div>
                </motion.div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, trend }: { label: string, value: string, trend: string }) {
  return (
    <div className="glass-card p-6 border-white/5 hover:bg-white/5 transition-all relative group overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-stadium-neon/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">{label}</p>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${trend === 'HIGH' || trend === 'ERROR' ? 'bg-stadium-emergency/10 text-stadium-emergency' : 'bg-stadium-success/10 text-stadium-success'}`}>{trend}</p>
      </div>
    </div>
  );
}

