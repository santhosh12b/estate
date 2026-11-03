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
import VideoModal from './components/VideoModal';
import { fetchProjects } from './services/api';
import { defaultProperties } from './data/properties';

function App() {
  const [properties, setProperties] = useState(defaultProperties);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [prefilledProperty, setPrefilledProperty] = useState(null);
  const [selectedLocationFilter, setSelectedLocationFilter] = useState('All');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [videoModalData, setVideoModalData] = useState(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Load properties dynamically from Render Backend / Supabase (with fallback)
  useEffect(() => {
    async function loadProperties() {
      try {
        const result = await fetchProjects();
        if (result && result.success && Array.isArray(result.data)) {
          setProperties(result.data);
        }
      } catch (err) {
        console.warn("Failed loading properties from backend, using defaults:", err);
      }
    }
    loadProperties();
  }, []);

  const handleContactClick = (property = null) => {
    setPrefilledProperty(property || null);
    setIsContactModalOpen(true);
  };

  const handleSelectLocation = (locationName) => {
    // If Avinashi is selected, we can filter or pre-register interest
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

  const handleWatchLegalVideo = () => {
    setVideoModalData({
      type: 'legal',
      title: '100% Legal Title & Document Verification Guide',
      poster: '/images/kubera-survey-about.jpg',
      description: 'Step-by-step verification of 30-year parent title deeds, DTCP & RERA layout approvals, Nil Encumbrance Certificates (EC), and individual revenue Patta name transfer in Coimbatore micro-markets.'
    });
    setIsVideoModalOpen(true);
  };

  const handleWatchLayoutVideo = (property) => {
    setVideoModalData({
      type: 'layout',
      title: property.videoTitle || `${property.name} — Drone Walkthrough`,
      poster: property.imageUrl,
      description: `Aerial drone walkthrough of ${property.name} in ${property.location}. Featuring 33ft/30ft asphalt tar roads, sweet water facilities, avenue trees, and 80%-90% bank loan approved plots.`
    });
    setIsVideoModalOpen(true);
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
            onWatchLegalVideo={handleWatchLegalVideo}
          />

          {/* 2. Featured Properties Section */}
          <FeaturedProperties 
            properties={properties}
            onSelectProperty={setSelectedProperty}
            selectedLocationFilter={selectedLocationFilter}
            onLocationFilterChange={setSelectedLocationFilter}
            onWatchLayoutVideo={handleWatchLayoutVideo}
          />

          {/* 3. About & Legal Verification Section */}
          <About 
            onApproachClick={() => {
              const el = document.querySelector('#services');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }} 
            onWatchLegalVideo={handleWatchLegalVideo}
          />

          {/* 4. Services Section */}
          <Services onServiceSelect={() => {
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
          isHidden={isContactModalOpen || !!selectedProperty || isVideoModalOpen}
        />

        {/* Property Detail Modal */}
        <PropertyModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onEnquire={handleEnquireProperty}
          onWatchVideo={handleWatchLayoutVideo}
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

        {/* Dedicated Legal & Layout Video Player Modal */}
        <VideoModal
          isOpen={isVideoModalOpen}
          onClose={() => {
            setIsVideoModalOpen(false);
            setVideoModalData(null);
          }}
          videoData={videoModalData}
        />

      </div>

    </div>
  );
}

export default App;
