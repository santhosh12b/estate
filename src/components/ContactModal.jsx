import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Loader2, ArrowRight, MapPin, Building, ShieldCheck } from 'lucide-react';
import { submitEnquiryToSheets } from '../services/googleSheets';

const ContactModal = ({ isOpen, onClose, prefilledProperty = null }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    preferredLocation: 'Coimbatore',
    propertyType: 'Villa',
    budget: '₹1.5 Cr – ₹3.0 Cr',
    message: ''
  });

  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const isSubmittingRef = useRef(false);

  // Sync prefilled property when modal opens
  useEffect(() => {
    if (isOpen) {
      if (prefilledProperty) {
        setFormData({
          fullName: '',
          phoneNumber: '',
          email: '',
          preferredLocation: prefilledProperty.location || 'Coimbatore',
          propertyType: prefilledProperty.propertyType || 'Villa',
          budget: prefilledProperty.startingPrice ? `Starting ${prefilledProperty.startingPrice}` : '₹1.5 Cr – ₹3.0 Cr',
          message: `I am interested in exploring ${prefilledProperty.name} (${prefilledProperty.location}). Please provide master floor plans and schedule a private consultation.`
        });
      } else {
        setFormData(prev => ({
          ...prev,
          preferredLocation: prev.preferredLocation || 'Coimbatore',
          propertyType: prev.propertyType || 'Villa',
          budget: prev.budget || '₹1.5 Cr – ₹3.0 Cr'
        }));
      }
      setStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen, prefilledProperty]);

  // Lock body scroll and listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e) => {
    const cleaned = e.target.value.replace(/[^0-9+ ]/g, '');
    setFormData(prev => ({ ...prev, phoneNumber: cleaned }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmittingRef.current || status === 'submitting') return;

    // Validate phone number (minimum 10 digits)
    const digitsOnly = formData.phoneNumber.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      setErrorMessage('Please enter a valid phone number with at least 10 digits.');
      setStatus('error');
      return;
    }

    isSubmittingRef.current = true;
    setStatus('submitting');
    setErrorMessage('');

    try {
      await submitEnquiryToSheets(formData);
      setStatus('success');
      // Reset form
      setFormData({
        fullName: '',
        phoneNumber: '',
        email: '',
        preferredLocation: 'Coimbatore',
        propertyType: 'Villa',
        budget: '₹1.5 Cr – ₹3.0 Cr',
        message: ''
      });
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMessage('There was a temporary problem dispatching your enquiry. Please check your connection or contact us directly via WhatsApp.');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-black/65 backdrop-blur-xs">
        
        {/* Backdrop click to close */}
        <div 
          className="absolute inset-0" 
          onClick={onClose}
          aria-label="Close modal backdrop"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-2xl max-h-[92vh] bg-brand-white shadow-2xl border border-brand-divider flex flex-col overflow-hidden"
        >
          {/* Header Strip with Title and Close Button */}
          <div className="flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5 border-b border-brand-divider bg-brand-white sticky top-0 z-20">
            <div>
              <span className="font-sans text-[10px] sm:text-[11px] font-semibold tracking-[0.18em] uppercase text-brand-accent block">
                DIRECT CONSULTATION
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-brand-dark tracking-tight">
                {prefilledProperty ? `Enquire About ${prefilledProperty.name}` : "Let's Find Your Next Property"}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-brand-canvas hover:bg-brand-dark hover:text-white transition-colors flex items-center justify-center border border-brand-divider shrink-0 ml-4"
              aria-label="Close contact popup"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Form Body */}
          <div className="p-5 sm:p-8 overflow-y-auto flex-1">
            
            {/* If a property was prefilled, show a nice compact architectural preview card */}
            {prefilledProperty && (
              <div className="mb-6 p-3 sm:p-4 bg-brand-canvas border border-brand-divider/80 flex items-center gap-3 sm:gap-4">
                {prefilledProperty.imageUrl && (
                  <img
                    src={prefilledProperty.imageUrl}
                    alt={prefilledProperty.name}
                    className="w-16 h-14 sm:w-20 sm:h-16 object-cover border border-brand-divider shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-[11px] text-brand-muted mb-0.5">
                    <MapPin size={12} className="text-brand-accent shrink-0" />
                    <span className="truncate">{prefilledProperty.location}</span>
                  </div>
                  <h4 className="font-display font-semibold text-sm sm:text-base text-brand-dark truncate">
                    {prefilledProperty.name}
                  </h4>
                  <span className="text-xs font-bold text-brand-dark block mt-0.5">
                    {prefilledProperty.startingPrice}
                  </span>
                </div>
              </div>
            )}

            {status === 'success' ? (
              <div className="py-10 px-4 text-center flex flex-col items-center justify-center animate-in fade-in duration-300">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4 border border-emerald-200">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-display font-semibold text-brand-dark mb-2">Enquiry Received</h3>
                <p className="text-sm text-brand-muted max-w-md leading-relaxed mb-6 font-normal">
                  Thank you for reaching out. Our architectural property advisor will review your preferences and contact you within 24 hours.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="btn-outline-architectural text-xs py-2.5 px-6 justify-center"
                  >
                    Submit Another Enquiry
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-architectural text-xs py-2.5 px-6 justify-center"
                  >
                    Done / Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {status === 'error' && (
                  <div className="p-3.5 bg-red-50/90 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2.5">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{errorMessage || 'An error occurred while submitting. Please try again.'}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="modalFullName" className="block text-[11px] uppercase tracking-wider font-semibold text-brand-dark mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="modalFullName"
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Vikramaditya Rao"
                      className="w-full bg-brand-canvas text-brand-dark text-base sm:text-sm px-3.5 py-2.5 sm:py-3 border border-brand-divider outline-none focus:border-brand-dark transition-colors"
                      disabled={status === 'submitting'}
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="modalPhoneNumber" className="block text-[11px] uppercase tracking-wider font-semibold text-brand-dark mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="modalPhoneNumber"
                      type="tel"
                      name="phoneNumber"
                      required
                      value={formData.phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="+91 98422 00000"
                      className="w-full bg-brand-canvas text-brand-dark text-base sm:text-sm px-3.5 py-2.5 sm:py-3 border border-brand-divider outline-none focus:border-brand-dark transition-colors"
                      disabled={status === 'submitting'}
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="modalEmail" className="block text-[11px] uppercase tracking-wider font-semibold text-brand-dark mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="modalEmail"
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="vikram@example.com"
                    className="w-full bg-brand-canvas text-brand-dark text-base sm:text-sm px-3.5 py-2.5 sm:py-3 border border-brand-divider outline-none focus:border-brand-dark transition-colors"
                    disabled={status === 'submitting'}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                  {/* Preferred Location */}
                  <div>
                    <label htmlFor="modalPreferredLocation" className="block text-[11px] uppercase tracking-wider font-semibold text-brand-dark mb-1.5">
                      Preferred Location
                    </label>
                    <select
                      id="modalPreferredLocation"
                      name="preferredLocation"
                      value={formData.preferredLocation}
                      onChange={handleChange}
                      className="w-full bg-brand-canvas text-brand-dark text-base sm:text-sm px-3 py-2.5 sm:py-3 border border-brand-divider outline-none focus:border-brand-dark transition-colors cursor-pointer"
                      disabled={status === 'submitting'}
                    >
                      <option value="Coimbatore">Coimbatore</option>
                      <option value="Karamadai">Karamadai</option>
                      <option value="Annur">Annur</option>
                      <option value="Kovilpalayam">Kovilpalayam</option>
                      <option value="Flexible">Flexible / Open</option>
                    </select>
                  </div>

                  {/* Property Type */}
                  <div>
                    <label htmlFor="modalPropertyType" className="block text-[11px] uppercase tracking-wider font-semibold text-brand-dark mb-1.5">
                      Property Type
                    </label>
                    <select
                      id="modalPropertyType"
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleChange}
                      className="w-full bg-brand-canvas text-brand-dark text-base sm:text-sm px-3 py-2.5 sm:py-3 border border-brand-divider outline-none focus:border-brand-dark transition-colors cursor-pointer"
                      disabled={status === 'submitting'}
                    >
                      <option value="Villa">Villa</option>
                      <option value="Contemporary Residence">Contemporary Residence</option>
                      <option value="Penthouse">Penthouse</option>
                      <option value="Architectural Plot">Architectural Plot</option>
                      <option value="Any Type">Any Type</option>
                    </select>
                  </div>

                  {/* Budget */}
                  <div>
                    <label htmlFor="modalBudget" className="block text-[11px] uppercase tracking-wider font-semibold text-brand-dark mb-1.5">
                      Budget Range
                    </label>
                    <select
                      id="modalBudget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="w-full bg-brand-canvas text-brand-dark text-base sm:text-sm px-3 py-2.5 sm:py-3 border border-brand-divider outline-none focus:border-brand-dark transition-colors cursor-pointer"
                      disabled={status === 'submitting'}
                    >
                      <option value="Under ₹1.5 Cr">Under ₹1.5 Cr</option>
                      <option value="₹1.5 Cr – ₹3.0 Cr">₹1.5 Cr – ₹3.0 Cr</option>
                      <option value="Above ₹3.0 Cr">Above ₹3.0 Cr</option>
                      <option value="Flexible">Flexible</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="modalMessage" className="block text-[11px] uppercase tracking-wider font-semibold text-brand-dark mb-1.5">
                    Message / Spatial Preferences
                  </label>
                  <textarea
                    id="modalMessage"
                    name="message"
                    rows={2}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your requirements, preferred layout, or timeline..."
                    className="w-full bg-brand-canvas text-brand-dark text-base sm:text-sm px-3.5 py-2.5 border border-brand-divider outline-none focus:border-brand-dark transition-colors resize-y"
                    disabled={status === 'submitting'}
                  ></textarea>
                </div>

                {/* Privacy Guarantee Note */}
                <div className="flex items-center gap-2 text-[11px] text-brand-muted">
                  <ShieldCheck size={14} className="text-brand-accent shrink-0" />
                  <span>Your contact details are strictly confidential and shared only with your personal advisor.</span>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className={`btn-architectural w-full h-12 text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 ${
                      status === 'submitting' ? 'opacity-80 cursor-wait' : ''
                    }`}
                  >
                    {status === 'submitting' ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Sending Enquiry...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Consultation Request</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ContactModal;
