/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, CheckCircle } from 'lucide-react';
import { createLead } from '../../lib/firestore';
import { useBooking } from '../../context/BookingContext';
import { cn } from '../../lib/utils';

export default function Hero() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    projectType: 'Residential',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const { openBookingModal } = useBooking();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const refCode = localStorage.getItem('eliteRefCode') || null;
      await createLead({
        ...formData,
        source: 'Hero Form',
        referralCode: refCode,
      });
      setIsSuccess(true);
      setFormData({ name: '', phone: '', email: '', projectType: 'Residential', message: '' });
    } catch (error) {
      console.error('Lead submission error:', error);
      setSubmitError('Submission failed. Call us: +918884530510');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
          poster="https://placehold.co/1920x1080/0A1931/C9A84C?text=Elite+Properties"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-building-exterior-441-large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/60 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto h-full px-6 flex flex-col lg:flex-row items-center justify-between gap-12 pt-20">
        {/* Text Content */}
        <div className="flex-1 text-white">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-accent font-bold uppercase tracking-[0.3em] text-xs mb-4"
          >
            Welcome to Elite Properties
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-serif text-3xl md:text-6xl font-bold leading-tight mb-6"
          >
            Where Dreams Find <br />
            <span className="text-accent italic">Their Address</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg text-white/80 max-w-xl mb-10 font-medium"
          >
            Premium Residential | Villas | Commercial | Plots — Mumbai's most trusted real estate partner since 2005.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              to="/projects"
              className="bg-accent text-primary px-8 py-4 rounded-sm font-black uppercase tracking-widest text-xs hover:bg-white hover:text-primary transition-all shadow-xl"
            >
              Explore Projects
            </Link>
            <button
              onClick={() => openBookingModal()}
              className="border-2 border-white text-white px-8 py-4 rounded-sm font-black uppercase tracking-widest text-xs hover:bg-white hover:text-primary transition-all"
            >
              Book Site Visit
            </button>
          </motion.div>
        </div>

        {/* Lead Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-md bg-white p-8 rounded-sm shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-accent" />
          
          {isSuccess ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} />
              </div>
              <h3 className="font-serif text-2xl font-bold text-primary mb-4">Thank You!</h3>
              <p className="text-gray-600 text-sm mb-8">
                We've received your enquiry. Our expert will call you within 2 hours.
              </p>
              <div className="bg-gray-50 p-4 rounded-sm border border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Direct Helpline</p>
                <p className="text-primary font-black text-lg">+91 88845 30510</p>
              </div>
              <button 
                onClick={() => setIsSuccess(false)}
                className="mt-8 text-accent text-xs font-bold uppercase tracking-widest hover:underline"
              >
                Send another enquiry
              </button>
            </div>
          ) : (
            <>
              <h3 className="font-serif text-2xl font-bold text-primary mb-2">Get Best Price</h3>
              <p className="text-gray-500 text-xs mb-8 uppercase tracking-widest font-bold">Exclusive Launch Offers</p>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                  required
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-accent transition-colors"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    required
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-accent transition-colors"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  <input
                    required
                    type="email"
                    placeholder="Email Address"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-accent transition-colors"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <select
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-accent transition-colors appearance-none"
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                >
                  <option>Residential</option>
                  <option>Villa</option>
                  <option>Commercial</option>
                  <option>Plot</option>
                </select>
                <textarea
                  placeholder="Message (Optional)"
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-accent transition-colors resize-none"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full bg-primary text-white py-4 rounded-sm font-black uppercase tracking-widest text-xs hover:bg-primary/90 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? 'Sending...' : 'Send Enquiry'}
                  {!isSubmitting && <Send size={14} className="text-accent" />}
                </button>
                {submitError && (
                  <p className="text-red-600 text-xs font-bold text-center mt-2">{submitError}</p>
                )}
              </form>
            </>
          )}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 text-white/50 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white/50 to-transparent" />
      </motion.div>
    </section>
  );
}
