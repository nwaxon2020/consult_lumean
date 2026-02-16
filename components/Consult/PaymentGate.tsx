'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaLock,
  FaShieldAlt,
  FaTimes,
  FaSpinner,
  FaCheckCircle,
  FaCreditCard,
  FaGift,
  FaPercent
} from 'react-icons/fa';

interface PaymentGateProps {
  amount: number;
  serviceType: 'chat' | 'voice';
  isReschedule?: boolean;
  rescheduleCount?: number;
  onSuccess: () => Promise<void>;
  onCancel: () => void;
}

const PaymentGate: React.FC<PaymentGateProps> = ({
  amount,
  serviceType,
  isReschedule,
  rescheduleCount = 0,
  onSuccess,
  onCancel
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isProcessing && !isSuccess) {
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prev + 2;
        });
      }, 40);
      
      return () => clearInterval(timer);
    }
  }, [isProcessing, isSuccess]);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await onSuccess();
      setIsSuccess(true);
      setTimeout(() => {
        onCancel();
      }, 2000);
    } catch (error) {
      console.error('Payment Failed:', error);
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const getBadge = () => {
    if (amount === 0) {
      return {
        icon: FaGift,
        text: 'FREE RESCHEDULE',
        color: 'text-green-500',
        bg: 'bg-green-50'
      };
    }
    if (isReschedule) {
      return {
        icon: FaPercent,
        text: '50% OFF • RESCHEDULE',
        color: 'text-amber-500',
        bg: 'bg-amber-50'
      };
    }
    return {
      icon: FaCreditCard,
      text: 'NEW BOOKING',
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    };
  };

  const badge = getBadge();
  const BadgeIcon = badge.icon;

  return (
    <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="bg-white w-full max-w-sm rounded-lg md:rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
          <motion.div 
            className={`h-full transition-colors ${isSuccess ? 'bg-green-500' : 'bg-blue-600'}`}
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
          />
        </div>

        {/* Close button */}
        {!isProcessing && !isSuccess && (
          <button
            onClick={onCancel}
            className="absolute top-6 right-6 text-slate-300 hover:text-slate-900 transition-colors"
          >
            <FaTimes size={18} />
          </button>
        )}

        <div className="text-center">
          {/* Icon */}
          <motion.div 
            animate={isSuccess ? { 
              scale: [1, 1.2, 1],
              rotate: [0, 360, 360]
            } : {}}
            transition={{ duration: 0.5 }}
            className={`w-16 h-16 rounded-lg md:rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm transition-all ${badge.bg}`}
          >
            {isSuccess ? (
              <FaCheckCircle size={32} className="text-green-500" />
            ) : isProcessing ? (
              <FaSpinner size={28} className="text-blue-600 animate-spin" />
            ) : (
              <BadgeIcon size={28} className={badge.color} />
            )}
          </motion.div>

          {/* Status */}
          <motion.p 
            key={isSuccess ? 'success' : isProcessing ? 'processing' : 'checkout'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 transition-colors duration-500 ${
              isSuccess ? 'text-green-500' : isProcessing ? 'text-blue-500' : badge.color
            }`}
          >
            {isSuccess ? 'Payment Confirmed' : isProcessing ? 'Processing Payment' : badge.text}
          </motion.p>

          {/* Amount */}
          <h2 className="text-4xl font-black text-slate-900 italic tracking-tighter mb-2">
            ₦{amount.toLocaleString()}
          </h2>

          {/* Service Info */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full mb-8">
            <div className={`w-1.5 h-1.5 rounded-full ${isSuccess ? 'bg-green-500' : 'bg-blue-500'} animate-pulse`} />
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
              {serviceType.toUpperCase()} • {isReschedule ? `Reschedule #${rescheduleCount}` : 'New Booking'}
            </p>
          </div>

          {/* Payment Button */}
          <div className="space-y-3 mb-8">
            <button
              disabled={isProcessing || isSuccess}
              onClick={handlePayment}
              className={`w-full py-5 text-white rounded-lg md:rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 
                ${isProcessing || isSuccess ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-blue-600 shadow-blue-900/20'}`}
            >
              {isProcessing ? (
                <><FaSpinner className="animate-spin" size={12} /> Processing...</>
              ) : isSuccess ? (
                <><FaCheckCircle size={12} /> Success</>
              ) : (
                <><FaLock size={12} /> Pay Now</>
              )}
            </button>

            {!isProcessing && !isSuccess && (
              <button 
                onClick={onCancel} 
                className="w-full py-2 text-slate-400 font-black uppercase text-[9px] tracking-widest hover:text-red-500 transition-colors"
              >
                Cancel Transaction
              </button>
            )}
          </div>

          {/* Security Footer */}
          <div className="flex items-center justify-center gap-3 pt-6 border-t border-slate-50">
            <FaShieldAlt className="text-blue-500" size={12} />
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
              Secured by Flutterwave • 256-bit SSL
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentGate;