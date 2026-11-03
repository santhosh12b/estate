import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, ShieldCheck, CheckCircle2, Film } from 'lucide-react';

function getEmbedUrl(rawUrl) {
  if (!rawUrl) return null;
  const url = rawUrl.trim();
  // YouTube regex matching youtu.be/ID or youtube.com/watch?v=ID
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
  }
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  }
  if (url.includes('/embed/')) {
    return url;
  }
  return null;
}

const VideoModal = ({ isOpen, onClose, videoData }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !videoData) return null;

  const isLegalVideo = videoData.type === 'legal';
  const embedUrl = videoData.embedUrl || getEmbedUrl(videoData.videoUrl);
  const isDirectVideo = Boolean(
    videoData.videoUrl && (
      videoData.videoUrl.endsWith('.mp4') || 
      videoData.videoUrl.endsWith('.webm') ||
      videoData.videoUrl.startsWith('data:video/') ||
      videoData.videoUrl.startsWith('blob:')
    )
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-10 bg-black/80 backdrop-blur-md">
        
        {/* Backdrop click to close */}
        <div className="absolute inset-0" onClick={onClose}></div>

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-4xl max-h-[92vh] bg-brand-white shadow-2xl border border-brand-divider flex flex-col overflow-hidden"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-brand-divider bg-brand-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-btn text-white flex items-center justify-center">
                {isLegalVideo ? <ShieldCheck size={16} /> : <Film size={16} />}
              </div>
              <div>
                <span className="font-sans text-[10px] uppercase tracking-widest font-semibold text-brand-accent block">
                  {isLegalVideo ? 'LEGAL DUE DILIGENCE VIDEO' : 'LAYOUT VIDEO WALKTHROUGH'}
                </span>
                <h3 className="text-lg sm:text-xl font-display font-semibold text-brand-dark tracking-tight">
                  {videoData.title || (isLegalVideo ? '100% Legal Title & Document Verification' : 'Layout Drone Tour')}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 bg-brand-canvas hover:bg-brand-dark hover:text-white transition-colors flex items-center justify-center border border-brand-divider cursor-pointer"
              aria-label="Close video"
            >
              <X size={18} />
            </button>
          </div>

          {/* Video Player Container (16:9 Aspect Ratio) */}
          <div className="relative aspect-[16/9] w-full bg-black overflow-hidden flex items-center justify-center group">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={videoData.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : isDirectVideo ? (
              <video
                src={videoData.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-cover"
              >
                Your browser does not support HTML5 video.
              </video>
            ) : (
              <div className="relative w-full h-full flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-zinc-900 via-neutral-900 to-black">
                {videoData.poster && (
                  <img
                    src={videoData.poster}
                    alt={videoData.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                  />
                )}
                
                <div className="relative z-10 flex flex-col items-center max-w-lg">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center mb-4 text-white shadow-xl transition-transform hover:scale-110 cursor-pointer">
                    <Play size={28} className="ml-1 text-white fill-white" />
                  </div>
                  
                  <span className="inline-block bg-brand-btn/90 text-white text-[11px] uppercase tracking-wider px-3 py-1 font-semibold mb-2">
                    {isLegalVideo ? 'Official Promoter Verification Video' : 'HD Layout Drone Tour'}
                  </span>
                  
                  <h4 className="text-white text-lg sm:text-2xl font-display font-semibold mb-2">
                    {videoData.title}
                  </h4>
                  <p className="text-white/80 text-xs sm:text-sm font-sans max-w-md">
                    {videoData.description || 'Watch our full on-ground video demonstration of the layout infrastructure, 33ft blacktop tar roads, sweet water facilities, and clear DTCP/RERA documentation.'}
                  </p>
                </div>

                <div className="absolute bottom-3 right-4 z-10 bg-black/60 px-2.5 py-1 text-[11px] text-white/90 font-mono tracking-wider">
                  03:45 MINS • FULL HD 1080P
                </div>
              </div>
            )}
          </div>

          {/* Key Checklist / Walkthrough Explanations */}
          <div className="p-5 sm:p-7 bg-brand-canvas border-t border-brand-divider overflow-y-auto">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-brand-dark mb-3">
              {isLegalVideo ? 'What You Will Learn In This Legal Verification Video:' : 'Featured Layout Infrastructure:'}
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs sm:text-[13px] text-brand-muted">
              {isLegalVideo ? (
                <>
                  <div className="flex items-start gap-2 bg-brand-white p-3 border border-brand-divider/70">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>30-Year Parent Document Search:</strong> How every title deed is vetted back to original ownership.</span>
                  </div>
                  <div className="flex items-start gap-2 bg-brand-white p-3 border border-brand-divider/70">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>DTCP & RERA Sanction Proof:</strong> Understanding layout approval numbers and approved road widths.</span>
                  </div>
                  <div className="flex items-start gap-2 bg-brand-white p-3 border border-brand-divider/70">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Nil Encumbrance Certificate (EC):</strong> Verifying zero bank hypothecation, litigation, or private claims.</span>
                  </div>
                  <div className="flex items-start gap-2 bg-brand-white p-3 border border-brand-divider/70">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Instant Patta Name Transfer:</strong> How individual revenue patta is legally transferred into your name.</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2 bg-brand-white p-3 border border-brand-divider/70">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>33ft & 30ft Blacktop Roads:</strong> High-density asphalt with durable curb stones.</span>
                  </div>
                  <div className="flex items-start gap-2 bg-brand-white p-3 border border-brand-divider/70">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Sweet Drinking Water Connection:</strong> Individual pipe delivered to each demarcated plot.</span>
                  </div>
                  <div className="flex items-start gap-2 bg-brand-white p-3 border border-brand-divider/70">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>80% to 90% Bank Loan Approved:</strong> Fast sanction with all nationalized and private banks.</span>
                  </div>
                  <div className="flex items-start gap-2 bg-brand-white p-3 border border-brand-divider/70">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Gated Security & Compound Wall:</strong> Grand arch entrance, solar street lights, and park area.</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VideoModal;

