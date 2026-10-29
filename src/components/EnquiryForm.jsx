import React, { useState, useRef } from 'react';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { submitEnquiryToSheets } from '../services/googleSheets';

const EnquiryForm = ({ prefilledProperty = null }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    preferredLocation: prefilledProperty?.location || 'Coimbatore',
    propertyType: prefilledProperty?.propertyType || 'Villa',
    budget: prefilledProperty?.startingPrice ? `Starting ${prefilledProperty.startingPrice}` : '₹1.5 Cr – ₹3.0 Cr',
    message: prefilledProperty ? `I am interested in exploring ${prefilledProperty.name} (${prefilledProperty.location}). Please provide further details.` : ''
  });

  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const isSubmittingRef = useRef(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e) => {
    // Only allow numbers and plus symbol
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
      // Reset form on success
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
      setErrorMessage('There was a temporary problem dispatching your enquiry. Please check your connection or contact us via WhatsApp.');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <section id="contact" className="w-full bg-brand-white py-16 sm:py-24 lg:py-32 border-b border-brand-divider">
      <div className="w-full max-w-7xl mx-auto px-5 sm:px-10 lg:px-16">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Left Column: Context & Editorial Statement */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <span className="font-sans text-[10px] sm:text-[11px] font-semibold tracking-[0.18em] uppercase text-brand-accent block mb-2 sm:mb-3">
                DIRECT CONSULTATION
              </span>
              <h2 className="text-[28px] sm:text-[34px] lg:text-[40px] font-display font-medium text-brand-dark tracking-[-0.02em] leading-tight mb-4">
                Let's Find Your Next Property.
              </h2>
              <p className="font-sans text-brand-muted text-[15px] sm:text-[16px] lg:text-[17px] leading-relaxed mb-8 font-normal" style={{ color: '#555555' }}>
                Tell us what you are looking for, and we will help you explore suitable options.
              </p>

              <div className="space-y-4 pt-4 border-t border-brand-divider/80">
                <div className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-dark mt-2"></span>
                  <p className="font-sans text-[13px] sm:text-[14px] text-brand-muted m-0">
                    <strong className="text-brand-dark font-medium">Bespoke Architectural Advice:</strong> Review master floor plans, daylight orientation, and verified titles.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-dark mt-2"></span>
                  <p className="font-sans text-[13px] sm:text-[14px] text-brand-muted m-0">
                    <strong className="text-brand-dark font-medium">Private Site Walkthroughs:</strong> Schedule exclusive on-site visits across Coimbatore, Karamadai, Annur & Kovilpalayam.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-brand-divider/60 hidden lg:block">
              <span className="font-sans text-[10px] tracking-widest uppercase text-brand-light-muted block mb-1">Direct Assistance</span>
              <span className="font-sans text-sm font-semibold text-brand-dark">+91 98422 12345 • concierge@estate.com</span>
            </div>
          </div>

          {/* Right Column: Clean Architectural Form */}
          <div className="lg:col-span-7 bg-brand-canvas p-5 sm:p-10 lg:p-12 border border-brand-divider/70">
            {status === 'success' ? (
              <div className="py-12 px-4 text-center flex flex-col items-center justify-center animate-in fade-in duration-300">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-5 border border-emerald-200">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-display font-semibold text-brand-dark mb-2">Enquiry Received</h3>
                <p className="text-sm text-brand-muted max-w-md leading-relaxed mb-8">
                  Thank you for reaching out. Our architectural property advisor will review your preferences and contact you within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="btn-outline-architectural text-xs py-2.5 px-6"
                >
                  Submit Another Enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {status === 'error' && (
                  <div className="p-4 bg-red-50/80 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2.5">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{errorMessage || 'An error occurred while submitting. Please try again.'}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-[11px] uppercase tracking-wider font-semibold text-brand-dark mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Vikramaditya Rao"
                      className="w-full bg-brand-white text-brand-dark text-base sm:text-sm px-4 py-3 border border-brand-divider outline-none focus:border-brand-dark transition-colors"
                      disabled={status === 'submitting'}
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="phoneNumber" className="block text-[11px] uppercase tracking-wider font-semibold text-brand-dark mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phoneNumber"
                      type="tel"
                      name="phoneNumber"
                      required
                      value={formData.phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="+91 98422 00000"
                      className="w-full bg-brand-white text-brand-dark text-base sm:text-sm px-4 py-3 border border-brand-divider outline-none focus:border-brand-dark transition-colors"
                      disabled={status === 'submitting'}
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="email" className="block text-[11px] uppercase tracking-wider font-semibold text-brand-dark mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="vikram@example.com"
                    className="w-full bg-brand-white text-brand-dark text-base sm:text-sm px-4 py-3 border border-brand-divider outline-none focus:border-brand-dark transition-colors"
                    disabled={status === 'submitting'}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Preferred Location */}
                  <div>
                    <label htmlFor="preferredLocation" className="block text-[11px] uppercase tracking-wider font-semibold text-brand-dark mb-2">
                      Preferred Location
                    </label>
                    <select
                      id="preferredLocation"
                      name="preferredLocation"
                      value={formData.preferredLocation}
                      onChange={handleChange}
                      className="w-full bg-brand-white text-brand-dark text-base sm:text-sm px-3 py-3 border border-brand-divider outline-none focus:border-brand-dark transition-colors cursor-pointer"
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
                    <label htmlFor="propertyType" className="block text-[11px] uppercase tracking-wider font-semibold text-brand-dark mb-2">
                      Property Type
                    </label>
                    <select
                      id="propertyType"
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleChange}
                      className="w-full bg-brand-white text-brand-dark text-base sm:text-sm px-3 py-3 border border-brand-divider outline-none focus:border-brand-dark transition-colors cursor-pointer"
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
                    <label htmlFor="budget" className="block text-[11px] uppercase tracking-wider font-semibold text-brand-dark mb-2">
                      Budget Range
                    </label>
                    <select
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="w-full bg-brand-white text-brand-dark text-base sm:text-sm px-3 py-3 border border-brand-divider outline-none focus:border-brand-dark transition-colors cursor-pointer"
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
                  <label htmlFor="message" className="block text-[11px] uppercase tracking-wider font-semibold text-brand-dark mb-2">
                    Message / Specific Preferences
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={3}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your spatial requirements, preferred move-in timeline, or specific architectural features..."
                    className="w-full bg-brand-white text-brand-dark text-base sm:text-sm px-4 py-3 border border-brand-divider outline-none focus:border-brand-dark transition-colors resize-y"
                    disabled={status === 'submitting'}
                  ></textarea>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className={`btn-architectural w-full sm:w-auto h-12 px-8 text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 ${
                      status === 'submitting' ? 'opacity-80 cursor-wait' : ''
                    }`}
                  >
                    {status === 'submitting' ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Submitting Enquiry...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Enquiry</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};

export default EnquiryForm;
