import React, { useState } from 'react';
import axios from 'axios';
import { User as UserIcon, Car, Shield, Mail, Award, Save, Activity, CheckCircle2 } from 'lucide-react';

export default function ProfilePage({ user }) {
  // Initialize form with existing vehicle data if they have it
  const [vehicle, setVehicle] = useState({
    make: user?.vehicle?.make || '',
    model: user?.vehicle?.model || '',
    plateNumber: user?.vehicle?.plateNumber || '',
    seatsAvailable: user?.vehicle?.seatsAvailable || 3
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleUpdateVehicle = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');

    try {
      const res = await axios.put(`http://localhost:5000/api/web/users/${user._id}`, {
        vehicle: vehicle
      });

      // Update LocalStorage so the app remembers the new data on refresh
      localStorage.setItem('vahan_user', JSON.stringify(res.data.user));
      
      setSuccessMsg('Vehicle details updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000); // Hide message after 3 seconds
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
          <UserIcon size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Profile</h1>
          <p className="text-slate-500 font-medium">Manage your personal data and vehicle registry.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Identity Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-indigo-500 to-purple-600"></div>
            
            <div className="relative z-10">
              <div className="w-24 h-24 mx-auto bg-white rounded-full p-1 shadow-lg mt-8 mb-4">
                <div className="w-full h-full bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-3xl font-black text-slate-900">
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
              <div className="flex items-center justify-center gap-2 text-slate-500 text-sm mt-1 mb-6">
                <Mail size={14} /> {user?.email}
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase mb-1 flex items-center justify-center gap-1"><Shield size={12}/> Trust</p>
                  <p className="text-lg font-black text-slate-800">{user?.trustScore?.toFixed(1) || '5.0'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase mb-1 flex items-center justify-center gap-1"><Award size={12}/> Level</p>
                  <p className="text-lg font-black text-indigo-600">{Math.floor((user?.ecoPoints || 0) / 1000) + 1}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Vehicle Registry Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <Car size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">Vehicle Registry</h3>
                <p className="text-sm text-slate-500">Required if you plan to offer carpool rides from parking hubs.</p>
              </div>
            </div>

            {successMsg && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-2 text-sm font-bold animate-in fade-in">
                <CheckCircle2 size={18} /> {successMsg}
              </div>
            )}

            <form onSubmit={handleUpdateVehicle} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Make (Brand)</label>
                  <input 
                    type="text" required placeholder="e.g. Hyundai, Toyota"
                    value={vehicle.make} onChange={(e) => setVehicle({...vehicle, make: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Model</label>
                  <input 
                    type="text" required placeholder="e.g. Creta, Innova"
                    value={vehicle.model} onChange={(e) => setVehicle({...vehicle, model: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">License Plate Number</label>
                  <input 
                    type="text" required placeholder="e.g. MP-04-AB-1234"
                    value={vehicle.plateNumber} onChange={(e) => setVehicle({...vehicle, plateNumber: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none transition font-mono uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Available Passenger Seats</label>
                  <select 
                    value={vehicle.seatsAvailable} onChange={(e) => setVehicle({...vehicle, seatsAvailable: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none transition appearance-none"
                  >
                    <option value={1}>1 Seat</option>
                    <option value={2}>2 Seats</option>
                    <option value={3}>3 Seats</option>
                    <option value={4}>4 Seats</option>
                    <option value={5}>5+ Seats</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  type="submit" disabled={loading}
                  className="py-3 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-2 transition shadow-lg shadow-indigo-200 disabled:opacity-50"
                >
                  {loading ? <Activity className="animate-spin" size={18} /> : <Save size={18} />}
                  Save Vehicle Data
                </button>
              </div>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
}