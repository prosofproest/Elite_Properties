/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import * as Slider from '@radix-ui/react-slider';
import * as Checkbox from '@radix-ui/react-checkbox';
import { Search, X, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ProjectFiltersProps {
  filters: any;
  setFilters: (filters: any) => void;
  onReset: () => void;
  className?: string;
}

const cities = ['Mumbai', 'Thane', 'Navi Mumbai', 'Pune', 'Nashik'];
const types = ['Residential', 'Villa', 'Commercial', 'Plot'];
const bhks = ['1BHK', '2BHK', '3BHK', '4BHK+'];
const statuses = ['Ongoing', 'Delivered', 'Upcoming'];
const amenitiesList = ['Pool', 'Gym', 'Parking', 'Clubhouse'];

const ProjectFilters: React.FC<ProjectFiltersProps> = ({ filters, setFilters, onReset, className }) => {
  const formatCurrency = (value: number) => {
    if (value >= 100) return `₹${(value / 100).toFixed(1)}Cr`;
    return `₹${value}L`;
  };

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      {/* Search */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-black uppercase tracking-widest text-primary/50">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Project name or location"
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-accent transition-colors"
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
      </div>

      {/* City */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-black uppercase tracking-widest text-primary/50">City</label>
        <select
          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-accent transition-colors appearance-none"
          value={filters.city || 'All'}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
        >
          <option value="All">All Cities</option>
          {cities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      {/* Type */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-black uppercase tracking-widest text-primary/50">Property Type</label>
        <div className="flex flex-wrap gap-2">
          {types.map(type => (
            <button
              key={type}
              onClick={() => setFilters({ ...filters, type: filters.type === type ? 'All' : type })}
              className={cn(
                "px-4 py-2 text-[10px] uppercase font-black tracking-widest rounded-full transition-all border",
                filters.type === type 
                  ? "bg-primary text-white border-primary shadow-lg" 
                  : "bg-white text-primary border-gray-200 hover:border-accent"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* BHK */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-black uppercase tracking-widest text-primary/50">BHK Configuration</label>
        <div className="flex flex-wrap gap-2">
          {bhks.map(bhk => (
            <button
              key={bhk}
              onClick={() => {
                const currentBhks = filters.bhks || [];
                const nextBhks = currentBhks.includes(bhk)
                  ? currentBhks.filter((b: string) => b !== bhk)
                  : [...currentBhks, bhk];
                setFilters({ ...filters, bhks: nextBhks });
              }}
              className={cn(
                "px-4 py-2 text-[10px] uppercase font-black tracking-widest rounded-full transition-all border",
                filters.bhks?.includes(bhk)
                  ? "bg-primary text-white border-primary shadow-lg" 
                  : "bg-white text-primary border-gray-200 hover:border-accent"
              )}
            >
              {bhk}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-black uppercase tracking-widest text-primary/50">Status</label>
        <div className="flex flex-wrap gap-2">
          {statuses.map(status => (
            <button
              key={status}
              onClick={() => setFilters({ ...filters, status: filters.status === status ? 'All' : status })}
              className={cn(
                "px-4 py-2 text-[10px] uppercase font-black tracking-widest rounded-full transition-all border",
                filters.status === status 
                  ? "bg-primary text-white border-primary shadow-lg" 
                  : "bg-white text-primary border-gray-200 hover:border-accent"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end">
          <label className="text-xs font-black uppercase tracking-widest text-primary/50">Budget Range</label>
          <span className="text-[10px] font-black text-accent">
            {formatCurrency(filters.budget?.[0] || 20)} - {formatCurrency(filters.budget?.[1] || 500)}
          </span>
        </div>
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          value={filters.budget || [20, 500]}
          onValueChange={(value) => setFilters({ ...filters, budget: value })}
          max={500}
          min={20}
          step={10}
        >
          <Slider.Track className="bg-gray-200 relative grow rounded-full h-[3px]">
            <Slider.Range className="absolute bg-accent rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb
            className="block w-5 h-5 bg-white border-2 border-accent shadow-lg rounded-full hover:bg-accent transition-colors focus:outline-none"
            aria-label="Min Budget"
          />
          <Slider.Thumb
            className="block w-5 h-5 bg-white border-2 border-accent shadow-lg rounded-full hover:bg-accent transition-colors focus:outline-none"
            aria-label="Max Budget"
          />
        </Slider.Root>
      </div>

      {/* Amenities */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-black uppercase tracking-widest text-primary/50">Amenities</label>
        <div className="grid grid-cols-2 gap-3">
          {amenitiesList.map(amenity => (
            <div key={amenity} className="flex items-center gap-3">
              <Checkbox.Root
                className="flex h-5 w-5 items-center justify-center rounded-sm border border-gray-200 bg-white shadow-sm focus:outline-none focus:border-accent data-[state=checked]:bg-accent data-[state=checked]:border-accent transition-colors"
                id={amenity}
                checked={filters.amenities?.includes(amenity)}
                onCheckedChange={(checked) => {
                  const currentAmenities = filters.amenities || [];
                  const nextAmenities = checked
                    ? [...currentAmenities, amenity]
                    : currentAmenities.filter((a: string) => a !== amenity);
                  setFilters({ ...filters, amenities: nextAmenities });
                }}
              >
                <Checkbox.Indicator className="text-primary">
                  <Check size={14} strokeWidth={4} />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <label className="text-xs font-bold text-primary/70 cursor-pointer" htmlFor={amenity}>
                {amenity}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        className="mt-4 text-xs font-black uppercase tracking-widest text-accent hover:underline flex items-center gap-2"
      >
        <X size={14} />
        Reset Filters
      </button>
    </div>
  );
};

export default ProjectFilters;
