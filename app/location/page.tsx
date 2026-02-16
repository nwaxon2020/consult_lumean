'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaPhoneAlt, FaClock, FaDirections, FaEnvelope, FaGlobe } from 'react-icons/fa';

// THE CONSTANT - Dynamic Data
const LOCATION_DATA = {
  address: "123 Healthcare Way, Victoria Island",
  city: "Lagos, Nigeria",
  phone: "+2347034632037",
  email: "princenwachukwu308@yahoo.com",
  hours: {
    weekdays: "8:00 AM - 6:00 PM",
    saturday: "10:00 AM - 6:00 PM"
  }
};

// AUTO-SEARCH LOGIC (Simple & Smart)
const query = encodeURIComponent(`${LOCATION_DATA.address}, ${LOCATION_DATA.city}`);
const autoMapEmbed = `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${query}`;
// Note: If you don't have an API key yet, use the free search string below:
const freeEmbed = `https://maps.google.com/maps?q=${query}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
const autoNavUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

const LocationPage = () => {
  return (
    <div className="min-h-screen bg-[#020617] pt-32 pb-20 px-6 relative overflow-hidden">
      
      {/* Background Glow Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] -z-10" />

      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }}
            className="relative z-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Live Clinic Status</span>
            </div>

            <h1 className="text-6xl font-black text-white mb-8 tracking-tighter uppercase italic leading-[0.9]">
              Physical <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                Presence.
              </span>
            </h1>
            
            <div className="space-y-10">
              {/* Address Card */}
              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center text-blue-400 shrink-0 group-hover:border-blue-500/50 transition-all duration-500 shadow-xl shadow-blue-500/5">
                  <FaMapMarkerAlt size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-amber-300 uppercase text-[10px] tracking-[0.25em] mb-2">Location</h4>
                  <p className="text-white text-xl font-bold leading-tight">
                    {LOCATION_DATA.address},<br />
                    <span className="text-slate-300 text-lg font-medium">{LOCATION_DATA.city}</span>
                  </p>
                </div>
              </div>

              {/* Hours Card */}
              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center text-purple-400 shrink-0 group-hover:border-purple-500/50 transition-all duration-500">
                  <FaClock size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-amber-300 uppercase text-[10px] tracking-[0.25em] mb-2">Facility Hours</h4>
                  <div className="space-y-1">
                    <p className="text-white font-bold flex items-center gap-3">
                      <span className="text-[10px] text-slate-300 font-normal w-12 uppercase">M-F</span> 
                      {LOCATION_DATA.hours.weekdays}
                    </p>
                    <p className="text-white font-bold flex items-center gap-3">
                      <span className="text-[10px] text-slate-300 font-normal w-12 uppercase">SAT</span> 
                      {LOCATION_DATA.hours.saturday}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact Buttons */}
            <div className="mt-12 flex flex-col md:flex-row gap-4">
              <a href={`tel:${LOCATION_DATA.phone}`} className="flex justify-center items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95">
                <FaPhoneAlt size={14}/> Call Center
              </a>
              {/* Email */}
              <a href={`mailto:${LOCATION_DATA.email}`} className="flex justify-center items-center gap-3 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border border-white/10 transition-all">
                <FaEnvelope size={14}/> Support
              </a>
            </div>
          </motion.div>

          {/* Glowing Map Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            {/* Outer Glow for Map */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000" />
            
            <div className="relative h-[550px] w-full rounded-lg md:rounded-[1rem] overflow-hidden border border-white/10 bg-[#0b0e1a] shadow-2xl">
              <iframe 
                src={freeEmbed} 
                className="w-full h-full grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-1000"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              ></iframe>

              {/* Float Glass UI for Map */}
              <div className="absolute top-6 left-6 p-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl hidden sm:block">
                <p className="text-[8px] font-black text-blue-400 uppercase tracking-[0.3em] mb-1">Global HQ</p>
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
                  <FaGlobe className="animate-spin-slow" /> Virtual Path Synced
                </div>
              </div>
              
              <a 
                href={autoNavUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] bg-white text-black py-5 rounded-3xl font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-blue-400 hover:text-white transition-all shadow-2xl"
              >
                <FaDirections size={18} /> Initiate GPS Navigation
              </a>
            </div>
          </motion.div>
        </div>

        {/* Smart Footer Bar */}
        <div className="mt-20 py-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
             <div className="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center">
               <div className="w-1 h-1 bg-blue-500 rounded-full animate-ping" />
             </div>
             <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Encrypted Clinic Database v2.0</p>
          </div>
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em] italic">Dr. Nwachukwu's Place © 2026</p>
        </div>
      </div>
    </div>
  );
};

export default LocationPage;