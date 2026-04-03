import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, ZoomControl, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import { 
  Activity, Zap, Clock, ShieldAlert, Cpu, AlertCircle, 
  CheckCircle2, Navigation, Car, User as UserIcon, 
  MousePointer2, ToggleLeft, ToggleRight 
} from 'lucide-react';
import L from 'leaflet';
import DigitalTicket from '../components/DigitalTicket';

// --- CUSTOM LEAFLET ICONS ---
const createCustomIcon = (color, innerHtml = '') => L.divIcon({
  className: 'custom-icon',
  html: `<div class="w-8 h-8 rounded-full border-[3px] border-white shadow-xl flex items-center justify-center text-white" style="background-color: ${color};">${innerHtml}</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// Icons for Demo Mode
const driverIcon = createCustomIcon('#ef4444', '<Car size="14"/>'); // Red
const riderIcon = createCustomIcon('#3b82f6', '<UserIcon size="14"/>'); // Blue

// Icons for Real Mode
const myIcon = createCustomIcon('#4f46e5', '<div class="w-3 h-3 bg-white rounded-full"></div>'); // Indigo
const partnerIcon = createCustomIcon('#64748b', '<div class="w-2 h-2 bg-white rounded-full"></div>'); // Slate

// Shared Hub Icon
const hubIcon = createCustomIcon('#10b981', '<b class="text-sm">P</b>'); // Emerald

// --- MAP CLICK HANDLER (Handles both modes cleanly) ---
function MapClickHandler({ isDemoMode, selectionMode, setDriverLoc, setRiderLoc, setMyLocation }) {
  useMapEvents({
    click: (e) => {
      if (isDemoMode) {
        if (selectionMode === 'driver') setDriverLoc([e.latlng.lat, e.latlng.lng]);
        if (selectionMode === 'rider') setRiderLoc([e.latlng.lat, e.latlng.lng]);
      } else {
        setMyLocation([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
}

export default function SmartMatchDashboard({ user }) {
  // Master Mode Toggle
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Common UI/ML State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hubData, setHubData] = useState(null);
  const [intelligence, setIntelligence] = useState(null);
  const [driverRoute, setDriverRoute] = useState([]);
  const [riderRoute, setRiderRoute] = useState([]);
  const [tripId, setTripId] = useState(null);
  const [showTicket, setShowTicket] = useState(false);

  // REAL MODE State
  const [userRole, setUserRole] = useState('rider'); // 'rider' or 'driver'
  const [myLocation, setMyLocation] = useState([23.2350, 77.4260]);
  const [partnerLocation, setPartnerLocation] = useState(null);

  // DEMO MODE State
  const [selectionMode, setSelectionMode] = useState('driver');
  const [driverLoc, setDriverLoc] = useState([23.2450, 77.4160]);
  const [riderLoc, setRiderLoc] = useState([23.2200, 77.4340]);

  // Reset map when switching modes
  const handleModeSwitch = () => {
    setIsDemoMode(!isDemoMode);
    setHubData(null);
    setIntelligence(null);
    setDriverRoute([]);
    setRiderRoute([]);
    setTripId(null);
    setPartnerLocation(null);
  };

  const runSimulation = async () => {
    setLoading(true);
    setError(null);
    setHubData(null);
    setDriverRoute([]);
    setRiderRoute([]);
    setTripId(null);
    setShowTicket(false);

    try {
      let finalDriverLoc, finalRiderLoc, dId, rId;

      // 1. Determine Coordinates based on Mode
      if (isDemoMode) {
        finalDriverLoc = driverLoc;
        finalRiderLoc = riderLoc;
        dId = user?._id; // Give points to the logged-in user presenting the demo
        rId = undefined;
      } else {
        // Simulate finding a partner nearby
        const latOffset = (Math.random() - 0.5) * 0.02;
        const lngOffset = (Math.random() - 0.5) * 0.02;
        const generatedPartner = [myLocation[0] + latOffset, myLocation[1] + lngOffset];
        setPartnerLocation(generatedPartner);

        if (userRole === 'driver') {
          finalDriverLoc = myLocation;
          finalRiderLoc = generatedPartner;
          dId = user?._id;
          rId = undefined;
        } else {
          finalDriverLoc = generatedPartner;
          finalRiderLoc = myLocation;
          dId = undefined;
          rId = user?._id;
        }
      }

      // 2. Build Payload
      const payload = {
        driver: { lat: finalDriverLoc[0], lng: finalDriverLoc[1] },
        rider: { lat: finalRiderLoc[0], lng: finalRiderLoc[1] },
        driverId: dId,
        riderId: rId,
        environment: { is_raining: 0 }
      };

      // 3. Call Node.js Backend (MongoDB saving + Points)
      const routeResponse = await axios.post('http://localhost:5000/api/web/request-match', payload);
      
      const optimal_hub = routeResponse.data.ml_data.optimal_hub;
      const mlMetrics = routeResponse.data.ml_data.intelligence;
      const newTripId = routeResponse.data.trip_id;
      
      setHubData(optimal_hub);
      setIntelligence(mlMetrics);
      setTripId(newTripId);

      // 4. Call FastAPI Backend (Geometry)
      const polylinePayload = {
        driver_lat: finalDriverLoc[0],
        driver_lng: finalDriverLoc[1],
        rider_lat: finalRiderLoc[0],
        rider_lng: finalRiderLoc[1],
        hub_node_id: optimal_hub.node_id
      };

      const polylineResponse = await axios.post('http://127.0.0.1:8000/api/v1/get-polylines', polylinePayload);
      
      setDriverRoute(polylineResponse.data.geometry.driver_route);
      setRiderRoute(polylineResponse.data.geometry.rider_route);
      
    } catch (err) {
      console.error(err);
      setError("Failed to connect to ML routing engine.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden font-sans">
      
      {/* --- BACKGROUND MAP --- */}
      <MapContainer 
        center={[23.2350, 77.4260]} 
        zoom={13} 
        zoomControl={false}
        className="w-full h-full z-0"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OSM' />
        <ZoomControl position="bottomright" />
        
        <MapClickHandler 
          isDemoMode={isDemoMode}
          selectionMode={selectionMode}
          setDriverLoc={setDriverLoc}
          setRiderLoc={setRiderLoc}
          setMyLocation={setMyLocation}
        />

        {/* --- MARKERS --- */}
        {isDemoMode ? (
          <>
            <Marker position={driverLoc} icon={driverIcon}><Popup><b>Driver Start</b></Popup></Marker>
            <Marker position={riderLoc} icon={riderIcon}><Popup><b>Rider Start</b></Popup></Marker>
          </>
        ) : (
          <>
            <Marker position={myLocation} icon={myIcon}><Popup><b>You</b> ({userRole})</Popup></Marker>
            {partnerLocation && <Marker position={partnerLocation} icon={partnerIcon}><Popup><b>Matched Partner</b></Popup></Marker>}
          </>
        )}
        
        {hubData && <Marker position={[hubData.lat, hubData.lng]} icon={hubIcon}><Popup>Optimal Hub (Point C)</Popup></Marker>}
        
        {/* --- ROUTES --- */}
        {driverRoute.length > 0 && <Polyline positions={driverRoute} color={isDemoMode ? '#ef4444' : (userRole === 'driver' ? '#4f46e5' : '#64748b')} weight={5} opacity={0.8} />}
        {riderRoute.length > 0 && <Polyline positions={riderRoute} color={isDemoMode ? '#3b82f6' : (userRole === 'rider' ? '#4f46e5' : '#64748b')} weight={5} opacity={0.8} />}
      </MapContainer>

      {/* --- UI OVERLAY --- */}
      <div className="absolute top-6 left-6 z-[1000] w-[400px] flex flex-col gap-4 pointer-events-none">
        
        {/* Interaction Panel */}
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl shadow-2xl pointer-events-auto">
          
          {/* Header & Toggle Switch */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl text-white ${isDemoMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                <Cpu size={20} />
              </div>
              <h2 className="font-bold text-white tracking-tight">Vahan ML Engine</h2>
            </div>
            
            <button 
              onClick={handleModeSwitch}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${isDemoMode ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}
              title="Toggle between Developer Demo and Real User UX"
            >
              {isDemoMode ? <ToggleRight size={16}/> : <ToggleLeft size={16}/>}
              {isDemoMode ? 'DEMO MODE' : 'REAL MODE'}
            </button>
          </div>

          {/* Dynamic Controls Based on Mode */}
          {isDemoMode ? (
            <div className="mb-6 animate-in fade-in">
              <p className="text-xs text-slate-400 mb-3">Manually place both users to test routing algorithms.</p>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setSelectionMode('driver')}
                  className={`py-3 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${selectionMode === 'driver' ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}
                >
                  <MousePointer2 size={14}/> Set Driver
                </button>
                <button 
                  onClick={() => setSelectionMode('rider')}
                  className={`py-3 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${selectionMode === 'rider' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}
                >
                  <MousePointer2 size={14}/> Set Rider
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-6 animate-in fade-in">
              <p className="text-xs text-slate-400 mb-3"><Navigation size={12} className="inline mr-1"/> Set your role, then click map for location.</p>
              <div className="bg-slate-800/50 p-1 rounded-xl flex border border-slate-700">
                <button 
                  onClick={() => { setUserRole('rider'); setPartnerLocation(null); setTripId(null); }}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex justify-center items-center gap-2 ${userRole === 'rider' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  <UserIcon size={16}/> I need a ride
                </button>
                <button 
                  onClick={() => { setUserRole('driver'); setPartnerLocation(null); setTripId(null); }}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex justify-center items-center gap-2 ${userRole === 'driver' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  <Car size={16}/> I am driving
                </button>
              </div>
            </div>
          )}

          {/* Action Button */}
          {tripId ? (
            <button 
              onClick={() => setShowTicket(true)}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-900/40 transition-all flex items-center justify-center gap-3"
            >
              <CheckCircle2 size={20} /> VIEW DIGITAL TICKET
            </button>
          ) : (
            <button 
              onClick={runSimulation}
              disabled={loading}
              className={`w-full py-4 text-white font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 disabled:bg-slate-800 disabled:text-slate-500 ${isDemoMode ? 'bg-yellow-600 hover:bg-yellow-500 shadow-yellow-900/30' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/40'}`}
            >
              {loading ? <Activity className="animate-spin" /> : <Zap size={20} />}
              {loading ? "PROCESSING..." : (isDemoMode ? "RUN ALGORITHM TEST" : "FIND MATCH")}
            </button>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400 text-xs">
              <AlertCircle size={14} /> {error}
            </div>
          )}
        </div>

        {/* Telemetry Panel */}
        {intelligence && (
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl shadow-2xl pointer-events-auto transition-all duration-500">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDemoMode ? 'bg-yellow-500' : 'bg-indigo-500'}`}></div> 
              {isDemoMode ? 'Algorithm Metrics' : 'Trip Telemetry'}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><ShieldAlert size={10}/> Traffic Risk</p>
                <div className={`text-2xl font-black ${intelligence.ai_traffic_risk > 70 ? 'text-red-400' : 'text-emerald-400'}`}>{intelligence.ai_traffic_risk}%</div>
              </div>
              <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Eco-Yield</p>
                <div className="text-2xl font-black text-indigo-400">+{intelligence.dynamic_incentive?.eco_points_offered || 0} <span className="text-[10px] uppercase opacity-60">Pts</span></div>
              </div>
              <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><Clock size={10} /> {isDemoMode ? 'Driver ETA' : 'Your ETA'}</p>
                <div className="text-xl font-black text-white">{isDemoMode ? intelligence.eta_prediction?.driver_arrival_mins : (userRole === 'driver' ? intelligence.eta_prediction?.driver_arrival_mins : intelligence.eta_prediction?.rider_arrival_mins)}m</div>
              </div>
              <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><Clock size={10} /> {isDemoMode ? 'Rider ETA' : 'Partner ETA'}</p>
                <div className="text-xl font-black text-white">{isDemoMode ? intelligence.eta_prediction?.rider_arrival_mins : (userRole === 'driver' ? intelligence.eta_prediction?.rider_arrival_mins : intelligence.eta_prediction?.driver_arrival_mins)}m</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showTicket && (
        <DigitalTicket 
          tripId={tripId} 
          mlData={{ optimal_hub: hubData, intelligence: intelligence }} 
          onClose={() => setShowTicket(false)} 
        />
      )}
    </div>
  );
}