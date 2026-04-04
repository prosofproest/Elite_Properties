/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Home, IndianRupee, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getFeaturedProjects } from '../../lib/firestore';
import { Project } from '../../lib/types';
import { cn } from '../../lib/utils';

const formatPrice = (price: string) => {
  // Assuming price is a string like "₹85 Lakhs" or "₹1.2 Crore"
  // If it's a number, we'd use Intl.NumberFormat
  return price;
};

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
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
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className={cn(
            "px-3 py-1 text-[10px] uppercase font-black tracking-widest rounded-sm text-white shadow-lg",
            (project.status === 'ongoing' || project.status === 'Ongoing') ? 'bg-accent' : 
            (project.status === 'delivered' || project.status === 'Completed') ? 'bg-green-600' : 'bg-blue-600'
          )}>
            {project.status}
          </span>
          {project.isFeatured && (
            <span className="bg-primary/80 backdrop-blur-sm text-white px-3 py-1 text-[10px] uppercase font-black tracking-widest rounded-sm flex items-center gap-1">
              <Star size={10} className="text-accent fill-accent" />
              Featured
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-2 text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-2">
          <MapPin size={12} className="text-accent" />
          {project.location}
        </div>
        <h3 className="font-serif text-2xl font-bold text-primary mb-4 group-hover:text-accent transition-colors">
          {project.name}
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6 mt-auto">
          <div className="flex items-center gap-2 text-gray-600 text-xs font-bold uppercase tracking-widest">
            <Home size={14} className="text-accent" />
            {project.configurations?.[0]?.type || 'Residential'}
          </div>
          <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest">
            <IndianRupee size={14} className="text-accent" />
            {formatPrice(project.configurations?.[0]?.price || 'TBA')}
          </div>
        </div>

        <Link
          to={`/projects/${project.slug}`}
          className="w-full py-3 border border-primary text-primary text-[10px] uppercase font-black tracking-widest hover:bg-primary hover:text-white transition-all text-center flex items-center justify-center gap-2"
        >
          View Project
          <ArrowRight size={12} />
        </Link>
      </div>
    </motion.div>
  );
};

function ProjectSkeleton() {
  return (
    <div className="bg-gray-100 rounded-sm h-[450px] animate-pulse flex flex-col">
      <div className="h-64 bg-gray-200" />
      <div className="p-6 flex flex-col gap-4">
        <div className="h-4 w-1/2 bg-gray-200 rounded" />
        <div className="h-8 w-full bg-gray-200 rounded" />
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
        <div className="mt-auto h-12 w-full bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export default function FeaturedProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  const tabs = ['All', 'Residential', 'Villa', 'Commercial', 'Plot'];

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getFeaturedProjects();
        if (data) {
          setProjects(data);
          setFilteredProjects(data);
        }
      } catch (error) {
        console.error('Error fetching featured projects:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (activeTab === 'All') {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(projects.filter(p => p.type.toLowerCase() === activeTab.toLowerCase()));
    }
  }, [activeTab, projects]);

  return (
    <section className="py-24 px-6 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <span className="text-accent font-bold uppercase tracking-[0.3em] text-xs mb-4 block">Our Landmark Projects</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary leading-tight">
              Featured <span className="text-accent italic">Developments</span>
            </h2>
          </div>
          
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-2 text-[10px] uppercase font-black tracking-widest rounded-full transition-all border",
                  activeTab === tab 
                    ? "bg-primary text-white border-primary shadow-lg" 
                    : "bg-white text-primary border-gray-200 hover:border-accent"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <ProjectSkeleton key={i} />)
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* No Results */}
        {!isLoading && filteredProjects.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No projects found in this category.</p>
          </div>
        )}

        <div className="mt-16 text-center">
          <Link
            to="/projects"
            className="inline-flex items-center gap-3 bg-primary text-white px-10 py-4 rounded-sm font-black uppercase tracking-widest text-xs hover:bg-accent hover:text-primary transition-all shadow-xl"
          >
            View All Projects
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
