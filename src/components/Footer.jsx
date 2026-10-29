import React, { useState } from 'react';
import { MessageCircle, ArrowUpRight, ShieldCheck, FileText } from 'lucide-react';

const Footer = ({ onContactClick }) => {
  const [activeLegalModal, setActiveLegalModal] = useState(null); // 'privacy' | 'terms' | null

  const handleScrollTo = (e, targetId) => {
    e.preventDefault();
    const element = document.querySelector(targetId);
    if (element) {
      const navHeight = 72;
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
      <footer className="w-full bg-brand-white border-t border-brand-divider py-12 sm:py-20 lg:py-24">
        <div className="w-full max-w-7xl mx-auto px-5 sm:px-10 lg:px-16">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-16 pb-12 sm:pb-16 border-b border-brand-divider">
            
            {/* Col 1: Brand & Bio (4 cols) */}
            <div className="lg:col-span-4 flex flex-col justify-between">
              <div>
                <a href="#home" className="inline-flex items-center gap-1.5 focus:outline-none mb-4">
                  <span className="font-display font-extrabold text-2xl text-brand-dark tracking-[0.22em] uppercase select-none">
                    ESTATE
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-accent mb-0.5"></span>
                </a>

                <p className="font-sans text-[14px] sm:text-[15px] text-brand-muted leading-relaxed font-normal max-w-sm mb-6" style={{ color: '#555555' }}>
                  A contemporary architectural real estate advisory dedicated to curating living spaces with calm geometric beauty, natural lighting, and enduring value.
                </p>

                {/* WhatsApp Action Button */}
                <a
                  href="https://wa.me/919842212345?text=Hello%20ESTATE%20Team,%20I%20would%20like%20to%20enquire%20about%20your%20architectural%20properties."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#111A18] text-white font-sans text-[13px] sm:text-[14px] font-semibold uppercase tracking-wider px-5 py-3 hover:bg-black transition-colors"
                >
                  <MessageCircle size={15} className="text-emerald-400" />
                  <span>WhatsApp Concierge</span>
                  <ArrowUpRight size={13} className="text-white/60" />
                </a>
              </div>
            </div>

            {/* Col 2: Navigation (2 cols) */}
            <div className="lg:col-span-2">
              <span className="font-sans text-[12px] uppercase tracking-wider font-semibold text-brand-dark block mb-4">
                Navigation
              </span>
              <ul className="space-y-3 font-sans text-[14px] sm:text-[15px] text-brand-muted">
                <li><a href="#home" onClick={(e) => handleScrollTo(e, '#home')} className="hover:text-brand-dark transition-colors">Home</a></li>
                <li><a href="#about" onClick={(e) => handleScrollTo(e, '#about')} className="hover:text-brand-dark transition-colors">About Us</a></li>
                <li><a href="#properties" onClick={(e) => handleScrollTo(e, '#properties')} className="hover:text-brand-dark transition-colors">Properties</a></li>
                <li><a href="#services" onClick={(e) => handleScrollTo(e, '#services')} className="hover:text-brand-dark transition-colors">Services</a></li>
                <li><a href="#locations" onClick={(e) => handleScrollTo(e, '#locations')} className="hover:text-brand-dark transition-colors">Locations</a></li>
              </ul>
            </div>

            {/* Col 3: Property Categories (3 cols) */}
            <div className="lg:col-span-3">
              <span className="font-sans text-[12px] uppercase tracking-wider font-semibold text-brand-dark block mb-4">
                Property Categories
              </span>
              <ul className="space-y-3 font-sans text-[14px] sm:text-[15px] text-brand-muted">
                <li><a href="#properties" onClick={(e) => handleScrollTo(e, '#properties')} className="hover:text-brand-dark transition-colors">Contemporary Villas</a></li>
                <li><a href="#properties" onClick={(e) => handleScrollTo(e, '#properties')} className="hover:text-brand-dark transition-colors">Hillside Residences</a></li>
                <li><a href="#properties" onClick={(e) => handleScrollTo(e, '#properties')} className="hover:text-brand-dark transition-colors">Terrace Penthouses</a></li>
                <li><a href="#properties" onClick={(e) => handleScrollTo(e, '#properties')} className="hover:text-brand-dark transition-colors">Architectural Enclave Plots</a></li>
              </ul>
            </div>

            {/* Col 4: Contact & Office (3 cols) */}
            <div className="lg:col-span-3">
              <span className="font-sans text-[12px] uppercase tracking-wider font-semibold text-brand-dark block mb-4">
                Advisory Office
              </span>
              <div className="space-y-2.5 font-sans text-[14px] text-brand-muted">
                <p className="leading-relaxed">
                  Suite 402, Race Course Towers,<br />
                  Race Course Road, Coimbatore,<br />
                  Tamil Nadu 641018, India
                </p>
                <p className="pt-2">
                  <span className="text-xs uppercase text-brand-light-muted block">Direct Lines</span>
                  <a href="tel:+919842212345" className="hover:text-brand-dark transition-colors block font-medium text-brand-dark">+91 98422 12345</a>
                  <a href="mailto:concierge@estate.com" className="hover:text-brand-dark transition-colors block text-xs">concierge@estate.com</a>
                </p>
              </div>
            </div>

          </div>

          {/* Bottom Copyright & Legal Links */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-muted font-normal">
            <div>
              &copy; {new Date().getFullYear()} ESTATE Architectural Living. All rights reserved.
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={() => setActiveLegalModal('privacy')}
                className="hover:text-brand-dark transition-colors inline-flex items-center gap-1"
              >
                <ShieldCheck size={13} />
                <span>Privacy Policy</span>
              </button>
              <button
                onClick={() => setActiveLegalModal('terms')}
                className="hover:text-brand-dark transition-colors inline-flex items-center gap-1"
              >
                <FileText size={13} />
                <span>Terms & Conditions</span>
              </button>
            </div>
          </div>

        </div>
      </footer>

      {/* LEGAL MODAL (Privacy & Terms) */}
      {activeLegalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-brand-white border border-brand-divider max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-10 shadow-2xl relative">
            <button
              onClick={() => setActiveLegalModal(null)}
              className="absolute top-6 right-6 text-brand-muted hover:text-brand-dark p-2"
            >
              ✕
            </button>

            <h3 className="text-2xl font-display font-semibold text-brand-dark mb-4">
              {activeLegalModal === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
            </h3>

            <div className="text-sm text-brand-muted leading-relaxed space-y-4">
              {activeLegalModal === 'privacy' ? (
                <>
                  <p>
                    ESTATE ("we", "our") is dedicated to protecting your privacy. We collect client contact details solely for personal property enquiries, site visit scheduling, and architectural consultations.
                  </p>
                  <p>
                    Your information is stored securely in private databases and is never sold, shared with third-party advertisers, or made public.
                  </p>
                  <p>
                    For questions regarding data processing or to request removal of your records, contact <a href="mailto:privacy@estate.com" className="text-brand-dark underline">privacy@estate.com</a>.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    All project specifications, dimensions, architectural renderings, and pricing shown on this platform are indicative and subject to final builder-buyer agreements.
                  </p>
                  <p>
                    Prospective purchasers are invited to conduct direct site inspections and independently verify all legal titles, encumbrance certificates, and RERA approvals with our advisory team prior to transaction.
                  </p>
                  <p>
                    Site visits must be pre-arranged to ensure private access and client convenience.
                  </p>
                </>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-brand-divider flex justify-end">
              <button
                onClick={() => setActiveLegalModal(null)}
                className="btn-architectural text-xs py-2 px-6"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
