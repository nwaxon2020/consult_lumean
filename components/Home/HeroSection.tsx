'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const images = [
  '/heroBg1.jpg',
  '/heroBg2.jpg',
  '/heroBg3.jpg',
];

const HeroSection: React.FC = () => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 20000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[85vh] w-full overflow-hidden flex items-center justify-center border-b-4 border-blue-600">
      {/* Background Image Slider */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImage}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${images[currentImage]})` }}
          />
        </AnimatePresence>
        
        {/* DARKER OVERLAYS */}
        <div className="absolute inset-0 bg-blue-950/60 backdrop-brightness-50"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-block mt-6 md:mt-1 px-4 py-1.5 mb-6 text-sm font-bold tracking-widest text-white uppercase border border-white/30 rounded-full bg-white/10 backdrop-blur-md"
          >
            Trusted Healthcare in Nigeria
          </motion.span>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
            Hi, I am <span className="text-blue-400">Dr. Nwachukwu</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-10 text-gray-100 max-w-2xl mx-auto font-medium drop-shadow-md">
            Welcome to <span className="font-bold text-white">Doc Nwachukwu's Place</span>. 
            Experience premium medical attention from the comfort of your home.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.a
              href="/consult"
              whileHover={{ scale: 1.05, backgroundColor: '#eff6ff' }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 bg-white text-blue-600 rounded-full font-bold text-lg shadow-2xl transition-all"
            >
              Start Consultation
            </motion.a>
            
            <motion.a
                href="/about"
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                className="px-10 py-4 border-2 border-white text-white rounded-full font-bold text-lg backdrop-blur-md transition-all"
            >
                Meet the Doctor
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;