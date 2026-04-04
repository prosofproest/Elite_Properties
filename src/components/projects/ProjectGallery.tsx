/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ProjectGalleryProps {
  images: string[];
  className?: string;
}

const ProjectGallery: React.FC<ProjectGalleryProps> = ({ images, className }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Main Image */}
      <div className="relative aspect-[16/9] bg-gray-100 rounded-sm overflow-hidden group">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`Gallery ${currentIndex}`}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>

        {/* Controls */}
        <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handlePrev}
            className="w-12 h-12 bg-white/90 backdrop-blur-sm text-primary rounded-full flex items-center justify-center hover:bg-accent hover:text-primary transition-all shadow-lg"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={handleNext}
            className="w-12 h-12 bg-white/90 backdrop-blur-sm text-primary rounded-full flex items-center justify-center hover:bg-accent hover:text-primary transition-all shadow-lg"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Lightbox Trigger */}
        <button
          onClick={() => setIsLightboxOpen(true)}
          className="absolute bottom-4 right-4 w-10 h-10 bg-primary/80 backdrop-blur-sm text-accent rounded-full flex items-center justify-center hover:bg-accent hover:text-primary transition-all shadow-lg"
        >
          <Maximize2 size={20} />
        </button>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={cn(
              "relative shrink-0 w-24 aspect-[16/9] rounded-sm overflow-hidden border-2 transition-all",
              currentIndex === idx ? "border-accent scale-105" : "border-transparent opacity-60 hover:opacity-100"
            )}
          >
            <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-primary/95 flex items-center justify-center p-6 md:p-20"
            onClick={() => setIsLightboxOpen(false)}
          >
            <button
              className="absolute top-10 right-10 text-white hover:text-accent transition-colors"
              onClick={() => setIsLightboxOpen(null)}
            >
              <X size={40} />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={images[currentIndex]}
              alt="Gallery Lightbox"
              className="max-w-full max-h-full object-contain rounded-sm shadow-2xl"
              referrerPolicy="no-referrer"
            />
            
            {/* Lightbox Controls */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-10 pointer-events-none">
              <button
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                className="w-16 h-16 bg-white/10 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-accent hover:text-primary transition-all pointer-events-auto"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="w-16 h-16 bg-white/10 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-accent hover:text-primary transition-all pointer-events-auto"
              >
                <ChevronRight size={32} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectGallery;
