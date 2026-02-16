'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSun, FaCloudSun, FaMoon, FaCommentMedical, 
  FaPhone, FaTimes, FaBan, FaUserCircle, 
  FaClock, FaExchangeAlt, FaHistory,} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { APPOINTMENT_CONFIG, getBasePrice, getReschedulePrice } from '@/components/Consult/appointment';

interface WeeklySchedulerProps {
  selectedDate: string; 
  setSelectedDate: (date: string) => void;
  selectedTime: string; 
  setSelectedTime: (time: string) => void;
  bookedSlots: any[]; 
  currentUserId?: string;
  onServiceSelect: (service: 'chat' | 'voice', price: number, isReschedule?: boolean, rescheduleCount?: number, originalAppointmentId?: string) => void;
  onRescheduleInit: (appointmentId: string) => Promise<void>;
}

const WeeklyScheduler: React.FC<WeeklySchedulerProps> = ({ 
  selectedDate, setSelectedDate, selectedTime, setSelectedTime, 
  bookedSlots, currentUserId, onServiceSelect, onRescheduleInit 
}) => {
  const [showChoice, setShowChoice] = useState(false);
  const [showRescheduleConfirm, setShowRescheduleConfirm] = useState(false);
  const [selectedSlotForReschedule, setSelectedSlotForReschedule] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Find user's active session (paid and not expired)
  const mySession = useMemo(() => {
    return bookedSlots.find(slot => 
      slot.userId === currentUserId && 
      slot.paymentStatus === 'paid' &&
      new Date(slot.date) >= new Date(new Date().setHours(0,0,0,0))
    );
  }, [bookedSlots, currentUserId]);

  // Check if a slot can be rescheduled (more than cutoff hours away)
  const canReschedule = (appointmentDate: string, appointmentTime: string) => {
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    const hoursDiff = (appointmentDateTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
    return hoursDiff > APPOINTMENT_CONFIG.reschedule.cutoffHours;
  };

  // Get week days with availability status
  const getWeekDays = () => {
    const days = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      const fullDateStr = date.toISOString().split('T')[0];
      
      const bookedCount = bookedSlots.filter(s => 
        s.date === fullDateStr && 
        s.paymentStatus === 'paid'
      ).length;
      
      const isFull = bookedCount >= APPOINTMENT_CONFIG.maxSlotsPerDay;
      const isPast = date < new Date(new Date().setHours(0,0,0,0));
      
      days.push({
        fullDate: fullDateStr,
        dayName: i === 0 ? "Today" : date.toLocaleDateString('en-US', { weekday: 'short' }),
        dateNum: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        isFull,
        isPast,
        availableSlots: APPOINTMENT_CONFIG.maxSlotsPerDay - bookedCount
      });
    }
    return days;
  };

  // Filter available times based on selected date and current time
  const getAvailableSlots = (slots: string[]) => {
    if (!selectedDate) return [];
    
    const selectedDateTime = new Date(selectedDate);
    const today = new Date();
    const isToday = selectedDateTime.toDateString() === today.toDateString();
    
    let availableSlots = [...slots];
    
    if (isToday) {
      // For today, only show future times
      const currentHour = today.getHours();
      availableSlots = slots.filter(time => {
        const slotHour = parseInt(time.split(':')[0]);
        return slotHour > currentHour;
      });
    }
    
    return availableSlots;
  };

  const handleTimeClick = (time: string) => {
    if (!selectedDate) return toast.error("Select a day first!");
    
    const selectedDateTime = new Date(`${selectedDate}T${time}`);
    const now = new Date();
    
    // Check if the selected time is in the past
    if (selectedDateTime < now) {
      return toast.error("Cannot select past time slots");
    }
    
    setSelectedTime(time);
    
    if (mySession) {
      // Check if user can reschedule their existing session
      if (!canReschedule(mySession.date, mySession.time)) {
        const hoursLeft = Math.round((new Date(`${mySession.date}T${mySession.time}`).getTime() - now.getTime()) / (1000 * 60 * 60));
        return toast.error(`Cannot reschedule within ${APPOINTMENT_CONFIG.reschedule.cutoffHours} hours of appointment. ${hoursLeft} hours remaining.`);
      }
      
      setSelectedSlotForReschedule(mySession);
      setShowRescheduleConfirm(true);
    } else {
      setShowChoice(true);
    }
  };

  const handleRescheduleConfirm = () => {
    if (!selectedSlotForReschedule) return;
    
    const basePrice = getBasePrice(selectedTime, selectedSlotForReschedule.serviceType);
    const reschedulePrice = getReschedulePrice(
      selectedSlotForReschedule.rescheduleCount || 0, 
      basePrice
    );
    
    onServiceSelect(
      selectedSlotForReschedule.serviceType, 
      reschedulePrice, 
      true, 
      (selectedSlotForReschedule.rescheduleCount || 0) + 1,
      selectedSlotForReschedule.id
    );
    
    onRescheduleInit(selectedSlotForReschedule.id);
    setShowRescheduleConfirm(false);
    setSelectedSlotForReschedule(null);
    setShowChoice(false);
    setSelectedTime('');
  };

  const TimeGroup = ({ title, icon: Icon, slots, color }: any) => {
    const isDaySelected = selectedDate !== '';
    const availableSlots = getAvailableSlots(slots);
    const hasAvailableSlots = availableSlots.length > 0;

    if (!isDaySelected || !hasAvailableSlots) return null;

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.2 }}
        className="space-y-4"
      >
        <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] ${color}`}>
          <Icon size={14} /> {title}
          <span className="ml-auto text-[8px] text-slate-400">
            {availableSlots.length} slots
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {availableSlots.map((time: string) => {
            const booking = bookedSlots.find(slot => 
              slot.date === selectedDate && 
              slot.time === time && 
              slot.paymentStatus === 'paid'
            );
            
            const isTaken = !!booking && booking.userId !== currentUserId;
            const isMine = booking?.userId === currentUserId;
            const isActive = selectedTime === time;

            return (
              <button 
                key={time} 
                disabled={isTaken}
                onClick={() => !isTaken && handleTimeClick(time)} 
                className={`py-3 md:py-3.5 rounded-lg md:rounded-2xl text-[11px] font-black border-2 transition-all duration-200
                  ${isTaken ? 
                      'bg-slate-100 text-slate-400 border-slate-100 cursor-not-allowed opacity-50' 
                    : isMine ? 
                      'bg-green-50 text-green-600 border-green-200 hover:border-green-300' 
                    : isActive ? 
                      'bg-blue-600 text-white border-blue-600 shadow-lg scale-105' 
                    : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-blue-400 hover:bg-blue-50'
                  }`}
              >
                {isTaken ? 'Booked' : isMine ? 'Your Slot' : time}
              </button>
            );
          })}
        </div>
      </motion.div>
    );
  };

  const days = getWeekDays();

  return (
    <div className="space-y-6 relative">
      {/* Reschedule Confirmation Modal */}
      <AnimatePresence>
        {showRescheduleConfirm && selectedSlotForReschedule && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[10003] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-6"
            onClick={() => setShowRescheduleConfirm(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              className="bg-white rounded-lg md:rounded-[2.5rem] p-6 md:p-8 max-w-sm w-full text-center shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-lg md:rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
                <FaExchangeAlt size={30} className="text-amber-500" />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase italic mb-2">Reschedule Appointment?</h3>
              <p className="text-[10px] text-slate-400 uppercase mb-4">
                Current: {new Date(selectedSlotForReschedule.date).toLocaleDateString('en-US', { weekday: 'short' })} {selectedSlotForReschedule.date} @ {selectedSlotForReschedule.time}
              </p>
              
              {selectedSlotForReschedule.rescheduleCount < APPOINTMENT_CONFIG.reschedule.freeRescheduleCount ? (
                <div className="bg-green-50 p-4 rounded-xl mb-6">
                  <p className="text-[10px] font-black text-green-600 uppercase">✨ First Reschedule FREE</p>
                </div>
              ) : (
                <div className="bg-amber-50 p-4 rounded-xl mb-6">
                  <p className="text-[10px] font-black text-amber-600 uppercase">
                    Reschedule Fee: 50% off regular price
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => {
                    setShowRescheduleConfirm(false);
                    setSelectedSlotForReschedule(null);
                  }} 
                  className="py-4 bg-slate-100 text-slate-500 rounded-xl font-black text-[10px] uppercase"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRescheduleConfirm} 
                  className="py-4 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-slate-900/20"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Service Selection Modal */}
      <AnimatePresence>
        {showChoice && !mySession && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[10003] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowChoice(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              className="bg-white p-6 md:p-8 rounded-lg md:rounded-[2.5rem] shadow-2xl w-full max-w-sm text-center relative"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowChoice(false)} 
                className="absolute top-6 right-6 text-slate-300 hover:text-slate-900"
              >
                <FaTimes size={20} />
              </button>
              <h3 className="text-xs font-black uppercase mb-6 italic text-slate-400">Select Consultation Type</h3>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => { 
                    const price = getBasePrice(selectedTime, 'chat');
                    onServiceSelect('chat', price); 
                    setShowChoice(false); 
                  }} 
                  className="p-5 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-between hover:bg-blue-600 transition-all group"
                >
                  <div className="flex items-center gap-4 text-left font-black uppercase text-[11px]">
                    <FaCommentMedical className="text-blue-400 group-hover:scale-110 transition-transform" /> Chat Session
                  </div>
                  <span className="text-xs font-black">
                    ₦{getBasePrice(selectedTime, 'chat')}
                  </span>
                </button>

                <button 
                  onClick={() => { 
                    const price = getBasePrice(selectedTime, 'voice');
                    onServiceSelect('voice', price); 
                    setShowChoice(false); 
                  }} 
                  className="p-5 bg-white border-2 border-slate-100 rounded-[1.5rem] flex items-center justify-between hover:border-blue-600 transition-all group"
                >
                  <div className="flex items-center gap-4 text-left font-black uppercase text-[11px]">
                    <FaPhone className="text-blue-600 group-hover:scale-110 transition-transform" /> Voice Call
                  </div>
                  <span className="text-xs font-black text-blue-600">
                    ₦{getBasePrice(selectedTime, 'voice')}
                  </span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Day Selection */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar px-1">
        {days.map((day) => (
          <button 
            key={day.fullDate} 
            onClick={() => !day.isPast && !day.isFull && setSelectedDate(day.fullDate)} 
            disabled={day.isPast || day.isFull}
            className={`flex-1 min-w-[70px] py-3 rounded-[1.2rem] border-2 transition-all flex flex-col items-center gap-1 relative
              ${selectedDate === day.fullDate ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-100'}
              ${(day.isPast || day.isFull) ? 'opacity-30 cursor-not-allowed grayscale' : 'hover:border-blue-200 hover:bg-blue-50'}`}
          >
            <span className="text-[7px] font-black uppercase tracking-tighter">{day.dayName}</span>
            <span className="text-sm font-black italic">
              {day.dateNum}
            </span>
            <span className="text-[6px] uppercase">{day.month}</span>
            {day.availableSlots > 0 && !day.isFull && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full text-[6px] text-white flex items-center justify-center font-black">
                {day.availableSlots}
              </span>
            )}
            {day.isFull && <FaBan className="absolute -top-1 -right-1 text-red-500 text-xs" />}
          </button>
        ))}
      </div>

      {/* Current Booking Info */}
      <AnimatePresence mode="wait">
        {mySession && (
          <motion.div 
            key="info-card"
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }} 
            className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
                <FaUserCircle size={24} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Active Booking</p>
                <h4 className="text-lg font-black italic uppercase leading-none mt-1">Dr. Appointment</h4>
              </div>
              <div className="text-right">
                {canReschedule(mySession.date, mySession.time) ? (
                  <button
                    onClick={() => {
                      setSelectedSlotForReschedule(mySession);
                      setShowRescheduleConfirm(true);
                    }}
                    className="bg-black/50 hover:bg-blue-600 text-white px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2 border border-white/10"
                  >
                    <FaExchangeAlt size={10} /> 
                    {mySession.rescheduleCount < APPOINTMENT_CONFIG.reschedule.freeRescheduleCount 
                      ? 'Free Reschedule' 
                      : 'Reschedule (50% off)'}
                  </button>
                ) : (
                  <div className="bg-red-500/20 text-red-400 px-3 py-2 rounded-xl text-[9px] font-black uppercase flex items-center gap-2">
                    <FaClock size={10} /> Too Late
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-2 text-green-400">
                 <FaClock size={10} />
                 <span className="text-[9px] font-black uppercase italic">
                   {new Date(mySession.date).toLocaleDateString('en-US', { weekday: 'short' })}, {mySession.date} @ {mySession.time}
                 </span>
              </div>
              <div className="flex items-center gap-2">
                {mySession.rescheduleCount > 0 && (
                  <div className="px-2 py-1 bg-amber-500/20 rounded-full text-[8px] font-black text-amber-400 uppercase">
                    <FaHistory className="inline mr-1" size={8} />
                    {mySession.rescheduleCount}x
                  </div>
                )}
                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                  mySession.serviceType === 'chat' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                }`}>
                  {mySession.serviceType}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Time Slots */}
      {selectedDate ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <TimeGroup title="Morning" icon={FaSun} slots={APPOINTMENT_CONFIG.slots.morning} color="text-orange-500" />
          <TimeGroup title="Mid-Day" icon={FaCloudSun} slots={APPOINTMENT_CONFIG.slots.midDay} color="text-blue-500" />
          <TimeGroup title="Night" icon={FaMoon} slots={APPOINTMENT_CONFIG.slots.night} color="text-indigo-600" />
        </div>) :(<p className='text-gray-300 p-4 text-center font-bold'>Select a day to unlock time</p>)}
    </div>
  );
};

export default WeeklyScheduler;