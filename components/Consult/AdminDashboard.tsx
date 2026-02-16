'use client';

import React, { useState } from 'react';
import { 
  FaTrash, FaUserShield, FaExclamationTriangle, 
  FaCommentMedical, FaPhone, FaHistory, 
  FaTimes, FaSpinner, FaLock
} from 'react-icons/fa';
import { db } from '@/lib/firebase';
import { doc, deleteDoc, writeBatch, collection, getDocs } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import toast from 'react-hot-toast';

interface AdminDashboardProps {
  allAppointments: any[];
  transactions: any[];
  totalRevenue: number;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  allAppointments, transactions, totalRevenue
}) => {
  const { user } = useAuth();
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [showApptWipeModal, setShowApptWipeModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleteItemName, setDeleteItemName] = useState('');
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [authError, setAuthError] = useState('');
  const [wipeType, setWipeType] = useState<'transactions' | 'appointments' | null>(null);

  const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_KEY;

  // Check if current user is admin
  const isAdmin = user?.uid === ADMIN_UID;

  // Re-authenticate user before sensitive operations
  const reauthenticate = async () => {
    if (!user || !user.email) {
      throw new Error('No user logged in');
    }

    const auth = getAuth();
    const credential = EmailAuthProvider.credential(user.email, password);
    
    try {
      await reauthenticateWithCredential(user, credential);
      setAuthError('');
      return true;
    } catch (error: any) {
      console.error('Reauthentication error:', error);
      if (error.code === 'auth/wrong-password') {
        setAuthError('Incorrect password');
      } else if (error.code === 'auth/too-many-requests') {
        setAuthError('Too many failed attempts. Please try again later.');
      } else {
        setAuthError('Authentication failed. Please try again.');
      }
      return false;
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    setProcessingId(id);
    try {
      await deleteDoc(doc(db, 'appointments', id));
      toast.success("Appointment deleted successfully");
      setConfirmDelete(null);
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error?.message || "Failed to delete appointment");
    } finally {
      setProcessingId(null);
    }
  };

  const handleWipeTransactions = async () => {
    const isAuthenticated = await reauthenticate();
    if (!isAuthenticated) return;

    setIsProcessing(true);
    try {
      const batch = writeBatch(db);
      const snapshot = await getDocs(collection(db, 'transactions'));
      
      if (snapshot.empty) {
        toast.error("No transactions to wipe");
        setShowWipeModal(false);
        setPassword('');
        setWipeType(null);
        return;
      }

      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      toast.success(`Successfully wiped ${snapshot.size} transactions`);
      setShowWipeModal(false);
      setPassword('');
      setWipeType(null);
    } catch (error: any) {
      console.error("Wipe error:", error);
      toast.error(error?.message || "Failed to wipe transactions");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWipeAppointments = async () => {
    const isAuthenticated = await reauthenticate();
    if (!isAuthenticated) return;

    setIsProcessing(true);
    try {
      const batch = writeBatch(db);
      const snapshot = await getDocs(collection(db, 'appointments'));
      
      if (snapshot.empty) {
        toast.error("No appointments to wipe");
        setShowApptWipeModal(false);
        setPassword('');
        setWipeType(null);
        return;
      }

      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      toast.success(`Successfully wiped ${snapshot.size} appointments`);
      setShowApptWipeModal(false);
      setPassword('');
      setWipeType(null);
    } catch (error: any) {
      console.error("Wipe error:", error);
      toast.error(error?.message || "Failed to wipe appointments");
    } finally {
      setIsProcessing(false);
    }
  };

  const closeAllModals = () => {
    setShowWipeModal(false);
    setShowApptWipeModal(false);
    setConfirmDelete(null);
    setPassword('');
    setAuthError('');
    setWipeType(null);
  };

  // If not admin, don't render
  if (!isAdmin) {
    return (
      <div className="max-w-6xl mx-auto p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
          <FaLock size={40} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Access Denied</h2>
          <p className="text-red-600">You do not have administrator privileges.</p>
        </div>
      </div>
    );
  }

  // Delete Confirmation Modal - Simple overlay
  if (confirmDelete) {
    return (
      <div className="fixed inset-0 z-[10005] bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
          <button
            onClick={closeAllModals}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <FaTimes size={18} />
          </button>

          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaExclamationTriangle size={28} className="text-red-500" />
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Appointment?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this appointment from <span className="font-semibold">{deleteItemName}</span>? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={closeAllModals}
                disabled={processingId === confirmDelete}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteAppointment(confirmDelete)}
                disabled={processingId === confirmDelete}
                className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processingId === confirmDelete ? (
                  <>
                    <FaSpinner className="animate-spin" size={14} />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Wipe Transactions Modal - Simple overlay
  if (showWipeModal) {
    return (
      <div className="fixed inset-0 z-[10005] bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
          <button
            onClick={closeAllModals}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <FaTimes size={18} />
          </button>

          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaExclamationTriangle size={28} className="text-red-500" />
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2">Wipe All Transactions</h3>
            <p className="text-sm text-gray-500 mb-4">
              This will permanently delete ALL transaction records. This action requires your Firebase password to confirm.
            </p>
            
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2 text-left">
                Enter your Firebase account password:
              </p>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setAuthError('');
                }}
                placeholder="Your Firebase password"
                className={`w-full p-3 border rounded-xl text-center ${
                  authError ? 'border-red-500 bg-red-50' : 'border-gray-200'
                }`}
                autoFocus
              />
              {authError && (
                <p className="text-xs text-red-500 mt-2 text-left">{authError}</p>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={closeAllModals}
                disabled={isProcessing}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleWipeTransactions}
                disabled={isProcessing || !password}
                className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <FaSpinner className="animate-spin" size={14} />
                    <span>Wiping...</span>
                  </>
                ) : (
                  <span>Wipe All</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Wipe Appointments Modal - Simple overlay
  if (showApptWipeModal) {
    return (
      <div className="fixed inset-0 z-[10005] bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
          <button
            onClick={closeAllModals}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <FaTimes size={18} />
          </button>

          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaExclamationTriangle size={28} className="text-red-500" />
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2">Wipe All Appointments</h3>
            <p className="text-sm text-gray-500 mb-4">
              This will permanently delete ALL appointment records. This action requires your Firebase password to confirm.
            </p>
            
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2 text-left">
                Enter your Firebase account password:
              </p>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setAuthError('');
                }}
                placeholder="Your Firebase password"
                className={`w-full p-3 border rounded-xl text-center ${
                  authError ? 'border-red-500 bg-red-50' : 'border-gray-200'
                }`}
                autoFocus
              />
              {authError && (
                <p className="text-xs text-red-500 mt-2 text-left">{authError}</p>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={closeAllModals}
                disabled={isProcessing}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleWipeAppointments}
                disabled={isProcessing || !password}
                className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <FaSpinner className="animate-spin" size={14} />
                    <span>Wiping...</span>
                  </>
                ) : (
                  <span>Wipe All</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter appointments
  const voiceAppointments = allAppointments.filter(a => a.serviceType === 'voice');
  const chatAppointments = allAppointments.filter(a => a.serviceType === 'chat');

  // Main Admin Dashboard
  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      {/* Admin Header */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <FaUserShield size={28} />
            </div>
            <div>
              <p className="text-xs text-blue-300 font-medium uppercase tracking-wider">
                Administrator • {user?.email}
              </p>
              <h2 className="text-2xl font-bold">Command Center</h2>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Total Revenue</p>
            <p className="text-3xl font-bold text-green-400">₦{totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setShowWipeModal(true)}
          className="p-4 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 flex items-center justify-center gap-2"
        >
          <FaHistory size={14} />
          <span>Wipe All Transactions</span>
        </button>

        <button
          onClick={() => setShowApptWipeModal(true)}
          className="p-4 bg-white border-2 border-red-100 rounded-xl text-red-600 font-semibold hover:bg-red-50 hover:border-red-200 flex items-center justify-center gap-2"
        >
          <FaTrash size={14} />
          <span>Wipe All Appointments</span>
        </button>
      </div>

      {/* Appointments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voice Appointments */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaPhone className="text-green-500" />
            <span>Voice Appointments ({voiceAppointments.length})</span>
          </h3>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {voiceAppointments.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No voice appointments</p>
            ) : (
              voiceAppointments.map(apt => (
                <div key={apt.id} className="group relative">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{apt.userName || 'Anonymous'}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {apt.date} at {apt.time}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setConfirmDelete(apt.id);
                          setDeleteItemName(apt.userName || 'Anonymous');
                        }}
                        disabled={processingId === apt.id}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        {processingId === apt.id ? (
                          <FaSpinner className="animate-spin" size={14} />
                        ) : (
                          <FaTrash size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Appointments */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaCommentMedical className="text-blue-500" />
            <span>Chat Appointments ({chatAppointments.length})</span>
          </h3>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {chatAppointments.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No chat appointments</p>
            ) : (
              chatAppointments.map(apt => (
                <div key={apt.id} className="group relative">
                  <div className="p-4 bg-blue-50/30 rounded-xl border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{apt.userName || 'Anonymous'}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {apt.date} at {apt.time}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setConfirmDelete(apt.id);
                          setDeleteItemName(apt.userName || 'Anonymous');
                        }}
                        disabled={processingId === apt.id}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        {processingId === apt.id ? (
                          <FaSpinner className="animate-spin" size={14} />
                        ) : (
                          <FaTrash size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaHistory className="text-purple-500" />
          <span>Transaction History ({transactions.length})</span>
        </h3>
        
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {transactions.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No transactions yet</p>
          ) : (
            transactions.map(t => (
              <div key={t.id} className="p-3 hover:bg-gray-50 rounded-xl border-b border-gray-100 last:border-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{t.userName || 'Anonymous'}</p>
                    <p className="text-xs text-gray-500 uppercase">{t.serviceType || 'Payment'}</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">₦{t.amount?.toLocaleString() || '0'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;