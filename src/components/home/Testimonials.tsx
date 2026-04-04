/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTestimonials } from '../../lib/firestore';
import { Testimonial } from '../../lib/types';
import { cn } from '../../lib/utils';

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const initials = (testimonial.clientName || testimonial.name)
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="bg-white p-10 rounded-sm shadow-xl border border-gray-100 flex flex-col h-full relative overflow-hidden group hover:border-accent transition-all duration-500">
      <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 -mr-12 -mt-12 rounded-full blur-2xl group-hover:bg-accent/10 transition-colors" />
      
      <div className="flex gap-1 mb-6">
        {Array(5).fill(0).map((_, i) => (
          <Star key={i} size={16} className={cn("fill-accent text-accent", i >= testimonial.rating && "text-gray-200 fill-gray-200")} />
        ))}
      </div>

      <Quote className="text-accent/20 mb-6" size={40} />
      
      <p className="text-gray-600 text-sm leading-relaxed mb-10 italic flex-grow">
        "{testimonial.review || testimonial.content}"
      </p>

      <div className="flex items-center gap-4 pt-8 border-t border-gray-50">
        <div className="w-12 h-12 bg-primary text-accent rounded-full flex items-center justify-center font-serif font-bold text-lg shadow-lg">
          {initials}
        </div>
        <div>
          <h4 className="font-serif font-bold text-primary text-sm">{testimonial.clientName || testimonial.name}</h4>
          <p className="text-[10px] uppercase tracking-widest font-black text-accent">{testimonial.projectName || testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTestimonials();
        if (data) setTestimonials(data);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    resetTimeout();
    if (testimonials.length > 0) {
      timeoutRef.current = setTimeout(
        () => setCurrentIndex((prevIndex) => (prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1)),
        5000
      );
    }
    return () => resetTimeout();
  }, [currentIndex, testimonials.length]);

  const next = () => setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  const prev = () => setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));

  if (isLoading) return null;
  if (testimonials.length === 0) return null;

  return (
    <section className="py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-accent font-bold uppercase tracking-[0.3em] text-xs mb-4 block">Client Testimonials</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary leading-tight">
            What Our <span className="text-accent italic">Happy Families</span> Say
          </h2>
        </div>

        <div className="relative">
          <div className="overflow-hidden px-4 py-10">
            <motion.div
              animate={{ x: `-${currentIndex * 100}%` }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="flex"
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full shrink-0 px-4">
                  <div className="max-w-3xl mx-auto">
                    <TestimonialCard testimonial={testimonial} />
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  currentIndex === i ? "bg-accent w-8" : "bg-gray-200"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
