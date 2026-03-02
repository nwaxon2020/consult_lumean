'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import AppointmentBooking from '@/components/Consult/AppointmentBooking';
import TextConsultation from '@/components/Consult/ChatUi'; 
import VoiceCall from '@/components/Consult/VoiceCall';
import Reviews from '@/components/Consult/Reviews'; // Ensure this path is correct
import { 
  FaCalendarAlt, FaCommentDots, FaPhone, 
  FaStar, FaUserMd, FaShieldAlt 
} from 'react-icons/fa';

const ConsultPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('appointments');
  const [unreadCount, setUnreadCount] = useState(0);
  
  const [dbConsults, setDbConsults] = useState(0);
  const [dbRating, setDbRating] = useState(0);

  const [bgIndex, setBgIndex] = useState(0);
  const backgroundImages = [
    '/heroBg1.jpg',
    '/heroBg2.jpg',
    '/heroBg3.jpg',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 20000);
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_KEY;
  const isAdmin = useMemo(() => user?.uid === ADMIN_UID, [user]);

  // 1. LIVE DATA POPULATION
  useEffect(() => {
    const unsubConsults = onSnapshot(collection(db, 'consults'), (snapshot) => {
      setDbConsults(snapshot.size);
    });

    const unsubReviews = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      if (snapshot.empty) {
        setDbRating(0);
        return;
      }
      const total = snapshot.docs.reduce((acc, doc) => acc + (doc.data().rating || 0), 0);
      const avg = total / snapshot.size;
      setDbRating(Number(avg.toFixed(1)));
    });

    return () => { unsubConsults(); unsubReviews(); };
  }, []);

  // 2. UNREAD MESSAGES LISTENER
  useEffect(() => {
    if (!user) return;

    const msgQuery = isAdmin 
      ? query(collection(db, 'messages'), where('status', '==', 'sent'))
      : query(collection(db, 'messages'), where('threadId', '==', user.uid), where('status', '==', 'sent'));

    const unsubscribe = onSnapshot(msgQuery, (snapshot) => {
      const count = snapshot.docs.filter(doc => doc.data().senderId !== user.uid).length;
      setUnreadCount(count);
    });

    return () => unsubscribe();
  }, [user, isAdmin]);

  const tabs = [
    { id: 'appointments', label: 'Book Appointment', icon: FaCalendarAlt },
    { id: 'chat', label: 'Chat Doctor', icon: FaCommentDots }, 
    { id: 'voice', label: 'Voice Call', icon: FaPhone },
    { id: 'reviews', label: 'Reviews', icon: FaStar }
  ];

  const goToAppointments = () => setActiveTab('appointments');

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Hero Section */}
      <div className="relative bg-[#1E293B] border-b border-white/5 pt-28 pb-12 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={bgIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 0.3, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${backgroundImages[bgIndex]})` }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E293B] via-[#1E293B]/60 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="max-w-2xl">
              <div className="flex items-center space-x-2 text-blue-400 font-bold text-sm uppercase tracking-wider mb-4">
                <FaShieldAlt />
                <span>Verified Medical Professionals</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                Consult with <span className="text-blue-500">Dr. Prince.N</span>
              </h1>
              <p className="text-lg text-slate-400 leading-relaxed">
                Experience world-class healthcare from the comfort of your home. 
                Secure, confidential, and professional medical advice tailored to you.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center w-28 backdrop-blur-xl">
                <div className="text-2xl font-bold text-blue-400 tabular-nums">{dbConsults}+</div>
                <div className="text-[10px] uppercase font-bold text-slate-300">Consults</div>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center w-28 backdrop-blur-md">
                <div className="text-2xl font-bold text-purple-400 tabular-nums">{dbRating > 0 ? dbRating : '--'}</div>
                <div className="flex justify-center text-[10px] text-yellow-500 my-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={i < Math.floor(dbRating) ? "text-yellow-500" : "text-slate-600"} />
                  ))}
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-300">Rating</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto md:px-4 py-12">
        {/* Navigation Tabs */}
        <div className="bg-[#1E293B] p-3 md:rounded-2xl shadow-2xl border border-white/5 flex flex-wrap md:flex-nowrap gap-2 mb-12 sticky top-24 z-10 backdrop-blur-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center justify-center space-x-3 flex-1 px-4 md:px-6 py-4 rounded-md md:rounded-xl font-bold text-sm transition-all duration-300 ${
                activeTab === tab.id ? 'text-white' : 'text-slate-200 bg-gray-900 hover:text-white hover:bg-white/5'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div layoutId="activeTab" className="absolute inset-0 bg-blue-600 rounded-md md:rounded-xl shadow-lg" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
              )}
              <div className="relative z-10">
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-slate-500'}`} />
                {tab.id === 'chat' && unreadCount > 0 && (
                  <span className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#1E293B]">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="relative z-10 whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Component holder for Bookings, Chats, Voice-calls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-[#1E293B] rounded-lg md:rounded-[2rem] md:p-4 shadow-2xl border border-white/5 h-full"
              >
                {activeTab === 'appointments' && (
                  <AppointmentBooking onSessionSecured={(type: 'chat' | 'voice') => setActiveTab(type)} />
                )}
                {activeTab === 'chat' && <TextConsultation onUnlockRedirect={goToAppointments} />}
                {activeTab === 'voice' && <VoiceCall onUnlockRedirect={goToAppointments} />}
                {activeTab === 'reviews' && <Reviews />}
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Emergeny number side bar */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group border border-white/5 shadow-2xl">
              <div className="absolute -right-4 -top-4 text-white/5 rotate-12 transition-transform group-hover:scale-110 duration-700">
                <FaUserMd size={150} />
              </div>
              <h3 className="text-xl font-bold mb-4 relative italic">Emergency?</h3>
              <p className="text-slate-400 text-sm mb-6 relative">
                If you are experiencing a medical emergency, please call your local emergency services immediately.
              </p>
              <button className="w-full bg-white text-slate-900 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-red-500 hover:text-white transition-all relative">
                Emergency Numbers
              </button>
            </div>

            <div className="bg-[#1E293B] rounded-[2rem] p-8 border border-white/5 shadow-2xl text-white">
              <h3 className="font-black text-slate-500 uppercase text-[10px] tracking-[0.3em] mb-6">Service Hours</h3>
              <div className="space-y-4">
                {[
                  { days: 'Mon - Fri', time: '08:00 AM - 08:00 PM' },
                  { days: 'Sat - Sun', time: '10:00 AM - 04:00 PM' }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                    <span className="text-slate-400 font-medium">{item.days}</span>
                    <span className="text-white font-bold">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultPage;
