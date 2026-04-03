import React from 'react';
import { Car, Leaf, MapPin, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function DashboardPage({ user, onNavigate }) {
  
  // SAFE FALLBACK: If user name is missing, use "User"
  const firstName = (user?.name || 'User').split(' ')[0];

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Bhopal is currently experiencing moderate traffic.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl border border-emerald-100 shadow-sm">
          <ShieldCheck size={20} className="text-emerald-500" />
          <span className="font-bold text-sm">Level {Math.floor((user?.ecoPoints || 0) / 1000) + 1} Guardian</span>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Action 1: Demand Side */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-900/20 group cursor-pointer" onClick={() => onNavigate('parking')}>
          <div className="relative z-10">
            <div className="bg-indigo-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <MapPin className="text-indigo-300" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Park & Pool</h2>
            <p className="text-indigo-200 text-sm mb-6 max-w-[80%]">
              Find an optimal parking hub and match with a co-rider instantly.
            </p>
            <button className="flex items-center gap-2 text-sm font-bold bg-white text-indigo-900 px-5 py-2.5 rounded-full group-hover:bg-indigo-50 transition">
              Find Route <ArrowRight size={16} />
            </button>
          </div>
          <Car size={180} className="absolute -right-10 -bottom-10 text-white opacity-5 group-hover:scale-110 transition-transform duration-500" />
        </div>

        {/* Action 2: Supply Side */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 relative overflow-hidden shadow-sm hover:shadow-md transition group cursor-pointer" onClick={() => onNavigate('hosting')}>
          <div className="relative z-10">
            <div className="bg-emerald-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <Zap className="text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Host a Spot</h2>
            <p className="text-slate-500 text-sm mb-6 max-w-[80%]">
              List your empty driveway on the Vahan network and earn passive income.
            </p>
            <button className="flex items-center gap-2 text-sm font-bold bg-slate-900 text-white px-5 py-2.5 rounded-full group-hover:bg-slate-800 transition">
              Start Earning <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Eco-Points</p>
          <p className="text-3xl font-black text-indigo-600">{user?.ecoPoints?.toLocaleString() || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">CO2 Saved</p>
          <p className="text-3xl font-black text-emerald-500 flex items-baseline gap-1">
            {user?.carbonSavedKg?.toFixed(1) || 0} <span className="text-sm font-medium text-slate-400">kg</span>
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Trips Taken</p>
          <p className="text-3xl font-black text-slate-800">12</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Trust Score</p>
          <p className="text-3xl font-black text-slate-800">4.9<span className="text-lg text-slate-400">/5</span></p>
        </div>
      </div>

    </div>
  );
}