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
                  <span className="font-display font-extrabold text-2xl text-brand-dark tracking-[0.16em] uppercase select-none">
                    KUBERA VASAL
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-accent mb-0.5"></span>
                </a>

                <p className="font-sans text-[14px] sm:text-[15px] text-brand-muted leading-relaxed font-normal max-w-sm mb-6" style={{ color: '#555555' }}>
                  Premier promoter of DTCP & RERA approved residential layouts, gated community villa plots, and high-growth land investments across Coimbatore, Karamadai, Annur, and Kovilpalayam.
                </p>

                {/* WhatsApp Action Button */}
                <a
                  href="https://wa.me/919842212345?text=Hello%20Kubera%20Vasal%20Team,%20I%20would%20like%20to%20enquire%20about%20your%20approved%20plots%20and%20schedule%20a%20free%20site%20visit."
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
                <li><a href="#properties" onClick={(e) => handleScrollTo(e, '#properties')} className="hover:text-brand-dark transition-colors">Layouts & Plots</a></li>
                <li><a href="#services" onClick={(e) => handleScrollTo(e, '#services')} className="hover:text-brand-dark transition-colors">Infrastructure</a></li>
                <li><a href="#locations" onClick={(e) => handleScrollTo(e, '#locations')} className="hover:text-brand-dark transition-colors">Locations</a></li>
              </ul>
            </div>

            {/* Col 3: Property Categories (3 cols) */}
            <div className="lg:col-span-3">
              <span className="font-sans text-[12px] uppercase tracking-wider font-semibold text-brand-dark block mb-4">
                Plot Categories
              </span>
              <ul className="space-y-3 font-sans text-[14px] sm:text-[15px] text-brand-muted">
                <li><a href="#properties" onClick={(e) => handleScrollTo(e, '#properties')} className="hover:text-brand-dark transition-colors">Gated Community Plots</a></li>
                <li><a href="#properties" onClick={(e) => handleScrollTo(e, '#properties')} className="hover:text-brand-dark transition-colors">Residential Villa Plots</a></li>
                <li><a href="#properties" onClick={(e) => handleScrollTo(e, '#properties')} className="hover:text-brand-dark transition-colors">Commercial & Villa Sites</a></li>
                <li><a href="#properties" onClick={(e) => handleScrollTo(e, '#properties')} className="hover:text-brand-dark transition-colors">Farm & Villa Sites</a></li>
              </ul>
            </div>

            {/* Col 4: Contact & Office (3 cols) */}
            <div className="lg:col-span-3">
              <span className="font-sans text-[12px] uppercase tracking-wider font-semibold text-brand-dark block mb-4">
                Promoter Office
              </span>
              <div className="space-y-2.5 font-sans text-[14px] text-brand-muted">
                <p className="leading-relaxed">
                  Kubera Vasal Promoters & Developers,<br />
                  Suite 402, Sathy Main Road,<br />
                  Near IT Corridor, Coimbatore,<br />
                  Tamil Nadu 641035, India
                </p>
                <p className="pt-2">
                  <span className="text-xs uppercase text-brand-light-muted block">Direct Desk</span>
                  <a href="tel:+919842212345" className="hover:text-brand-dark transition-colors block font-medium text-brand-dark">+91 98422 12345</a>
                  <a href="mailto:contact@kuberavasal.in" className="hover:text-brand-dark transition-colors block text-xs">contact@kuberavasal.in</a>
                </p>
              </div>
            </div>

          </div>

          {/* Bottom Copyright & Legal Links */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-muted font-normal">
            <div>
              &copy; {new Date().getFullYear()} Kubera Vasal Promoters. All rights reserved.
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={() => setActiveLegalModal('privacy')}
                className="hover:text-brand-dark transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <ShieldCheck size={13} />
                <span>Privacy Policy</span>
              </button>
              <button
                onClick={() => setActiveLegalModal('terms')}
                className="hover:text-brand-dark transition-colors inline-flex items-center gap-1 cursor-pointer"
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
              className="absolute top-6 right-6 text-brand-muted hover:text-brand-dark p-2 cursor-pointer"
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
                    Kubera Vasal ("we", "our") is dedicated to protecting your privacy. We collect client contact details solely for personal property enquiries, site visit scheduling, and legal land consultations.
                  </p>
                  <p>
                    Your information is stored securely in private databases and is never sold, shared with third-party advertisers, or made public.
                  </p>
                  <p>
                    For questions regarding data processing or to request removal of your records, contact <a href="mailto:privacy@kuberavasal.in" className="text-brand-dark underline">privacy@kuberavasal.in</a>.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    All layout maps, plot dimensions, DTCP & RERA approval numbers, and pricing shown on this platform are verified with government records and subject to registered promoter-buyer agreements.
                  </p>
                  <p>
                    Prospective purchasers are invited to conduct direct on-ground site inspections and independently verify all legal parent titles, encumbrance certificates, and RERA approvals with our legal advisory team prior to registration.
                  </p>
                  <p>
                    Free cab pick-up & drop is arranged for scheduled site inspections.
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
