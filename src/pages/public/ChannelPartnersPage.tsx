/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, CheckCircle, ArrowRight, Building2, TrendingUp, Users, ShieldCheck, Award, Briefcase } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { toast } from 'sonner';

export default function ChannelPartnersPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    experience: '',
    reraNumber: '',
  });
  const [idProof, setIdProof] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIdProof(e.target.files[0]);
    }
  };

  const uploadToCloudinary = async (file: File) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'ml_default'); // Assuming default unsigned preset
    data.append('cloud_name', 'dzynvkgqd');

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dzynvkgqd/image/upload', {
        method: 'POST',
        body: data,
      });
      const json = await res.json();
      return json.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload ID proof');
    }
  };

  const generateRefCode = (name: string) => {
    const prefix = name.substring(0, 3).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `EP-${prefix}${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      toast.error('Please agree to the Terms & Conditions');
      return;
    }
    if (!idProof) {
      toast.error('Please upload an ID proof');
      return;
    }

    setIsSubmitting(true);
    try {
      setIsUploading(true);
      let idProofUrl = '';
      try {
        idProofUrl = await uploadToCloudinary(idProof);
      } catch (err) {
        toast.error('Failed to upload ID proof. Please try again.');
        setIsSubmitting(false);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);

      const refCode = generateRefCode(formData.name);

      await addDoc(collection(db, 'channelPartners'), {
        ...formData,
        idProofUrl,
        refCode,
        status: 'Pending',
        totalEarnings: 0,
        createdAt: serverTimestamp(),
      });

      setIsSuccess(true);
      toast.success('Registration successful!');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 bg-primary text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://placehold.co/1920x1080/0A1931/C9A84C?text=Elite+Properties')] bg-cover bg-center" />
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif font-bold mb-6"
          >
            Earn Up to <span className="text-accent italic">2% Commission</span> <br className="hidden md:block" />
            on Every Sale
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto"
          >
            Join 500+ active partners earning with Elite Properties Mumbai. Partner with the most trusted real estate brand.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <a href="#register" className="btn-accent w-full sm:w-auto px-8 py-4 text-sm">
              Register Now
            </a>
            <Link to="/channel-partners/dashboard" className="w-full sm:w-auto px-8 py-4 text-sm font-bold uppercase tracking-widest border-2 border-white text-white hover:bg-white hover:text-primary transition-colors text-center">
              Partner Login
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto border-t border-white/20 pt-12"
          >
            <div>
              <p className="text-4xl font-black text-accent mb-2">500+</p>
              <p className="text-xs uppercase tracking-widest font-bold text-white/60">Active Partners</p>
            </div>
            <div>
              <p className="text-4xl font-black text-accent mb-2">₹2Cr+</p>
              <p className="text-xs uppercase tracking-widest font-bold text-white/60">Commission Paid</p>
            </div>
            <div>
              <p className="text-4xl font-black text-accent mb-2">15%</p>
              <p className="text-xs uppercase tracking-widest font-bold text-white/60">Avg Conversion</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">Why Partner With Us?</h2>
          <p className="text-gray-500">Exclusive benefits for Elite Properties Channel Partners</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: TrendingUp, title: 'High Commission Rates', desc: 'Earn up to 2% on every successful booking.' },
            { icon: Briefcase, title: 'Marketing Materials', desc: 'Get access to high-quality brochures, videos, and creatives.' },
            { icon: Building2, title: 'Real-time Dashboard', desc: 'Track your leads, site visits, and commissions in real-time.' },
            { icon: Award, title: 'Monthly Payouts', desc: 'Guaranteed on-time commission payouts every month.' },
            { icon: Users, title: 'Dedicated Support', desc: 'A dedicated relationship manager for your clients.' },
            { icon: ShieldCheck, title: 'RERA Training', desc: 'Free training sessions on RERA compliance and sales.' },
          ].map((benefit, i) => (
            <div key={i} className="bg-white p-8 rounded-sm shadow-xl border border-gray-100 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                <benefit.icon className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">{benefit.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">How It Works</h2>
            <p className="text-gray-500">Start earning in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
            {[
              { step: '01', title: 'Register', desc: 'Fill the form below' },
              { step: '02', title: 'Get Verified', desc: 'Our team verifies your details' },
              { step: '03', title: 'Refer Clients', desc: 'Share your unique referral link' },
              { step: '04', title: 'Earn Commission', desc: 'Get paid on successful booking' },
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center bg-white p-6">
                <div className="w-16 h-16 bg-primary text-accent rounded-full flex items-center justify-center font-serif text-2xl font-bold mb-6 shadow-xl border-4 border-white">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section id="register" className="py-24 px-6 max-w-3xl mx-auto">
        <div className="bg-white p-8 md:p-12 rounded-sm shadow-2xl border border-gray-100">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-serif font-bold text-primary mb-4">Partner Registration</h2>
            <p className="text-gray-500 text-sm">Join our network of elite real estate professionals</p>
          </div>

          {isSuccess ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">Application Submitted!</h3>
              <p className="text-gray-600 mb-8">
                Thank you for registering. Our team will review your application and contact you within 24-48 hours.
              </p>
              <button 
                onClick={() => setIsSuccess(false)}
                className="text-accent font-bold uppercase tracking-widest text-sm hover:underline"
              >
                Submit Another Application
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Full Name *</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:border-primary transition-colors"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Email Address *</label>
                  <input
                    required
                    type="email"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:border-primary transition-colors"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Phone Number *</label>
                  <input
                    required
                    type="tel"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:border-primary transition-colors"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">City *</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:border-primary transition-colors"
                    value={formData.city}
                    onChange={e => setFormData({...formData, city: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Years of Experience</label>
                  <select
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:border-primary transition-colors appearance-none"
                    value={formData.experience}
                    onChange={e => setFormData({...formData, experience: e.target.value})}
                  >
                    <option value="">Select Experience</option>
                    <option value="0-2 years">0-2 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5-10 years">5-10 years</option>
                    <option value="10+ years">10+ years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">RERA Number (Optional)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:border-primary transition-colors"
                    value={formData.reraNumber}
                    onChange={e => setFormData({...formData, reraNumber: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Upload ID Proof (Aadhar/PAN) *</label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-sm p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="text-gray-400" size={24} />
                    <p className="text-sm text-gray-600">
                      {idProof ? idProof.name : 'Click or drag file to upload'}
                    </p>
                    <p className="text-xs text-gray-400">Max size: 5MB (JPG, PNG, PDF)</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-4">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the <a href="#" className="text-primary font-bold hover:underline">Terms & Conditions</a> and confirm that the information provided is accurate.
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white py-4 rounded-sm font-black uppercase tracking-widest text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? (isUploading ? 'Uploading ID...' : 'Submitting...') : 'Submit Application'}
                {!isSubmitting && <ArrowRight size={18} className="text-accent" />}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
