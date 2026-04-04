/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';

interface StatItemProps {
  value: number;
  label: string;
  suffix?: string;
}

const StatItem: React.FC<StatItemProps> = ({ value, label, suffix = '+' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  const spring = useSpring(0, {
    stiffness: 100,
    damping: 30,
    duration: 2000
  });
  
  const displayValue = useTransform(spring, (current) => Math.floor(current).toLocaleString());

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, value, spring]);

  return (
    <div ref={ref} className="flex flex-col items-center text-center gap-2">
      <div className="flex items-baseline gap-1">
        <motion.span className="text-4xl md:text-5xl font-serif font-black text-accent">
          {displayValue}
        </motion.span>
        <span className="text-2xl font-bold text-accent">{suffix}</span>
      </div>
      <span className="text-[10px] uppercase tracking-[0.3em] font-black text-white/60">
        {label}
      </span>
    </div>
  );
};

export default function StatsBar() {
  const stats = [
    { value: 200, label: 'Completed Projects' },
    { value: 15000, label: 'Happy Families' },
    { value: 30, label: 'Years of Excellence' },
    { value: 5, label: 'Cities Across India' },
  ];

  return (
    <section className="bg-primary py-16 px-6 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-px h-full bg-white" />
        <div className="absolute top-0 left-2/4 w-px h-full bg-white" />
        <div className="absolute top-0 left-3/4 w-px h-full bg-white" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
        {stats.map((stat, index) => (
          <StatItem key={index} value={stat.value} label={stat.label} />
        ))}
      </div>
    </section>
  );
}
