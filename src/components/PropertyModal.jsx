import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Check, ArrowRight, Bed, Bath, Maximize } from 'lucide-react';

const PropertyModal = ({ property, onClose, onEnquire }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (property) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [property, onClose]);

  if (!property) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/60 backdrop-blur-xs">
        
        {/* Backdrop click to close */}
        <div className="absolute inset-0" onClick={onClose}></div>

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-brand-white shadow-2xl overflow-y-auto border border-brand-divider flex flex-col"
        >
          {/* Close Icon Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 bg-brand-white/90 backdrop-blur-xs hover:bg-brand-dark hover:text-white transition-colors flex items-center justify-center border border-brand-divider"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>

          {/* Top Hero Image Banner */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full bg-brand-canvas overflow-hidden">
            <img
              src={property.imageUrl}
              alt={property.name}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute bottom-4 left-4 bg-brand-dark text-white px-3 py-1 text-xs font-semibold tracking-wider uppercase">
              {property.propertyType}
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6 sm:p-10 flex flex-col gap-8">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-brand-divider pb-6">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-brand-muted mb-1.5">
                  <MapPin size={13} className="text-brand-accent" />
                  <span>{property.subLocation || property.location}, {property.location}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-semibold text-brand-dark">
                  {property.name}
                </h2>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase tracking-widest text-brand-light-muted block">Starting Price</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-brand-dark">{property.startingPrice}</span>
              </div>
            </div>

            {/* Architectural Specifications Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 bg-brand-canvas p-4 sm:p-5 border border-brand-divider/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-white border border-brand-divider/70">
                  <Bed size={18} className="text-brand-dark" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-brand-muted block">Bedrooms</span>
                  <span className="font-semibold text-xs sm:text-sm text-brand-dark">{property.bedrooms > 0 ? `${property.bedrooms} Suites` : 'Estate Plot'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-white border border-brand-divider/70">
                  <Bath size={18} className="text-brand-dark" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-brand-muted block">Bathrooms</span>
                  <span className="font-semibold text-xs sm:text-sm text-brand-dark">{property.bathrooms > 0 ? `${property.bathrooms} Baths` : 'NA'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-white border border-brand-divider/70">
                  <Maximize size={18} className="text-brand-dark" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-brand-muted block">Total Area</span>
                  <span className="font-semibold text-xs sm:text-sm text-brand-dark">{property.area}</span>
                </div>
              </div>
            </div>

            {/* Description (Inter) */}
            <div>
              <h3 className="font-sans text-[11px] sm:text-[12px] uppercase tracking-wider font-semibold text-brand-dark mb-2">Architectural Concept</h3>
              <p className="font-sans text-[14px] sm:text-[15px] lg:text-[16px] text-brand-muted leading-relaxed font-normal">
                {property.description}
              </p>
            </div>

            {/* Features Checklist (Inter) */}
            {property.features && property.features.length > 0 && (
              <div>
                <h3 className="font-sans text-[11px] sm:text-[12px] uppercase tracking-wider font-semibold text-brand-dark mb-3">Key Highlights</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {property.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 font-sans text-[13px] text-brand-dark">
                      <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <Check size={11} />
                      </div>
                      <span className="font-medium">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Modal CTA */}
            <div className="pt-6 border-t border-brand-divider flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="font-sans text-xs sm:text-[13px] text-brand-muted">
                Available for private walkthroughs upon appointment.
              </div>

              <button
                onClick={() => {
                  onClose();
                  if (onEnquire) onEnquire(property);
                }}
                className="btn-architectural w-full sm:w-auto h-11 px-8 text-[13px] sm:text-[14px] font-sans uppercase tracking-wider font-medium flex items-center justify-center gap-2"
              >
                <span>Enquire About This Property</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PropertyModal;
