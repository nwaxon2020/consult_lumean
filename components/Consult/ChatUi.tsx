'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { 
  collection, addDoc, query, where, onSnapshot, 
  orderBy, Timestamp, getDocs, writeBatch, doc, 
  updateDoc, limit 
} from 'firebase/firestore';
import { 
  FaPaperPlane, FaCheckDouble, FaUserCircle, FaLock, 
  FaTrash, FaExclamationTriangle, FaUsers, 
  FaArrowLeft, FaTimes, FaInbox, FaCommentSlash
} from 'react-icons/fa';
import toast from 'react-hot-toast';

interface ChatUIProps { onUnlockRedirect: () => void; }

const ChatUI: React.FC<ChatUIProps> = ({ onUnlockRedirect }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [hasAccess, setHasAccess] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [contacts, setContacts] = useState<any[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatientName, setSelectedPatientName] = useState<string>('Patient');
  const [showMobileChat, setShowMobileChat] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_KEY;
  const isAdmin = useMemo(() => user?.uid === ADMIN_UID, [user]);

  // 1. UNREAD MESSAGES LISTENER (ADMIN ONLY)
  useEffect(() => {
    if (!user || !isAdmin) return;
    const q = query(collection(db, 'messages'), where('status', '==', 'sent'));
    const unsub = onSnapshot(q, (snapshot) => {
      const counts: Record<string, number> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.senderId !== user.uid) {
          counts[data.threadId] = (counts[data.threadId] || 0) + 1;
        }
      });
      setUnreadCounts(counts);
    });
    return () => unsub();
  }, [user, isAdmin]);

  // 2. GATEKEEPER & ACCESS LOGIC
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    const todayStr = new Date().toISOString().split('T')[0];
    const q = isAdmin 
      ? query(collection(db, 'appointments'), where('serviceType', '==', 'chat'), where('paymentStatus', '==', 'paid'))
      : query(collection(db, 'appointments'), where('userId', '==', user.uid), where('serviceType', '==', 'chat'), where('paymentStatus', '==', 'paid'), orderBy('createdAt', 'desc'), limit(1));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLoading(false);
      
      // Handle empty state
      if (snapshot.empty) {
        setHasAccess(false);
        setIsUnlocked(false);
        setContacts([]); // Clear contacts for admin
        return;
      }

      if (isAdmin) {
        setHasAccess(true);
        setIsUnlocked(true);
        // Filter for today's appointments only
        const activeToday = snapshot.docs
          .map(d => ({ 
            uid: d.data().userId, 
            name: d.data().userName || 'Patient', 
            date: d.data().date 
          }))
          .filter(c => c.date === todayStr)
          .filter((v, i, a) => a.findIndex(t => t.uid === v.uid) === i);
        
        setContacts(activeToday);
        
        // If no patients today, show empty state
        if (activeToday.length === 0) {
          setSelectedPatientId(null);
        }
      } else {
        const data = snapshot.docs[0].data();
        const checkAccess = () => {
          const now = new Date();
          const start = new Date(`${data.date}T00:00:00`); 
          const expiry = new Date(start.getTime() + 86400000);

          if (now < start) {
            setHasAccess(true); 
            setIsUnlocked(false);
            const diff = start.getTime() - now.getTime();
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            setCountdown(`${h}h ${m}m`);
          } else if (now >= start && now < expiry) {
            setHasAccess(true); 
            setIsUnlocked(true);
          } else {
            setHasAccess(false); 
            setIsUnlocked(false);
          }
        };
        checkAccess();
        const interval = setInterval(checkAccess, 1000);
        return () => clearInterval(interval);
      }
    }, (error) => {
      console.error("Snapshot error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isAdmin]);

  // 3. MESSAGE STREAM
  useEffect(() => {
    if (!user || !isUnlocked) return;
    const threadId = isAdmin ? selectedPatientId : user.uid;
    if (!threadId) return;

    const q = query(collection(db, 'messages'), where('threadId', '==', threadId), orderBy('timestamp', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      
      msgs.forEach(async (m: any) => {
        if (m.senderId !== user.uid && m.status !== 'seen') {
          await updateDoc(doc(db, 'messages', m.id), { status: 'seen' });
        }
      });
    });
  }, [user, isUnlocked, isAdmin, selectedPatientId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !isUnlocked) return;
    const threadId = isAdmin ? selectedPatientId : user.uid;
    if (!threadId) {
      toast.error(isAdmin ? "Select a patient first" : "No active session");
      return;
    }
    try {
      await addDoc(collection(db, 'messages'), {
        threadId,
        senderId: user.uid,
        text: newMessage,
        timestamp: Timestamp.now(),
        status: 'sent'
      });
      setNewMessage('');
    } catch (e) { 
      console.error("Send error:", e);
      toast.error("Failed to send"); 
    }
  };

  const handleClearChat = async () => {
    const threadId = isAdmin ? selectedPatientId : user?.uid;
    if (!threadId) return;
    
    try {
      const q = query(collection(db, 'messages'), where('threadId', '==', threadId));
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
      setShowConfirm(false);
      toast.success("Chat wiped");
    } catch (e) {
      console.error("Clear error:", e);
      toast.error("Failed to clear chat");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 h-[500px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Loading chats...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8 h-[500px]">
        <div className="bg-[#0b141a] p-7 md:p-12 rounded-[1rem] md:rounded-[2.5rem] border border-white/5 text-center shadow-2xl max-w-sm w-full">
          <FaLock size={40} className="text-blue-500/20 mx-auto mb-6" />
          <h3 className="text-white font-black uppercase italic text-lg tracking-tighter">Sign In Required</h3>
          <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-4">Please sign in to access chat</p>
          <button onClick={onUnlockRedirect} className="mt-8 px-8 py-4 bg-blue-600 text-white rounded-lg md:rounded-2xl font-black uppercase text-[10px] tracking-widest">Go to Schedule</button>
        </div>
      </div>
    );
  }

  // Admin view - No patients today
  if (isAdmin && contacts.length === 0 && !selectedPatientId) {
    return (
      <div className="flex items-center justify-center p-12 h-[500px]">
        <div className="bg-[#0b141a] p-12 rounded-[2.5rem] border border-white/5 text-center shadow-2xl max-w-sm w-full">
          <FaCommentSlash size={40} className="text-slate-500/20 mx-auto mb-6" />
          <h3 className="text-white font-black uppercase italic text-lg tracking-tighter">No Active Chats</h3>
          <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-4 leading-relaxed">
            No patients have active chat sessions scheduled for today.
          </p>
          <div className="mt-8 text-xs text-slate-600 font-mono">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>
    );
  }

  // Admin view - Selected patient but no messages
  if (isAdmin && selectedPatientId && messages.length === 0) {
    return (
      <div className="fixed inset-0 z-[9999] md:static bg-[#0F172A] md:bg-transparent flex flex-col w-full h-[100dvh] md:h-[600px] overflow-hidden">
        <div className="flex-1 flex bg-[#0b141a] md:rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
          {/* ADMIN SIDEBAR */}
          <div className={`${showMobileChat ? 'hidden md:flex' : 'flex'} w-full md:w-72 bg-[#111b21] border-r border-white/5 flex-col`}>
            <div className="p-5 border-b border-white/5 text-blue-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"><FaUsers /> Patient Threads</div>
            <div className="flex-1 overflow-y-auto">
              {contacts.map(c => (
                <button 
                  key={c.uid} 
                  onClick={() => { setSelectedPatientId(c.uid); setSelectedPatientName(c.name); setShowMobileChat(true); }} 
                  className={`w-full p-4 flex items-center gap-3 border-b border-white/5 transition-all relative ${selectedPatientId === c.uid ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]'}`}
                >
                  <FaUserCircle size={30} className="text-slate-500" />
                  <div className="text-left truncate flex-1">
                    <p className="text-xs font-black text-white uppercase truncate">{c.name}</p>
                    <p className="text-[8px] text-green-500 font-black uppercase italic">Active Today</p>
                  </div>
                  {unreadCounts[c.uid] > 0 && (
                    <div className="bg-green-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                      {unreadCounts[c.uid]}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* CHAT INTERFACE - EMPTY STATE */}
          <div className={`${isAdmin && !showMobileChat ? 'hidden md:flex' : 'flex'} flex-1 flex flex-col bg-[#0b141a]`}>
            <div className="px-6 py-4 bg-[#202c33] flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-3">
                {isAdmin && <button onClick={() => setShowMobileChat(false)} className="md:hidden text-white mr-2"><FaArrowLeft /></button>}
                <FaUserCircle size={35} className="text-slate-400" />
                <div>
                  <p className="text-sm font-black text-white uppercase italic">{selectedPatientName}</p>
                  <p className="text-[9px] text-green-500 font-black uppercase italic tracking-widest">End-to-End Encrypted</p>
                </div>
              </div>
              <button onClick={() => setShowConfirm(true)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><FaTrash size={14} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-fixed opacity-90">
              <div className="text-center">
                <FaInbox size={40} className="text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-sm font-black uppercase tracking-widest">No Messages Yet</p>
                <p className="text-slate-600 text-[10px] mt-2">Send a message to start the conversation</p>
              </div>
            </div>

            <div className="p-4 bg-[#202c33] flex items-center gap-3 border-t border-white/5 pb-8 md:pb-4">
              <input 
                type="text" value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Write a message..."
                className="flex-1 bg-[#2a3942] rounded-xl p-4 text-white text-sm outline-none border border-transparent focus:border-blue-500"
              />
              <button onClick={sendMessage} className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 transition-all">
                <FaPaperPlane size={14} />
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showConfirm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10001] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
              <div className="bg-white p-8 rounded-[2.5rem] max-w-xs w-full text-center">
                <FaExclamationTriangle className="text-red-500 text-2xl mx-auto mb-4" />
                <h4 className="text-[11px] font-black uppercase mb-2">Clear History?</h4>
                <p className="text-[9px] text-slate-400 mb-6 uppercase tracking-widest">This will wipe all messages in this thread.</p>
                <div className="flex gap-2">
                  <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 bg-slate-100 rounded-xl text-[10px] font-black uppercase">Cancel</button>
                  <button onClick={handleClearChat} className="flex-1 py-3 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase">Wipe</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // User view - No access or locked
  if (!isUnlocked || !hasAccess) {
    return (
      <div className="flex items-center justify-center p-12 h-[500px]">
        <div className="bg-[#0b141a] p-12 rounded-[2.5rem] border border-white/5 text-center shadow-2xl max-w-sm w-full">
          <FaLock size={40} className="text-blue-500/20 mx-auto mb-6" />
          <h3 className="text-white font-black uppercase italic text-lg tracking-tighter">
            {hasAccess ? 'Chat Locked' : 'No Active Session'}
          </h3>
          <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-4 leading-relaxed whitespace-pre-line">
            {hasAccess 
              ? `Session opens in:\n${countdown}` 
              : "You don't have any active chat sessions.\nBook a session to get started."}
          </p>
          <button onClick={onUnlockRedirect} className="mt-8 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest">
            {hasAccess ? 'View Schedule' : 'Book Session'}
          </button>
        </div>
      </div>
    );
  }

  // Regular chat interface (with messages)
  return (
    <div className="fixed inset-0 z-[9999] md:static bg-[#0F172A] md:bg-transparent flex flex-col w-full h-[100dvh] md:h-[600px] overflow-hidden">
      <div className="flex-1 flex bg-[#0b141a] md:rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl relative">
        
        {/* ADMIN SIDEBAR */}
        {isAdmin && (
          <div className={`${showMobileChat ? 'hidden md:flex' : 'flex'} w-full md:w-72 bg-[#111b21] border-r border-white/5 flex-col`}>
            <div className="p-5 border-b border-white/5 text-blue-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"><FaUsers /> Patient Threads</div>
            <div className="flex-1 overflow-y-auto">
              {contacts.map(c => (
                <button 
                  key={c.uid} 
                  onClick={() => { setSelectedPatientId(c.uid); setSelectedPatientName(c.name); setShowMobileChat(true); }} 
                  className={`w-full p-4 flex items-center gap-3 border-b border-white/5 transition-all relative ${selectedPatientId === c.uid ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]'}`}
                >
                  <FaUserCircle size={30} className="text-slate-500" />
                  <div className="text-left truncate flex-1">
                    <p className="text-xs font-black text-white uppercase truncate">{c.name}</p>
                    <p className="text-[8px] text-green-500 font-black uppercase italic">Active Today</p>
                  </div>
                  {unreadCounts[c.uid] > 0 && (
                    <div className="bg-green-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      {unreadCounts[c.uid]}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CHAT INTERFACE */}
        <div className={`${isAdmin && !showMobileChat ? 'hidden md:flex' : 'flex'} flex-1 flex flex-col bg-[#0b141a]`}>
          <div className="px-6 py-4 bg-[#202c33] flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              {isAdmin && <button onClick={() => setShowMobileChat(false)} className="md:hidden text-white mr-2"><FaArrowLeft /></button>}
              <FaUserCircle size={35} className="text-slate-400" />
              <div>
                <p className="text-sm font-black text-white uppercase italic">{isAdmin ? selectedPatientName : "Medical Consultant"}</p>
                <p className="text-[9px] text-green-500 font-black uppercase italic tracking-widest">End-to-End Encrypted</p>
              </div>
            </div>
            <button onClick={() => setShowConfirm(true)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><FaTrash size={14} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[url('/chatBg2.png')] bg-fixed opacity-90">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <FaInbox size={40} className="text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-sm font-black uppercase tracking-widest">No Messages Yet</p>
                  <p className="text-slate-600 text-[10px] mt-2">Send a message to start the conversation</p>
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`flex ${m.senderId === user.uid ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-[1.5rem] text-[13px] relative shadow-xl ${m.senderId === user.uid ? 'bg-[#005c4b] text-white rounded-tr-none' : 'bg-[#202c33] text-white rounded-tl-none'}`}>
                    {m.text}
                    <div className="flex justify-end mt-1">
                      {m.senderId === user.uid && <FaCheckDouble className={m.status === 'seen' ? "text-blue-400" : "text-white/30"} size={10} />}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={scrollRef} />
          </div>

          <div className="p-4 bg-[#202c33] flex items-center gap-3 border-t border-white/5 pb-8 md:pb-4">
            <input 
              type="text" value={newMessage} 
              onChange={(e) => setNewMessage(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={isAdmin && !selectedPatientId ? "Select a patient first..." : "Write a message..."}
              disabled={isAdmin && !selectedPatientId}
              className="flex-1 bg-[#2a3942] rounded-xl p-4 text-white text-sm outline-none border border-transparent focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button 
              onClick={sendMessage} 
              disabled={isAdmin && !selectedPatientId}
              className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              <FaPaperPlane size={14} />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10001] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
            <div className="bg-white p-8 rounded-[2.5rem] max-w-xs w-full text-center">
              <FaExclamationTriangle className="text-red-500 text-2xl mx-auto mb-4" />
              <h4 className="text-[11px] font-black uppercase mb-2">Clear History?</h4>
              <p className="text-[9px] text-slate-400 mb-6 uppercase tracking-widest">This will wipe all messages in this thread.</p>
              <div className="flex gap-2">
                <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 bg-slate-100 rounded-xl text-[10px] font-black uppercase">Cancel</button>
                <button onClick={handleClearChat} className="flex-1 py-3 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase">Wipe</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatUI;