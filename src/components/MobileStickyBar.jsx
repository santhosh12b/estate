import React from 'react';
import { MessageCircle, Phone, ArrowUpRight, Mail } from 'lucide-react';

const MobileStickyBar = ({ onContactClick, isHidden = false }) => {
  if (isHidden) return null;

  return (
    <aside 
      aria-label="Mobile quick actions"
      className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-brand-white/95 backdrop-blur-md border-t border-brand-divider px-4 py-2.5 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] flex items-center justify-between gap-2.5"
    >
      {/* 1. Quick WhatsApp Concierge Button */}
      <a
        href="https://wa.me/919842212345?text=Hello%20ESTATE%20Team,%20I%20am%20interested%20in%20inquiring%20about%20your%20properties."
        target="_blank"
        rel="noopener noreferrer"
        className="h-11 px-3.5 bg-brand-canvas hover:bg-brand-canvas/80 text-brand-dark border border-brand-divider flex items-center justify-center gap-1.5 font-sans text-[12px] font-semibold uppercase tracking-wider shrink-0 transition-colors"
        aria-label="WhatsApp Concierge"
      >
        <MessageCircle size={16} className="text-emerald-600" />
        <span className="text-[11px] font-medium tracking-wide">WhatsApp</span>
      </a>

      {/* 2. Direct Phone Call Button */}
      <a
        href="tel:+919842212345"
        className="h-11 w-11 bg-brand-canvas hover:bg-brand-canvas/80 text-brand-dark border border-brand-divider flex items-center justify-center shrink-0 transition-colors"
        aria-label="Call Advisory Desk"
      >
        <Phone size={15} />
      </a>

      {/* 3. Prominent Black 'Contact Us' Popup Trigger Button */}
      <button
        onClick={onContactClick}
        className="btn-architectural flex-1 h-11 text-[13px] font-sans uppercase tracking-wider font-semibold flex items-center justify-center gap-2 shadow-xs"
        aria-label="Open contact consultation popup"
      >
        <Mail size={14} />
        <span>Contact Us</span>
        <ArrowUpRight size={14} />
      </button>
    </aside>
  );
};

export default MobileStickyBar;
