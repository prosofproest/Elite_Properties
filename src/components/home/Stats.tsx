/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'framer-motion';

export default function Stats() {
  const stats = [
    { value: '25+', label: 'Years of Excellence' },
    { value: '150+', label: 'Projects Completed' },
    { value: '10K+', label: 'Happy Families' },
    { value: '15M+', label: 'Sq. Ft. Delivered' },
  ];

  return (
    <section className="bg-primary py-16 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="text-center"
          >
            <h3 className="text-4xl md:text-5xl font-serif font-bold text-accent mb-2">
              {stat.value}
            </h3>
            <p className="text-white/60 text-xs uppercase tracking-[0.2em] font-bold">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
