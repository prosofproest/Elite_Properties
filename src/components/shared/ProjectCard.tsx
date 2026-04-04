/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Home, IndianRupee } from 'lucide-react';
import { Project } from '../../lib/types';
import { cn } from '../../lib/utils';

interface ProjectCardProps {
  project: Project;
  index?: number;
  key?: string | number;
}

export default function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={project.coverImage || 'https://placehold.co/800x600/0A1931/C9A84C?text=Elite+Properties'}
          alt={project.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className={cn(
            'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white',
            project.status === 'Ongoing' ? 'bg-accent' : project.status === 'Completed' ? 'bg-green-600' : 'bg-blue-600'
          )}>
            {project.status}
          </span>
          {project.isFeatured && (
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white border border-white/30">
              Featured
            </span>
          )}
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-6 text-white">
          <div className="flex items-center gap-2 text-accent mb-2">
            <MapPin size={14} />
            <span className="text-xs font-bold uppercase tracking-widest">{project.location}, {project.city}</span>
          </div>
          <h3 className="text-2xl font-serif font-bold mb-4 leading-tight group-hover:text-accent transition-colors">
            {project.name}
          </h3>
          
          <div className="flex items-center justify-between pt-4 border-t border-white/20">
            <div className="flex items-center gap-2">
              <Home size={16} className="text-accent" />
              <span className="text-xs font-medium">{project.type}</span>
            </div>
            <div className="flex items-center gap-1">
              <IndianRupee size={14} className="text-accent" />
              <span className="text-sm font-bold">{project.priceRange}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hover Action */}
      <Link
        to={`/projects/${project.slug}`}
        className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      >
        <div className="w-16 h-16 bg-accent text-primary rounded-full flex items-center justify-center scale-0 group-hover:scale-100 transition-transform duration-500 delay-100">
          <ArrowRight size={24} />
        </div>
      </Link>
    </motion.div>
  );
}
