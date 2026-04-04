/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'framer-motion';
import { ShieldCheck, Truck, Construction, MapPin, BadgePercent, Headphones } from 'lucide-react';

export default function WhyChooseUs() {
  const reasons = [
    {
      icon: ShieldCheck,
      title: 'RERA Registered & Compliant',
      description: 'Every project we build is fully registered and compliant with MahaRERA regulations, ensuring total transparency.'
    },
    {
      icon: Truck,
      title: 'On-Time Project Delivery',
      description: 'We pride ourselves on our track record of delivering projects on or before schedule, every single time.'
    },
    {
      icon: Construction,
      title: 'Premium Quality Construction',
      description: 'Using only the finest materials and latest construction technologies to build homes that last generations.'
    },
    {
      icon: MapPin,
      title: 'Prime Mumbai Locations',
      description: 'Our projects are strategically located in Mumbai\'s most sought-after neighborhoods with excellent connectivity.'
    },
    {
      icon: BadgePercent,
      title: 'Transparent Pricing',
      description: 'No hidden costs, no surprises. We provide clear, all-inclusive pricing structures for every property.'
    },
    {
      icon: Headphones,
      title: '24/7 After-Sales Support',
      description: 'Our relationship doesn\'t end at possession. We provide dedicated support for all your needs post-purchase.'
    }
  ];

  return (
    <section className="py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-accent font-bold uppercase tracking-[0.3em] text-xs mb-4 block">Why Choose Elite Properties</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary leading-tight">
            The Elite <span className="text-accent italic">Advantage</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-8 rounded-sm border border-gray-100 bg-gray-50 hover:bg-primary hover:text-white transition-all duration-500 group shadow-sm hover:shadow-2xl"
            >
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-accent transition-colors">
                <reason.icon className="text-accent group-hover:text-primary transition-colors" size={32} />
              </div>
              <h3 className="font-serif text-xl font-bold mb-4 group-hover:text-accent transition-colors">
                {reason.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed group-hover:text-white/70 transition-colors">
                {reason.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
