/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { getGallery } from '../../lib/firestore';
import { GalleryItem } from '../../lib/types';
import { motion } from 'framer-motion';

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const data = await getGallery();
        setItems(data || [
          { id: '1', url: 'https://placehold.co/800x600/0A1931/C9A84C?text=Elite+Heights', category: 'Residential', title: 'Elite Heights' },
          { id: '2', url: 'https://placehold.co/800x600/1a2e4a/C9A84C?text=Luxury+Interior', category: 'Interior', title: 'Luxury Living Room' },
          { id: '3', url: 'https://placehold.co/800x600/0A1931/C9A84C?text=Elite+Villas', category: 'Residential', title: 'Elite Villas' },
          { id: '4', url: 'https://placehold.co/800x600/1a2e4a/C9A84C?text=Business+Center', category: 'Commercial', title: 'Elite Business Center' },
          { id: '5', url: 'https://placehold.co/800x600/0A1931/C9A84C?text=Elite+Tower', category: 'Commercial', title: 'Elite Tower' },
          { id: '6', url: 'https://placehold.co/800x600/1a2e4a/C9A84C?text=Coastal+Retreat', category: 'Residential', title: 'Coastal Retreat' },
        ]);
      } catch (error) {
        console.error('Error fetching gallery:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  return (
    <div className="pt-32 pb-24 px-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-accent font-bold tracking-widest text-sm uppercase mb-4 block">Visual Journey</span>
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-primary mb-6 leading-tight">
            Our <span className="italic text-accent">Masterpieces.</span>
          </h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative aspect-square overflow-hidden rounded-2xl shadow-lg"
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                  <span className="text-accent font-bold text-[10px] uppercase tracking-widest mb-1">{item.category}</span>
                  <h3 className="text-white font-serif font-bold text-xl">{item.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
