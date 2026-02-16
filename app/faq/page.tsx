'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaMinus, FaEnvelope, FaWhatsapp, FaMapMarkerAlt } from 'react-icons/fa';

const faqs = [
  {
    question: "How do I book a consultation with Dr. Nwachukwu?",
    answer: "You can book a session by clicking the 'Consult' link in the navigation bar. Choose your preferred service (Voice or Video), select a date, and proceed to payment."
  },
  {
    question: "Is my medical data secure?",
    answer: "Absolutely. We use end-to-end encryption for all calls and clinical-grade security for your medical records. Your privacy is our top priority."
  },
  {
    question: "What happens if I miss my scheduled time?",
    answer: "We offer a 15-minute grace period. If you miss the session entirely, you can reschedule via the 'Account' section, provided you notify us 2 hours in advance."
  },
  {
    question: "Can I get a prescription after a voice consultation?",
    answer: "Yes, depending on the diagnosis. Digital prescriptions are sent directly to your email and stored in your patient dashboard."
  }
];

const FAQPage = () => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-blue-900 mb-4 tracking-tight">How can we <span className="text-blue-500">help?</span></h1>
          <p className="text-gray-500 font-medium italic">Frequently asked questions about our services</p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <button 
                onClick={() => setActiveIdx(activeIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 md:p-6 text-left"
              >
                <span className="font-bold text-blue-900">{faq.question}</span>
                <div className={`p-2 rounded-full transition-colors ${activeIdx === idx ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
                  {activeIdx === idx ? <FaMinus size={12} /> : <FaPlus size={12} />}
                </div>
              </button>
              <AnimatePresence>
                {activeIdx === idx && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 md:px-6 pb-6 text-gray-500 text-sm leading-relaxed border-t border-gray-50 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Contact Footer */}
        <div className="mt-20 bg-blue-900 rounded-lg md:rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl font-black mb-2 uppercase tracking-tighter">Still have questions?</h2>
              <p className="text-blue-200 text-sm">Our medical support team is available 24/7 for your enquiries.</p>
            </div>
            
            <div className="flex flex-col gap-4 w-full md:w-auto">
              <a href="mailto:princenwachukwu308@yahoo.com" className="flex justify-center items-center gap-3 bg-white/10 hover:bg-white/20 p-4 rounded-2xl transition-all border border-white/10">
                <FaEnvelope className="text-blue-400" />
                <span className="font-bold text-sm">support@drnwachukwu.com</span>
              </a>
              <a href="https://wa.me/2347034632037" className="flex justify-center items-center gap-3 bg-green-500 hover:bg-green-600 p-4 rounded-2xl transition-all shadow-lg shadow-green-500/20">
                <FaWhatsapp className="text-white" />
                <span className="font-bold text-sm">Chat on WhatsApp</span>
              </a>
            </div>
          </div>
          
          {/* Decorative Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default FAQPage;