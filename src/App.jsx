import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import FeaturedProperties from './components/FeaturedProperties';
import About from './components/About';
import Services from './components/Services';
import Locations from './components/Locations';
import EnquiryForm from './components/EnquiryForm';
import Footer from './components/Footer';
import PropertyModal from './components/PropertyModal';
import ContactModal from './components/ContactModal';
import MobileStickyBar from './components/MobileStickyBar';
import { fetchProjectsFromSheets } from './services/googleSheets';
import { defaultProperties } from './data/properties';

function App() {
  const [properties, setProperties] = useState(defaultProperties);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [prefilledProperty, setPrefilledProperty] = useState(null);
  const [selectedLocationFilter, setSelectedLocationFilter] = useState('All');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Load properties dynamically from Google Sheets if configured
  useEffect(() => {
    async function loadProperties() {
      try {
        const result = await fetchProjectsFromSheets();
        if (result && result.success && Array.isArray(result.data)) {
          setProperties(result.data);
        }
      } catch (err) {
        console.warn("Failed loading properties from Google Sheets, using defaults:", err);
      }
    }
    loadProperties();
  }, []);

  const handleContactClick = (property = null) => {
    setPrefilledProperty(property || null);
    setIsContactModalOpen(true);
  };

  const handleSelectLocation = (locationName) => {
    setSelectedLocationFilter(locationName);
    const propertiesSection = document.querySelector('#properties');
    if (propertiesSection) {
      const navHeight = 72;
      const elementPosition = propertiesSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleEnquireProperty = (prop) => {
    handleContactClick(prop);
  };

  return (
    <div className="min-h-screen w-full bg-brand-white flex flex-col pb-16 md:pb-0">
      <div className="site-canvas w-full bg-brand-white flex flex-col relative">
        
        {/* Navigation Header */}
        <Header onContactClick={() => handleContactClick()} />

        {/* Main Content Area */}
        <main className="flex-1 w-full">
          {/* 1. Hero Section */}
          <Hero 
            onExploreClick={() => {
              const el = document.querySelector('#properties');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }} 
            onSelectRegion={handleSelectLocation}
          />

          {/* 2. Featured Properties Section */}
          <FeaturedProperties 
            properties={properties}
            onSelectProperty={setSelectedProperty}
            selectedLocationFilter={selectedLocationFilter}
            onLocationFilterChange={setSelectedLocationFilter}
          />

          {/* 3. About Section */}
          <About onApproachClick={() => {
            const el = document.querySelector('#services');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }} />

          {/* 4. Services Section */}
          <Services onServiceSelect={(serviceName) => {
            handleContactClick();
          }} />

          {/* 5. Locations Section */}
          <Locations onSelectLocation={handleSelectLocation} />

          {/* 6. Customer Enquiry Section */}
          <EnquiryForm prefilledProperty={prefilledProperty} />
        </main>

        {/* Footer */}
        <Footer onContactClick={() => handleContactClick()} />

        {/* Mobile View Sticky Action Bar (WhatsApp, Call & Contact Us popup trigger) */}
        <MobileStickyBar 
          onContactClick={() => handleContactClick()}
          isHidden={isContactModalOpen || !!selectedProperty}
        />

        {/* Property Detail Modal */}
        <PropertyModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onEnquire={handleEnquireProperty}
        />

        {/* Dedicated Real Estate Contact & Consultation Popup Modal */}
        <ContactModal
          isOpen={isContactModalOpen}
          onClose={() => {
            setIsContactModalOpen(false);
            setPrefilledProperty(null);
          }}
          prefilledProperty={prefilledProperty}
        />

      </div>

    </div>
  );
}

export default App;
