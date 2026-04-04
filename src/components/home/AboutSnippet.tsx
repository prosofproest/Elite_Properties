/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutSnippet() {
  const trustItems = [
    'RERA Approved',
    'Award Winning',
    'On-Time Delivery',
    'ISO Certified'
  ];

  return (
    <section className="py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
        {/* Left: Image with gold frame border */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative w-full lg:w-1/2"
        >
          <div className="relative z-10 rounded-sm overflow-hidden shadow-2xl">
            <img
              src="https://placehold.co/800x1000/0A1931/C9A84C?text=Elite+Properties"
              alt="Elite Properties Mumbai"
              className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
          </div>
          {/* Gold Frame Border */}
          <div className="absolute -top-6 -left-6 w-full h-full border-2 border-accent z-0 rounded-sm" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/10 -z-10 rounded-full blur-3xl" />
        </motion.div>

        {/* Right: Text Content */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full lg:w-1/2"
        >
          <span className="text-accent font-bold uppercase tracking-[0.3em] text-xs mb-4 block">Who We Are</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-8 leading-tight">
            Building Mumbai's <br />
            <span className="text-accent italic">Finest Landmarks</span> Since 2005
          </h2>
          
          <div className="flex flex-col gap-6 text-gray-600 text-sm leading-relaxed mb-10">
            <p>
              Elite Properties Mumbai is a name synonymous with luxury, trust, and innovation. For over three decades, we have been at the forefront of the Mumbai real estate landscape, crafting spaces that are more than just buildings—they are homes where dreams find their address.
            </p>
            <p>
              Our philosophy is simple: to deliver excellence without compromise. Every project we undertake is a testament to our commitment to quality construction, prime locations, and transparent dealings. We don't just build apartments; we build communities that thrive.
            </p>
            <p>
              With a portfolio spanning premium residential towers, luxury villas, and state-of-the-art commercial spaces, Elite Properties continues to set new benchmarks in the industry, ensuring that every client receives the best value for their investment.
            </p>
          </div>

          {/* Trust Row */}
          <div className="grid grid-cols-2 gap-4 mb-12">
            {trustItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-widest">
                <CheckCircle2 className="text-accent" size={18} />
                {item}
              </div>
            ))}
          </div>

          <Link
            to="/about"
            className="inline-flex items-center gap-3 text-primary font-black uppercase tracking-widest text-xs group"
          >
            Know More About Us
            <div className="w-10 h-10 rounded-full border border-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
              <ArrowRight size={16} />
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
