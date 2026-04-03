import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Users, Send, MessageSquare, ShieldCheck, Activity } from 'lucide-react';

// Connect to the backend socket server outside the component to prevent multiple connections
const socket = io('http://localhost:5000');

export default function CommunityPage({ user }) {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Ref to automatically scroll to the bottom of the chat
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // 1. Fetch Chat History on load
    const fetchHistory = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/web/chat/history');
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();

    // 2. Listen for real-time messages from the server
    socket.on('receive_message', (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    // Cleanup listener on unmount
    return () => {
      socket.off('receive_message');
    };
  }, []);

  // Auto-scroll when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (currentMessage.trim() === '') return;

    const messageData = {
      userId: user._id,
      userName: user.name,
      text: currentMessage
    };

    // Emit the message to the backend via WebSockets
    socket.emit('send_message', messageData);
    
    // Clear the input field
    setCurrentMessage('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative font-sans animate-in fade-in">
      
      {/* HEADER */}
      <div className="bg-slate-900 text-white p-6 md:p-8 flex items-center justify-between shadow-md z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Bhopal Commuter Hub</h1>
            <p className="text-slate-400 text-sm flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Live Community Chat
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl text-sm font-bold text-slate-300">
          <ShieldCheck className="text-emerald-400" size={16}/>
          Vahan Trust Network
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 bg-slate-50/50 relative">
        {loading ? (
          <div className="flex h-full items-center justify-center text-slate-400">
            <Activity className="animate-spin mr-2" /> Connecting to network...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-50">
            <MessageSquare size={48} className="mb-4" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.userId === user?._id;
            
            return (
              <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                <div className={`max-w-[75%] md:max-w-[60%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  
                  {/* Name tag for other users */}
                  {!isMe && (
                    <span className="text-xs font-bold text-slate-500 ml-2 mb-1">
                      {msg.userName}
                    </span>
                  )}
                  
                  {/* Message Bubble */}
                  <div className={`px-5 py-3 rounded-2xl shadow-sm text-sm ${
                    isMe 
                      ? 'bg-indigo-600 text-white rounded-tr-sm' 
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                  
                  {/* Timestamp */}
                  <span className="text-[10px] text-slate-400 mt-1 mx-1 font-medium">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        {/* Invisible div to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="bg-white p-4 md:p-6 border-t border-slate-200 shrink-0">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex items-center gap-3">
          <input
            type="text"
            placeholder="Message the community (e.g., Anyone heading to Sector 29?)"
            className="flex-1 bg-slate-100 border border-transparent focus:bg-white focus:border-indigo-300 rounded-full px-6 py-4 outline-none transition shadow-inner"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
          />
          <button
            type="submit"
            disabled={!currentMessage.trim()}
            className="p-4 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition shadow-lg shadow-indigo-200 flex items-center justify-center"
          >
            <Send size={20} className="ml-1" />
          </button>
        </form>
      </div>

    </div>
  );
}