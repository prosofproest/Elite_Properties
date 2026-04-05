/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Home, IndianRupee, ArrowRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Project } from '../../lib/types';
import { cn } from '../../lib/utils';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const whatsappMessage = `Hi, I'm interested in ${project.name} in ${project.location}. Please share more details.`;
  const whatsappUrl = `https://wa.me/917304954717?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white rounded-sm overflow-hidden shadow-lg border border-gray-100 flex flex-col h-full hover:shadow-2xl transition-all"
    >
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={project.coverImage || 'https://placehold.co/800x600/0A1931/C9A84C?text=Elite+Properties'}
          alt={project.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4">
          <span className={cn(
            "px-3 py-1 text-[10px] uppercase font-black tracking-widest rounded-sm text-white shadow-lg",
            (project.status === 'Ongoing' || project.status === 'ongoing') ? 'bg-green-600' : 
            (project.status === 'Delivered' || project.status === 'delivered') ? 'bg-blue-600' : 'bg-amber-500'
          )}>
            {project.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-2 text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-2">
          <MapPin size={12} className="text-accent" />
          {project.location}, {project.city}
        </div>
        
        <h3 className="font-serif text-2xl font-bold text-primary mb-4 group-hover:text-accent transition-colors">
          {project.name}
        </h3>

        {/* BHK Chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {project.configurations?.map((config, idx) => (
            <span key={idx} className="bg-gray-50 text-primary/60 px-2 py-1 text-[9px] uppercase font-black tracking-widest border border-gray-100 rounded-sm">
              {config.type}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between mb-6 mt-auto">
          <div className="flex items-center gap-2 text-primary font-black text-sm uppercase tracking-widest">
            <IndianRupee size={14} className="text-accent" />
            {project.priceRange}
          </div>
          <div className="flex items-center gap-1 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
            <Home size={12} className="text-accent" />
            {project.type}
          </div>
        </div>

        <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-6 pb-6 border-b border-gray-50">
          MahaRERA: {project.reraNumber}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Link
            to={`/projects/${project.slug}`}
            className="py-3 border border-primary text-primary text-[10px] uppercase font-black tracking-widest hover:bg-primary hover:text-white transition-all text-center flex items-center justify-center gap-2"
          >
            View Project
            <ArrowRight size={12} />
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 bg-green-600 text-white text-[10px] uppercase font-black tracking-widest hover:bg-green-700 transition-all text-center flex items-center justify-center gap-2 shadow-lg"
          >
            <MessageCircle size={14} />
            WhatsApp
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
