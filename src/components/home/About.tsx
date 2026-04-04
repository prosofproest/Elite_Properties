/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function About() {
  const highlights = [
    'Prime Locations in Mumbai',
    'RERA Certified Projects',
    'Sustainable & Green Architecture',
    'World-class Amenities',
  ];

  return (
    <section className="py-24 px-6 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Images */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative z-10 w-4/5 aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl"
          >
            <img
              src="https://placehold.co/1000x1250/0A1931/C9A84C?text=Elite+Properties"
              alt="Elite Properties Architecture"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50, y: 50 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute -bottom-10 -right-10 z-20 w-3/5 aspect-square rounded-2xl overflow-hidden shadow-2xl border-8 border-background"
          >
            <img
              src="https://placehold.co/1000x1000/1a2e4a/C9A84C?text=Luxury+Living"
              alt="Elite Properties Interior"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div>
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-accent font-bold tracking-widest text-sm uppercase mb-4 block"
          >
            Legacy of Excellence
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-serif font-bold text-primary mb-8 leading-tight"
          >
            Crafting Landmarks <br /> <span className="italic text-accent">Since 1995.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-primary/70 mb-8 leading-relaxed"
          >
            Elite Properties has been at the forefront of Mumbai's real estate transformation. We believe that a home is more than just four walls; it's a sanctuary where memories are built and legacies are born.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {highlights.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <CheckCircle2 className="text-accent" size={20} />
                <span className="text-sm font-medium text-primary/80">{item}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <Link to="/about" className="btn-primary inline-flex items-center gap-2 group">
              Our Story
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
