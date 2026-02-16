'use client';
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShieldAlt, FaCheckCircle, FaTimes, FaHeartbeat, FaChevronLeft, FaChevronRight, FaInfoCircle } from 'react-icons/fa';

export const PreventionHub = ({ advert }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth / 2 : clientWidth / 2;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -8 }}
        onClick={() => setIsOpen(true)}
        className="relative rounded-3xl overflow-hidden shadow-2xl cursor-pointer h-[400px] w-full group"
      >
        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110" 
             style={{ backgroundImage: `url(${advert.bgImage})` }} />
        <div className={`absolute inset-0 bg-gradient-to-t ${advert.color} opacity-85 group-hover:opacity-90`} />
        <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
          <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl w-fit mb-4"><FaHeartbeat size={24} /></div>
          <h2 className="text-3xl font-black mb-2">{advert.title}</h2>
          <p className="text-white/90 text-lg mb-6">Stay ahead of illness with preventive care.</p>
          <button className="w-fit px-6 py-2 bg-white text-red-900 rounded-xl font-bold uppercase tracking-wider">Get Tips</button>
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
                <h2 className="text-2xl font-bold text-red-900">{advert.title}</h2>
                <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><FaTimes size={24} /></button>
              </div>

              {/* Scroll Buttons */}
              <button 
                onClick={() => scroll('left')}
                className="hidden md:flex absolute left-4 top-1/2 z-20 bg-white/90 p-3 rounded-full shadow-lg text-red-600 hover:bg-red-600 hover:text-white transition-all"
              >
                <FaChevronLeft size={20} />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="hidden md:flex absolute right-4 top-1/2 z-20 bg-white/90 p-3 rounded-full shadow-lg text-red-600 hover:bg-red-600 hover:text-white transition-all"
              >
                <FaChevronRight size={20} />
              </button>
              
              <div ref={scrollRef} className="overflow-y-auto md:overflow-y-hidden md:overflow-x-auto scrollbar-hide scroll-smooth">
                <div className="flex flex-col md:flex-row md:flex-nowrap gap-6 p-6 md:p-10 md:pr-20 min-h-fit">
                  {advert.vaccines.map((item: any) => (
                    <motion.div key={item.id} whileHover={{ y: -5 }} className="flex-none w-full md:w-[280px] bg-white rounded-xl shadow-lg p-4">
                      <div className="h-40 bg-cover bg-center rounded-lg mb-4 shadow-inner" style={{ backgroundImage: `url(${item.image})` }} />
                      <div className="text-xs font-bold text-red-600 uppercase mb-1">{item.tag}</div>
                      <h3 className="font-bold text-gray-900 mb-3 truncate">{item.name}</h3>
                      <div className="flex items-center text-sm text-gray-600 mb-4 font-medium"><FaCheckCircle className="text-green-500 mr-2" /> Verified info</div>
                      <button 
                        onClick={() => setSelectedDetail(item)}
                        className="w-full bg-red-600 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-colors shadow-md shadow-red-100"
                      >
                        <FaShieldAlt /> Details
                      </button>
                    </motion.div>
                  ))}
                  <div className="hidden md:block flex-none w-10 h-10 invisible" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INFORMATION DETAIL OVERLAY */}
      <AnimatePresence>
        {selectedDetail && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-red-950/90 backdrop-blur-xl"
            onClick={() => setSelectedDetail(null)}
          >
            <motion.div 
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setSelectedDetail(null)} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors">
                <FaTimes size={24} />
              </button>

              <div className="h-64 bg-cover bg-center" style={{ backgroundImage: `url(${selectedDetail.image})` }} />
              
              <div className="p-8 md:p-10 overflow-y-auto">
                <div className="flex items-center gap-2 text-red-600 font-bold uppercase text-xs tracking-widest mb-2">
                  <FaInfoCircle /> Health Advisory
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-4">{selectedDetail.name}</h2>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg mb-2 underline decoration-red-500 underline-offset-4">Description</h4>
                    <p className="text-gray-600 leading-relaxed italic">
                      {selectedDetail.longDescription || "Medical research and verified data regarding this condition are provided to ensure public safety and awareness."}
                    </p>
                  </div>

                  <div className="bg-red-50 p-6 rounded-2xl border-l-4 border-red-600">
                    <h4 className="font-bold text-red-900 mb-2">How to Prevent it:</h4>
                    <ul className="text-red-800 text-sm space-y-2 list-disc pl-4">
                      {selectedDetail.preventionTips ? selectedDetail.preventionTips.map((tip: string, i: number) => (
                        <li key={i}>{tip}</li>
                      )) : (
                        <>
                          <li>Maintain proper hygiene and wash hands regularly.</li>
                          <li>Avoid contact with infected individuals.</li>
                          <li>Follow government and NCDC health protocols.</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedDetail(null)}
                  className="w-full mt-8 bg-gray-900 text-white py-4 rounded-xl font-bold uppercase text-sm tracking-widest hover:bg-black transition-colors"
                >
                  Close Advisory
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};