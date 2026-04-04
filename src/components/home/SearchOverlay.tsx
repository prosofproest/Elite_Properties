/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Home, LayoutGrid, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';

const CITIES = ['Mumbai', 'Thane', 'Navi Mumbai', 'Pune', 'Nashik'];
const TYPES = ['Residential', 'Villa', 'Commercial', 'Plot'];
const BHK_OPTIONS = ['Studio', '1BHK', '2BHK', '3BHK', '4BHK+'];
const BUDGET_OPTIONS = [
  { label: 'Under 50L', value: '0-5000000' },
  { label: '50L - 80L', value: '5000000-8000000' },
  { label: '80L - 1.5Cr', value: '8000000-15000000' },
  { label: '1.5Cr - 3Cr', value: '15000000-30000000' },
  { label: 'Above 3Cr', value: '30000000-500000000' },
];

export default function SearchOverlay() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    city: '',
    type: '',
    bhk: '',
    budget: '',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (filters.city) params.set('city', filters.city);
    if (filters.type) params.set('type', filters.type);
    if (filters.bhk) params.set('bhk', filters.bhk);
    if (filters.budget) params.set('budget', filters.budget);
    
    navigate(`/search?${params.toString()}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="relative z-20 -mt-12 max-w-5xl mx-auto px-6 w-full"
    >
      <div className="bg-white p-4 md:p-6 rounded-sm shadow-2xl border-b-4 border-accent">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          {/* City */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <MapPin size={12} className="text-accent" />
              City
            </label>
            <select 
              className="w-full bg-gray-50 border border-gray-100 p-3 text-sm rounded-sm focus:outline-none focus:border-accent appearance-none"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            >
              <option value="">Select City</option>
              {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>

          {/* Type */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Home size={12} className="text-accent" />
              Property Type
            </label>
            <select 
              className="w-full bg-gray-50 border border-gray-100 p-3 text-sm rounded-sm focus:outline-none focus:border-accent appearance-none"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">Select Type</option>
              {TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>

          {/* BHK */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <LayoutGrid size={12} className="text-accent" />
              BHK
            </label>
            <select 
              className="w-full bg-gray-50 border border-gray-100 p-3 text-sm rounded-sm focus:outline-none focus:border-accent appearance-none"
              value={filters.bhk}
              onChange={(e) => setFilters({ ...filters, bhk: e.target.value })}
            >
              <option value="">Select BHK</option>
              {BHK_OPTIONS.map(bhk => <option key={bhk} value={bhk}>{bhk}</option>)}
            </select>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <IndianRupee size={12} className="text-accent" />
              Budget
            </label>
            <select 
              className="w-full bg-gray-50 border border-gray-100 p-3 text-sm rounded-sm focus:outline-none focus:border-accent appearance-none"
              value={filters.budget}
              onChange={(e) => setFilters({ ...filters, budget: e.target.value })}
            >
              <option value="">Select Budget</option>
              {BUDGET_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

          {/* Search Button */}
          <button 
            type="submit"
            className="bg-accent text-primary h-[46px] flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all shadow-lg"
          >
            <Search size={16} />
            Search
          </button>
        </form>
      </div>
    </motion.div>
  );
}
