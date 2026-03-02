// components/Footer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { FaHeart, FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaTimes, FaShieldAlt, FaLock, FaSignOutAlt, FaGoogle } from 'react-icons/fa';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';

const Footer: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  // Logic States
  const [user, setUser] = useState<any>(null);
  const [showAdminOverlay, setShowAdminOverlay] = useState(false);
  const [adminCreds, setAdminCreds] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Auth error:", err);
    }
  };

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsAuthenticating(true);

    try {
      // 1. Authenticate with Firebase Email/Password
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        adminCreds.email, 
        adminCreds.password
      );
      
      const loggedInUser = userCredential.user;
      const masterAdminUID = process.env.NEXT_PUBLIC_ADMIN_KEY;

      // 2. Verify if the logged-in UID matches the Admin Key in .env
      if (loggedInUser.uid === masterAdminUID) {
        setIsAuthenticating(false);
        setShowAdminOverlay(false);
        router.push('/admin');
      } else {
        // Log out immediately if UID doesn't match
        await signOut(auth);
        setIsAuthenticating(false);
        setError("Access Denied: UID mismatch.");
      }
    } catch (err: any) {
      setIsAuthenticating(false);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        setError("Invalid email or password.");
      } else {
        setError("Authentication failed. Please try again.");
      }
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300 relative">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/">
              <motion.span 
                whileHover={{ scale: 1.02 }}
                className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent cursor-pointer"
              >
                Dr. Prince.N's Place
              </motion.span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your trusted partner in healthcare, providing quality medical consultations and services 24/7.
            </p>
            <div className="flex space-x-4 pt-2">
              <SocialIcon href="#" icon={FaFacebook} />
              <SocialIcon href="#" icon={FaTwitter} />
              <SocialIcon href="#" icon={FaInstagram} />
              <SocialIcon href="#" icon={FaLinkedin} />
            </div>
          </div>

          {/* Quick Links - Navigation */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <FooterLink href="/" active={pathname === '/'}>Home</FooterLink>
              <FooterLink href="/consult" active={pathname === '/consult'}>Consult</FooterLink>
              <FooterLink href="/about" active={pathname === '/about'}>About Us</FooterLink>
              {/* Logic: Sign In/Out Toggle */}
              {!user ? (
                <li onClick={handleGoogleSignIn} className="text-sm text-gray-400 hover:text-white cursor-pointer transition-colors flex items-center gap-2">
                  <FaGoogle size={12}/> Sign In
                </li>
              ) : (
                <li onClick={() => signOut(auth)} className="text-sm text-red-400 hover:text-red-300 cursor-pointer transition-colors flex items-center gap-2">
                  <FaSignOutAlt size={12}/> Sign Out
                </li>
              )}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Our Services</h3>
            <ul className="space-y-2">
              <li className="text-sm text-gray-400 hover:text-white transition-colors">
                <Link href="/consult" className="block">Appointment Booking</Link>
              </li>
              <li className="text-sm text-gray-400 hover:text-white transition-colors">
                <Link href="/consult" className="block">Text Consultation</Link>
              </li>
              <li className="text-sm text-gray-400 hover:text-white transition-colors">
                <Link href="/consult" className="block">Voice Calls</Link>
              </li>
              {/* Logic: Admin Portal Trigger (Hidden when auth) */}
              {!user && (
                <li onClick={() => setShowAdminOverlay(true)} className="text-xs text-gray-600 hover:text-blue-400 cursor-pointer transition-colors mt-4 flex items-center gap-1 font-bold">
                  <FaLock size={10}/> ADMIN PORTAL
                </li>
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 text-sm text-gray-400">
                <FaMapMarkerAlt className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>123 Sample Address for Medical Center Drive, Healthcare City, HC 12345</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-gray-400">
                <FaPhone className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span>+01-3244-your-number</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-gray-400">
                <FaEnvelope className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span>support@doctorconstancy.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-gray-400">
            © {currentYear} DoctorConstancy. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
              FAQ
            </Link>
          </div>
          <p className="text-sm text-gray-400 flex items-center">
            Made with <FaHeart className="w-4 h-4 text-red-500 mx-1" /> for better healthcare
          </p>
        </div>
      </div>

      {/* Admin Auth Overlay */}
      <AnimatePresence>
        {showAdminOverlay && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setShowAdminOverlay(false)}
          >
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }}
              className="bg-gray-800 p-8 rounded-3xl border border-gray-700 w-full max-w-sm shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => { setShowAdminOverlay(false); setError(null); }} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                <FaTimes size={20} />
              </button>
              <div className="text-center mb-6">
                <FaShieldAlt className="text-blue-500 text-3xl mx-auto mb-2" />
                <h2 className="text-white font-bold uppercase tracking-widest text-sm">Admin Access</h2>
                <span className='text-gray-400 text-[10px]'>{"sample Log in details use: (email: prince.n@testemail.com) (password: user1234)"}</span>
              </div>
              <form onSubmit={handleAdminAuth} className="space-y-4">
                <input 
                  type="email" placeholder="Admin Email" required
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500"
                  onChange={(e) => setAdminCreds({...adminCreds, email: e.target.value})}
                />
                <input 
                  type="password" placeholder="Password" required
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500"
                  onChange={(e) => setAdminCreds({...adminCreds, password: e.target.value})}
                />
                {error && <p className="text-red-500 text-[10px] font-bold uppercase text-center">{error}</p>}
                <button 
                  disabled={isAuthenticating}
                  className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all text-xs tracking-widest disabled:opacity-50"
                >
                  {isAuthenticating ? "VERIFYING..." : "LOGIN TO WORKSPACE"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
};

const FooterLink: React.FC<{ href: string; active: boolean; children: React.ReactNode }> = ({
  href,
  active,
  children,
}) => (
  <li>
    <Link href={href}>
      <span className={`text-sm cursor-pointer transition-colors ${
        active 
          ? 'text-blue-400 font-medium' 
          : 'text-gray-400 hover:text-white'
      }`}>
        {children}
      </span>
    </Link>
  </li>
);

const SocialIcon: React.FC<{ href: string; icon: React.ElementType }> = ({ href, icon: Icon }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ scale: 1.1, y: -2 }}
    whileTap={{ scale: 0.95 }}
    className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all"
  >
    <Icon className="w-4 h-4" />
  </motion.a>
);

export default Footer;
