/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="pt-32 pb-24 px-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-accent font-bold tracking-widest text-sm uppercase mb-4 block"
          >
            Connect With Us
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-serif font-bold text-primary mb-6 leading-tight"
          >
            Let's Start a <span className="italic text-accent">Conversation.</span>
          </motion.h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-8">
              <h3 className="text-2xl font-serif font-bold text-primary">Contact Details</h3>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-primary/50 font-bold uppercase tracking-widest mb-1">Call Us</p>
                  <p className="font-bold text-primary text-lg">+91 88845 30510</p>
                  <p className="text-xs text-primary/40">Mon - Sat, 9:00 AM - 7:00 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-primary/50 font-bold uppercase tracking-widest mb-1">Email Us</p>
                  <p className="font-bold text-primary text-lg">info@eliteproperties.in</p>
                  <p className="text-xs text-primary/40">sales@eliteproperties.in</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-primary/50 font-bold uppercase tracking-widest mb-1">Visit Us</p>
                  <p className="font-bold text-primary text-lg">Actual Address</p>
                  <p className="text-xs text-primary/40">Mumbai, Maharashtra</p>
                </div>
              </div>
            </div>

            <div className="bg-primary p-8 rounded-3xl shadow-sm text-white flex flex-col gap-6">
              <h4 className="font-serif font-bold text-lg text-accent">Follow Our Journey</h4>
              <div className="flex gap-4">
                {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" className="p-3 rounded-full border border-white/20 hover:bg-accent hover:text-primary transition-all">
                    <Icon size={20} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-10 md:p-16 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <h3 className="text-3xl font-serif font-bold text-primary mb-10 relative z-10">Send a Message</h3>
              <form 
                className="relative z-10 flex flex-col gap-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  // Basic form submission simulation. In a real app, this would use createLead logic.
                  const fd = new FormData(e.currentTarget);
                  fetch('/api/send-lead-email', { method: 'POST', body: JSON.stringify(Object.fromEntries(fd)) }).catch(() => {});
                  alert('Message sent successfully!');
                  e.currentTarget.reset();
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input required name="firstName" placeholder="Your First Name" className="border-b border-gray-200 py-3 text-sm focus:outline-none focus:border-accent" />
                  <input required name="lastName" placeholder="Your Last Name" className="border-b border-gray-200 py-3 text-sm focus:outline-none focus:border-accent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input required type="email" name="email" placeholder="your@email.com" className="border-b border-gray-200 py-3 text-sm focus:outline-none focus:border-accent" />
                  <input required type="tel" name="phone" placeholder="+91 88845 30510" className="border-b border-gray-200 py-3 text-sm focus:outline-none focus:border-accent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input required name="subject" placeholder="I'm interested in..." className="border-b border-gray-200 py-3 text-sm focus:outline-none focus:border-accent" />
                  <select required name="budget" className="border-b border-gray-200 py-3 text-sm focus:outline-none focus:border-accent appearance-none bg-transparent">
                    <option value="" disabled defaultValue="">Select Budget</option>
                    <option value="1cr-3cr">₹1 Cr - ₹3 Cr</option>
                    <option value="3cr-5cr">₹3 Cr - ₹5 Cr</option>
                    <option value="5cr-10cr">₹5 Cr - ₹10 Cr</option>
                  </select>
                </div>
                <textarea required name="message" placeholder="Tell us about your requirements..." rows={4} className="border-b border-gray-200 py-3 text-sm focus:outline-none focus:border-accent resize-none mt-2"></textarea>
                <button type="submit" className="bg-primary text-white py-4 mt-6 rounded-sm font-black uppercase tracking-widest text-xs hover:bg-accent hover:text-primary transition-all">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="mt-20 rounded-3xl overflow-hidden h-[400px] shadow-lg border border-gray-200">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.796740616142!2d72.86214531490134!3d19.07284618708945!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c8e123f8d271%3A0x10d9472658826d70!2sBandra%20Kurla%20Complex%2C%20Mumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1625482019284!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
