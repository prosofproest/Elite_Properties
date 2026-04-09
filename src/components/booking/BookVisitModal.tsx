/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  MapPin,
  ExternalLink,
  Loader2,
  Phone,
  Mail,
  User,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  format, 
  addDays, 
  isSunday, 
  isBefore, 
  startOfDay, 
  eachDayOfInterval,
  isSameDay
} from 'date-fns';
import { 
  getProjects, 
  getBlockedDates, 
  getSiteVisitsBySlot, 
  createSiteVisit 
} from '../../lib/firestore';
import { Project, BlockedDate } from '../../lib/types';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

interface BookVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProjectId?: string;
}

const TIME_SLOTS = [
  '10:00 AM', '11:00 AM', '12:00 PM', 
  '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
];

const SOURCES = ['Social Media', 'Google', 'Friend', 'Hoarding', 'Other'];
const VISITOR_OPTIONS = ['1', '2', '3', '4+'];
const MAX_BOOKINGS_PER_SLOT = 5;

export default function BookVisitModal({ isOpen, onClose, initialProjectId }: BookVisitModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [slotAvailability, setSlotAvailability] = useState<Record<string, number>>({});
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    peopleCount: '1',
    source: 'Google',
    projectId: initialProjectId || '',
    projectName: '',
    visitDate: '',
    timeSlot: '',
    referenceNumber: ''
  });

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        const [projectsData, blockedData] = await Promise.all([
          getProjects(),
          getBlockedDates()
        ]);
        setProjects(projectsData || []);
        setBlockedDates(blockedData || []);
        
        if (initialProjectId && projectsData) {
          const p = projectsData.find(proj => proj.id === initialProjectId);
          if (p) setFormData(prev => ({ ...prev, projectName: p.name }));
        }
      };
      fetchData();
    }
  }, [isOpen, initialProjectId]);

  // Check availability when date changes
  useEffect(() => {
    if (formData.visitDate) {
      const checkAllSlots = async () => {
        setIsCheckingAvailability(true);
        const availability: Record<string, number> = {};
        
        await Promise.all(TIME_SLOTS.map(async (slot) => {
          const visits = await getSiteVisitsBySlot(formData.visitDate, slot);
          availability[slot] = visits?.length || 0;
        }));
        
        setSlotAvailability(availability);
        setIsCheckingAvailability(false);
      };
      checkAllSlots();
    }
  }, [formData.visitDate]);

  const availableDates = useMemo(() => {
    const start = addDays(new Date(), 1);
    const end = addDays(new Date(), 21);
    return eachDayOfInterval({ start, end }).filter(date => {
      if (isSunday(date)) return false;
      const dateStr = format(date, 'yyyy-MM-dd');
      return !blockedDates.some(bd => bd.date === dateStr);
    });
  }, [blockedDates]);

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.phone || !formData.email) {
        toast.error('Please fill all details');
        return;
      }
      if (!/^\d{10}$/.test(formData.phone)) {
        toast.error('Please enter a valid 10-digit mobile number');
        return;
      }
    }
    if (step === 2) {
      if (!formData.projectId || !formData.visitDate || !formData.timeSlot) {
        toast.error('Please select project, date and time slot');
        return;
      }
      if (slotAvailability[formData.timeSlot] >= MAX_BOOKINGS_PER_SLOT) {
        toast.error('This slot is full. Please choose another.');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const refNum = `EP-${Date.now().toString().slice(-6)}`;
      const visitData = {
        ...formData,
        peopleCount: parseInt(formData.peopleCount),
        referenceNumber: refNum,
        status: 'Pending' as const,
      };
      
      await createSiteVisit(visitData);
      
      try {
        await fetch('/api/send-visit-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            projectName: formData.projectName || '',
            visitDate: formData.visitDate,
            timeSlot: formData.timeSlot,
            referenceNumber: refNum,
          })
        });
      } catch (emailError) {
        console.error('Visit email failed:', emailError);
      }

      setFormData(prev => ({ ...prev, referenceNumber: refNum }));
      setStep(4); // Success state
      toast.success('Booking Confirmed! Email confirmation sent.');
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to confirm booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSlotStatus = (slot: string) => {
    const count = slotAvailability[slot] || 0;
    if (count >= MAX_BOOKINGS_PER_SLOT) return 'Full';
    if (count >= MAX_BOOKINGS_PER_SLOT - 2) return 'Filling Fast';
    return 'Available';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-primary/80 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-sm shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-primary p-6 md:p-8 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-1">
              Book a <span className="text-accent italic">Site Visit</span>
            </h2>
            <p className="text-white/60 text-xs uppercase tracking-widest font-bold">
              Step {step > 3 ? 3 : step} of 3
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-100 w-full">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(Math.min(step, 3) / 3) * 100}%` }}
            className="h-full bg-accent"
          />
        </div>

        <div className="p-6 md:p-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <User size={12} className="text-accent" /> Full Name
                    </label>
                    <input 
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full bg-gray-50 border-b-2 border-gray-100 py-3 px-4 focus:border-accent outline-none transition-all text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <Phone size={12} className="text-accent" /> Phone Number
                    </label>
                    <input 
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      placeholder="9876543210"
                      className="w-full bg-gray-50 border-b-2 border-gray-100 py-3 px-4 focus:border-accent outline-none transition-all text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <Mail size={12} className="text-accent" /> Email Address
                  </label>
                  <input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full bg-gray-50 border-b-2 border-gray-100 py-3 px-4 focus:border-accent outline-none transition-all text-sm font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <Users size={12} className="text-accent" /> Number of Visitors
                    </label>
                    <div className="flex gap-2">
                      {VISITOR_OPTIONS.map(opt => (
                        <button
                          key={opt}
                          onClick={() => setFormData({ ...formData, peopleCount: opt })}
                          className={cn(
                            "flex-1 py-3 rounded-sm text-xs font-bold border transition-all",
                            formData.peopleCount === opt 
                              ? "bg-primary border-primary text-white shadow-lg" 
                              : "bg-white border-gray-100 text-gray-400 hover:border-accent"
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <Info size={12} className="text-accent" /> How did you hear about us?
                    </label>
                    <select 
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      className="w-full bg-gray-50 border-b-2 border-gray-100 py-3 px-4 focus:border-accent outline-none transition-all text-sm font-bold appearance-none"
                    >
                      {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    Select Project
                  </label>
                  <select 
                    value={formData.projectId}
                    onChange={(e) => {
                      const p = projects.find(proj => proj.id === e.target.value);
                      setFormData({ ...formData, projectId: e.target.value, projectName: p?.name || '' });
                    }}
                    className="w-full bg-gray-50 border-b-2 border-gray-100 py-3 px-4 focus:border-accent outline-none transition-all text-sm font-bold appearance-none"
                  >
                    <option value="">Choose a project...</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <CalendarIcon size={12} className="text-accent" /> Available Dates
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {availableDates.map(date => {
                      const dateStr = format(date, 'yyyy-MM-dd');
                      const isSelected = formData.visitDate === dateStr;
                      return (
                        <button
                          key={dateStr}
                          onClick={() => setFormData({ ...formData, visitDate: dateStr, timeSlot: '' })}
                          className={cn(
                            "flex flex-col items-center p-2 rounded-sm border transition-all",
                            isSelected 
                              ? "bg-accent border-accent text-primary shadow-lg" 
                              : "bg-white border-gray-100 text-gray-500 hover:border-accent"
                          )}
                        >
                          <span className="text-[8px] uppercase font-black opacity-60">{format(date, 'EEE')}</span>
                          <span className="text-sm font-bold">{format(date, 'dd')}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <AnimatePresence>
                  {formData.visitDate && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4"
                    >
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <Clock size={12} className="text-accent" /> Available Slots
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {TIME_SLOTS.map(slot => {
                          const status = getSlotStatus(slot);
                          const isSelected = formData.timeSlot === slot;
                          const isFull = status === 'Full';

                          return (
                            <button
                              key={slot}
                              disabled={isFull || isCheckingAvailability}
                              onClick={() => setFormData({ ...formData, timeSlot: slot })}
                              className={cn(
                                "relative flex flex-col items-center p-3 rounded-sm border transition-all",
                                isSelected 
                                  ? "bg-primary border-primary text-white shadow-lg" 
                                  : isFull 
                                    ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
                                    : "bg-white border-gray-100 text-gray-500 hover:border-accent"
                              )}
                            >
                              <span className="text-xs font-bold">{slot}</span>
                              <span className={cn(
                                "text-[8px] uppercase font-black mt-1",
                                status === 'Available' ? "text-green-500" : 
                                status === 'Filling Fast' ? "text-orange-500" : "text-red-400"
                              )}>
                                {status}
                              </span>
                              {isCheckingAvailability && (
                                <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                                  <Loader2 size={12} className="animate-spin text-accent" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="bg-gray-50 p-6 rounded-sm border border-gray-100 space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-accent">Booking Summary</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Project</p>
                      <p className="text-sm font-bold text-primary">{formData.projectName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Date & Time</p>
                      <p className="text-sm font-bold text-primary">{format(new Date(formData.visitDate), 'MMMM dd, yyyy')} at {formData.timeSlot}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Visitors</p>
                      <p className="text-sm font-bold text-primary">{formData.peopleCount} Person(s)</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Contact</p>
                      <p className="text-sm font-bold text-primary">{formData.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-accent/10 p-3 rounded-sm">
                      <MapPin size={20} className="text-accent" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-1">Site Office Address</h4>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        Elite Properties Office, Andheri West, Mumbai - 400053
                      </p>
                      <a 
                        href="https://maps.google.com/?q=Elite+Properties+Andheri+West" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-accent text-[10px] font-black uppercase tracking-widest flex items-center gap-1 mt-2 hover:underline"
                      >
                        View on Google Maps <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 p-4 rounded-sm border border-primary/10 flex items-center gap-3">
                  <Info size={16} className="text-primary" />
                  <p className="text-[10px] font-medium text-primary/70">
                    A confirmation email with the reference number and site details will be sent to your email address.
                  </p>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                  >
                    <CheckCircle2 size={48} className="text-green-500" />
                  </motion.div>
                </div>
                <h2 className="font-serif text-3xl font-bold text-primary mb-2">Booking Confirmed!</h2>
                <p className="text-gray-500 text-sm mb-8">
                  Your site visit has been scheduled successfully.
                </p>
                
                <div className="bg-gray-50 px-8 py-4 rounded-sm border border-gray-100 mb-8">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Reference Number</p>
                  <p className="text-2xl font-serif font-bold text-primary tracking-wider">{formData.referenceNumber}</p>
                </div>

                <button 
                  onClick={onClose}
                  className="bg-primary text-white px-12 py-4 rounded-sm font-black uppercase tracking-widest text-xs hover:bg-accent hover:text-primary transition-all shadow-lg"
                >
                  Done
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        {step <= 3 && (
          <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            {step > 1 ? (
              <button 
                onClick={handleBack}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors"
              >
                <ChevronLeft size={16} /> Back
              </button>
            ) : <div />}

            <button 
              disabled={loading}
              onClick={step === 3 ? handleSubmit : handleNext}
              className="bg-accent text-primary px-8 py-4 rounded-sm font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : step === 3 ? (
                'Confirm Booking'
              ) : (
                <>Next <ChevronRight size={16} /></>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
