import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, ZoomControl } from 'react-leaflet';
import axios from 'axios';
import { Home, BatteryCharging, Video, Shield, PlusCircle, CheckCircle2, DollarSign } from 'lucide-react';
import L from 'leaflet';

const spotIcon = L.divIcon({
  className: 'custom-icon',
  html: `<div class="w-6 h-6 rounded-full border-[3px] border-white shadow-xl flex items-center justify-center bg-indigo-600"><div class="w-2 h-2 bg-white rounded-full"></div></div>`,
  iconSize: [24, 24], iconAnchor: [12, 12]
});

// Component to handle map clicks for setting the driveway location
function LocationPicker({ setDraftLocation }) {
  useMapEvents({
    click: (e) => setDraftLocation([e.latlng.lat, e.latlng.lng]),
  });
  return null;
}

export default function ProviderDashboard() {
  const [mySpots, setMySpots] = useState([]);
  const [isListing, setIsListing] = useState(false);
  const [draftLocation, setDraftLocation] = useState(null);
  
  // Form State
  const [spotName, setSpotName] = useState('');
  const [price, setPrice] = useState(15);
  const [features, setFeatures] = useState({ hasCCTV: false, hasEVCharging: false, isCovered: false });

  // Fetch existing spots on load
  useEffect(() => {
    fetchSpots();
  }, []);

  const fetchSpots = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/web/spots');
      setMySpots(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleListSpot = async () => {
    if (!draftLocation || !spotName) return alert("Please set a location and name.");
    
    try {
      await axios.post('http://localhost:5000/api/web/spots', {
        name: spotName,
        lat: draftLocation[0],
        lng: draftLocation[1],
        price: price,
        features: features
      });
      
      setIsListing(false);
      setDraftLocation(null);
      fetchSpots(); // Refresh the list
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full bg-slate-50">
      
      {/* LEFT PANEL: Spot Management */}
      <div className="w-full md:w-1/3 bg-white border-r border-slate-200 flex flex-col z-10 shadow-xl">
        <div className="p-6 border-b border-slate-100 bg-slate-900 text-white">
          <h2 className="font-bold text-2xl flex items-center gap-2"><Home /> Hosting Dashboard</h2>
          <p className="text-slate-400 text-sm mt-1">Turn your empty driveway into earnings.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Active Listings */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">My Listed Spots</h3>
            {mySpots.length === 0 ? (
              <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 text-sm">
                No spots listed yet.
              </div>
            ) : (
              <div className="space-y-4">
                {mySpots.map((spot, i) => (
                  <div key={i} className="p-4 border border-slate-100 rounded-2xl hover:shadow-md transition bg-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> LIVE
                    </div>
                    <h4 className="font-bold text-slate-800">{spot.name}</h4>
                    <p className="text-xl font-black text-indigo-600 my-1">₹{spot.pricePerHour}<span className="text-xs text-slate-400 font-medium">/hr</span></p>
                    <div className="flex gap-2 mt-3 text-slate-400">
                      {spot.features.hasCCTV && <Video size={14} />}
                      {spot.features.hasEVCharging && <BatteryCharging size={14} />}
                      {spot.features.isCovered && <Shield size={14} />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!isListing ? (
            <button 
              onClick={() => setIsListing(true)}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg"
            >
              <PlusCircle size={20} /> Add New Space
            </button>
          ) : (
            <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl space-y-4 animate-in fade-in">
              <h4 className="font-bold text-indigo-900">List a new space</h4>
              <p className="text-xs text-indigo-600 mb-4">1. Click on the map to set the exact location of your driveway.</p>
              
              <input 
                type="text" placeholder="Location Name (e.g. Sector 29 Driveway)" 
                className="w-full p-3 rounded-xl border-none shadow-sm text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => setSpotName(e.target.value)}
              />
              
              <div className="flex items-center bg-white p-2 rounded-xl shadow-sm">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><DollarSign size={16}/></div>
                <input 
                  type="number" placeholder="Price per hour" value={price}
                  className="w-full p-2 border-none outline-none text-sm bg-transparent"
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input type="checkbox" onChange={(e) => setFeatures({...features, hasCCTV: e.target.checked})} className="rounded text-indigo-600" />
                  <Video size={16} className="text-slate-400"/> CCTV Monitored
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input type="checkbox" onChange={(e) => setFeatures({...features, hasEVCharging: e.target.checked})} className="rounded text-indigo-600" />
                  <BatteryCharging size={16} className="text-slate-400"/> EV Charger Available
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button onClick={() => setIsListing(false)} className="flex-1 py-3 text-slate-500 font-bold text-sm">Cancel</button>
                <button onClick={handleListSpot} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2">
                  <CheckCircle2 size={16}/> Publish
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: The Map */}
      <div className="flex-1 relative">
        <MapContainer center={[23.2599, 77.4126]} zoom={14} zoomControl={false} className="w-full h-full z-0" style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OSM" />
          <ZoomControl position="bottomright" />
          
          {isListing && <LocationPicker setDraftLocation={setDraftLocation} />}
          
          {/* Render existing spots */}
          {mySpots.map((spot, i) => (
            <Marker key={i} position={[spot.location.lat, spot.location.lng]} icon={spotIcon}>
              <Popup><b>{spot.name}</b><br/>₹{spot.pricePerHour}/hr</Popup>
            </Marker>
          ))}

          {/* Render the draft pin when user clicks the map */}
          {draftLocation && (
            <Marker position={draftLocation} icon={spotIcon}>
              <Popup>New Spot Location</Popup>
            </Marker>
          )}
        </MapContainer>
        
        {isListing && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] bg-indigo-600 text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm pointer-events-none animate-pulse">
            Click anywhere on the map to drop a pin
          </div>
        )}
      </div>
    </div>
  );
}