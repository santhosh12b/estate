import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowUpRight, Maximize, RotateCcw, ShieldCheck, Compass, Check } from 'lucide-react';
import { propertyTypesList, budgetRanges } from '../data/properties';

const locations = [
  { id: 'All', name: 'All Regions' },
  { id: 'Coimbatore', name: 'Coimbatore' },
  { id: 'Karamadai', name: 'Karamadai' },
  { id: 'Annur', name: 'Annur' },
  { id: 'Kovilpalayam', name: 'Kovilpalayam' }
];

const FeaturedProperties = ({ properties = [], onSelectProperty, selectedLocationFilter, onLocationFilterChange }) => {
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedBudget, setSelectedBudget] = useState('All Budgets');

  // Compute counts for each location dynamically
  const locationCounts = useMemo(() => {
    const counts = { All: properties.length };
    locations.forEach(loc => {
      if (loc.id !== 'All') {
        counts[loc.id] = properties.filter(p => p.location.toLowerCase() === loc.id.toLowerCase()).length;
      }
    });
    return counts;
  }, [properties]);

  // Compute counts for property types
  const typeCounts = useMemo(() => {
    const counts = { 'All Types': properties.length };
    propertyTypesList.forEach(t => {
      if (t !== 'All Types') {
        counts[t] = properties.filter(p => p.propertyType.toLowerCase() === t.toLowerCase()).length;
      }
    });
    return counts;
  }, [properties]);

  // Filter logic
  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      // 1. Location filter
      if (selectedLocationFilter && selectedLocationFilter !== 'All') {
        if (prop.location.toLowerCase() !== selectedLocationFilter.toLowerCase()) {
          return false;
        }
      }

      // 2. Property Type filter
      if (selectedType !== 'All Types') {
        if (prop.propertyType.toLowerCase() !== selectedType.toLowerCase()) {
          return false;
        }
      }

      // 3. Budget filter
      if (selectedBudget !== 'All Budgets') {
        const range = budgetRanges.find(b => b.label === selectedBudget);
        if (range) {
          const val = prop.priceValue || 0;
          if (val < range.min || val > range.max) {
            return false;
          }
        }
      }

      return true;
    });
  }, [properties, selectedLocationFilter, selectedType, selectedBudget]);

  const handleResetFilters = () => {
    if (onLocationFilterChange) onLocationFilterChange('All');
    setSelectedType('All Types');
    setSelectedBudget('All Budgets');
  };

  const isFiltered = (selectedLocationFilter && selectedLocationFilter !== 'All') || selectedType !== 'All Types' || selectedBudget !== 'All Budgets';

  return (
    <section id="properties" className="w-full bg-brand-white py-16 sm:py-24 lg:py-32 border-b border-brand-divider">
      <div className="w-full max-w-7xl mx-auto px-5 sm:px-10 lg:px-16">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-14 gap-4 sm:gap-6">
          <div className="max-w-xl">
            <span className="font-sans text-[10px] sm:text-[11px] font-semibold tracking-[0.18em] uppercase text-brand-accent block mb-2 sm:mb-3">
              DTCP & RERA APPROVED SITES
            </span>
            <h2 className="text-[28px] sm:text-[34px] lg:text-[40px] font-display font-medium text-brand-dark tracking-[-0.02em] leading-tight mb-2 sm:mb-3">
              Featured Residential Layouts
            </h2>
            <p className="font-sans text-brand-muted text-[14px] sm:text-[15px] lg:text-[16px] leading-relaxed font-normal">
              Explore 100% legally verified residential plots and gated layout developments ready for instant home construction and high capital appreciation.
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-brand-divider/50">
            <span className="text-xs uppercase tracking-wider text-brand-muted">
              Displaying <strong className="text-brand-dark font-bold">{filteredProperties.length}</strong> of {properties.length} Layouts
            </span>
            {isFiltered && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-semibold text-brand-dark hover:text-brand-accent underline underline-offset-4 transition-colors"
              >
                <RotateCcw size={12} />
                <span>Reset All</span>
              </button>
            )}
          </div>
        </div>

        {/* 1-CLICK INTERACTIVE LOCATION PILLS BAR (Touch-scrollable on mobile) */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2 sm:mb-2.5">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-brand-muted">
              Select Region:
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-5 px-5 sm:mx-0 sm:px-0 no-scrollbar sm:flex-wrap">
            {locations.map((loc) => {
              const count = locationCounts[loc.id] || 0;
              const isActive = (selectedLocationFilter || 'All').toLowerCase() === loc.id.toLowerCase();

              return (
                <button
                  key={loc.id}
                  onClick={() => onLocationFilterChange && onLocationFilterChange(loc.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-[13px] font-medium tracking-wide transition-all duration-200 cursor-pointer select-none border ${
                    isActive
                      ? 'bg-brand-btn text-white border-brand-btn shadow-sm'
                      : 'bg-brand-white text-brand-dark border-brand-divider hover:border-brand-dark hover:bg-brand-canvas'
                  }`}
                >
                  <span>{loc.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-brand-canvas text-brand-muted'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1-CLICK INTERACTIVE PROPERTY TYPE PILLS & BUDGET ROW */}
        <div className="p-4 sm:p-5 bg-brand-canvas border border-brand-divider/70 mb-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          {/* Sub-Pills for Property Type */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-muted pr-2 hidden sm:inline">
              Category:
            </span>
            {propertyTypesList.map((type) => {
              const count = typeCounts[type] || 0;
              const isActive = selectedType.toLowerCase() === type.toLowerCase();
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`text-xs px-3 py-1.5 font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-brand-dark text-white font-semibold'
                      : 'bg-brand-white text-brand-muted hover:text-brand-dark border border-brand-divider/80'
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>

          {/* Budget Dropdown Filter */}
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full lg:w-auto border-t lg:border-t-0 pt-3 lg:pt-0 border-brand-divider/60">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-muted shrink-0">
              Budget:
            </span>
            <select
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(e.target.value)}
              className="bg-brand-white text-brand-dark text-sm sm:text-xs px-3 py-2 sm:py-1.5 border border-brand-divider outline-none focus:border-brand-dark cursor-pointer font-medium"
            >
              {budgetRanges.map((b) => (
                <option key={b.label} value={b.label}>{b.label}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Property Grid: 3 cols desktop, 2 tablet, 1 mobile */}
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            <AnimatePresence>
              {filteredProperties.map((property) => (
                <motion.article
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                  key={property.id}
                  className="group bg-brand-white flex flex-col cursor-pointer border border-brand-divider/40 hover:border-brand-divider hover:shadow-subtle transition-all duration-300"
                  onClick={() => onSelectProperty && onSelectProperty(property)}
                >
                  {/* Large Architectural Photography Container */}
                  <div className="relative aspect-[16/11] overflow-hidden bg-brand-canvas select-none">
                    <img
                      src={property.imageUrl}
                      alt={property.name}
                      loading="lazy"
                      className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                    
                    {/* Status / Category Tag */}
                    <div className="absolute top-4 left-4 bg-brand-white/95 backdrop-blur-xs px-2.5 py-1 text-[10px] font-semibold tracking-widest uppercase text-brand-dark shadow-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      <span>{property.approvals || property.propertyType}</span>
                    </div>

                    {/* Price Pill */}
                    <div className="absolute bottom-4 right-4 bg-brand-btn text-white px-3 py-1.5 text-xs font-semibold tracking-wide flex flex-col items-end">
                      <span>{property.startingPrice}</span>
                      {property.pricePerCent && (
                        <span className="text-[9px] font-normal text-white/80">{property.pricePerCent}</span>
                      )}
                    </div>
                  </div>

                  {/* Card Content & Architectural Details */}
                  <div className="p-6 flex flex-col flex-1 justify-between">
                    <div>
                      {/* Location Badge */}
                      <div className="flex items-center gap-1.5 font-sans text-[12px] sm:text-[13px] text-brand-muted mb-2 font-medium">
                        <MapPin size={13} className="text-brand-accent shrink-0" />
                        <span>{property.subLocation || property.location}, {property.location}</span>
                      </div>

                      {/* Project Title (Manrope) */}
                      <h3 className="text-xl sm:text-2xl font-display font-semibold text-brand-dark group-hover:text-black transition-colors mb-2 tracking-tight">
                        {property.name}
                      </h3>

                      {/* Short Description (Inter) */}
                      <p className="font-sans text-[14px] sm:text-[15px] text-brand-muted line-clamp-2 leading-relaxed mb-4 font-normal">
                        {property.description}
                      </p>
                    </div>

                    {/* Specifications Bar (Inter) */}
                    <div className="pt-4 border-t border-brand-divider/60 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 font-sans text-[12px] sm:text-[13px] uppercase tracking-wider text-brand-light-muted font-medium">
                        <span className="flex items-center gap-1 text-brand-dark font-semibold">
                          <Maximize size={12} className="text-brand-accent" />
                          {property.plotSizeCents || property.area}
                        </span>
                        <span>•</span>
                        <span className="text-brand-muted">
                          {property.roadWidth || '33ft Road'}
                        </span>
                      </div>

                      <span className="inline-flex items-center font-sans text-[13px] sm:text-[14px] font-semibold text-brand-dark group-hover:text-brand-accent transition-colors">
                        <span>View Layout</span>
                        <ArrowUpRight size={14} className="ml-0.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>

                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-20 text-center bg-brand-canvas border border-brand-divider/80 p-8">
            <h4 className="text-lg font-semibold text-brand-dark mb-2">No properties match your filter</h4>
            <p className="text-sm text-brand-muted mb-6">Try selecting a different region or resetting your filters.</p>
            <button
              onClick={handleResetFilters}
              className="btn-architectural text-xs py-2.5 px-6"
            >
              Show All Properties
            </button>
          </div>
        )}

      </div>
    </section>
  );
};

export default FeaturedProperties;
