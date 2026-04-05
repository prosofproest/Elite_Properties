/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Send, CheckCircle, Phone, MessageCircle } from 'lucide-react';
import { createLead } from '../../lib/firestore';
import { cn } from '../../lib/utils';

interface ProjectEnquiryFormProps {
  projectName: string;
  className?: string;
}

const ProjectEnquiryForm: React.FC<ProjectEnquiryFormProps> = ({ projectName, className }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: `Hi, I'm interested in ${projectName}. Please share more details.`
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const refCode = localStorage.getItem('eliteRefCode') || null;
      await createLead({
        ...formData,
        projectInterest: projectName,
        source: 'Project Detail Page',
        referralCode: refCode,
      });
      setIsSuccess(true);
      setFormData({ name: '', phone: '', email: '', message: '' });
    } catch (error) {
      console.error('Lead submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={cn("bg-white p-8 rounded-sm shadow-2xl border border-gray-100 text-center", className)}>
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} />
        </div>
        <h3 className="font-serif text-2xl font-bold text-primary mb-4">Enquiry Sent!</h3>
        <p className="text-gray-600 text-sm mb-8">
          Thank you for your interest in {projectName}. Our expert will call you within 2 hours.
        </p>
        <div className="bg-gray-50 p-4 rounded-sm border border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Direct Helpline</p>
          <p className="text-primary font-black text-lg">+91 73049 54717</p>
        </div>
        <button 
          onClick={() => setIsSuccess(false)}
          className="mt-8 text-accent text-xs font-bold uppercase tracking-widest hover:underline"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <div className={cn("bg-white p-8 rounded-sm shadow-2xl border border-gray-100", className)}>
      <h3 className="font-serif text-2xl font-bold text-primary mb-2">Enquire Now</h3>
      <p className="text-gray-500 text-[10px] mb-8 uppercase tracking-widest font-black">Get Exclusive Launch Offers</p>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          required
          type="text"
          placeholder="Your Name"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-accent transition-colors"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
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
        <textarea
          placeholder="Message"
          rows={3}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-accent transition-colors resize-none"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        />
        <button
          disabled={isSubmitting}
          type="submit"
          className="w-full bg-primary text-white py-4 rounded-sm font-black uppercase tracking-widest text-xs hover:bg-primary/90 transition-all flex items-center justify-center gap-2 mt-2 shadow-lg"
        >
          {isSubmitting ? 'Sending...' : 'Send Enquiry'}
          {!isSubmitting && <Send size={14} className="text-accent" />}
        </button>
      </form>

      <div className="mt-8 pt-8 border-t border-gray-50 flex flex-col gap-4">
        <a
          href="tel:+917304954717"
          className="flex items-center gap-4 text-primary hover:text-accent transition-colors group"
        >
          <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-accent/10 transition-colors">
            <Phone size={18} className="text-accent" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Call Us</p>
            <p className="font-black text-sm">+91 73049 54717</p>
          </div>
        </a>
        <a
          href={`https://wa.me/917304954717?text=${encodeURIComponent(`Hi, I'm interested in ${projectName}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 text-primary hover:text-green-600 transition-colors group"
        >
          <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-green-50 transition-colors">
            <MessageCircle size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">WhatsApp</p>
            <p className="font-black text-sm">Chat with Expert</p>
          </div>
        </a>
      </div>
    </div>
  );
};

export default ProjectEnquiryForm;
