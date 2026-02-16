'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaStethoscope, FaBars, FaTimes, FaUserShield, FaSignOutAlt, 
  FaUserCircle, FaPhoneAlt, FaGoogle, FaChevronDown 
} from 'react-icons/fa';
import { auth, googleProvider } from '@/lib/firebase'; 
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showUserCard, setShowUserCard] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAboutDropdown, setShowAboutDropdown] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.uid === process.env.NEXT_PUBLIC_ADMIN_KEY) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setIsOpen(false);
    } catch (error) {
      console.error("Sign-in error", error);
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Consult', href: '/consult' },
    { 
      name: 'About', 
      href: '#', 
      isDropdown: true, 
      subLinks: [
        { name: 'About Us', href: '/about' },
        { name: 'FAQs', href: '/faq' },
        { name: 'Our Location', href: '/location' },
      ] 
    },
  ];

  return (
    <>
      <header className="fixed w-full z-[60] bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FaStethoscope className="text-white text-xl" />
              </div>
              <span className="text-xl font-bold text-blue-900 tracking-tight">
                Dr.<span className="text-blue-500"> Nwachukwu's</span> Place
              </span>
            </Link>

            <nav className="hidden lg:flex flex-1 justify-center space-x-12">
              {navLinks.map((link) => (
                <div 
                  key={link.name} 
                  className="relative group py-2"
                  onMouseEnter={() => link.isDropdown && setShowAboutDropdown(true)}
                  onMouseLeave={() => link.isDropdown && setShowAboutDropdown(false)}
                >
                  <Link href={link.href} className={`flex items-center gap-1 text-sm uppercase tracking-widest font-semibold transition-colors ${pathname.includes(link.name.toLowerCase()) ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
                    {link.name}
                    {link.isDropdown && <FaChevronDown size={10} className={`transition-transform ${showAboutDropdown ? 'rotate-180' : ''}`} />}
                  </Link>

                  {link.isDropdown && (
                    <AnimatePresence>
                      {showAboutDropdown && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute left-0 mt-2 w-48 bg-white shadow-xl border border-gray-50 rounded-xl overflow-hidden"
                        >
                          {link.subLinks?.map((sub) => (
                            <Link key={sub.name} href={sub.href} className="block px-6 py-4 text-xs font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 border-b border-gray-50 last:border-none transition-all">
                              {sub.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-4 flex-shrink-0">
              <a href="tel:+23412345678" className="mr-2 flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full font-bold text-xs border border-blue-100 hover:bg-blue-600 hover:text-white transition-all">
                <FaPhoneAlt size={10} className="animate-pulse" />
                EMERGENCY
              </a>

              {!user ? (
                <button onClick={handleGoogleSignIn} className="text-blue-600 border-2 border-blue-600 px-6 py-2 rounded-full font-bold text-sm hover:bg-blue-50 transition-all">
                  SIGN IN
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="text-right flex flex-col justify-center">
                    <span className={`text-sm font-black leading-tight ${isAdmin ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent italic uppercase tracking-tighter' : 'text-blue-900'}`}>
                      {isAdmin ? 'CEO' : (user.displayName?.split(' ')[0] || 'User')}
                    </span>
                  </div>
                  <div className="relative">
                    <button onClick={() => setShowUserCard(!showUserCard)} className="w-10 h-10 rounded-full border-2 border-blue-600 overflow-hidden shadow-sm">
                      {user.photoURL ? <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" /> : <FaUserCircle className="w-full h-full text-blue-600" />}
                    </button>
                    <AnimatePresence>
                      {showUserCard && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4">
                          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Account</p>
                          <p className="text-sm font-semibold text-blue-900 truncate mb-3 border-b pb-2">{user.email}</p>
                          <div className="space-y-2">
                            {isAdmin && <Link href="/admin" onClick={() => setShowUserCard(false)} className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all"><FaUserShield /> ADMIN PORTAL</Link>}
                            <button onClick={() => { signOut(auth); setShowUserCard(false); }} className="w-full flex items-center gap-2 text-sm font-bold text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"><FaSignOutAlt /> SIGN OUT</button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>

            <button className="md:hidden text-2xl text-blue-900" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* --- MOBILE NAV --- */}
        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl md:hidden overflow-hidden">
              <div className="flex flex-col items-center p-8 space-y-6">
                
                {user && (
                   <div className="flex flex-col items-center space-y-2 border-b border-gray-100 pb-4 w-full">
                      <div className="w-16 h-16 rounded-full border-2 border-blue-600 overflow-hidden">
                        {user.photoURL ? <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" /> : <FaUserCircle className="w-full h-full text-blue-600" />}
                      </div>
                      <span className={`text-lg font-black ${isAdmin ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent italic uppercase tracking-tighter' : 'text-blue-900'}`}>
                        {isAdmin ? 'CEO' : (user.displayName?.split(' ')[0] || 'User')}
                      </span>
                      <p className="text-xs text-gray-400">{user.email}</p>
                   </div>
                )}

                {navLinks.map((link) => (
                  <React.Fragment key={link.name}>
                    {!link.isDropdown ? (
                      <Link href={link.href} onClick={() => setIsOpen(false)} className={`font-bold text-xl transition-colors ${pathname === link.href ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>
                        {link.name}
                      </Link>
                    ) : (
                      <div className="flex flex-col items-center space-y-4">
                        <span className="text-gray-400 text-xs font-black uppercase tracking-widest">About Dr. Nwachukwu</span>
                        {link.subLinks?.map(sub => (
                          <Link key={sub.name} href={sub.href} onClick={() => setIsOpen(false)} className="font-bold text-xl text-gray-700">
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </React.Fragment>
                ))}

                <div className="w-full pt-4 space-y-3">
                  {!user ? (
                    <button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-xl font-bold">
                      <FaGoogle /> SIGN IN WITH GOOGLE
                    </button>
                  ) : (
                    <>
                      {isAdmin && (
                        <Link href="/admin" onClick={() => setIsOpen(false)} className="w-full flex items-center justify-center gap-3 bg-green-50 text-green-600 py-4 rounded-xl font-bold border border-green-100">
                          <FaUserShield /> ADMIN PORTAL
                        </Link>
                      )}
                      <button onClick={() => { signOut(auth); setIsOpen(false); }} className="w-full flex items-center justify-center gap-3 bg-red-50 text-red-600 py-4 rounded-xl font-bold border border-red-100">
                        <FaSignOutAlt /> SIGN OUT
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className="fixed bottom-6 left-6 z-[70] md:hidden">
        <motion.a whileTap={{ scale: 0.9 }} href="tel:+23412345678" className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/50 border-4 border-white">
          <FaPhoneAlt size={20} className="animate-pulse" />
        </motion.a>
      </div>
    </>
  );
};

export default Header; 