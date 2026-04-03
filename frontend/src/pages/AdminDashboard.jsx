import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, Users, MapPin, Activity, ShieldCheck, Globe, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/web/admin/stats');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-10 text-slate-400 animate-pulse">Accessing Vahan Mainframe...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-700">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-indigo-600" size={32}/> Command Center
          </h1>
          <p className="text-slate-500 font-medium">Real-time monitoring of the Bhopal mobility grid.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> SYSTEM STABLE
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Active Nodes", val: stats.spots, icon: MapPin, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Total Commuters", val: stats.users, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Carbon Mitigated", val: `${stats.impact.totalCarbon.toFixed(1)}kg`, icon: Globe, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Ecosystem Liquidity", val: `₹${stats.impact.totalPlatformCapital.toLocaleString()}`, icon: DollarSign, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className={`w-10 h-10 ${kpi.bg} ${kpi.color} rounded-xl flex items-center justify-center mb-4`}>
              <kpi.icon size={20} />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
            <p className="text-3xl font-black text-slate-900">{kpi.val}</p>
          </div>
        ))}
      </div>

      {/* ECO-SYSTEM SIMULATOR */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="text-indigo-400" /> Scale Simulation
          </h2>
          <p className="text-slate-400 text-sm mb-8">
            Adjust the sliders below to visualize how Vahan's environmental impact scales as we onboard more users and optimize our ML routing engine.
          </p>
        </div>
      </div>
    </div>
  );
}