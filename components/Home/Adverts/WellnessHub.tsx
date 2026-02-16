'use client';
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDumbbell, FaFireAlt, FaClock, FaTimes, FaAppleAlt, FaChevronLeft, FaChevronRight, FaPlay } from 'react-icons/fa';

export const WellnessHub = ({ advert }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeExercise, setActiveExercise] = useState<any>(null); // Track the whole exercise card
  const [currentVideo, setCurrentVideo] = useState<any>(null); // Track the specific video playing
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleStartExercise = (workout: any) => {
    setActiveExercise(workout);
    // Automatically play the first video in the workout's video list
    setCurrentVideo(workout.videos[0]);
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -8 }}
        onClick={() => setIsOpen(true)}
        className="relative rounded-3xl overflow-hidden shadow-2xl cursor-pointer h-[400px] w-full group"
      >
        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" 
             style={{ backgroundImage: `url(${advert.bgImage})` }} />
        <div className={`absolute inset-0 bg-gradient-to-t ${advert.color} opacity-85 group-hover:opacity-90`} />
        <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
          <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl w-fit mb-4"><FaAppleAlt size={24} /></div>
          <h2 className="text-3xl font-black mb-2">{advert.title}</h2>
          <p className="text-white/90 text-lg mb-6">Nutrition & fitness for optimal wellness.</p>
          <button className="w-fit px-6 py-2 bg-white text-green-900 rounded-xl font-bold uppercase tracking-wider">View Plans</button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setIsOpen(false)}>
            <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }}
              className="bg-white rounded-xl md:rounded-3xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col relative"
              onClick={(e) => e.stopPropagation()}>
              
              <div className="p-4 md:p-6 flex justify-between items-center bg-gray-50">
                <h2 className="text-2xl font-bold text-green-900">{advert.title}</h2>
                <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><FaTimes size={24} /></button>
              </div>

              <button 
                onClick={() => scroll('left')}
                className="hidden md:flex absolute left-4 top-1/2 z-20 bg-white/90 p-3 rounded-full shadow-lg text-green-600 hover:bg-green-600 hover:text-white transition-all"
              >
                <FaChevronLeft size={20} />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="hidden md:flex absolute right-4 top-1/2 z-20 bg-white/90 p-3 rounded-full shadow-lg text-green-600 hover:bg-green-600 hover:text-white transition-all"
              >
                <FaChevronRight size={20} />
              </button>

              <div ref={scrollRef} className="overflow-y-auto md:overflow-y-hidden md:overflow-x-auto scrollbar-hide scroll-smooth">
                <div className="flex flex-col md:flex-row md:flex-nowrap gap-6 p-6 md:p-10 md:pr-20 min-h-fit">
                  {advert.workouts.map((workout: any) => (
                    <motion.div key={workout.id} whileHover={{ y: -5 }} className="flex-none w-full md:w-[280px] bg-white rounded-xl shadow-lg overflow-hidden">
                      <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${workout.image})` }} />
                      <div className="p-5">
                        <div className="flex items-center mb-2">
                          <FaDumbbell className="w-4 h-4 text-green-500 mr-2" />
                          <h3 className="font-bold text-gray-800">{workout.name}</h3>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-4 gap-4">
                          <span className="flex items-center"><FaClock className="mr-1 text-gray-400"/> {workout.duration}</span>
                          <span className="flex items-center"><FaFireAlt className="mr-1 text-orange-500"/> {workout.calories}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded">{workout.level}</span>
                          <button 
                            onClick={() => handleStartExercise(workout)}
                            className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-green-700 transition-colors"
                          >
                            <FaPlay size={10} /> Start
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <div className="hidden md:block flex-none w-10 h-10 invisible" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIDEO PLAYER OVERLAY (Theater Mode) */}
      <AnimatePresence>
        {activeExercise && currentVideo && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-2 md:p-4 bg-black/95 backdrop-blur-xl"
            onClick={() => { setActiveExercise(null); setCurrentVideo(null); }}
          >
            <motion.div 
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-zinc-900 rounded-xl w-full max-w-5xl h-[95vh] md:h-[85vh] overflow-hidden flex flex-col md:flex-row shadow-2xl relative border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* DESKTOP ONLY CANCEL BUTTON */}
              <button 
                onClick={() => { setActiveExercise(null); setCurrentVideo(null); }}
                className="hidden md:flex absolute top-6 right-6 z-[300] bg-white/10 text-white p-3 rounded-full hover:bg-red-500 transition-all"
              >
                <FaTimes size={20} />
              </button>

              {/* LEFT SIDE: MAIN VIDEO PLAYER */}
              <div className="flex-[2.5] bg-black h-full flex flex-col">
                <div className="relative w-full h-full">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${currentVideo.videoId}?autoplay=1`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="p-8 bg-zinc-900">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                        {currentVideo.title}
                      </h2>
                      <p className="text-green-500 font-bold mt-2 uppercase text-xs tracking-widest">
                        Part of: {activeExercise.name}
                      </p>
                    </div>
                    {/* MOBILE ONLY CANCEL BUTTON - Positioned next to header for clear access */}
                    <button 
                      onClick={() => { setActiveExercise(null); setCurrentVideo(null); }}
                      className="md:hidden z-[300] relative bg-red-600 text-white p-3 rounded-xl shadow-lg active:scale-95 transition-all"
                    >
                      <FaTimes size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: 3 VIDEOS FOR THIS SPECIFIC EXERCISE */}
              <div className="flex-1 bg-zinc-800 overflow-y-auto border-l border-white/5 custom-scrollbar">
                <div className="p-6 border-b border-white/5 bg-zinc-900/50">
                    <h3 className="text-white font-black uppercase text-xs tracking-widest opacity-70">Exercise Playlist</h3>
                    <p className="text-[10px] text-zinc-500 mt-1">3 Videos included in this session</p>
                </div>
                <div className="flex flex-col">
                  {activeExercise.videos.map((video: any) => (
                    <div 
                      key={video.videoId}
                      onClick={() => setCurrentVideo(video)}
                      className={`p-4 flex gap-4 cursor-pointer hover:bg-white/5 transition-all border-b border-white/5 ${currentVideo.videoId === video.videoId ? 'bg-green-600/20 border-l-4 border-l-green-600' : ''}`}
                    >
                      <div className="w-24 h-16 rounded-lg bg-zinc-700 flex items-center justify-center shrink-0 overflow-hidden relative">
                        <img src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`} alt="" className="object-cover w-full h-full opacity-60" />
                        <FaPlay className="absolute text-white text-xs opacity-80" />
                      </div>
                      <div className="flex flex-col justify-center overflow-hidden">
                        <h4 className={`font-bold textxs md:text-sm leading-tight ${currentVideo.videoId === video.videoId ? 'text-green-400' : 'text-white'}`}>
                          {video.title}
                        </h4>
                        <p className="text-zinc-500 text-[10px] mt-1 italic uppercase">Video Part {activeExercise.videos.indexOf(video) + 1}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-6 mt-4">
                   <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                      <p className="text-zinc-400 text-xs leading-relaxed">
                        Follow these 3 professional guides to master the <strong>{activeExercise.name}</strong>.
                      </p>
                   </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};