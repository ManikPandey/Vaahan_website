import React from 'react';
import { ArrowRight, Leaf, MapPin, Zap, ShieldCheck, Car, Cpu, Globe } from 'lucide-react';

export default function LandingPage({ onGetStarted }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-widest text-white">VAAHAN</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#impact" className="hover:text-white transition">Impact</a>
            <a href="#technology" className="hover:text-white transition">Technology</a>
          </div>
          <button 
            onClick={onGetStarted}
            className="px-6 py-2.5 bg-white text-slate-900 font-bold rounded-full hover:bg-indigo-50 transition shadow-[0_0_15px_rgba(255,255,255,0.3)]"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 mb-8 text-xs font-bold text-indigo-300 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Live in Bhopal
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight">
            Smart Urban Mobility, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">Powered by AI.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Vahan connects drivers and riders to optimal parking hubs using machine learning. Reduce traffic, cut carbon emissions, and earn rewards for every eco-friendly mile.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-900/50"
            >
              Enter the App <ArrowRight size={18} />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-full flex items-center justify-center transition border border-slate-700 hover:border-slate-600">
              Read the Whitepaper
            </button>
          </div>
        </div>
      </section>

      {/* --- CORE FEATURES --- */}
      <section id="features" className="py-24 bg-slate-900/50 relative border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">The Complete Ecosystem</h2>
            <p className="text-slate-400">Everything you need to rethink your daily commute.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-indigo-500/30 transition group">
              <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <MapPin className="text-indigo-400 w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Park & Pool</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Our ML engine mathematically calculates the perfect parking hub between a driver and rider, ensuring zero detours and maximum efficiency.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-emerald-500/30 transition group">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Leaf className="text-emerald-400 w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Eco-Vault Rewards</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Earn Eco-Points for carpooling. Level up your RPG-style skill tree to unlock real-world discounts on parking, EV charging, and coffee.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-amber-500/30 transition group">
              <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Car className="text-amber-400 w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Host a Spot</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Turn your empty driveway into passive income. List your spot on the Vahan network and let our routing engine guide commuters to you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- IMPACT / STATS --- */}
      <section id="impact" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[3rem] p-10 md:p-16 border border-indigo-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <Globe size={300} />
            </div>
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">Real Impact. <br/><span className="text-indigo-400">Real Time.</span></h2>
                <p className="text-indigo-100/70 mb-8 max-w-md">
                  Vahan isn't just a routing app; it's a decentralized infrastructure platform designed to reclaim our cities from traffic congestion.
                </p>
                <button 
                  onClick={onGetStarted}
                  className="px-6 py-3 bg-white text-indigo-900 font-bold rounded-full hover:bg-indigo-50 transition flex items-center gap-2"
                >
                  Join the Network <Zap size={16} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-950/40 backdrop-blur-md p-6 rounded-3xl border border-white/5">
                  <div className="text-4xl font-black text-white mb-1">12.5k</div>
                  <div className="text-xs text-indigo-300 uppercase tracking-widest font-bold">Kg CO₂ Saved</div>
                </div>
                <div className="bg-slate-950/40 backdrop-blur-md p-6 rounded-3xl border border-white/5">
                  <div className="text-4xl font-black text-white mb-1">4.2k</div>
                  <div className="text-xs text-indigo-300 uppercase tracking-widest font-bold">Active Hubs</div>
                </div>
                <div className="bg-slate-950/40 backdrop-blur-md p-6 rounded-3xl border border-white/5">
                  <div className="text-4xl font-black text-emerald-400 mb-1">84%</div>
                  <div className="text-xs text-indigo-300 uppercase tracking-widest font-bold">Traffic Reduction</div>
                </div>
                <div className="bg-slate-950/40 backdrop-blur-md p-6 rounded-3xl border border-white/5">
                  <div className="text-4xl font-black text-white mb-1">2M+</div>
                  <div className="text-xs text-indigo-300 uppercase tracking-widest font-bold">Eco-Points Minted</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-white/5 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-indigo-500 w-5 h-5" />
            <span className="font-bold tracking-widest text-slate-300">VAAHAN</span>
          </div>
          <p className="text-slate-600 text-sm">© 2026 Vahan Technologies. Engineered for a sustainable future.</p>
        </div>
      </footer>

    </div>
  );
}