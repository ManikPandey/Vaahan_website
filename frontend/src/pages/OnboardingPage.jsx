import React from 'react';
import { ArrowRight, Zap, Shield, Leaf, MapPin } from 'lucide-react';

export default function OnboardingPage({ onComplete }) {
  return (
    <div className="relative h-screen w-full bg-slate-900 overflow-hidden flex items-center justify-center">
      
      {/* 1. Animated Background Gradients (The "Vibrant" Look) */}
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
      </div>

      {/* 2. Glassmorphism Card */}
      <div className="relative z-10 max-w-md w-full mx-4 glass-dark p-8 rounded-3xl border border-slate-700/50">
        
        {/* Logo Section */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <MapPin className="text-white w-8 h-8" />
          </div>
        </div>

        <div className="text-center space-y-4 mb-10">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Vahan
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Stop commuting alone. <br/> Start <span className="text-emerald-400 font-bold">earning</span> while you travel.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-4 mb-10">
          <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><Zap size={20} /></div>
            <div className="text-left">
              <h3 className="font-bold text-white text-sm">Smart Routing</h3>
              <p className="text-xs text-slate-400">Avoid traffic with AI-optimized paths.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400"><Leaf size={20} /></div>
            <div className="text-left">
              <h3 className="font-bold text-white text-sm">Eco-Rewards</h3>
              <p className="text-xs text-slate-400">Get paid to park and pool.</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={onComplete}
          className="group w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-900/20 border border-indigo-400/20"
        >
          Get Started
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="mt-6 text-center text-xs text-slate-500">
          Version 1.0 • Designed for Urban Mobility
        </p>
      </div>
    </div>
  );
}