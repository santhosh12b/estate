import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

const Hero = ({ onExploreClick, onSelectRegion }) => {
  const handleScrollToProperties = () => {
    if (onExploreClick) {
      onExploreClick();
      return;
    }
    const element = document.querySelector('#properties');
    if (element) {
      const navHeight = window.innerWidth < 640 ? 64 : 72;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section 
      id="home"
      className="relative w-full bg-brand-white overflow-hidden border-b border-brand-divider"
      style={{ minHeight: 'clamp(640px, 85vh, 840px)' }}
    >
      <div className="relative w-full h-full min-h-[inherit] flex flex-col justify-end lg:justify-center">
        
        {/* Architectural Photograph Layer */}
        <div className="absolute top-0 right-0 w-full lg:w-[72%] h-full z-0 select-none pointer-events-none">
          <img 
            src="/images/hero-villa.jpg" 
            alt="Modern contemporary luxury villa architecture" 
            className="w-full h-full object-cover object-center lg:object-[60%_center]"
            loading="eager"
            fetchpriority="high"
          />

          {/* DESKTOP GRADIENT: Soft subtle white fade from left to right */}
          <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-brand-white via-brand-white/80 via-35% to-transparent to-75%"></div>

          {/* TABLET / MOBILE GRADIENT: Rich vertical architectural fade to ensure 100% crisp typography */}
          <div className="lg:hidden absolute inset-0 bg-gradient-to-t from-brand-white via-brand-white/95 via-45% to-black/20"></div>
          <div className="lg:hidden absolute inset-0 bg-gradient-to-r from-brand-white/95 via-brand-white/70 to-transparent"></div>
        </div>

        {/* Content Container (Full Width with max-w-7xl centered) */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-10 lg:px-16 pt-20 pb-12 sm:py-24 lg:py-28 flex flex-col justify-center">
          
          <div className="max-w-xl">
            {/* Eyebrow Label */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-2 mb-3 sm:mb-6"
            >
              <span className="w-5 sm:w-6 h-[1.5px] bg-brand-accent"></span>
              <span className="font-sans text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-brand-accent">
                THOUGHTFULLY DESIGNED SPACES
              </span>
            </motion.div>

            {/* Main Editorial Heading: 56–64px desktop, 38–42px mobile (Manrope) */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-medium text-brand-dark tracking-[-0.03em] leading-[1.12] mb-4 sm:mb-8 text-[38px] sm:text-[42px] lg:text-[58px] xl:text-[64px]"
              style={{ maxWidth: '440px' }}
            >
              Built for <br />
              <span className="font-semibold text-black">Modern</span> <br />
              Living
            </motion.h1>

            {/* Supporting Paragraph: 15–17px desktop, 14–16px mobile (Inter) */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="font-sans text-brand-muted text-[14px] sm:text-[15px] lg:text-[16px] xl:text-[17px] leading-relaxed mb-6 sm:mb-10 font-normal max-w-sm sm:max-w-md"
              style={{ color: '#555555' }}
            >
              Discover modern property solutions designed to support confident decisions, simplify the buying process, and create lasting value for every step forward.
            </motion.p>

            {/* CTAs (Inter) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6"
            >
              <button
                onClick={handleScrollToProperties}
                className="btn-architectural w-full sm:w-auto h-12 sm:h-[48px] min-w-[150px] text-[13px] sm:text-[14px] font-sans font-medium uppercase tracking-wider shadow-sm hover:shadow-md transition-all group"
              >
                <span>Get Started</span>
                <span className="ml-2 transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
              </button>

              <button
                onClick={() => {
                  const about = document.querySelector('#about');
                  if (about) {
                    about.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="hidden sm:inline-flex items-center text-[13px] sm:text-[14px] font-sans tracking-wider uppercase font-semibold text-brand-dark hover:text-brand-accent transition-colors"
              >
                <span>Learn More</span>
                <span className="ml-1 text-base">→</span>
              </button>
            </motion.div>

            {/* Region Quick-Jump Strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-brand-divider/70 flex flex-wrap items-center gap-2"
            >
              <span className="text-[10px] uppercase tracking-widest font-semibold text-brand-muted mr-1 w-full sm:w-auto">
                Explore Regions:
              </span>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {['Coimbatore', 'Karamadai', 'Annur', 'Kovilpalayam'].map((region) => (
                  <button
                    key={region}
                    onClick={() => onSelectRegion ? onSelectRegion(region) : handleScrollToProperties()}
                    className="text-[11px] bg-brand-canvas hover:bg-brand-dark hover:text-white text-brand-dark px-3 py-1.5 border border-brand-divider/80 transition-colors font-medium select-none"
                  >
                    {region}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

        </div>

        {/* Bottom indicator hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-2 text-brand-light-muted/60 hover:text-brand-dark cursor-pointer transition-colors" onClick={handleScrollToProperties}>
          <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Scroll</span>
          <ArrowDown size={12} className="animate-bounce" />
        </div>

      </div>
    </section>
  );
};

export default Hero;
