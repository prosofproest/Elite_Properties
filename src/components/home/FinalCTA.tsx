/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'framer-motion';
import { Phone, MessageCircle } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="py-24 px-6 bg-primary overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 -mr-48 -mt-48 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 -ml-48 -mb-48 rounded-full blur-3xl" />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-serif text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
            Ready to Find Your <br />
            <span className="text-accent italic">Dream Home</span> in Mumbai?
          </h2>
          <p className="text-white/60 text-lg mb-12 max-w-2xl mx-auto">
            Our experts are here to guide you through every step of your home-buying journey. Contact us today for exclusive offers and site visits.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            <a
              href="tel:+917304954717"
              className="bg-accent text-primary px-10 py-5 rounded-sm font-black uppercase tracking-widest text-xs hover:bg-white transition-all shadow-2xl flex items-center gap-3"
            >
              <Phone size={18} />
              Call Now: +91 73049 54717
            </a>
            <a
              href="https://wa.me/917304954717"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white text-white px-10 py-5 rounded-sm font-black uppercase tracking-widest text-xs hover:bg-white hover:text-primary transition-all flex items-center gap-3"
            >
              <MessageCircle size={18} />
              WhatsApp Us
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
