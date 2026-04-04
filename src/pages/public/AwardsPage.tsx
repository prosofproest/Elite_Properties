/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'framer-motion';
import { Award, Star, Trophy, ShieldCheck } from 'lucide-react';

export default function AwardsPage() {
  const awards = [
    {
      year: '2024',
      title: 'Best Luxury Project - Mumbai',
      organization: 'Real Estate Excellence Awards',
      icon: Trophy,
      description: 'Awarded to Elite Residency for its exceptional design and world-class amenities.'
    },
    {
      year: '2023',
      title: 'Developer of the Year',
      organization: 'Mumbai Property Awards',
      icon: Star,
      description: 'Recognized for consistent delivery and quality across multiple residential projects.'
    },
    {
      year: '2022',
      title: 'Sustainable Architecture Award',
      organization: 'Green Building Council',
      icon: ShieldCheck,
      description: 'For implementing eco-friendly construction practices in Skyline Towers.'
    },
    {
      year: '2021',
      title: 'Customer Choice Award',
      organization: 'Home Buyers Association',
      icon: Award,
      description: 'Voted as the most trusted developer by Mumbai home buyers.'
    }
  ];

  return (
    <div className="pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="font-serif text-5xl font-bold text-primary mb-6">Awards & Recognition</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our commitment to excellence has been recognized by the industry's most prestigious organizations. Each award is a testament to our dedication to quality and innovation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {awards.map((award, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-8 rounded-sm shadow-lg border border-gray-100 flex gap-6 group hover:border-accent transition-all"
            >
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center shrink-0 group-hover:bg-accent transition-colors">
                <award.icon className="text-accent group-hover:text-primary transition-colors" size={32} />
              </div>
              <div>
                <span className="text-accent font-bold text-sm uppercase tracking-widest">{award.year}</span>
                <h3 className="font-serif text-2xl font-bold text-primary mt-2 mb-3">{award.title}</h3>
                <p className="text-primary/60 font-bold text-sm mb-4">{award.organization}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{award.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
