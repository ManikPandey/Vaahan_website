import React, { useEffect, useRef, useState } from 'react';
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Zap, ShieldCheck, Activity, Navigation } from 'lucide-react';

// --- THE WEBGL OVERLAY ENGINE ---
const WebGLOverlay = ({ carPosition, carHeading, efficiency, lootActive, lootCoords }) => {
  const map = useMap();
  const overlayRef = useRef(null);
  const sceneRef = useRef(new THREE.Scene());
  const cameraRef = useRef(new THREE.PerspectiveCamera());
  const rendererRef = useRef(null);
  
  const carGroupRef = useRef(new THREE.Group());
  const carOffsetRef = useRef(new THREE.Group())
  const lootGroupRef = useRef(new THREE.Group());
  const trailRef = useRef(null);
  const trailPositionsRef = useRef([]);

  useEffect(() => {
    if (!map) return;

    const overlay = new google.maps.WebGLOverlayView();
    overlayRef.current = overlay;

    overlay.onAdd = () => {
      // 1. Setup the 3D Car Model Hierarchy
      sceneRef.current.add(carGroupRef.current);
      carGroupRef.current.add(carOffsetRef.current); // Put offset box inside main GPS box
      
      // --- SET YOUR LANE OFFSET HERE ---
      // X = Left/Right (Positive is Right, Negative is Left)
      // Z = Forward/Backward (Negative is Forward, Positive is Backward)
      carOffsetRef.current.position.x = 15; // Shifts the car 3 meters to the Right!
      // ---------------------------------

      const gltfLoader = new GLTFLoader();
      gltfLoader.load('/car.glb', (gltf) => {
        const model = gltf.scene;
        model.scale.set(8.0, 8, 8); 
        
        model.rotation.y = Math.PI / 1.15;
        model.rotation.x = Math.PI / 2;
        
        // Add model to the INNER OFFSET container, not the main group
        carOffsetRef.current.add(model); 
      }, undefined, (error) => {
        console.error("Could not load car.glb", error);
        const bodyGeo = new THREE.BoxGeometry(2, 1.5, 4.5);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.75;
        carOffsetRef.current.add(body); // Fallback also goes in offset
      });

      // Setup AR Loot Drop
      sceneRef.current.add(lootGroupRef.current);
      const lootGeo = new THREE.OctahedronGeometry(2);
      const lootMat = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.8, wireframe: true });
      const loot = new THREE.Mesh(lootGeo, lootMat);
      const coreGeo = new THREE.OctahedronGeometry(1);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const core = new THREE.Mesh(coreGeo, coreMat);
      lootGroupRef.current.add(loot, core);

      // Setup TRON Trail
      const trailMat = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 8 });
      const trailGeo = new THREE.BufferGeometry();
      const trail = new THREE.Line(trailGeo, trailMat);
      trailRef.current = trail;
      sceneRef.current.add(trail);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      const dirLight = new THREE.DirectionalLight(0xffffff, 2);
      dirLight.position.set(50, 100, 50);
      sceneRef.current.add(ambientLight, dirLight);
    };

    overlay.onContextRestored = ({ gl }) => {
      rendererRef.current = new THREE.WebGLRenderer({ canvas: gl.canvas, context: gl, ...gl.getContextAttributes() });
      rendererRef.current.autoClear = false;
    };

    overlay.onRemove = () => {
      if (rendererRef.current) rendererRef.current.dispose();
    };

    overlay.onDraw = ({ gl, transformer }) => {
      if (!rendererRef.current) return;

      const matrix = transformer.fromLatLngAltitude({ lat: carPosition.lat, lng: carPosition.lng, altitude: 0 });
      cameraRef.current.projectionMatrix = new THREE.Matrix4().fromArray(matrix);
      
      const carVector = transformer.fromLatLngAltitude({ lat: carPosition.lat, lng: carPosition.lng, altitude: 4 });
      if (carVector && !isNaN(carVector.x)) {
        carGroupRef.current.position.copy(carVector); 
        // Map heading is clockwise from North, Three.js rotation is counter-clockwise.
        carGroupRef.current.rotation.y = -(carHeading * Math.PI) / 180;
        carGroupRef.current.translateX(1);
      }

      if (trailRef.current && carVector && !isNaN(carVector.x)) {
        const trailColor = efficiency > 70 ? 0x10b981 : (efficiency > 40 ? 0xf59e0b : 0xef4444);
        trailRef.current.material.color.setHex(trailColor);
        
        const len = trailPositionsRef.current.length;
        if (len === 0 || trailPositionsRef.current[len-3] !== carVector.x || trailPositionsRef.current[len-1] !== carVector.z) {
          trailPositionsRef.current.push(carVector.x, 0.2, carVector.z); 
          if (trailPositionsRef.current.length > 500) trailPositionsRef.current.splice(0, 3); 
          trailRef.current.geometry.setAttribute('position', new THREE.Float32BufferAttribute(trailPositionsRef.current, 3));
        }
      }

      if (lootGroupRef.current) {
        lootGroupRef.current.visible = lootActive;
        if (lootActive) {
          const lootVector = transformer.fromLatLngAltitude({ lat: lootCoords.lat, lng: lootCoords.lng, altitude: 3 });
          if (lootVector && !isNaN(lootVector.x)) {
            const time = Date.now() * 0.003;
            lootGroupRef.current.position.set(lootVector.x, lootVector.y + Math.sin(time) * 1.5, lootVector.z);
            lootGroupRef.current.rotation.y += 0.05;
          }
        }
      }

      rendererRef.current.state.reset();
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      overlay.requestRedraw();
    };

    overlay.setMap(map);
    return () => { if (overlayRef.current) overlayRef.current.setMap(null); };
  }, [map, carPosition, carHeading, efficiency, lootActive]);

  return null;
};

// --- MAIN UI & SIMULATION COMPONENT ---
export default function SmartDrive3D() {
  const [isDriving, setIsDriving] = useState(false);
  const [ecoPoints, setEcoPoints] = useState(1240);
  
  // --- REAL VIP ROAD COORDINATES (BHOPAL) ---
  // These waypoints accurately trace the curve of VIP Road along the Upper Lake
  // --- REALIGNED VIP ROAD COORDINATES ---
  // --- SHIFTED VIP ROAD COORDINATES (INLAND) ---
  // --- SHIFTED VIP ROAD COORDINATES (INLAND) ---
  // --- SHIFTED FURTHER INLAND ---
  const WAYPOINTS = [
    { lat: 23.255750, lng: 77.395500 }, // Start
    { lat: 23.257250, lng: 77.393500 }, // Approaching statue
    { lat: 23.258800, lng: 77.391800 }, // Right next to View Point (On the road)
    { lat: 23.260250, lng: 77.390000 }, // Past the statue
    { lat: 23.261850, lng: 77.388200 }  // End
  ];
  
  // Place the loot pod exactly on Waypoint 2
  const LOOT_COORDS = { lat: 23.258800, lng: 77.395000 };

  const [carPos, setCarPos] = useState(WAYPOINTS[0]);
  const [carHeading, setCarHeading] = useState(0);
  const [lootActive, setLootActive] = useState(true);
  const [efficiency, setEfficiency] = useState(100); 
  const [telemetryEvent, setTelemetryEvent] = useState("System Ready. Waiting for Engine Start.");

  const calculateHeading = (p1, p2) => {
    const dLng = (p2.lng - p1.lng) * Math.PI / 180;
    const lat1 = p1.lat * Math.PI / 180;
    const lat2 = p2.lat * Math.PI / 180;
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    const brng = Math.atan2(y, x);
    return ((brng * 180 / Math.PI) + 360) % 360;
  };

  const calculateDistance = (p1, p2) => {
    const dx = p2.lng - p1.lng;
    const dy = p2.lat - p1.lat;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const startSimulation = () => {
    setIsDriving(true);
    setTelemetryEvent("Engine Started. Routing...");
    
    let currentWaypointIndex = 0;
    let progress = 0;
    let currentEfficiency = 100;
    
    setCarHeading(calculateHeading(WAYPOINTS[0], WAYPOINTS[1]));

    const driveInterval = setInterval(() => {
      if (currentWaypointIndex >= WAYPOINTS.length - 1) {
        clearInterval(driveInterval);
        setIsDriving(false);
        setTelemetryEvent("Destination Reached.");
        return;
      }

      const start = WAYPOINTS[currentWaypointIndex];
      const end = WAYPOINTS[currentWaypointIndex + 1];
      
      const dist = calculateDistance(start, end);
      const speedStep = 0.000015 / dist; 
      
      progress += speedStep;

      if (progress >= 1) {
        progress = 0;
        currentWaypointIndex++;
        if (currentWaypointIndex < WAYPOINTS.length - 1) {
          setCarHeading(calculateHeading(WAYPOINTS[currentWaypointIndex], WAYPOINTS[currentWaypointIndex + 1]));
        }
        return;
      }

      const newLat = start.lat + (end.lat - start.lat) * progress;
      const newLng = start.lng + (end.lng - start.lng) * progress;
      setCarPos({ lat: newLat, lng: newLng });

      // Traffic Events
      const randomEvent = Math.random();
      if (randomEvent > 0.96 && currentEfficiency > 50) {
        currentEfficiency -= 30; 
        setTelemetryEvent("Harsh Braking Detected! Efficiency dropping.");
      } else if (randomEvent > 0.94 && currentEfficiency > 60) {
        currentEfficiency -= 20; 
        setTelemetryEvent("Speed Limit Exceeded! Wasting fuel.");
      } else if (currentEfficiency < 100) {
        currentEfficiency += 1.5; 
        if (currentEfficiency > 80) setTelemetryEvent("Cruising optimally. Trail restored.");
      }
      setEfficiency(currentEfficiency);

      // AR Collision Detection
      if (lootActive && Math.abs(newLat - LOOT_COORDS.lat) < 0.00015 && Math.abs(newLng - LOOT_COORDS.lng) < 0.00015) {
        setEcoPoints(prev => prev + 50);
        setLootActive(false);
        setTelemetryEvent("AR Pod Collected! +50 EP");
      }

    }, 30); 
  };

  return (
    <div className="relative w-full h-screen bg-slate-900 font-sans text-white overflow-hidden">
      
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <Map
          mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID}
          defaultCenter={WAYPOINTS[2]} // Centers perfectly on VIP Road
          defaultZoom={18} 
          defaultTilt={65} 
          defaultHeading={315} // Rotates the camera to look down the road nicely
          disableDefaultUI={true}
          gestureHandling="greedy"
        >
          <WebGLOverlay 
            carPosition={carPos} 
            carHeading={carHeading}
            efficiency={efficiency}
            lootActive={lootActive}
            lootCoords={LOOT_COORDS}
          />
        </Map>
      </APIProvider>

      {/* GAMIFIED UI OVERLAY */}
      <div className="absolute top-6 left-6 z-10 w-96 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700 p-6 rounded-3xl shadow-2xl pointer-events-auto transition-all">
          <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
            <h2 className="font-black text-xl tracking-tight flex items-center gap-2">
              <Navigation className="text-indigo-400"/> Drive Mode
            </h2>
            <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-inner">
              <ShieldCheck size={16}/> {ecoPoints.toLocaleString()} EP
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase mb-2">
                <span>Route Mastery (TRON Trail)</span>
                <span className={efficiency > 70 ? 'text-emerald-400' : (efficiency > 40 ? 'text-amber-400' : 'text-red-400')}>
                  {efficiency.toFixed(0)}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div 
                  className={`h-full transition-all duration-300 ${efficiency > 70 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]' : (efficiency > 40 ? 'bg-amber-500' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]')}`}
                  style={{ width: `${Math.max(0, efficiency)}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                <Activity size={12}/> Live Telemetry
              </p>
              <p className={`text-sm font-medium ${efficiency < 50 ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
                {telemetryEvent}
              </p>
            </div>

            {!isDriving ? (
              <button 
                onClick={startSimulation}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl shadow-lg shadow-indigo-500/30 flex justify-center items-center gap-2 transition"
              >
                START ENGINE
              </button>
            ) : (
              <div className="w-full py-4 bg-slate-800 text-slate-400 font-black rounded-xl flex justify-center items-center gap-2 border border-slate-700">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div> EN ROUTE
              </div>
            )}
            
          </div>
        </div>
      </div>
      
    </div>
  );
}