import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = ({ onContactClick, activeSection = 'home' }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll and listen for Escape key when mobile menu is open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };

    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Plots & Layouts', href: '#properties' },
    { name: 'Services', href: '#services' },
    { name: 'Locations', href: '#locations' },
  ];

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
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
    <>
      <header 
        className={`sticky top-0 z-40 w-full bg-brand-white transition-all duration-300 ${
          isScrolled 
            ? 'shadow-xs border-b border-brand-divider/80' 
            : 'border-b border-brand-divider'
        } h-16 sm:h-[72px]`}
      >
        <div className="h-full w-full max-w-7xl mx-auto px-5 sm:px-10 lg:px-16 flex items-center justify-between">
          {/* LEFT: Logo */}
          <a 
            href="#home" 
            onClick={(e) => handleNavClick(e, '#home')}
            className="group flex items-center gap-1.5 focus:outline-none"
          >
            <span className="font-display font-extrabold text-lg sm:text-2xl text-brand-dark tracking-[0.16em] sm:tracking-[0.2em] uppercase select-none transition-opacity group-hover:opacity-80">
              KUBERA VASAL
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent mb-0.5"></span>
          </a>

          {/* CENTER: Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-11">
            {navLinks.slice(0, 4).map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="relative font-sans text-[14px] sm:text-[15px] font-medium tracking-wide uppercase text-brand-muted hover:text-brand-dark transition-colors py-1 group"
              >
                <span>{link.name}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-brand-dark transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          {/* RIGHT: Outlined Contact Us Button (Desktop) */}
          <div className="hidden md:flex items-center">
            <button
              onClick={onContactClick}
              className="btn-outline-architectural hover:shadow-subtle"
            >
              <span>Book Site Visit</span>
            </button>
          </div>

          {/* MOBILE: Hamburger Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 text-brand-dark hover:text-black focus:outline-none"
              aria-label="Open navigation menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* FULL-SCREEN MOBILE NAVIGATION OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 bg-brand-white flex flex-col justify-between p-6 sm:p-10 md:hidden overflow-y-auto"
          >
            {/* Top Bar inside Overlay: Logo & Close Button */}
            <div className="flex items-center justify-between border-b border-brand-divider/80 pb-5">
              <a 
                href="#home" 
                onClick={(e) => handleNavClick(e, '#home')}
                className="flex items-center gap-1.5"
              >
                <span className="font-display font-extrabold text-xl text-brand-dark tracking-[0.16em] uppercase">
                  KUBERA VASAL
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent mb-0.5"></span>
              </a>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-brand-dark hover:text-black focus:outline-none border border-brand-divider"
                aria-label="Close navigation menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* Middle: Editorial Large Navigation Links */}
            <nav className="flex flex-col py-8 space-y-6">
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-brand-accent block">
                Menu Directory
              </span>

              {navLinks.map((link, idx) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="group flex items-center justify-between text-2xl font-display font-medium text-brand-dark hover:text-black transition-colors"
                >
                  <span className="tracking-tight">{link.name}</span>
                  <span className="text-xs font-mono text-brand-light-muted group-hover:text-brand-dark transition-colors">
                    0{idx + 1}
                  </span>
                </a>
              ))}

              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  if (onContactClick) onContactClick();
                }}
                className="group flex items-center justify-between text-2xl font-display font-medium text-brand-dark hover:text-black transition-colors pt-2 border-t border-brand-divider/50"
              >
                <span className="tracking-tight">Contact Us</span>
                <span className="text-xs font-mono text-brand-light-muted group-hover:text-brand-dark transition-colors">
                  06
                </span>
              </a>
            </nav>

            {/* Bottom: Direct Contact Details & Prominent Black Contact Button */}
            <div className="pt-6 border-t border-brand-divider space-y-4">
              <div className="text-xs text-brand-muted space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-brand-light-muted block">Advisory Desk</span>
                <p className="font-medium text-brand-dark">+91 98422 12345 • contact@kuberavasal.in</p>
              </div>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onContactClick) onContactClick();
                }}
                className="btn-architectural w-full h-12 text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2"
              >
                <span>Contact Us</span>
                <ArrowUpRight size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
