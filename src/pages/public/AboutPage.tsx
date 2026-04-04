/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'framer-motion';
import { CheckCircle2, Award, Users, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="pt-20 bg-background min-h-screen">
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <img
          src="https://placehold.co/1920x800/0A1931/C9A84C?text=Elite+Properties"
          alt="Elite Properties Corporate"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-primary/80"></div>
        <div className="relative z-10 text-center px-6">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-accent font-bold tracking-widest text-sm uppercase mb-4 block"
          >
            Our Legacy
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight"
          >
            Redefining <span className="italic text-accent">Mumbai's Skyline.</span>
          </motion.h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-4xl font-serif font-bold text-primary mb-8 leading-tight">
            A Tradition of <br /> <span className="italic text-accent">Trust & Excellence.</span>
          </h2>
          <p className="text-primary/70 mb-6 leading-relaxed">
            Founded in 1995, Elite Properties has grown from a boutique developer to one of Mumbai's most respected real estate brands. Our journey is defined by a relentless pursuit of quality, innovation, and customer satisfaction.
          </p>
          <p className="text-primary/70 mb-12 leading-relaxed">
            With over 150 projects delivered and 10,000+ happy families, we continue to push the boundaries of luxury living, sustainable architecture, and urban development.
          </p>
          
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <span className="text-4xl font-serif font-bold text-accent">25+</span>
              <span className="text-xs font-bold uppercase tracking-widest text-primary/50">Years of Legacy</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-4xl font-serif font-bold text-accent">150+</span>
              <span className="text-xs font-bold uppercase tracking-widest text-primary/50">Projects Delivered</span>
            </div>
          </div>
        </div>
        <div className="relative">
          <img
            src="https://placehold.co/1000x750/0A1931/C9A84C?text=Elite+Properties+Office"
            alt="Elite Properties Office"
            className="rounded-3xl shadow-2xl"
            referrerPolicy="no-referrer"
          />
          <div className="absolute -bottom-10 -left-10 bg-accent p-8 rounded-2xl shadow-xl hidden md:block">
            <p className="text-primary font-serif italic text-xl font-bold">"Building homes, <br /> creating legacies."</p>
          </div>
        </div>
      </section>

      {/* Mission/Vision */}
      <section className="py-24 px-6 bg-primary text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col gap-6">
            <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center text-accent">
              <Users size={24} />
            </div>
            <h3 className="text-2xl font-serif font-bold">Our Vision</h3>
            <p className="text-white/60 text-sm leading-relaxed">To be the most trusted real estate brand in India, known for creating sustainable and iconic landmarks.</p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center text-accent">
              <Award size={24} />
            </div>
            <h3 className="text-2xl font-serif font-bold">Our Mission</h3>
            <p className="text-white/60 text-sm leading-relaxed">To deliver exceptional value to our customers through innovative design, superior construction, and transparent dealings.</p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center text-accent">
              <MapPin size={24} />
            </div>
            <h3 className="text-2xl font-serif font-bold">Our Values</h3>
            <p className="text-white/60 text-sm leading-relaxed">Integrity, Excellence, Innovation, and Customer-Centricity are the pillars of everything we do.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
