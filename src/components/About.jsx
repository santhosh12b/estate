import React from 'react';
import { ArrowRight, Play, ShieldCheck } from 'lucide-react';

const About = ({ onApproachClick, onWatchLegalVideo }) => {
  return (
    <section id="about" className="w-full bg-brand-white py-16 sm:py-24 lg:py-32 border-b border-brand-divider">
      <div className="w-full max-w-7xl mx-auto px-5 sm:px-10 lg:px-16">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center">
          
          {/* LEFT: Legal Explanation Video Showcase Container */}
          <div className="lg:col-span-7">
            <div 
              onClick={() => onWatchLegalVideo && onWatchLegalVideo()}
              className="group relative aspect-[4/3] overflow-hidden bg-brand-canvas shadow-subtle cursor-pointer border border-brand-divider/70"
            >
              <img
                src="/images/kubera-survey-about.jpg"
                alt="Gubera Vasal legal document verification and land survey in Coimbatore"
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />

              {/* Gentle darkening gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20 group-hover:from-black/85 transition-opacity"></div>

              {/* Top Legal Badge */}
              <div className="absolute top-4 left-4 bg-brand-white/95 backdrop-blur-xs px-3 py-1.5 text-[10px] sm:text-[11px] uppercase tracking-widest text-brand-dark font-semibold flex items-center gap-1.5 shadow-sm">
                <ShieldCheck size={14} className="text-emerald-700" />
                <span>100% Legal Scrutiny & Title Check</span>
              </div>

              {/* Center Prominent Play Button */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 text-brand-btn flex items-center justify-center shadow-2xl transform group-hover:scale-110 group-hover:bg-white transition-all duration-300 mb-3">
                  <Play size={26} className="ml-1 fill-brand-btn text-brand-btn" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-white tracking-wide uppercase font-sans drop-shadow-md">
                  Watch Legal Explanation Video
                </span>
                <span className="text-[11px] text-white/80 font-sans mt-0.5">
                  Parent Documents, DTCP & RERA Approvals Explained (03:45)
                </span>
              </div>

              {/* Bottom Tag */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white/90 text-[11px] font-medium font-sans">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Video Guide Available
                </span>
                <span className="underline underline-offset-4 group-hover:text-brand-accent transition-colors">
                  Click to Watch Video →
                </span>
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
              At <strong>Gubera Vasal</strong>, we specialize exclusively in DTCP & RERA approved residential layouts, gated community villa plots, and high-growth land investments in Coimbatore and key micro-markets. Every project includes blacktop tar roads, individual sweet water connections, street lighting, and 100% legal scrutiny for total peace of mind.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={() => onWatchLegalVideo && onWatchLegalVideo()}
                className="btn-architectural text-[13px] sm:text-[14px] font-sans font-medium uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Play size={14} className="fill-white" />
                <span>Watch Legal Video</span>
              </button>

              <button
                onClick={() => {
                  if (onApproachClick) {
                    onApproachClick();
                  } else {
                    const services = document.querySelector('#services');
                    if (services) services.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="btn-outline-architectural text-[13px] sm:text-[14px] font-sans font-medium uppercase tracking-wider hover:shadow-subtle group justify-center"
              >
                <span>Layout Amenities</span>
                <ArrowRight size={14} className="ml-1.5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default About;
