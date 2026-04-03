import React from 'react';
import QRCode from 'react-qr-code';
import { MapPin, Car, Leaf, CheckCircle2, ShieldCheck, X } from 'lucide-react';

export default function DigitalTicket({ tripId, mlData, onClose }) {
  // Failsafe: If no data is passed, don't try to render
  if (!mlData || !mlData.optimal_hub) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      
      {/* Ticket Container */}
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 p-2 rounded-full transition z-10"
        >
          <X size={20} />
        </button>

        {/* TOP SECTION: Parking Details */}
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 text-white relative">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Parking Hub</p>
              {/* Added safe .toString() fallback */}
              <h2 className="text-2xl font-black">Node #{mlData.optimal_hub.node_id?.toString().slice(-4) || '0000'}</h2>
            </div>
            <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
              <ShieldCheck className="text-emerald-300 w-8 h-8" />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <MapPin size={16} className="text-indigo-300" />
            <p className="text-sm font-medium">{mlData.optimal_hub.lat?.toFixed(4)}, {mlData.optimal_hub.lng?.toFixed(4)}</p>
          </div>
          
          <p className="text-xs text-indigo-200 bg-black/20 inline-block px-3 py-1 rounded-full border border-white/10 mt-2">
            Show QR at Boom Barrier
          </p>

          <div className="absolute -bottom-4 left-[-16px] w-8 h-8 bg-slate-950/80 rounded-full"></div>
          <div className="absolute -bottom-4 right-[-16px] w-8 h-8 bg-slate-950/80 rounded-full"></div>
        </div>

        {/* MIDDLE SECTION: QR Code */}
        <div className="p-8 border-b border-dashed border-slate-300 bg-white flex flex-col items-center relative">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
            <QRCode value={tripId || "vahan-demo-ticket"} size={140} level="H" fgColor="#0f172a" />
          </div>
          <p className="text-slate-400 font-mono text-xs mt-4 tracking-widest">{tripId || "PENDING-ID"}</p>
        </div>

        {/* BOTTOM SECTION: Ride & Rewards */}
        <div className="bg-slate-50 p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                <Car size={12}/> Match
              </p>
              <p className="font-bold text-slate-800">Toyota Innova</p>
              <p className="text-xs text-slate-500">MP-04-AB-1234</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                <Leaf size={12}/> Reward
              </p>
              <p className="font-bold text-emerald-600">+{mlData.intelligence?.dynamic_incentive?.eco_points_offered || 0} Pts</p>
              <p className="text-xs text-slate-500">Eco-Yield Secured</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition shadow-lg shadow-slate-900/20"
          >
            <CheckCircle2 size={18} /> Done
          </button>
        </div>

      </div>
    </div>
  );
}