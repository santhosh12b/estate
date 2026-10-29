import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const servicesList = [
  {
    number: '01',
    title: 'Residential Properties',
    description: 'Carefully curated portfolio of architectural villas, contemporary homes, and scenic hillside estates.',
  },
  {
    number: '02',
    title: 'Property Consultation',
    description: 'Objective guidance on architectural orientation, land verification, master planning, and long-term livability.',
  },
  {
    number: '03',
    title: 'Site Visit Assistance',
    description: 'Personalized private walkthroughs scheduled at your convenience to experience lighting, ventilation, and surroundings.',
  },
  {
    number: '04',
    title: 'Buying Guidance',
    description: 'Clear documentation, transparent title scrutiny, and smooth transactional support from start to keys.',
  },
];

const Services = ({ onServiceSelect }) => {
  return (
    <section id="services" className="w-full bg-brand-white py-16 sm:py-24 lg:py-32 border-b border-brand-divider">
      <div className="w-full max-w-7xl mx-auto px-5 sm:px-10 lg:px-16">
        
        {/* Section Header */}
        <div className="max-w-xl mb-8 sm:mb-16">
          <span className="font-sans text-[10px] sm:text-[11px] font-semibold tracking-[0.18em] uppercase text-brand-accent block mb-2 sm:mb-3">
            CAPABILITIES
          </span>
          <h2 className="text-[28px] sm:text-[34px] lg:text-[40px] font-display font-medium text-brand-dark tracking-[-0.02em] leading-tight">
            Comprehensive Services
          </h2>
        </div>

        {/* 4 Items with Thin Dividers and Large Numbers */}
        <div className="border-t border-brand-divider">
          {servicesList.map((service) => (
            <div
              key={service.number}
              onClick={() => onServiceSelect && onServiceSelect(service.title)}
              className="group py-6 sm:py-10 border-b border-brand-divider flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-6 transition-colors duration-300 hover:bg-brand-canvas/60 px-2 sm:px-4 -mx-2 sm:-mx-4 cursor-pointer"
            >
              {/* Number and Title (Manrope) */}
              <div className="flex items-baseline gap-4 sm:gap-10 md:w-1/2">
                <span className="font-display font-light text-2xl sm:text-3xl text-brand-light-muted group-hover:text-brand-accent transition-colors shrink-0">
                  {service.number}
                </span>
                <h3 className="text-xl sm:text-2xl font-display font-semibold text-brand-dark group-hover:text-black transition-colors">
                  {service.title}
                </h3>
              </div>

              {/* Description & Action (Inter) */}
              <div className="md:w-1/2 flex items-center justify-between gap-4 pl-0 md:pl-0">
                <p className="font-sans text-[14px] sm:text-[15px] text-brand-muted leading-relaxed font-normal max-w-md">
                  {service.description}
                </p>

                <div className="flex w-8 h-8 sm:w-9 sm:h-9 items-center justify-center border border-brand-divider rounded-none group-hover:border-brand-dark group-hover:bg-brand-dark group-hover:text-white transition-all shrink-0">
                  <ArrowUpRight size={15} />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Services;
