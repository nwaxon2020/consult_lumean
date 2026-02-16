'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { FaStar, FaTrash, FaPaperPlane, FaQuoteLeft, FaPlusCircle, FaChevronDown, FaExclamationTriangle } from 'react-icons/fa';

interface Review {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  timestamp: string;
}

const Reviews: React.FC = () => {
  const { user, signInWithGoogle } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // Modal State

  useEffect(() => { fetchReviews(); }, []);

  useEffect(() => {
    if (user && reviews.length > 0) {
      const existing = reviews.find(r => r.userId === user.uid);
      setUserReview(existing || null);
    } else if (!user) {
      setUserReview(null);
    }
  }, [user, reviews]);

  const fetchReviews = async () => {
    try {
      const q = query(collection(db, 'reviews'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const reviewsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Review[];
      setReviews(reviewsData);
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  const submitReview = async () => {
    if (!user || rating === 0 || !comment.trim()) return;
    setLoading(true);
    try {
      const reviewData = {
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Patient',
        userPhoto: user.photoURL || "",
        rating: Number(rating),
        comment: comment.trim(),
        timestamp: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'reviews'), reviewData);
      const newReview = { id: docRef.id, ...reviewData } as Review;
      setReviews(prev => [newReview, ...prev]);
      setUserReview(newReview);
      setRating(0);
      setComment('');
      toast.success('Review Published!');
    } catch (error: any) {
      toast.error('Failed to post');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!user || !userReview) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'reviews', userReview.id));
      setReviews(reviews.filter(r => r.id !== userReview.id));
      setUserReview(null);
      setShowDeleteConfirm(false);
      toast.success('Review Removed');
    } catch (error) {
      toast.error('Error deleting');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const averageRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0.0';

  return (
    <div className="max-w-3xl mx-auto space-y-6 relative">
      
      {/* 1. DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaExclamationTriangle size={20} />
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Delete Review?</h3>
                <p className="text-xs text-slate-500 font-medium mb-6">
                  This action cannot be undone. You will need to write a new review from scratch.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDelete}
                    disabled={loading}
                    className="flex-1 py-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-red-200"
                  >
                    {loading ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Header & Summary */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-sm font-black text-slate-200 uppercase tracking-widest italic">Patient Feedback</h2>
          <p className="text-[9px] text-blue-600 font-bold uppercase mt-0.5 tracking-wider">{reviews.length} Verified Reviews</p>
        </div>
        <div className="flex items-center bg-white px-3 py-1.5 rounded-lg border-2 border-blue-50 shadow-sm">
          <FaStar className="w-3 h-3 text-yellow-500 mr-2" />
          <span className="font-black text-slate-900 text-xs">{averageRating}</span>
        </div>
      </div>

      {/* 3. Input Section */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <AnimatePresence mode="wait">
          {!user ? (
            <motion.div key="guest" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-4 text-center">
              <FaStar className="w-5 h-5 text-blue-600 mx-auto mb-3 opacity-30" />
              <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-3">Want to share your experience?</h3>
              <button onClick={signInWithGoogle} className="px-6 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">Sign in to Review</button>
            </motion.div>
          ) : userReview ? (
            <motion.div key="posted" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-50/80 rounded-xl p-4 border border-slate-200 relative group">
              <FaQuoteLeft className="absolute top-2 left-2 text-slate-300 text-lg opacity-60" />
              <div className="flex items-center gap-2 mb-2 ml-6">
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Your Entry:</span>
                <div className="flex gap-0.5">
                  {[...Array(userReview.rating)].map((_, i) => <FaStar key={i} className="text-yellow-400 text-[10px]" />)}
                </div>
              </div>
              <p className="text-slate-800 font-medium italic text-xs leading-relaxed mb-4 ml-6">"{userReview.comment}"</p>
              <button 
                onClick={() => setShowDeleteConfirm(true)} 
                className="ml-6 text-red-600 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 hover:text-red-800"
              >
                <FaTrash size={10} /> Delete & Rewrite
              </button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="flex flex-col items-center">
                <div className="flex gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onMouseEnter={() => setHoveredRating(star)} onMouseLeave={() => setHoveredRating(0)} onClick={() => setRating(star)}>
                      <FaStar className={`text-2xl transition-all ${star <= (hoveredRating || rating) ? 'text-yellow-400 drop-shadow-sm' : 'text-slate-200'}`} />
                    </button>
                  ))}
                </div>
                <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest italic">Overall Satisfaction</span>
              </div>
              <textarea
                value={comment} onChange={(e) => setComment(e.target.value)}
                placeholder="Briefly describe your experience..."
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-xs font-medium text-slate-900 focus:border-blue-400 outline-none h-28 resize-none"
              />
              <button
                onClick={submitReview} disabled={loading || rating === 0 || !comment.trim()}
                className="w-full bg-slate-900 text-white font-black py-4 rounded-xl hover:bg-blue-700 uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-30 shadow-lg"
              >
                {loading ? <FaPlusCircle className="animate-spin" /> : <FaPaperPlane />} PUBLISH FEEDBACK
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Feed Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <FaChevronDown className="text-blue-600 text-[10px] animate-bounce" />
          <h3 className="text-[10px] font-black text-slate-200 uppercase tracking-widest italic">The Community Wall</h3>
        </div>
        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <motion.div key={review.id} layout className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-blue-200 transition-all group">
                <div className="flex gap-4">
                  <div className="shrink-0">
                    {review.userPhoto ? (
                      <img src={review.userPhoto} alt="" className="w-9 h-9 rounded-lg object-cover ring-2 ring-slate-100 shadow-sm" />
                    ) : (
                      <div className="w-9 h-9 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-xs uppercase">{review.userName.charAt(0)}</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1.5">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 tracking-tight italic uppercase">{review.userName}</h4>
                        <div className="flex gap-0.5 mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className={`text-[9px] ${i < review.rating ? 'text-yellow-400' : 'text-slate-200'}`} />
                          ))}
                        </div>
                      </div>
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{formatDate(review.timestamp)}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg group-hover:bg-blue-50/50 transition-colors">
                      <p className="text-slate-800 font-medium text-xs leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 bg-white border-2 border-dashed border-slate-200 rounded-xl">
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest italic">No public entries yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;