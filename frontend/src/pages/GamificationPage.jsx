import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Car, Leaf, Zap, Target, Shield, Award, Check, Lock, Bus, Bike, Activity } from 'lucide-react';

// --- CONSTANTS & DATA ---
const LEVELS = [
  { name: "Starter", minPoints: 0, car: "Hatchback", icon: Car },
  { name: "Eco-Rookie", minPoints: 1000, car: "Sedan Hybrid", icon: Car },
  { name: "Green Pro", minPoints: 3000, car: "Electric SUV", icon: Zap },
  { name: "Earth Guardian", minPoints: 6000, car: "Future Pod", icon: Leaf }
];

const SKILL_TREE_DATA = {
  commuter: {
    title: "The Commuter", description: "Efficiency & Routine", color: "text-blue-400", bg: "bg-blue-500",
    skills: [
      { id: "c1", title: "Mile Muncher", cost: 500, desc: "2% Discount on Parking", parent: null },
      { id: "c2", title: "Urban Navigator", cost: 1500, desc: "Early Bird Parking (30m early)", parent: "c1" },
      { id: "c3", title: "Road Master", cost: 4000, desc: "5% off Platform Fees", parent: "c2" },
    ]
  },
  guardian: {
    title: "Green Guardian", description: "CO₂ Impact", color: "text-emerald-400", bg: "bg-emerald-500",
    skills: [
      { id: "g1", title: "Seedling", cost: 500, desc: "Unlock 'Green' Dashboard Skin", parent: null },
      { id: "g2", title: "Carbon Crusader", cost: 1500, desc: "10% Charging Discount", parent: "g1" },
      { id: "g3", title: "Earth Hero", cost: 4000, desc: "Featured on Global Leaderboard", parent: "g2" },
    ]
  },
  strategist: {
    title: "The Strategist", description: "Smart Features", color: "text-purple-400", bg: "bg-purple-500",
    skills: [
      { id: "s1", title: "Precision Parker", cost: 500, desc: "50 Bonus Pts per Park", parent: null },
      { id: "s2", title: "Slot Finder", cost: 1500, desc: "1 Free Premium Upgrade", parent: "s1" },
      { id: "s3", title: "Ghost Driver", cost: 4000, desc: "15% Monthly Cashback", parent: "s2" },
    ]
  }
};

const MISSIONS = [
  { id: 1, title: "The Streak", desc: "Use app 5 days in a row", reward: "2x Multiplier (24h)", claimed: false },
  { id: 2, title: "Zone Explorer", desc: "Park in 3 different zones", reward: "+100 Points", claimed: false },
  { id: 3, title: "Zero Hero", desc: "Save 5kg CO₂ this week", reward: "Green Badge", claimed: false },
];

// --- MAIN COMPONENT ---
export default function GamificationPage({ user: authUser }) {
  // We use authUser for the initial ID, but maintain a local 'user' state for real-time UI updates
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [missions, setMissions] = useState(MISSIONS);
  const [notification, setNotification] = useState(null);

  // 1. Fetch fresh data on load
  useEffect(() => {
    if (!authUser?._id) return;
    
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/web/users/${authUser._id}`);
        setUser({
          ...response.data,
          skills: response.data.skills || [],
          lifetimePoints: response.data.lifetimePoints || response.data.ecoPoints
        });
      } catch (error) {
        console.error("Failed to fetch user data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [authUser]);

  const currentLevel = useMemo(() => {
    if (!user) return LEVELS[0];
    return LEVELS.slice().reverse().find(l => user.lifetimePoints >= l.minPoints) || LEVELS[0];
  }, [user]);

  const nextLevel = useMemo(() => {
    if (!user) return null;
    return LEVELS.find(l => l.minPoints > user.lifetimePoints);
  }, [user]);

  const showNotification = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // 2. Handle API Call to Unlock Skill
  const handleUnlockSkill = async (skill) => {
    if (user.skills.includes(skill.id)) return;
    
    if (skill.parent && !user.skills.includes(skill.parent)) {
      showNotification("Unlock previous skill first!", "error");
      return;
    }

    if (user.ecoPoints >= skill.cost) {
      try {
        const res = await axios.post(`http://localhost:5000/api/web/users/${user._id}/skills/unlock`, {
          skillId: skill.id,
          cost: skill.cost
        });

        // Update local state and local storage so other pages see the new balance
        setUser(res.data.user);
        localStorage.setItem('vahan_user', JSON.stringify(res.data.user));
        
        showNotification(`Unlocked: ${skill.title}!`);
      } catch (error) {
        console.error("Failed to unlock skill", error);
        showNotification("Transaction failed.", "error");
      }
    } else {
      showNotification("Not enough Eco-Points!", "error");
    }
  };

  // 3. Handle API Call to Claim Rewards
  const handleClaimMission = (id) => {
    setMissions(prev => prev.map(m => {
      if (m.id === id && !m.claimed) {
        
        // Fire API to award points
        axios.post(`http://localhost:5000/api/web/users/${user._id}/rewards/claim`, {
          pointsToAward: 100 // Hardcoded for demo
        }).then(res => {
          setUser(res.data.user);
          localStorage.setItem('vahan_user', JSON.stringify(res.data.user));
          showNotification("Reward Claimed! +100 EP");
        }).catch(err => {
          console.error("Failed to claim reward", err);
        });

        return { ...m, claimed: true };
      }
      return m;
    }));
  };

  if (loading || !user) {
    return <div className="flex h-full items-center justify-center text-slate-400"><Activity className="animate-spin mr-2" /> Loading Eco-Vault...</div>;
  }

  const progress = nextLevel 
    ? Math.min(100, ((user.lifetimePoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100)
    : 100;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-8 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-lg border ${notification.type === 'error' ? 'bg-red-500/90 border-red-400 text-white' : 'bg-emerald-500/90 border-emerald-400 text-white'} font-bold animate-in slide-in-from-top-4`}>
          {notification.msg}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Profile & Missions */}
        <div className="xl:col-span-4 space-y-8">
          
          {/* Profile Card */}
          <div className="bg-slate-900 rounded-3xl p-6 relative overflow-hidden shadow-2xl border border-slate-800">
            <div className="absolute top-[-20px] right-[-20px] opacity-5 text-emerald-500">
              <Leaf size={180} />
            </div>
            <div className="relative z-10">
              <h2 className="text-slate-400 text-xs uppercase tracking-widest mb-1 font-bold">Driver Profile</h2>
              <h1 className="text-2xl font-black text-white mb-6">{user.name}</h1>
              
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${currentLevel.minPoints >= 3000 ? 'bg-gradient-to-br from-emerald-400 to-cyan-500' : 'bg-slate-800'}`}>
                  <currentLevel.icon size={32} className="text-white" />
                </div>
                <div>
                  <div className="text-xs text-emerald-400 font-bold tracking-wider mb-1">CURRENT TIER</div>
                  <div className="text-xl font-black text-white tracking-tight">{currentLevel.name}</div>
                  <div className="text-xs text-slate-400">{currentLevel.car}</div>
                </div>
              </div>

              {/* Level Progress */}
              <div className="mb-2 flex justify-between text-xs font-bold text-slate-400">
                <span>{user.lifetimePoints} XP</span>
                <span>{nextLevel ? nextLevel.minPoints : 'MAX'} XP</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden shadow-inner mb-8">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">CO₂ Saved</div>
                  <div className="text-2xl font-mono text-emerald-400 font-bold">{user.carbonSavedKg?.toFixed(1) || 0} <span className="text-xs text-slate-500">kg</span></div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Eco-Points</div>
                  <div className="text-2xl font-mono text-indigo-400 font-bold">{user.ecoPoints?.toLocaleString() || 0} <span className="text-xs text-slate-500">EP</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Mission Board */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <Target className="text-red-500" size={20}/> Active Bounties
            </h3>
            <div className="space-y-3">
              {missions.map(m => (
                <div key={m.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center group">
                  <div>
                    <div className="text-sm font-bold text-slate-800">{m.title}</div>
                    <div className="text-xs text-slate-500 mt-1">{m.desc}</div>
                    <div className="text-xs text-amber-600 mt-2 font-bold bg-amber-100 inline-block px-2 py-1 rounded-md">{m.reward}</div>
                  </div>
                  <button 
                    disabled={m.claimed}
                    onClick={() => handleClaimMission(m.id)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${m.claimed ? 'bg-emerald-100 border-emerald-500 text-emerald-600' : 'border-slate-300 text-slate-400 hover:border-emerald-500 hover:text-emerald-500 bg-white shadow-sm'}`}
                  >
                    {m.claimed ? <Check size={18} /> : <Award size={18} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Skill Tree */}
        <div className="xl:col-span-8">
          <div className="bg-slate-900 rounded-3xl p-8 h-full shadow-2xl border border-slate-800 relative">
            
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black text-white tracking-tight">VAAHAN SKILL TREE</h3>
              <div className="text-sm font-bold text-slate-300 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 flex items-center gap-2">
                Available EP: <span className="text-emerald-400 text-lg">{user.ecoPoints?.toLocaleString() || 0}</span>
              </div>
            </div>

            {/* Tree Container */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              
              {/* Branch Rendering */}
              {Object.entries(SKILL_TREE_DATA).map(([key, branch]) => (
                <div key={key} className="flex flex-col items-center gap-10">
                  {/* Branch Header */}
                  <div className="text-center bg-slate-800/80 p-4 rounded-2xl border border-slate-700 w-full shadow-lg">
                    <div className={`text-lg font-black ${branch.color} uppercase tracking-widest`}>{branch.title}</div>
                    <div className="text-xs text-slate-400 font-medium mt-1">{branch.description}</div>
                  </div>

                  {/* Nodes */}
                  <div className="flex flex-col gap-10 relative w-full items-center">
                    {/* Connecting Line background */}
                    <div className="absolute top-4 bottom-4 w-1 bg-slate-800 -z-10 rounded-full"></div>

                    {branch.skills.map((skill, index) => {
                      const isUnlocked = user.skills?.includes(skill.id);
                      const isUnlockable = (skill.parent === null || user.skills?.includes(skill.parent)) && !isUnlocked;
                      const canAfford = user.ecoPoints >= skill.cost;
                      
                      return (
                        <button 
                          key={skill.id}
                          onClick={() => handleUnlockSkill(skill)}
                          disabled={isUnlocked}
                          className={`
                            relative w-full max-w-[220px] p-5 rounded-2xl border-2 transition-all duration-300 group
                            ${isUnlocked 
                                ? `bg-slate-800 border-${branch.bg.replace('bg-', '')} shadow-[0_0_20px_rgba(0,0,0,0.4)] opacity-100` 
                                : isUnlockable 
                                    ? 'bg-slate-900 border-slate-600 hover:border-slate-400 opacity-100 shadow-xl' 
                                    : 'bg-slate-900 border-slate-800 opacity-50 cursor-not-allowed'}
                          `}
                        >
                          {/* Connector dot */}
                          {index > 0 && <div className={`absolute -top-10 left-1/2 -translate-x-1/2 w-1 h-10 ${isUnlocked ? branch.bg : 'bg-slate-800'}`}></div>}

                          <div className="flex flex-col items-center text-center">
                            <div className={`
                              w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-inner
                              ${isUnlocked ? branch.bg + ' text-white' : 'bg-slate-800 text-slate-500'}
                            `}>
                              {isUnlocked ? <Check size={24} /> : <Lock size={20} />}
                            </div>
                            <div className="font-bold text-sm text-slate-200 mb-1">{skill.title}</div>
                            <div className="text-[11px] font-medium text-slate-400 leading-tight mb-4 h-8 flex items-center justify-center">{skill.desc}</div>
                            
                            {!isUnlocked && (
                              <div className={`text-xs font-mono font-bold py-1.5 px-3 rounded-lg w-full ${canAfford && isUnlockable ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'}`}>
                                {skill.cost.toLocaleString()} EP
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}