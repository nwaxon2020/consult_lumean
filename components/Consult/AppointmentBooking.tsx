'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { 
  collection, addDoc, query, where, onSnapshot, 
  orderBy, doc, updateDoc, serverTimestamp, Timestamp, 
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import { FaCreditCard, FaGift, FaPercent, FaLock, } from 'react-icons/fa';

import WeeklyScheduler from './WeeklyScheduler';
import PaymentGate from './PaymentGate';
import AdminDashboard from './AdminDashboard';

interface AppointmentBookingProps {
  onSessionSecured?: (type: 'chat' | 'voice') => void;
}

const AppointmentBooking: React.FC<AppointmentBookingProps> = ({ onSessionSecured }) => {
  const { user } = useAuth();
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [allBookedSlots, setAllBookedSlots] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [pendingBooking, setPendingBooking] = useState<{
    type: 'chat' | 'voice';
    price: number;
    isReschedule?: boolean;
    rescheduleCount?: number;
    originalAppointmentId?: string;
  } | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(false);

  const ADMIN_UID = "UKCd1iFnIcYzpkL3rmVK5iniNbU2";
  const isAdmin = user?.uid === ADMIN_UID;

  // Real-time Database Sync
  useEffect(() => {
    if (!user && !isAdmin) return;
    
    // Global listener for all paid slots
    const unsubGlobal = onSnapshot(
      query(collection(db, 'appointments'), where('paymentStatus', '==', 'paid')), 
      (snap) => setAllBookedSlots(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    let unsubDetails: () => void;
    if (isAdmin) {
      unsubDetails = onSnapshot(
        query(collection(db, 'appointments'), orderBy('createdAt', 'desc')), 
        (snap) => setAllAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      );
      
      const unsubTransactions = onSnapshot(
        query(collection(db, 'transactions'), orderBy('createdAt', 'desc')), 
        (snap) => setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      );
      
      return () => { 
        unsubGlobal(); 
        unsubDetails?.(); 
        unsubTransactions(); 
      };
    } else if (user) {
      unsubDetails = onSnapshot(
        query(collection(db, 'appointments'), where('userId', '==', user.uid)), 
        (snap) => setAllAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      );
      
      return () => { 
        unsubGlobal(); 
        unsubDetails?.(); 
      };
    }
  }, [user, isAdmin]);

  const handleServiceSelection = (
    type: 'chat' | 'voice', 
    price: number, 
    isReschedule: boolean = false,
    rescheduleCount: number = 0,
    originalAppointmentId?: string
  ) => {
    setPendingBooking({
      type,
      price,
      isReschedule,
      rescheduleCount,
      originalAppointmentId
    });
  };

  const handlePaymentSuccess = async () => {
    if (!user || !pendingBooking || !selectedDate || !selectedTime) return;
    
    try {
      setLoading(true);
      
      // Check if slot is still available
      const slotTaken = allBookedSlots.find(
        slot => slot.date === selectedDate && 
        slot.time === selectedTime && 
        slot.paymentStatus === 'paid' &&
        slot.userId !== user.uid
      );
      
      if (slotTaken) {
        toast.error("This slot was just taken. Please select another time.");
        setPendingBooking(null);
        setShowPayment(false);
        return;
      }

      const appointmentData = {
        date: selectedDate,
        time: selectedTime,
        serviceType: pendingBooking.type,
        paymentStatus: 'paid' as const,
        status: 'confirmed' as const,
        userId: user.uid,
        userName: user.displayName || 'Patient',
        lastUpdated: serverTimestamp(),
        rescheduleCount: pendingBooking.rescheduleCount || 0,
        originalBookingDate: pendingBooking.isReschedule ? Timestamp.now() : null
      };

      if (pendingBooking.isReschedule && pendingBooking.originalAppointmentId) {
        // Update existing appointment (reschedule)
        await updateDoc(doc(db, 'appointments', pendingBooking.originalAppointmentId), appointmentData);
        toast.success("Appointment rescheduled successfully!");
      } else {
        // Create new appointment
        await addDoc(collection(db, 'appointments'), {
          ...appointmentData,
          createdAt: serverTimestamp()
        });
        toast.success("Appointment booked successfully!");
      }
      
      // Log transaction if payment was made
      if (pendingBooking.price > 0) {
        await addDoc(collection(db, 'transactions'), {
          userName: user.displayName || 'Patient',
          userId: user.uid,
          amount: pendingBooking.price,
          serviceType: pendingBooking.isReschedule ? 'Reschedule Fee' : pendingBooking.type,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
          rescheduleCount: pendingBooking.rescheduleCount,
          createdAt: serverTimestamp()
        });
      }

      // Reset UI
      setShowPayment(false);
      setSelectedDate('');
      setSelectedTime('');
      setPendingBooking(null);
      
      if (onSessionSecured) {
        onSessionSecured(pendingBooking.type);
      }

    } catch (error) {
      console.error("Booking Error:", error);
      toast.error("Failed to process booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRescheduleInit = async (appointmentId: string) => {
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: 'rescheduling'
      });
    } catch (error) {
      console.error("Reschedule Init Error:", error);
      toast.error("Failed to initiate reschedule");
    }
  };

  const getPaymentButtonProps = () => {
    if (!selectedDate || !selectedTime) {
      return {
        text: 'Select Date & Time',
        disabled: true,
        className: 'bg-slate-100 text-slate-300 cursor-not-allowed'
      };
    }

    if (!pendingBooking) {
      return {
        text: 'Choose Service Type',
        disabled: true,
        className: 'bg-slate-100 text-slate-300 cursor-not-allowed'
      };
    }

    if (pendingBooking.price === 0) {
      return {
        text: 'Confirm Free Reschedule',
        disabled: false,
        className: 'bg-green-600 text-white hover:bg-green-700 animate-pulse shadow-lg shadow-green-600/30'
      };
    }

    return {
      text: `Pay ₦${pendingBooking.price.toLocaleString()} & ${pendingBooking.isReschedule ? 'Reschedule' : 'Book'}`,
      disabled: false,
      className: 'bg-blue-600 text-white hover:bg-blue-700 animate-pulse shadow-lg shadow-blue-600/30'
    };
  };

  const getBookingTypeIcon = () => {
    if (!pendingBooking) return null;
    if (pendingBooking.price === 0) return <FaGift className="text-green-500" />;
    if (pendingBooking.isReschedule) return <FaPercent className="text-amber-500" />;
    return <FaCreditCard className="text-blue-500" />;
  };

  const buttonProps = getPaymentButtonProps();

  if (isAdmin) {
    return (
      <AdminDashboard 
        allAppointments={allAppointments}
        transactions={transactions}
        totalRevenue={transactions.reduce((acc, t) => acc + (t.amount || 0), 0)}
      />
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8 h-[500px]">
        <div className="bg-[#0b141a] p-7 md:p-12 rounded-[1rem] md:rounded-[2.5rem] border border-white/5 text-center shadow-2xl max-w-sm w-full">
          <FaLock size={40} className="text-blue-500/20 mx-auto mb-6" />
          <h3 className="text-white font-black uppercase italic text-lg tracking-tighter">Sign In Required</h3>
          <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-4">Please sign in to access <span className='font-bold text-white'>Booking Schedule</span></p>
        </div>
      </div>
    );
  }
    

  return (
    <div className="max-w-4xl mx-auto p-3 md:p-4">
      <div className="bg-white rounded-lg md:rounded-[2.5rem] p-3 py-6 md:p-8 shadow-2xl">
        <WeeklyScheduler 
          selectedDate={selectedDate} 
          setSelectedDate={setSelectedDate} 
          selectedTime={selectedTime} 
          setSelectedTime={setSelectedTime} 
          bookedSlots={allBookedSlots} 
          currentUserId={user?.uid} 
          onServiceSelect={handleServiceSelection} 
          onRescheduleInit={handleRescheduleInit}
        />
        
        {/* Payment Button */}
        <div className="mt-10 md:space-y-3">
          {pendingBooking && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 mb-2"
            >
              {getBookingTypeIcon()}
              <span className="text-[10px] font-black uppercase tracking-wider">
                {pendingBooking.price === 0 && 'First Reschedule - Free'}
                {pendingBooking.price > 0 && pendingBooking.isReschedule && 'Reschedule - 50% Off'}
                {!pendingBooking.isReschedule && 'New Booking'}
              </span>
            </motion.div>
          )}
          
          <motion.button
            whileHover={!buttonProps.disabled ? { scale: 1.02 } : {}}
            whileTap={!buttonProps.disabled ? { scale: 0.98 } : {}}
            onClick={() => {
              if (pendingBooking?.price === 0) {
                handlePaymentSuccess();
              } else if (pendingBooking) {
                setShowPayment(true);
              }
            }}
            disabled={buttonProps.disabled || loading}
            className={`w-full py-4 md:py-6 rounded-lg md:rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] transition-all ${buttonProps.className}`}
          >
            {loading ? 'Processing...' : buttonProps.text}
          </motion.button>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPayment && pendingBooking && pendingBooking.price > 0 && (
          <PaymentGate 
            amount={pendingBooking.price} 
            serviceType={pendingBooking.type}
            isReschedule={pendingBooking.isReschedule}
            rescheduleCount={pendingBooking.rescheduleCount}
            onSuccess={handlePaymentSuccess} 
            onCancel={() => {
              setShowPayment(false);
              setPendingBooking(null);
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppointmentBooking;