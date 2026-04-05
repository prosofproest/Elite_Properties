import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, MapPin, Home, X, SlidersHorizontal,
  ArrowUpDown, ChevronDown, MessageCircle, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Project } from '../../lib/types';
import { cn } from '../../lib/utils';

const CITIES = ['Mumbai', 'Thane', 'Navi Mumbai', 'Pune', 'Nashik'];
const TYPES = ['Residential', 'Villa', 'Commercial', 'Plot'];
const BHK_OPTIONS = ['1BHK', '2BHK', '3BHK', '4BHK+'];
const STATUS_OPTIONS = ['Ongoing', 'Delivered', 'Upcoming'];

export default function SearchPage() {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const hasFetched = useRef(false);

  // Filter state — no URL sync, no debounce
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [bhk, setBhk] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState('');

  // Fetch ONCE only — ref prevents double fetch in StrictMode
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchProjects = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, 'projects'));
        const data = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        } as Project));
        setAllProjects(data);
      } catch (err) {
        console.error('Search error:', err);
        setAllProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []); // EMPTY array — never re-runs

  // Pure in-memory filtering — instant, no Firebase
  const filtered = useMemo(() => {
    let results = [...allProjects];

    if (search) {
      const s = search.toLowerCase();
      results = results.filter(p =>
        p.name?.toLowerCase().includes(s) ||
        p.location?.toLowerCase().includes(s) ||
        p.city?.toLowerCase().includes(s)
      );
    }

    if (city) {
      results = results.filter(p =>
        p.city?.toLowerCase() === city.toLowerCase()
      );
    }

    if (type) {
      results = results.filter(p =>
        p.type?.toLowerCase() === type.toLowerCase()
      );
    }

    if (status) {
      results = results.filter(p =>
        p.status?.toLowerCase() === status.toLowerCase()
      );
    }

    if (bhk) {
      results = results.filter(p =>
        p.configurations?.some(c =>
          c.type?.toLowerCase().includes(bhk.toLowerCase())
        )
      );
    }

    // Sort
    return results.sort((a, b) => {
      if (sort === 'price_asc')
        return ((a as any).startingPrice || 0) - ((b as any).startingPrice || 0);
      if (sort === 'price_desc')
        return ((b as any).startingPrice || 0) - ((a as any).startingPrice || 0);
      if (sort === 'popular')
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      // newest
      return (
        ((b.createdAt as any)?.toMillis?.() || 0) -
        ((a.createdAt as any)?.toMillis?.() || 0)
      );
    });
  }, [allProjects, search, city, type, status, bhk, sort]);

  const handleReset = () => {
    setCity('');
    setType('');
    setBhk('');
    setStatus('');
    setSort('newest');
    setSearch('');
  };

  const SkeletonCard = () => (
    <div className="bg-white rounded-sm overflow-hidden shadow-sm animate-pulse">
      <div className="h-64 bg-gray-200" />
      <div className="p-6 space-y-3">
        <div className="h-3 bg-gray-200 w-1/4 rounded" />
        <div className="h-5 bg-gray-200 w-3/4 rounded" />
        <div className="h-3 bg-gray-200 w-1/2 rounded" />
        <div className="grid grid-cols-2 gap-3 pt-3">
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Search</p>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Project name or location"
            className="w-full bg-gray-50 border border-gray-200 rounded-sm py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* City */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">City</p>
        <select
          value={city}
          onChange={e => setCity(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-sm py-2.5 px-3 text-sm focus:outline-none focus:border-accent appearance-none"
        >
          <option value="">All Cities</option>
          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Type */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Property Type</p>
        <div className="flex flex-wrap gap-2">
          {TYPES.map(t => (
            <button
              key={t}
              onClick={() => setType(type === t ? '' : t)}
              className={cn(
                "px-3 py-1.5 rounded-sm text-xs font-bold border transition-all",
                type === t
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-500 border-gray-200 hover:border-accent"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* BHK */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">BHK Configuration</p>
        <div className="flex flex-wrap gap-2">
          {BHK_OPTIONS.map(b => (
            <button
              key={b}
              onClick={() => setBhk(bhk === b ? '' : b)}
              className={cn(
                "px-3 py-1.5 rounded-sm text-xs font-bold border transition-all",
                bhk === b
                  ? "bg-accent text-primary border-accent"
                  : "bg-white text-gray-500 border-gray-200 hover:border-accent"
              )}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Status</p>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setStatus(status === s ? '' : s)}
              className={cn(
                "px-3 py-1.5 rounded-sm text-xs font-bold border transition-all",
                status === s
                  ? "bg-accent text-primary border-accent"
                  : "bg-white text-gray-500 border-gray-200 hover:border-accent"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={handleReset}
        className="w-full py-3 text-xs font-black uppercase tracking-widest text-red-400 border border-red-100 rounded-sm hover:bg-red-50 transition-all"
      >
        Reset All Filters
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary">
              Property <span className="text-accent italic">Search</span>
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              {loading
                ? 'Loading properties...'
                : `${filtered.length} properties found${city ? ` in ${city}` : ''}`
              }
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent" />
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="bg-white border border-gray-200 pl-9 pr-8 py-2.5 rounded-sm text-xs font-bold text-primary appearance-none focus:outline-none focus:border-accent"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="popular">Featured First</option>
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden bg-primary text-white p-2.5 rounded-sm"
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-28 h-fit">
            <div className="bg-white rounded-sm border border-gray-200 p-6">
              <FilterPanel />
            </div>
          </aside>

          {/* Results */}
          <div className="flex-grow">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-sm p-16 text-center border border-dashed border-gray-200">
                <Search size={40} className="text-gray-200 mx-auto mb-4" />
                <h3 className="font-serif text-2xl font-bold text-primary mb-2">
                  No properties found
                </h3>
                <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto">
                  Try adjusting your filters or reset to see all properties.
                </p>
                <button
                  onClick={handleReset}
                  className="bg-accent text-primary px-8 py-3 rounded-sm font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filtered.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 0.3) }}
                    className="group bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={project.coverImage || 'https://placehold.co/800x600/0A1931/C9A84C?text=Elite+Properties'}
                        alt={project.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className={cn(
                          "text-[9px] font-black uppercase px-2 py-1 rounded-sm",
                          project.status?.toLowerCase() === 'ongoing'
                            ? "bg-green-500 text-white"
                            : project.status?.toLowerCase() === 'delivered' ||
                              project.status?.toLowerCase() === 'completed'
                            ? "bg-blue-500 text-white"
                            : "bg-amber-500 text-white"
                        )}>
                          {project.status}
                        </span>
                        {project.isFeatured && (
                          <span className="bg-accent text-primary text-[9px] font-black uppercase px-2 py-1 rounded-sm">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                        <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-0.5">
                          {project.city}
                        </p>
                        <h3 className="font-serif text-lg font-bold text-white">
                          {project.name}
                        </h3>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-4">
                        <MapPin size={12} className="text-accent shrink-0" />
                        {project.location}
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gray-50 p-3 rounded-sm">
                          <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Config</p>
                          <p className="text-xs font-bold text-primary">
                            {project.configurations?.[0]?.type || 'N/A'}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-sm">
                          <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Price</p>
                          <p className="text-xs font-bold text-primary">
                            {project.priceRange || 'On Request'}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-gray-100">
                        <Link
                          to={`/projects/${project.slug}`}
                          className="flex-grow flex items-center justify-center gap-1.5 bg-primary text-white py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-accent hover:text-primary transition-all"
                        >
                          <ExternalLink size={13} /> View Project
                        </Link>
                        <a
                          href={`https://wa.me/917304954717?text=Hi, I am interested in ${project.name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 bg-green-500 text-white px-4 py-2.5 rounded-sm hover:bg-green-600 transition-all"
                        >
                          <MessageCircle size={14} />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-2xl p-6 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl font-bold text-primary">Filters</h2>
                <button onClick={() => setIsMobileFiltersOpen(false)}>
                  <X size={22} className="text-gray-400" />
                </button>
              </div>
              <FilterPanel />
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full mt-6 bg-primary text-white py-4 rounded-sm font-black uppercase tracking-widest text-xs"
              >
                Show {filtered.length} Properties
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
