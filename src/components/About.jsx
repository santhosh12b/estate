import React from 'react';
import { ArrowRight } from 'lucide-react';

const About = ({ onApproachClick }) => {
  return (
    <section id="about" className="w-full bg-brand-white py-16 sm:py-24 lg:py-32 border-b border-brand-divider">
      <div className="w-full max-w-7xl mx-auto px-5 sm:px-10 lg:px-16">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center">
          
          {/* LEFT: Large Architectural & Land Survey Photography */}
          <div className="lg:col-span-7">
            <div className="relative aspect-[4/3] overflow-hidden bg-brand-canvas shadow-subtle">
              <img
                src="/images/kubera-survey-about.jpg"
                alt="Kubera Vasal civil engineers and surveyors verifying residential layout master plan in Coimbatore"
                className="w-full h-full object-cover object-center transform hover:scale-[1.02] transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute bottom-4 left-4 bg-brand-white/95 px-3 py-1.5 text-[10px] uppercase tracking-widest text-brand-dark font-semibold">
                100% Legal Title & Master Plan Verification
              </div>
            </div>
          </div>

          {/* RIGHT: Editorial Text Composition */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <span className="font-sans text-[10px] sm:text-[11px] font-semibold tracking-[0.18em] uppercase text-brand-accent block mb-3 sm:mb-4">
              PROMOTERS OF TRUST & VALUE
            </span>

            <h2 className="text-[28px] sm:text-[34px] lg:text-[42px] font-display font-medium text-brand-dark tracking-[-0.02em] leading-[1.15] mb-4 sm:mb-6">
              Securing Clear Land. <br />
              <span className="font-semibold text-black">Building Real Value.</span>
            </h2>

            <p className="font-sans text-brand-muted text-[15px] sm:text-[16px] lg:text-[17px] leading-relaxed mb-6 sm:mb-8 font-normal" style={{ color: '#555555' }}>
              At Kubera Vasal, we specialize exclusively in DTCP & RERA approved residential layouts, gated community villa plots, and high-growth land investments in Coimbatore and key micro-markets. Every project includes blacktop tar roads, individual sweet water connections, street lighting, and 100% legal scrutiny for total peace of mind.
            </p>

            <div className="pt-2">
              <button
                onClick={() => {
                  if (onApproachClick) {
                    onApproachClick();
                  } else {
                    const services = document.querySelector('#services');
                    if (services) services.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="btn-outline-architectural w-full sm:w-auto justify-center text-[13px] sm:text-[14px] font-sans font-medium uppercase tracking-wider hover:shadow-subtle group"
              >
                <span>Discover Layout Amenities</span>
                <ArrowRight size={14} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default About;
