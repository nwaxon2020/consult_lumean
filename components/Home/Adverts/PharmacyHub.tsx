'use client';
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingCart, FaTimes, FaPills, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export const PharmacyHub = ({ advert }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPayment, setShowPayment] = useState(false); // Added for payment overlay
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
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
          <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl w-fit mb-4"><FaPills size={24} /></div>
          <h2 className="text-3xl font-black mb-2">{advert.title}</h2>
          <p className="text-white/90 text-lg mb-6">Quality medications at affordable prices.</p>
          <button className="w-fit px-6 py-2 bg-white text-blue-900 rounded-xl font-bold uppercase tracking-wider">Shop Now</button>
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
                <h2 className="text-2xl font-bold text-blue-900">{advert.title}</h2>
                <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><FaTimes size={24} /></button>
              </div>
              
              <button 
                onClick={() => scroll('left')}
                className="hidden md:flex absolute left-4 top-1/2 z-20 bg-white/90 p-3 rounded-full shadow-lg text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
              >
                <FaChevronLeft size={20} />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="hidden md:flex absolute right-4 top-1/2 z-20 bg-white/90 p-3 rounded-full shadow-lg text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
              >
                <FaChevronRight size={20} />
              </button>
              
              <div ref={scrollRef} className="overflow-y-auto md:overflow-y-hidden md:overflow-x-auto scrollbar-hide scroll-smooth">
                <div className="flex flex-col md:flex-row md:flex-nowrap gap-6 p-6 md:p-10 md:pr-20 min-h-fit">
                  {advert.products.map((product: any) => (
                    <motion.div key={product.id} whileHover={{ y: -5 }} className="flex-none w-full md:w-[280px] bg-white rounded-xl shadow-lg p-4">
                      <div className="h-40 bg-cover bg-center rounded-lg mb-4" style={{ backgroundImage: `url(${product.image})` }} />
                      <h3 className="font-bold text-gray-800 truncate">{product.name}</h3>
                      <p className="text-xs text-gray-500 mb-2">{product.manufacturer}</p>
                      <div className="flex justify-between items-center mt-4">
                        <span className="font-bold text-blue-600">₦{product.price.toLocaleString()}</span>
                        {/* Modified button to open payment overlay */}
                        <button 
                          onClick={() => setShowPayment(true)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                        >
                          <FaShoppingCart size={14} /> Buy
                        </button>
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

      {/* Payment Overlay */}
      <AnimatePresence>
        {showPayment && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowPayment(false)}
          >
            <motion.div 
              initial={{ scale: 0.8 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0.8 }}
              className="bg-white p-8 rounded-2xl shadow-2xl text-center relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowPayment(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
              >
                <FaTimes size={20} />
              </button>
              <h3 className="text-xl font-bold text-gray-900 mb-4 px-8">fix payment method latter</h3>
              <button 
                onClick={() => setShowPayment(false)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};