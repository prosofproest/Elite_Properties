/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useBooking } from '../../context/BookingContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showProjectsDropdown, setShowProjectsDropdown] = useState(false);
  const location = useLocation();
  const { openBookingModal } = useBooking();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Search', path: '/search' },
    { name: 'Projects', path: '/projects' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Loans', path: '/loan-calculator' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 w-full z-50 bg-white shadow-lg px-6 py-3"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <span className="font-serif text-2xl font-bold tracking-tight text-primary transition-colors">
            ELITE
          </span>
          <span className="font-serif text-2xl font-light tracking-tighter text-primary/80 transition-colors ml-1">
            PROPERTIES
          </span>
          <span className="w-1.5 h-1.5 bg-accent rounded-full ml-1 mt-2" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <div 
              key={link.name} 
              className="relative group"
            >
              <Link
                to={link.path}
                className={cn(
                  'text-xs uppercase tracking-widest font-semibold transition-all hover:text-accent flex items-center gap-1',
                  location.pathname === link.path 
                    ? 'text-accent' 
                    : 'text-primary'
                )}
              >
                {link.name}
              </Link>
            </div>
          ))}
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-6">
          <a
            href="tel:+918884530510"
            className="flex items-center gap-2 text-sm font-bold text-primary transition-colors"
          >
            <Phone size={16} className="text-accent" />
            +91 88845 30510
          </a>
          <button 
            onClick={() => openBookingModal()}
            className="bg-accent text-primary px-6 py-2.5 rounded-sm text-[10px] uppercase tracking-widest font-black hover:bg-primary hover:text-white border border-accent transition-all shadow-lg"
          >
            Book Site Visit
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden p-2 text-primary transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 w-full h-screen bg-primary z-[60] flex flex-col p-10 lg:hidden"
          >
            <div className="flex justify-between items-center mb-16">
              <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center">
                <span className="font-serif text-2xl font-bold text-white">ELITE</span>
                <span className="font-serif text-2xl font-light text-white/80 ml-1">PROPERTIES</span>
                <span className="w-1.5 h-1.5 bg-accent rounded-full ml-1 mt-2" />
              </Link>
              <button onClick={() => setIsOpen(false)} className="text-white">
                <X size={32} />
              </button>
            </div>

            <div className="flex flex-col gap-8">
              {navLinks.map((link) => (
                <div key={link.name} className="flex flex-col gap-4">
                  <Link
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'text-3xl font-serif font-bold transition-colors',
                      location.pathname === link.path ? 'text-accent' : 'text-white'
                    )}
                  >
                    {link.name}
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-10 border-t border-white/10 flex flex-col gap-6">
              <a href="tel:+918884530510" className="text-accent text-xl font-bold flex items-center gap-3">
                <Phone size={24} />
                +91 88845 30510
              </a>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  openBookingModal();
                }}
                className="bg-accent text-primary py-4 rounded-sm font-black text-center uppercase tracking-widest"
              >
                Book Site Visit
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
