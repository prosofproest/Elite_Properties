/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getFeaturedGallery } from '../../lib/firestore';
import { GalleryItem } from '../../lib/types';
import { cn } from '../../lib/utils';

export default function GalleryPreview() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getFeaturedGallery();
        if (data) setItems(data);
      } catch (error) {
        console.error('Error fetching gallery:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return null;
  if (items.length === 0) return null;

  return (
    <section className="py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-accent font-bold uppercase tracking-[0.3em] text-xs mb-4 block">Gallery Preview</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary leading-tight">
            A Glimpse of <span className="text-accent italic">Luxury</span>
          </h2>
        </div>

        {/* Masonry-like Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative group overflow-hidden rounded-sm cursor-pointer",
                index === 0 ? "md:row-span-2 md:col-span-1 h-[300px] md:h-[600px]" : "h-[150px] md:h-[290px]"
              )}
              onClick={() => setSelectedImage(item.url)}
            >
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-primary scale-0 group-hover:scale-100 transition-transform duration-300">
                  <Maximize2 size={20} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-3 text-primary font-black uppercase tracking-widest text-xs group"
          >
            View Full Gallery
            <div className="w-10 h-10 rounded-full border border-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
              <ArrowRight size={16} />
            </div>
          </Link>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-primary/95 flex items-center justify-center p-6 md:p-20"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-10 right-10 text-white hover:text-accent transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X size={40} />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedImage}
              alt="Gallery Lightbox"
              className="max-w-full max-h-full object-contain rounded-sm shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
