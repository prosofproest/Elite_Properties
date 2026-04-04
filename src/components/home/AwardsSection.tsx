/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Award, Star, Trophy, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAwards } from '../../lib/firestore';
import { Award as AwardType } from '../../lib/types';
import { cn } from '../../lib/utils';

function AwardCard({ award }: { award: AwardType }) {
  return (
    <div className="min-w-[300px] md:min-w-[400px] bg-white p-8 rounded-sm shadow-lg border border-gray-100 flex flex-col gap-6 group hover:border-accent transition-all duration-500">
      <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center shrink-0 group-hover:bg-accent transition-colors">
        <Trophy className="text-accent group-hover:text-primary transition-colors" size={32} />
      </div>
      <div>
        <span className="text-accent font-bold text-xs uppercase tracking-widest">{award.year}</span>
        <h3 className="font-serif text-2xl font-bold text-primary mt-2 mb-3 leading-tight">{award.title}</h3>
        <p className="text-primary/60 font-bold text-[10px] uppercase tracking-widest mb-4">{award.organization}</p>
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{award.description}</p>
      </div>
    </div>
  );
}

export default function AwardsSection() {
  const [awards, setAwards] = useState<AwardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAwards();
        if (data) setAwards(data);
      } catch (error) {
        console.error('Error fetching awards:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (isLoading) return null;
  if (awards.length === 0) return null;

  return (
    <section className="py-24 px-6 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <span className="text-accent font-bold uppercase tracking-[0.3em] text-xs mb-4 block">Awards & Recognition</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary leading-tight">
              Our <span className="text-accent italic">Excellence</span> Recognized
            </h2>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => scroll('left')}
              className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-8 overflow-x-auto pb-12 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {awards.map((award) => (
            <div key={award.id} className="snap-center">
              <AwardCard award={award} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
