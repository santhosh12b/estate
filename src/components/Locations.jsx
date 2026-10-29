import React from 'react';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { locationsList } from '../data/properties';

const Locations = ({ onSelectLocation }) => {
  return (
    <section id="locations" className="w-full bg-brand-white py-16 sm:py-24 lg:py-32 border-b border-brand-divider">
      <div className="w-full max-w-7xl mx-auto px-5 sm:px-10 lg:px-16">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-16 gap-6">
          <div className="max-w-xl">
            <span className="font-sans text-[10px] sm:text-[11px] font-semibold tracking-[0.18em] uppercase text-brand-accent block mb-2 sm:mb-3">
              KEY GROWTH CORRIDORS
            </span>
            <h2 className="text-[28px] sm:text-[34px] lg:text-[40px] font-display font-medium text-brand-dark tracking-[-0.02em] leading-tight">
              Prime Plot Locations
            </h2>
          </div>
          <p className="font-sans text-[14px] sm:text-[15px] text-brand-muted leading-relaxed max-w-sm">
            High-appreciation residential layout corridors in Coimbatore, Karamadai, Annur & Kovilpalayam with ready infrastructure.
          </p>
        </div>

        {/* 4 Large Location Image Panels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {locationsList.map((loc) => (
            <div
              key={loc.id}
              onClick={() => onSelectLocation && onSelectLocation(loc.name)}
              className="group relative aspect-[4/5] sm:aspect-[3/4] overflow-hidden bg-brand-canvas cursor-pointer shadow-subtle border border-brand-divider/40"
            >
              {/* Architectural Location Image */}
              <img
                src={loc.imageUrl}
                alt={loc.name}
                loading="lazy"
                className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Gentle darkening overlay for high contrast text */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 transition-opacity group-hover:from-black/90"></div>

              {/* Top Verified Count Tag */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs text-brand-dark font-sans text-[11px] font-semibold tracking-wider px-2.5 py-1">
                {loc.count} Approved {loc.count === 1 ? 'Layout' : 'Layouts'}
              </div>

              {/* Bottom Details */}
              <div className="absolute bottom-0 left-0 w-full p-6 text-white flex flex-col justify-end">
                <div className="flex items-center gap-1.5 font-sans text-xs text-white/80 mb-1">
                  <MapPin size={12} className="text-brand-accent" />
                  <span className="tracking-widest uppercase text-[10px]">Micro-Market</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-display font-semibold text-white mb-1.5 group-hover:text-brand-accent transition-colors">
                  {loc.name}
                </h3>

                <p className="font-sans text-[12px] sm:text-[13px] text-white/75 line-clamp-2 leading-relaxed mb-3">
                  {loc.description}
                </p>

                <div className="flex items-center gap-1.5 font-sans text-[12px] sm:text-[13px] font-semibold tracking-wider uppercase text-white group-hover:underline">
                  <span>Explore Layouts</span>
                  <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Locations;
