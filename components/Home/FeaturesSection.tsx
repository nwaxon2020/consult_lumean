'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaClock, FaShieldAlt, FaUserMd } from 'react-icons/fa';

const features = [
  {
    title: '24/7 Availability',
    description: 'Access healthcare professionals anytime, anywhere',
    icon: FaClock,
    color: 'from-blue-400 to-blue-600'
  },
  {
    title: 'Secure Consultations',
    description: 'End-to-end encrypted voice calls and messages',
    icon: FaShieldAlt,
    color: 'from-green-400 to-green-600'
  },
  {
    title: 'Expert Doctors',
    description: 'Qualified and experienced medical professionals',
    icon: FaUserMd,
    color: 'from-purple-400 to-purple-600'
  }
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose DoctorConstancy?
          </h2>
          <p className="text-xl text-gray-600">
            We provide comprehensive healthcare solutions
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className={`inline-block p-3 rounded-lg bg-gradient-to-r ${feature.color} mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;