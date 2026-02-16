'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { 
  FaPhone, FaPhoneSlash, FaMicrophone, FaMicrophoneSlash, 
  FaLock, FaUserCircle, FaClock, FaShieldAlt, 
} from 'react-icons/fa';

interface VoiceCallProps {
  onUnlockRedirect: () => void;
}

const VoiceCall: React.FC<VoiceCallProps> = ({ onUnlockRedirect }) => {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('SYNCING...');
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    if (!user) return;

    const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_KEY;
    const isAdmin = user?.uid === ADMIN_UID;
    
    if (isAdmin) {
      setHasAccess(true);
      setIsUnlocked(true);
      setTimeLeft("ADMIN ACCESS");
      return;
    }

    const q = query(
      collection(db, 'appointments'),
      where('userId', '==', user.uid),
      where('serviceType', '==', 'voice'),
      where('paymentStatus', '==', 'paid'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setHasAccess(false);
        setIsUnlocked(false);
        setIsInCall(false); 
        return;
      }

      const docData = snapshot.docs[0].data();
      const apptDate = docData.date; 
      const apptTime = docData.time; 

      setHasAccess(true);

      const timer = setInterval(() => {
        const now = new Date().getTime();
        const startTime = new Date(`${apptDate}T${apptTime}:00`).getTime();
        const expiryTime = startTime + (24 * 60 * 60 * 1000); 

        if (now < startTime) {
          setIsUnlocked(false);
          const diff = startTime - now;
          const h = Math.floor(diff / 3600000);
          const m = Math.floor((diff % 3600000) / 60000);
          const s = Math.floor((diff % 60000) / 1000);
          setTimeLeft(`${h}h ${m}m ${s}s`);
        } else if (now >= startTime && now < expiryTime) {
          setIsUnlocked(true); 
          const diff = expiryTime - now;
          const h = Math.floor(diff / 3600000);
          const m = Math.floor((diff % 3600000) / 60000);
          const s = Math.floor((diff % 60000) / 1000);
          setTimeLeft(`${h}h ${m}s`); // Smarter: removed minutes if too long, kept concise
        } else {
          setIsUnlocked(false);
          setHasAccess(false);
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8 h-[500px]">
        <div className="bg-[#0b141a] p-7 md:p-12 rounded-[1rem] md:rounded-[2.5rem] border border-white/5 text-center shadow-2xl max-w-sm w-full">
          <FaLock size={40} className="text-blue-500/20 mx-auto mb-6" />
          <h3 className="text-white font-black uppercase italic text-lg tracking-tighter">Sign In Required</h3>
          <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-4">Please sign in to access Voice Calls</p>
          <button onClick={onUnlockRedirect} className="mt-8 px-8 py-4 bg-blue-600 text-white rounded-lg md:rounded-2xl font-black uppercase text-[10px] tracking-widest">Go to Schedule</button>
        </div>
      </div>
    );
  }
  

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="w-full max-w-sm p-6 text-center bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl"
        >
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FaLock className="text-slate-500" />
          </div>
          <h3 className="text-white font-bold text-lg tracking-tight">Access Locked</h3>
          <p className="text-slate-400 text-xs mt-2 leading-relaxed">No active voice consultation found.</p>
          <button 
            onClick={onUnlockRedirect} 
            className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
          >
            Check Schedule
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full">
      <div className="w-full max-w-[340px] bg-[#0f172a] rounded-[2.5rem] p-6 border border-white/5 shadow-2xl relative overflow-hidden">
        
        {/* Smarter: Subtle ambient glow */}
        <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[80px] transition-colors duration-1000 ${isUnlocked ? 'bg-green-500/20' : 'bg-blue-500/10'}`} />

        <div className="text-center relative z-10">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center overflow-hidden border border-white/5">
              <FaUserCircle size={60} className="text-slate-600" />
            </div>
            <AnimatePresence>
              {isUnlocked && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-[#0f172a] rounded-full"
                />
              )}
            </AnimatePresence>
          </div>
          
          <h3 className="text-white font-bold text-lg tracking-tight">Medical Consultant</h3>
          
          {/* Smarter Time Display */}
          <div className={`mt-3 py-1.5 px-4 rounded-full inline-flex items-center gap-2 border ${isUnlocked ? 'bg-green-500/10 border-green-500/20' : 'bg-white/5 border-white/10'}`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isUnlocked ? 'text-green-500' : 'text-slate-400'}`}>
              {timeLeft}
            </span>
          </div>
        </div>

        {/* Action Area */}
        <div className="mt-8 mb-4 flex flex-col items-center gap-4">
          {!isInCall ? (
            <button 
              disabled={!isUnlocked} 
              onClick={() => setIsInCall(true)} 
              className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 
                ${isUnlocked 
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/40 hover:scale-105' 
                  : 'bg-slate-800 text-slate-600 opacity-40 grayscale blur-[2px]'}`}
            >
              {isUnlocked ? <FaPhone size={24} /> : <FaLock size={20} />}
            </button>
          ) : (
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-4">
              <button 
                onClick={() => setIsMuted(!isMuted)} 
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isMuted ? 'bg-orange-500 text-white' : 'bg-white/10 text-white'}`}
              >
                {isMuted ? <FaMicrophoneSlash size={18}/> : <FaMicrophone size={18}/>}
              </button>
              <button 
                onClick={() => setIsInCall(false)} 
                className="w-16 h-16 bg-red-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-red-500/40 hover:scale-105 transition-all"
              >
                <FaPhoneSlash size={24} />
              </button>
            </motion.div>
          )}
          
          <p className={`text-[9px] font-bold uppercase tracking-[0.2em] ${isUnlocked ? 'text-green-500' : 'text-slate-600'}`}>
            {isUnlocked ? "Line Active" : "Line Encrypted"}
          </p>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-center gap-2">
           <FaShieldAlt size={10} className="text-blue-500/50" />
           <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">End-to-End Secure</span>
        </div>
      </div>
    </div>
  );
};

export default VoiceCall;