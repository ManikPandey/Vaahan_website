import React, { useState } from 'react';
import { Search, MapPin, Car, Leaf, ArrowRight, ShieldCheck, Navigation } from 'lucide-react';

export default function SmartParkingPage() {
  const [step, setStep] = useState(1); // 1: Input, 2: Route Options, 3: Active Trip
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex flex-col md:flex-row h-full">
      
      {/* LEFT PANEL: The Interactive Map */}
      <div className="w-full md:w-2/3 bg-slate-200 relative h-64 md:h-auto min-h-[300px]">
        {/* Placeholder for Google Maps API */}
        <div className="absolute inset-0 flex items-center justify-center bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/Mapbox_Streets.png')] bg-cover opacity-50">
          <p className="bg-white/80 px-4 py-2 rounded-lg font-bold text-slate-600 shadow-sm backdrop-blur-sm">
            Interactive Map View
          </p>
        </div>

        {/* Dynamic Map Overlays based on Step */}
        {step >= 2 && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-bounce">
             <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg mb-1 whitespace-nowrap">
                Optimal Point C
             </div>
             <MapPin className="text-indigo-600 w-10 h-10 drop-shadow-2xl fill-white" />
          </div>
        )}
      </div>

      {/* RIGHT PANEL: The Action Logic */}
      <div className="w-full md:w-1/3 bg-white border-l border-slate-100 flex flex-col shadow-2xl z-10">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Plan Your Route</h2>
          <p className="text-slate-400 text-sm">Park at the perimeter. Pool to the center.</p>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          
          {/* STEP 1: DESTINATION INPUT */}
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="relative">
                <Search className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Where is your office? (Point B)" 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent</p>
                <button className="flex items-center gap-3 w-full p-3 hover:bg-slate-50 rounded-lg transition text-left">
                  <div className="bg-slate-100 p-2 rounded-full"><Navigation size={16} /></div>
                  <div>
                    <p className="font-bold text-slate-700">Cyber City, DLF Phase 2</p>
                    <p className="text-xs text-slate-400">12km • High Congestion</p>
                  </div>
                </button>
              </div>

              <button 
                onClick={() => setStep(2)}
                disabled={!searchQuery}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
              >
                Find Smart Route <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* STEP 2: ROUTE SELECTION (The "Magic Moment") */}
          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              
              {/* The Recommendation Card */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-2xl border border-indigo-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                  RECOMMENDED
                </div>
                
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <div className="w-3 h-3 bg-slate-800 rounded-full"></div>
                    <div className="h-8 border-l-2 border-dashed border-slate-300"></div>
                    <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                    <div className="h-8 border-l-2 border-dashed border-slate-300"></div>
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-xs text-slate-500">Start (Home)</p>
                      <p className="font-bold text-slate-800">Drive 15 mins</p>
                    </div>
                    <div>
                      <p className="text-xs text-indigo-600 font-bold">🅿️ Park at Sector 29 (Point C)</p>
                      <p className="text-xs text-slate-500">Save ₹120 vs. Direct Parking</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Destination (Office)</p>
                      <p className="font-bold text-slate-800">Pool 10 mins</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white/60 p-2 rounded-lg backdrop-blur-sm">
                   <Leaf className="text-emerald-500 w-4 h-4" />
                   <span className="text-xs font-bold text-emerald-700">Saves 2.4kg CO2 • +50 EcoPoints</span>
                </div>
              </div>

              {/* Driver Match */}
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                  <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Driver" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800">Ride with Rahul</h4>
                  <p className="text-xs text-slate-500">Toyota Innova • 4.9⭐</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-indigo-600">₹45</p>
                  <p className="text-[10px] text-slate-400">per seat</p>
                </div>
              </div>

              <button 
                onClick={() => setStep(3)}
                className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:scale-[1.02] transition-transform shadow-xl"
              >
                Confirm Booking (₹165 Total)
              </button>
            </div>
          )}

          {/* STEP 3: LIVE TRIP */}
          {step === 3 && (
            <div className="text-center space-y-6 animate-in zoom-in duration-300 pt-8">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <ShieldCheck className="w-12 h-12 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Booking Confirmed!</h2>
                <p className="text-slate-500 mt-2">Navigate to Point C. Your spot is reserved.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-400 uppercase">Parking ID</p>
                  <p className="text-xl font-mono font-bold text-slate-800">A-24</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-400 uppercase">OTP for Ride</p>
                  <p className="text-xl font-mono font-bold text-slate-800">8829</p>
                </div>
              </div>

              <button 
                onClick={() => setStep(1)} 
                className="text-indigo-600 font-bold text-sm hover:underline"
              >
                Cancel Booking
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}