import React, { useState } from 'react';
import axios from 'axios';
import { Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, Clock, Plus, ShieldCheck, Activity } from 'lucide-react';

export default function WalletPage({ user }) {
  const [topupAmount, setTopupAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Use local state to update the balance instantly on the UI without requiring a full page reload
  const [currentBalance, setCurrentBalance] = useState(user?.walletBalance || 0);

  const handleTopUp = async (e) => {
    e.preventDefault();
    if (!topupAmount || topupAmount <= 0) return;
    
    setLoading(true);
    setSuccessMsg('');

    try {
      const res = await axios.post(`http://localhost:5000/api/web/users/${user._id}/wallet/topup`, {
        amount: parseFloat(topupAmount)
      });

      // Update LocalStorage and UI State
      localStorage.setItem('vahan_user', JSON.stringify(res.data.user));
      setCurrentBalance(res.data.user.walletBalance);
      
      setSuccessMsg(`Successfully added ₹${topupAmount} to your Vahan Wallet!`);
      setTopupAmount('');
      
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      console.error("Payment failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-slate-900 text-white rounded-xl shadow-lg">
          <Wallet size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Vahan Pay</h1>
          <p className="text-slate-500 font-medium">Manage your balance, payments, and earnings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: The Digital Card & Top Up */}
        <div className="md:col-span-1 space-y-6">
          
          {/* Virtual Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 shadow-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <span className="text-slate-400 text-xs font-bold tracking-widest uppercase">Available Balance</span>
              <ShieldCheck className="text-emerald-400" size={20} />
            </div>
            
            <h2 className="text-4xl font-black mb-6 relative z-10">
              ₹{currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            
            <div className="flex justify-between items-end relative z-10">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Cardholder</p>
                <p className="font-medium text-sm">{user?.name || 'Vahan User'}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg text-slate-300">•••• 4242</p>
              </div>
            </div>
          </div>

          {/* Top Up Form */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Plus className="text-indigo-600" size={18}/> Add Funds
            </h3>
            
            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleTopUp} className="space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input 
                  type="number" required min="10" placeholder="Amount (e.g. 500)"
                  value={topupAmount} onChange={(e) => setTopupAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none transition font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[100, 500, 1000].map((amt) => (
                  <button 
                    key={amt} type="button" onClick={() => setTopupAmount(amt.toString())}
                    className="py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition"
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>

              <button 
                type="submit" disabled={loading}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-lg disabled:opacity-50"
              >
                {loading ? <Activity className="animate-spin" size={18} /> : <CreditCard size={18} />}
                Proceed to Pay
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Transaction History */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 h-full">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Clock className="text-slate-400" /> Recent Transactions
              </h3>
              <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800">View All</button>
            </div>

            <div className="space-y-4">
              {/* Note: In a production app, you would fetch these from a Transactions MongoDB collection. 
                  For now, we map static UI data to make the presentation look complete. */}
              {[
                { title: "Wallet Top-up", type: "credit", amount: 500.00, date: "Today, 10:42 AM", status: "Completed" },
                { title: "Smart Hub Parking (Sector 29)", type: "debit", amount: 45.00, date: "Yesterday, 06:15 PM", status: "Paid" },
                { title: "Hosted Spot Earnings", type: "credit", amount: 120.00, date: "Mar 28, 02:30 PM", status: "Credited" },
                { title: "Carpool Contribution", type: "debit", amount: 80.00, date: "Mar 25, 09:10 AM", status: "Paid" },
              ].map((tx, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 cursor-default">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${tx.type === 'credit' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'}`}>
                      {tx.type === 'credit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{tx.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono font-bold ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{tx.status}</p>
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