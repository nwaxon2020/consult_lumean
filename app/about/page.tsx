// pages/about.tsx
'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaHospital, FaHeart, FaTrophy, FaStethoscope, FaClock, FaUsers, FaGlobe } from 'react-icons/fa';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Doctor Profile Section */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-16"
        >
            <div className="relative h-64 bg-gray-700" 
                style={{ backgroundImage: `url(/heroBg3.jpg)`, backgroundRepeat: "no-repeat", 
                backgroundBlendMode:"multiply", backgroundPosition:"center", backgroundSize:"cover" }}
            >
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                    <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className="w-40 h-40 rounded-full border-4 border-white overflow-hidden shadow-xl"
                    >
                    <img
                        src="https://www.upwork.com/profile-portraits/c1xdNdDfBioYemExni0Bp_U_tbmyUwc4pDmIVNzxDfxcVNYhhV0D-hN1QGKRV2tufn" {/* "/doc.png" */}
                        alt="Dr. Smith"
                        className="w-full h-full object-cover"
                    />
                    </motion.div>
                </div>
            </div>
            
            <div className="pt-24 pb-8 px-8 text-center">
           <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-2"
            >
              Dr. Prince.N <br />
            
              <span className="block text-sm font-medium text-gray-600">
                Email: 
                <a href="mailto:docPrince.N@testemail.com" className="ml-1 hover:underline">
                  docPrince.N@testemail.com
                </a>
              </span>
            
              <span className="block text-sm font-medium text-gray-600">
                Contact: 
                <a href="tel:+013440000000" className="ml-1 hover:underline">
                  +01-344-000000
                </a>
              </span>
            </motion.h1>
            
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-xl text-blue-600 font-semibold mb-4"
            >
                Senior Cardiologist & Internal Medicine Specialist
            </motion.p>
            
            <div className="flex justify-center space-x-8 mb-8">
                <div className="flex items-center">
                <FaGraduationCap className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-gray-600">20+ years experience</span>
                </div>
                <div className="flex items-center">
                <FaHospital className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-gray-600">10,000+ patients</span>
                </div>
            </div>
            </div>
        </motion.div>

        {/* Qualifications & Experience */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
            <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl p-8"
            >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FaGraduationCap className="w-6 h-6 text-blue-500 mr-2" />
                Qualifications
            </h2>
            <ul className="space-y-4">
                <li className="flex items-start">
                <span className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full mr-3"></span>
                <div>
                    <p className="font-semibold text-gray-900">MD, Cardiology</p>
                    <p className="text-gray-600">Harvard Medical School, 2005</p>
                </div>
                </li>
                <li className="flex items-start">
                <span className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full mr-3"></span>
                <div>
                    <p className="font-semibold text-gray-900">Fellowship in Interventional Cardiology</p>
                    <p className="text-gray-600">Johns Hopkins Hospital, 2008</p>
                </div>
                </li>
                <li className="flex items-start">
                <span className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full mr-3"></span>
                <div>
                    <p className="font-semibold text-gray-900">Board Certified</p>
                    <p className="text-gray-600">American Board of Internal Medicine</p>
                </div>
                </li>
            </ul>
            </motion.div>

            <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl p-8"
            >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FaHospital className="w-6 h-6 text-blue-500 mr-2" />
                Hospital Affiliations
            </h2>
            <div className="space-y-6">
                <div>
                <h3 className="font-semibold text-gray-900">Current</h3>
                <p className="text-gray-700">Chief of Cardiology</p>
                <p className="text-gray-600">University Medical Center (2015 - Present)</p>
                </div>
                <div>
                <h3 className="font-semibold text-gray-900">Previous</h3>
                <ul className="space-y-2 mt-2">
                    <li className="text-gray-600">• Associate Cardiologist, City General Hospital (2010-2015)</li>
                    <li className="text-gray-600">• Resident Physician, Memorial Medical Center (2005-2010)</li>
                </ul>
                </div>
            </div>
            </motion.div>
        </div>

        {/* Motivation Cards */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
        >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
            Why I Practice Medicine
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {motivations.map((item, index) => (
                <motion.div
                key={index}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-lg border border-gray-100"
                >
                <div className={`inline-block p-3 rounded-lg bg-gradient-to-r ${item.color} mb-4`}>
                    <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
                </motion.div>
            ))}
            </div>
        </motion.div>

        {/* Journey Timeline */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl p-8"
        >
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <FaClock className="w-6 h-6 text-blue-500 mr-2" />
            Medical Journey
            </h2>
            
            <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-600"></div>
            
            <div className="space-y-8">
                {journey.map((item, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pl-12"
                >
                    <div className="absolute left-0 top-1 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900">{item.year}</h3>
                    <p className="text-gray-700 font-medium">{item.title}</p>
                    <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                    </div>
                </motion.div>
                ))}
            </div>
            </div>
        </motion.div>
    </div>
  );
};

const motivations = [
  {
    title: 'Patient-Centered Care',
    description: 'Every patient deserves personalized attention and compassionate care.',
    icon: FaHeart,
    color: 'from-red-400 to-red-600'
  },
  {
    title: 'Excellence in Medicine',
    description: 'Continuously learning and adopting the latest medical advancements.',
    icon: FaTrophy,
    color: 'from-yellow-400 to-yellow-600'
  },
  {
    title: 'Community Health',
    description: 'Making quality healthcare accessible to all members of society.',
    icon: FaUsers,
    color: 'from-green-400 to-green-600'
  },
  {
    title: 'Global Impact',
    description: 'Contributing to medical research and global health initiatives.',
    icon: FaGlobe,
    color: 'from-blue-400 to-blue-600'
  }
];

const journey = [
  {
    year: '2000 - 2005',
    title: 'Medical School',
    description: 'Graduated with honors from Harvard Medical School'
  },
  {
    year: '2005 - 2008',
    title: 'Internal Medicine Residency',
    description: 'Completed residency at Massachusetts General Hospital'
  },
  {
    year: '2008 - 2010',
    title: 'Cardiology Fellowship',
    description: 'Specialized in interventional cardiology at Johns Hopkins'
  },
  {
    year: '2010 - 2015',
    title: 'Attending Physician',
    description: 'Served as attending cardiologist at City General Hospital'
  },
  {
    year: '2015 - Present',
    title: 'Chief of Cardiology',
    description: 'Leading cardiology department at University Medical Center'
  }
];

export default AboutPage;
