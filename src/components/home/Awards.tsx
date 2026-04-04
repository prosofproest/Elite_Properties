/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award as AwardIcon, Trophy, Medal, Star } from 'lucide-react';
import { getAwards } from '../../lib/firestore';
import { Award } from '../../lib/types';

export default function Awards() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const data = await getAwards();
        setAwards(data || [
          { id: '1', title: 'Best Luxury Developer', year: '2023', organization: 'Real Estate Awards India' },
          { id: '2', title: 'Sustainable Architecture Award', year: '2022', organization: 'Green Building Council' },
          { id: '3', title: 'Customer Choice Award', year: '2021', organization: 'Mumbai Property Expo' },
          { id: '4', title: 'Excellence in Innovation', year: '2020', organization: 'Global Real Estate Summit' },
        ]);
      } catch (error) {
        console.error('Error fetching awards:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAwards();
  }, []);

  if (loading) return null;

  const icons = [Trophy, Medal, Star, AwardIcon];

  return (
    <section className="py-24 px-6 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-accent font-bold tracking-widest text-sm uppercase mb-4 block">Our Recognition</span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-6 leading-tight">
            Awards & <span className="italic text-accent">Accolades.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {awards.map((award, i) => {
            const Icon = icons[i % icons.length];
            return (
              <motion.div
                key={award.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all group text-center border border-gray-100"
              >
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center text-accent mx-auto mb-6 group-hover:bg-accent group-hover:text-primary transition-all">
                  <Icon size={32} />
                </div>
                <h4 className="font-serif font-bold text-lg text-primary mb-2">{award.title}</h4>
                <p className="text-xs text-primary/50 font-bold uppercase tracking-widest mb-4">{award.organization}</p>
                <div className="inline-block px-3 py-1 bg-gray-50 rounded-full text-[10px] font-bold text-primary/40">
                  {award.year}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
