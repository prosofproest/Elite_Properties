/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Filter, X, LayoutGrid, List, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { getProjects } from '../../lib/firestore';
import { Project } from '../../lib/types';
import { cn } from '../../lib/utils';
import ProjectFilters from '../../components/projects/ProjectFilters';
import ProjectCard from '../../components/projects/ProjectCard';

const ProjectsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('Newest');

  // Initial filters from URL
  // Normalize a status string to Title Case ('ongoing' → 'Ongoing')
  const normalizeStatus = (s: string | null): string => {
    if (!s || s.toLowerCase() === 'all') return 'All';
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  };

  const initialFilters = useMemo(() => ({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || 'All',
    type: searchParams.get('type') || 'All',
    bhks: searchParams.get('bhks')?.split(',') || [],
    status: normalizeStatus(searchParams.get('status')),
    budget: searchParams.get('budget')?.split(',').map(Number) || [20, 500],
    amenities: searchParams.get('amenities')?.split(',') || [],
  }), [searchParams]);

  const [filters, setFilters] = useState(initialFilters);

  // Sync filters to URL
  useEffect(() => {
    const params: any = {};
    if (filters.search) params.search = filters.search;
    if (filters.city !== 'All') params.city = filters.city;
    if (filters.type !== 'All') params.type = filters.type;
    if (filters.bhks.length > 0) params.bhks = filters.bhks.join(',');
    if (filters.status !== 'All') params.status = filters.status;
    if (filters.budget[0] !== 20 || filters.budget[1] !== 500) params.budget = filters.budget.join(',');
    if (filters.amenities.length > 0) params.amenities = filters.amenities.join(',');
    
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getProjects({
          city: filters.city,
          type: filters.type,
          status: filters.status,
          search: filters.search,
          minPrice: filters.budget[0],
          maxPrice: filters.budget[1],
        });
        
        if (data) {
          // Additional client-side filtering for BHKs and Amenities
          let filtered = data;
          
          if (filters.bhks.length > 0) {
            filtered = filtered.filter(p => 
              p.configurations?.some(c => filters.bhks.includes(c.type))
            );
          }
          
          if (filters.amenities.length > 0) {
            filtered = filtered.filter(p => 
              filters.amenities.every((a: string) => p.amenities?.includes(a))
            );
          }

          // Sorting
          if (sortBy === 'Price: Low to High') {
            filtered.sort((a, b) => (a.startingPrice || 0) - (b.startingPrice || 0));
          } else if (sortBy === 'Price: High to Low') {
            filtered.sort((a, b) => (b.startingPrice || 0) - (a.startingPrice || 0));
          } else {
            // Newest (assuming createdAt is Firestore Timestamp)
            filtered.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
          }

          setProjects(filtered);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [filters, sortBy]);

  const handleReset = () => {
    setFilters({
      search: '',
      city: 'All',
      type: 'All',
      bhks: [],
      status: 'All',
      budget: [20, 500],
      amenities: [],
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-primary pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 -mr-48 -mt-48 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-2 text-white/50 text-[10px] uppercase font-black tracking-widest mb-6">
            <Link to="/" className="hover:text-accent transition-colors">Home</Link>
            <ChevronRight size={10} />
            <span className="text-accent">Projects</span>
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-white leading-tight">
            Our <span className="text-accent italic">Projects</span>
          </h1>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-80 shrink-0 sticky top-32 h-fit">
              <div className="bg-white p-8 rounded-sm border border-gray-100 shadow-xl">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-serif text-xl font-bold text-primary">Filters</h2>
                  <SlidersHorizontal size={18} className="text-accent" />
                </div>
                <ProjectFilters filters={filters} setFilters={setFilters} onReset={handleReset} />
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow">
              {/* Toolbar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-8 border-b border-gray-50">
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-black uppercase tracking-widest text-primary/50">
                    Showing {projects.length} properties {filters.city !== 'All' ? `in ${filters.city}` : ''}
                  </p>
                  <h2 className="font-serif text-2xl font-bold text-primary">Property Results</h2>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/40">Sort By:</label>
                    <select
                      className="bg-transparent text-[10px] font-black uppercase tracking-widest text-primary focus:outline-none cursor-pointer"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option>Newest</option>
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                    </select>
                  </div>
                  
                  {/* Mobile Filter Toggle */}
                  <button
                    onClick={() => setIsFilterOpen(true)}
                    className="lg:hidden flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest shadow-lg"
                  >
                    <Filter size={14} />
                    Filters
                  </button>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
                {isLoading ? (
                  Array(6).fill(0).map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-sm h-[450px] animate-pulse flex flex-col">
                      <div className="h-64 bg-gray-200" />
                      <div className="p-6 flex flex-col gap-4">
                        <div className="h-4 w-1/2 bg-gray-200 rounded" />
                        <div className="h-8 w-full bg-gray-200 rounded" />
                        <div className="h-4 w-3/4 bg-gray-200 rounded" />
                        <div className="mt-auto h-12 w-full bg-gray-200 rounded" />
                      </div>
                    </div>
                  ))
                ) : projects.length > 0 ? (
                  projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))
                ) : (
                  <div className="col-span-full py-24 text-center">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                      <LayoutGrid size={40} className="text-gray-200" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-primary mb-4">No properties found</h3>
                    <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">
                      We couldn't find any properties matching your current filters. Try adjusting your search criteria or reset filters.
                    </p>
                    <button
                      onClick={handleReset}
                      className="bg-accent text-primary px-10 py-4 rounded-sm font-black uppercase tracking-widest text-xs shadow-xl"
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </section>

      {/* Mobile Filter Bottom Sheet */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-primary/80 backdrop-blur-sm z-[100]"
              onClick={() => setIsFilterOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white z-[101] rounded-t-3xl max-h-[90vh] overflow-y-auto p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-serif text-2xl font-bold text-primary">Filters</h2>
                <button onClick={() => setIsFilterOpen(false)} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-primary">
                  <X size={20} />
                </button>
              </div>
              <ProjectFilters filters={filters} setFilters={setFilters} onReset={handleReset} />
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-full bg-primary text-white py-5 rounded-sm font-black uppercase tracking-widest text-xs mt-10 shadow-2xl"
              >
                Apply Filters
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectsPage;
