export const defaultProperties = [
  {
    id: 'prop-1',
    name: 'The Pavilion Estate',
    location: 'Coimbatore',
    subLocation: 'Race Course Road',
    propertyType: 'Contemporary Residence',
    description: 'An architectural marvel featuring floor-to-ceiling double-glazed glass, private basalt stone reflection pool, and integrated sustainable smart-home automation.',
    startingPrice: '₹3.40 Cr',
    priceValue: 34000000,
    imageUrl: '/images/hero-villa.jpg',
    status: 'Available',
    featured: true,
    bedrooms: 4,
    bathrooms: 5,
    area: '4,850 sq.ft',
    features: ['Private Infinity Pool', 'Italian Travertine Flooring', 'Automated Solar Pergola', '3-Car Covered Portico', 'Landscaped Courtyard']
  },
  {
    id: 'prop-2',
    name: 'Karamadai Valley Villa',
    location: 'Karamadai',
    subLocation: 'Western Ghats Foothills',
    propertyType: 'Villa',
    description: 'Nestled against the mist-covered foothills, this bespoke sanctuary pairs cantilevered teak decks with expansive open-plan garden pavilions.',
    startingPrice: '₹1.85 Cr',
    priceValue: 18500000,
    imageUrl: '/images/property-villa-1.jpg',
    status: 'Available',
    featured: true,
    bedrooms: 3,
    bathrooms: 4,
    area: '3,600 sq.ft',
    features: ['Mountain Views', 'Double Height Living Room', 'Rainwater Harvesting Reservoir', 'Organic Kitchen Garden', 'Gated Community Security']
  },
  {
    id: 'prop-3',
    name: 'Annur Horizon Residences',
    location: 'Annur',
    subLocation: 'Annur Eco-Corridor',
    propertyType: 'Villa',
    description: 'Modern minimalist two-story residence with cantilevered balconies, natural cross-ventilation, and private perimeter landscaping.',
    startingPrice: '₹1.25 Cr',
    priceValue: 12500000,
    imageUrl: '/images/property-villa-2.jpg',
    status: 'Available',
    featured: true,
    bedrooms: 3,
    bathrooms: 3,
    area: '2,950 sq.ft',
    features: ['Cantilevered Balcony', 'Teak Wood Accents', 'Private Courtyard', 'EV Fast Charging Station', 'Solar Power Backup']
  },
  {
    id: 'prop-4',
    name: 'Kovilpalayam Serene Enclave',
    location: 'Kovilpalayam',
    subLocation: 'Sathy Road Sanctuary',
    propertyType: 'Architectural Plot',
    description: 'Exclusive 12-acre gated enclave of prime architectural home sites surrounded by native canopy trees and stone walkways.',
    startingPrice: '₹95 Lakhs',
    priceValue: 9500000,
    imageUrl: '/images/property-estate-plot.jpg',
    status: 'Available',
    featured: true,
    bedrooms: 0,
    bathrooms: 0,
    area: '5,400 sq.ft (Plot)',
    features: ['Underground Cabling', 'Avenue Tree Plantation', 'Blacktop Internal Roads', 'Architectural Design Guidelines', 'Compound Perimeter Wall']
  },
  {
    id: 'prop-5',
    name: 'The Courtyard Sanctuary',
    location: 'Coimbatore',
    subLocation: 'Vadavalli',
    propertyType: 'Contemporary Residence',
    description: 'Centered around a traditional central courtyard with water lilies, bringing calm natural lighting into all private suites.',
    startingPrice: '₹2.75 Cr',
    priceValue: 27500000,
    imageUrl: '/images/location-residence.jpg',
    status: 'Available',
    featured: false,
    bedrooms: 4,
    bathrooms: 4,
    area: '4,100 sq.ft',
    features: ['Internal Water Courtyard', 'Natural Granite Flooring', 'Master Suite with Private Deck', 'Designer Modular Kitchen', 'Quiet Residential Cul-de-sac']
  },
  {
    id: 'prop-6',
    name: 'Skyline Terrace Penthouse',
    location: 'Coimbatore',
    subLocation: 'R.S. Puram',
    propertyType: 'Penthouse',
    description: 'Top-floor architectural penthouse with wrap-around private terrace garden and uninterrupted panoramic sunrise views over the city skyline.',
    startingPrice: '₹4.10 Cr',
    priceValue: 41000000,
    imageUrl: '/images/about-architecture.jpg',
    status: 'Available',
    featured: false,
    bedrooms: 4,
    bathrooms: 5,
    area: '5,200 sq.ft',
    features: ['Private Elevator Lobby', 'Wrap-around Sunset Terrace', 'Plunge Pool on Sky Deck', 'High Acoustic Glazing', 'Concierge Service']
  }
];

export const locationsList = [
  {
    id: 'coimbatore',
    name: 'Coimbatore',
    description: 'The urban epicenter of premier architecture, cultural prestige, and serene residential avenues.',
    count: 3,
    imageUrl: '/images/hero-villa.jpg'
  },
  {
    id: 'karamadai',
    name: 'Karamadai',
    description: 'Tranquil hill-view retreats surrounded by fresh mountain breezes and verdant greenery.',
    count: 1,
    imageUrl: '/images/property-villa-1.jpg'
  },
  {
    id: 'annur',
    name: 'Annur',
    description: 'Rapidly emerging luxury corridor pairing connectivity with expansive modern garden living.',
    count: 1,
    imageUrl: '/images/property-villa-2.jpg'
  },
  {
    id: 'kovilpalayam',
    name: 'Kovilpalayam',
    description: 'Well-connected estate plots and private architectural compounds with serene surroundings.',
    count: 1,
    imageUrl: '/images/property-estate-plot.jpg'
  }
];

export const propertyTypesList = [
  'All Types',
  'Villa',
  'Contemporary Residence',
  'Penthouse',
  'Architectural Plot'
];

export const budgetRanges = [
  { label: 'All Budgets', min: 0, max: Infinity },
  { label: 'Under ₹1.5 Cr', min: 0, max: 15000000 },
  { label: '₹1.5 Cr – ₹3.0 Cr', min: 15000000, max: 30000000 },
  { label: 'Above ₹3.0 Cr', min: 30000000, max: Infinity }
];
