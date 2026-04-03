import React, { useState } from 'react';
import { LayoutDashboard, MapPin, Trophy, Wallet, User as UserIcon, Menu, X, Users, Home, LogOut, Zap } from 'lucide-react';
import DashboardPage from '../pages/DashboardPage';
import SmartMatchDashboard from '../pages/SmartMatchDashboard';
import GamificationPage from '../pages/GamificationPage';
import WalletPage from '../pages/WalletPage';
import ProfilePage from '../pages/ProfilePage';
import CommunityPage from '../pages/CommunityPage';
import ProviderDashboard from '../pages/ProviderDashboard';
import SmartDrive3D from '../pages/SmartDrive3D';

// FIX: Added 'user' and 'onLogout' as props here
export default function MainLayout({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      // FIX: Passing the 'user' prop down to the pages
      case 'dashboard': return <DashboardPage user={user} onNavigate={setActiveTab} />;
      case 'parking': return <SmartMatchDashboard user={user} />;
      case 'hosting': return <ProviderDashboard user={user} />;
      case 'gamification': return <GamificationPage user={user} />;
      case 'wallet': return <WalletPage user={user} />;
      case 'profile': return <ProfilePage user={user} />;
      case 'community': return <CommunityPage user={user} />;
      case 'drive3d': return <SmartDrive3D />;
      case 'vault': return <GamificationPage user={user} onUpdateUser={onUpdateUser} />;
      default: return <DashboardPage user={user} onNavigate={setActiveTab} />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'parking', label: 'Park & Pool', icon: MapPin },
    { id: 'hosting', label: 'Host a Spot', icon: Home },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'gamification', label: 'Eco-Vault', icon: Trophy },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'drive3d', label: '3D Drive Mode', icon: Zap }, // Make sure Zap is imported from lucide-react
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white shadow-2xl z-20">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Vahan</h1>
          <p className="text-xs text-slate-400 tracking-wider mt-1">URBAN MOBILITY</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-indigo-600 shadow-lg shadow-indigo-500/30 text-white' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* FIX: Live User Profile & Logout Button in Sidebar */}
        <div className="p-4 mt-auto">
          <div className="bg-slate-800 rounded-xl p-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex-shrink-0 flex items-center justify-center font-bold text-slate-900 text-xs">
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-sm font-bold truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] text-slate-400">Level {Math.floor((user?.ecoPoints || 0) / 1000) + 1}</p>
              </div>
            </div>
            <button onClick={onLogout} className="text-slate-400 hover:text-red-400 transition-colors p-1" title="Log Out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="md:hidden absolute top-0 w-full bg-slate-900 text-white p-4 flex justify-between items-center z-50">
        <h1 className="font-bold text-lg">Vahan</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full h-full bg-slate-900/95 backdrop-blur-md text-white z-40 md:hidden border-t border-slate-800">
          {navItems.map((item) => (
             <button
             key={item.id}
             onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
             className="flex items-center gap-3 w-full px-6 py-4 border-b border-slate-800/50"
           >
             <item.icon size={20} />
             <span>{item.label}</span>
           </button>
          ))}
          <button onClick={onLogout} className="flex items-center gap-3 w-full px-6 py-4 text-red-400">
            <LogOut size={20} /> <span>Log Out</span>
          </button>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto relative pt-16 md:pt-0">
        {renderContent()}
      </main>
    </div>
  );
}