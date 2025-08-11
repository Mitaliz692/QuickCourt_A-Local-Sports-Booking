import { Venue } from '../types';
import { additionalAhmedabadVenues } from './additionalVenues';

export const ahmedabadVenues: Venue[] = [
  {
    _id: 'ahm001',
    name: 'Ahmedabad Sports Club',
    description: 'Premier sports facility in the heart of Ahmedabad with world-class amenities and heritage since 1946',
    ownerId: 'owner001',
    address: {
      street: 'Ellis Bridge',
      city: 'Ahmedabad',
      state: 'Gujarat',
      zipCode: '380006',
      country: 'India',
      coordinates: {
        latitude: 23.0225,
        longitude: 72.5714
      }
    },
    sportsSupported: ['Cricket', 'Tennis', 'Swimming', 'Gym', 'Squash'],
    amenities: ['Premium Parking', 'Multi-Cuisine Restaurant', 'Luxury Locker Rooms', 'Pro Shop', 'Central AC', 'WiFi', 'Medical Room'],
    photos: [
      'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Cricket stadium
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Tennis court
      'https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'  // Swimming pool
    ],
    rating: {
      average: 4.7,
      count: 234
    },
    operatingHours: {
      monday: { open: '06:00', close: '22:00', isClosed: false },
      tuesday: { open: '06:00', close: '22:00', isClosed: false },
      wednesday: { open: '06:00', close: '22:00', isClosed: false },
      thursday: { open: '06:00', close: '22:00', isClosed: false },
      friday: { open: '06:00', close: '22:00', isClosed: false },
      saturday: { open: '06:00', close: '23:00', isClosed: false },
      sunday: { open: '07:00', close: '21:00', isClosed: false }
    },
    status: 'approved',
    contactInfo: {
      phone: '+91-79-26575757',
      email: 'info@ahmedabadsportsclub.com'
    },
    isActive: true,
    priceRange: {
      min: 800,
      max: 2500
    }
  },
  {
    _id: 'ahm002',
    name: 'Gujarat Sports Arena',
    description: 'Modern multi-sport complex with international standard facilities on S.G. Highway',
    ownerId: 'owner002',
    address: {
      street: 'S.G. Highway, Bodakdev',
      city: 'Ahmedabad',
      state: 'Gujarat',
      zipCode: '380054',
      country: 'India',
      coordinates: {
        latitude: 23.0593,
        longitude: 72.5293
      }
    },
    sportsSupported: ['Badminton', 'Basketball', 'Volleyball', 'Table Tennis', 'Squash'],
    amenities: ['Central AC', 'Valet Parking', 'Equipment Rental', 'Sports Cafe', 'Designer Changing Rooms', 'Live Streaming', 'Physiotherapy'],
    photos: [
      'https://images.unsplash.com/photo-1594736797933-d0dc1b4827e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Badminton court
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Basketball court
      'https://images.unsplash.com/photo-1596464716127-f2a82984de30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'  // Volleyball court
    ],
    rating: {
      average: 4.5,
      count: 189
    },
    operatingHours: {
      monday: { open: '05:30', close: '23:00', isClosed: false },
      tuesday: { open: '05:30', close: '23:00', isClosed: false },
      wednesday: { open: '05:30', close: '23:00', isClosed: false },
      thursday: { open: '05:30', close: '23:00', isClosed: false },
      friday: { open: '05:30', close: '23:00', isClosed: false },
      saturday: { open: '06:00', close: '23:30', isClosed: false },
      sunday: { open: '06:00', close: '22:00', isClosed: false }
    },
    status: 'approved',
    contactInfo: {
      phone: '+91-79-40123456',
      email: 'contact@gujaratsportsarena.com'
    },
    isActive: true,
    priceRange: {
      min: 600,
      max: 1800
    }
  },
  {
    _id: 'ahm003',
    name: 'Sabarmati Sports Complex',
    description: 'Scenic riverside sports facility with panoramic Sabarmati views and eco-friendly design',
    ownerId: 'owner003',
    address: {
      street: 'Sabarmati Riverfront',
      city: 'Ahmedabad',
      state: 'Gujarat',
      zipCode: '380005',
      country: 'India',
      coordinates: {
        latitude: 23.0395,
        longitude: 72.5665
      }
    },
    sportsSupported: ['Tennis', 'Jogging Track', 'Cycling', 'Yoga', 'Outdoor Fitness'],
    amenities: ['Scenic Sabarmati Views', 'Open Air Courts', 'Eco-Friendly Design', 'Bicycle Parking', 'Organic Cafe', 'Equipment Rental', 'Nature Trails'],
    photos: [
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Tennis court outdoor
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Jogging track
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'  // Yoga outdoor
    ],
    rating: {
      average: 4.6,
      count: 145
    },
    operatingHours: {
      monday: { open: '05:00', close: '21:00', isClosed: false },
      tuesday: { open: '05:00', close: '21:00', isClosed: false },
      wednesday: { open: '05:00', close: '21:00', isClosed: false },
      thursday: { open: '05:00', close: '21:00', isClosed: false },
      friday: { open: '05:00', close: '21:00', isClosed: false },
      saturday: { open: '05:00', close: '22:00', isClosed: false },
      sunday: { open: '05:30', close: '20:00', isClosed: false }
    },
    status: 'approved',
    contactInfo: {
      phone: '+91-79-25678901',
      email: 'info@sabarmaticomplex.com'
    },
    isActive: true,
    priceRange: {
      min: 400,
      max: 1200
    }
  },
  {
    _id: 'ahm004',
    name: 'Vastrapur Lake Sports Club',
    description: 'Premium lakeside sports facility offering water sports and fitness activities with serene lake views',
    ownerId: 'owner004',
    address: {
      street: 'Vastrapur Lake Area, Science City Road',
      city: 'Ahmedabad',
      state: 'Gujarat',
      zipCode: '380015',
      country: 'India',
      coordinates: {
        latitude: 23.0395,
        longitude: 72.5293
      }
    },
    sportsSupported: ['Swimming', 'Boating', 'Water Sports', 'Gym', 'Aqua Aerobics'],
    amenities: ['Panoramic Lake View', 'Olympic Size Pool', 'Modern Changing Rooms', 'Valet Parking', 'Lakeside Cafe', 'Boat Rentals', 'Poolside Bar'],
    photos: [
      'https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Olympic swimming pool
      'https://images.unsplash.com/photo-1589815494239-7d7d70e1e72c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Lake boating
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'  // Modern gym
    ],
    rating: {
      average: 4.4,
      count: 167
    },
    operatingHours: {
      monday: { open: '06:00', close: '20:00', isClosed: false },
      tuesday: { open: '06:00', close: '20:00', isClosed: false },
      wednesday: { open: '06:00', close: '20:00', isClosed: false },
      thursday: { open: '06:00', close: '20:00', isClosed: false },
      friday: { open: '06:00', close: '20:00', isClosed: false },
      saturday: { open: '06:00', close: '21:00', isClosed: false },
      sunday: { open: '07:00', close: '19:00', isClosed: false }
    },
    status: 'approved',
    contactInfo: {
      phone: '+91-79-26789012',
      email: 'contact@vastrapurlakesports.com'
    },
    isActive: true,
    priceRange: {
      min: 500,
      max: 1500
    }
  },
  {
    _id: 'ahm005',
    name: 'Bopal Sports Academy',
    description: 'Professional multi-sport training academy with certified coaches and international standard facilities',
    ownerId: 'owner005',
    address: {
      street: 'Bopal-Ambli Road, Near Shilp Golf Course',
      city: 'Ahmedabad',
      state: 'Gujarat',
      zipCode: '380058',
      country: 'India',
      coordinates: {
        latitude: 23.0395,
        longitude: 72.4593
      }
    },
    sportsSupported: ['Football', 'Cricket', 'Hockey', 'Athletics', 'Badminton'],
    amenities: ['Professional Coaching', 'FIFA Standard Turf', 'Floodlights', 'Equipment Library', 'Secure Parking', 'Sports Medicine', 'Video Analysis'],
    photos: [
      'https://images.unsplash.com/photo-1559692048-79a3f837883d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Football field
      'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Cricket ground
      'https://images.unsplash.com/photo-1551526019-6ad22cdad8c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'  // Hockey field
    ],
    rating: {
      average: 4.8,
      count: 298
    },
    operatingHours: {
      monday: { open: '05:30', close: '22:00', isClosed: false },
      tuesday: { open: '05:30', close: '22:00', isClosed: false },
      wednesday: { open: '05:30', close: '22:00', isClosed: false },
      thursday: { open: '05:30', close: '22:00', isClosed: false },
      friday: { open: '05:30', close: '22:00', isClosed: false },
      saturday: { open: '06:00', close: '23:00', isClosed: false },
      sunday: { open: '06:00', close: '21:00', isClosed: false }
    },
    status: 'approved',
    contactInfo: {
      phone: '+91-79-48901234',
      email: 'academy@bopalfootball.com'
    },
    isActive: true,
    priceRange: {
      min: 1000,
      max: 2200
    }
  },
  {
    _id: 'ahm006',
    name: 'Maninagar Cricket Ground',
    description: 'Traditional cricket ground with excellent pitch conditions',
    ownerId: 'owner006',
    address: {
      street: 'Maninagar East',
      city: 'Ahmedabad',
      state: 'Gujarat',
      zipCode: '380008',
      country: 'India',
      coordinates: {
        latitude: 23.0158,
        longitude: 72.5958
      }
    },
    sportsSupported: ['Cricket'],
    amenities: ['Natural Grass', 'Pavilion', 'Scoreboard', 'Equipment Room', 'Parking'],
    photos: [
      'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&h=250&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=250&fit=crop'
    ],
    rating: {
      average: 4.3,
      count: 112
    },
    operatingHours: {
      monday: { open: '06:00', close: '18:00', isClosed: false },
      tuesday: { open: '06:00', close: '18:00', isClosed: false },
      wednesday: { open: '06:00', close: '18:00', isClosed: false },
      thursday: { open: '06:00', close: '18:00', isClosed: false },
      friday: { open: '06:00', close: '18:00', isClosed: false },
      saturday: { open: '06:00', close: '19:00', isClosed: false },
      sunday: { open: '07:00', close: '17:00', isClosed: false }
    },
    status: 'approved',
    contactInfo: {
      phone: '+91-79-25012345',
      email: 'info@maninagarcricket.com'
    },
    isActive: true,
    priceRange: {
      min: 1500,
      max: 3000
    }
  },
  {
    _id: 'ahm007',
    name: 'Paldi Badminton Center',
    description: 'Indoor badminton facility with premium courts',
    ownerId: 'owner007',
    address: {
      street: 'Paldi Main Road',
      city: 'Ahmedabad',
      state: 'Gujarat',
      zipCode: '380007',
      country: 'India',
      coordinates: {
        latitude: 23.0158,
        longitude: 72.5656
      }
    },
    sportsSupported: ['Badminton'],
    amenities: ['Air Conditioning', 'Wooden Flooring', 'Professional Lighting', 'Equipment Rental', 'Parking'],
    photos: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop',
      'https://images.unsplash.com/photo-1595435742656-5272d0dc50d7?w=400&h=250&fit=crop',
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=250&fit=crop'
    ],
    rating: {
      average: 4.6,
      count: 178
    },
    operatingHours: {
      monday: { open: '06:00', close: '22:00', isClosed: false },
      tuesday: { open: '06:00', close: '22:00', isClosed: false },
      wednesday: { open: '06:00', close: '22:00', isClosed: false },
      thursday: { open: '06:00', close: '22:00', isClosed: false },
      friday: { open: '06:00', close: '22:00', isClosed: false },
      saturday: { open: '06:00', close: '23:00', isClosed: false },
      sunday: { open: '07:00', close: '21:00', isClosed: false }
    },
    status: 'approved',
    contactInfo: {
      phone: '+91-79-26123456',
      email: 'bookings@paldibadminton.com'
    },
    isActive: true,
    priceRange: {
      min: 400,
      max: 800
    }
  },
  {
    _id: 'ahm008',
    name: 'Sarkhej Swimming Complex',
    description: 'Olympic-standard swimming facility with multiple pools',
    ownerId: 'owner008',
    address: {
      street: 'Sarkhej-Gandhinagar Highway',
      city: 'Ahmedabad',
      state: 'Gujarat',
      zipCode: '380051',
      country: 'India',
      coordinates: {
        latitude: 23.0095,
        longitude: 72.4893
      }
    },
    sportsSupported: ['Swimming', 'Water Polo', 'Diving'],
    amenities: ['Olympic Pool', 'Kids Pool', 'Diving Board', 'Lockers', 'Shower', 'Cafe'],
    photos: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=250&fit=crop',
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=250&fit=crop',
      'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400&h=250&fit=crop'
    ],
    rating: {
      average: 4.7,
      count: 203
    },
    operatingHours: {
      monday: { open: '05:30', close: '21:00', isClosed: false },
      tuesday: { open: '05:30', close: '21:00', isClosed: false },
      wednesday: { open: '05:30', close: '21:00', isClosed: false },
      thursday: { open: '05:30', close: '21:00', isClosed: false },
      friday: { open: '05:30', close: '21:00', isClosed: false },
      saturday: { open: '06:00', close: '22:00', isClosed: false },
      sunday: { open: '06:00', close: '20:00', isClosed: false }
    },
    status: 'approved',
    contactInfo: {
      phone: '+91-79-67234567',
      email: 'info@sarkhejswimming.com'
    },
    isActive: true,
    priceRange: {
      min: 300,
      max: 600
    }
  },
  {
    _id: 'ahm009',
    name: 'Navrangpura Tennis Club',
    description: 'Prestigious tennis club with grass and clay courts',
    ownerId: 'owner009',
    address: {
      street: 'Navrangpura Cross Roads',
      city: 'Ahmedabad',
      state: 'Gujarat',
      zipCode: '380009',
      country: 'India',
      coordinates: {
        latitude: 23.0395,
        longitude: 72.5593
      }
    },
    sportsSupported: ['Tennis', 'Squash'],
    amenities: ['Multiple Court Types', 'Pro Shop', 'Coaching', 'Club House', 'Parking'],
    photos: [
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=250&fit=crop',
      'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400&h=250&fit=crop',
      'https://images.unsplash.com/photo-1595435742656-5272d0dc50d7?w=400&h=250&fit=crop'
    ],
    rating: {
      average: 4.8,
      count: 156
    },
    operatingHours: {
      monday: { open: '06:00', close: '21:00', isClosed: false },
      tuesday: { open: '06:00', close: '21:00', isClosed: false },
      wednesday: { open: '06:00', close: '21:00', isClosed: false },
      thursday: { open: '06:00', close: '21:00', isClosed: false },
      friday: { open: '06:00', close: '21:00', isClosed: false },
      saturday: { open: '06:00', close: '22:00', isClosed: false },
      sunday: { open: '07:00', close: '20:00', isClosed: false }
    },
    status: 'approved',
    contactInfo: {
      phone: '+91-79-26345678',
      email: 'bookings@navrangpuratennis.com'
    },
    isActive: true,
    priceRange: {
      min: 800,
      max: 1800
    }
  },
  {
    _id: 'ahm010',
    name: 'Gota Basketball Arena',
    description: 'Modern basketball facility with international standard courts',
    ownerId: 'owner010',
    address: {
      street: 'Gota Circle',
      city: 'Ahmedabad',
      state: 'Gujarat',
      zipCode: '382481',
      country: 'India',
      coordinates: {
        latitude: 23.1293,
        longitude: 72.5593
      }
    },
    sportsSupported: ['Basketball', 'Volleyball'],
    amenities: ['Indoor Courts', 'Professional Flooring', 'Air Conditioning', 'Scoreboard', 'Parking'],
    photos: [
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=250&fit=crop',
      'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=400&h=250&fit=crop',
      'https://images.unsplash.com/photo-1559692048-79a3f837883d?w=400&h=250&fit=crop'
    ],
    rating: {
      average: 4.5,
      count: 89
    },
    operatingHours: {
      monday: { open: '07:00', close: '22:00', isClosed: false },
      tuesday: { open: '07:00', close: '22:00', isClosed: false },
      wednesday: { open: '07:00', close: '22:00', isClosed: false },
      thursday: { open: '07:00', close: '22:00', isClosed: false },
      friday: { open: '07:00', close: '22:00', isClosed: false },
      saturday: { open: '07:00', close: '23:00', isClosed: false },
      sunday: { open: '08:00', close: '21:00', isClosed: false }
    },
    status: 'approved',
    contactInfo: {
      phone: '+91-79-67456789',
      email: 'info@gotabasketball.com'
    },
    isActive: true,
    priceRange: {
      min: 600,
      max: 1200
    }
  }
];

// Function to simulate API delay and return all venues
export const fetchAhmedabadVenues = async (): Promise<Venue[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Combine original venues with additional venues for comprehensive data
  const allVenues = [...ahmedabadVenues, ...additionalAhmedabadVenues];
  
  // Log venue count for development
  console.log(`📍 Loaded ${allVenues.length} sports venues in Ahmedabad`);
  
  return allVenues;
};

// Function to search venues by location or sport
export const searchVenues = async (query: string): Promise<Venue[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const allVenues = [...ahmedabadVenues, ...additionalAhmedabadVenues];
  
  if (!query.trim()) {
    return allVenues;
  }
  
  const searchLower = query.toLowerCase();
  const results = allVenues.filter(venue =>
    venue.address.city.toLowerCase().includes(searchLower) ||
    venue.address.street.toLowerCase().includes(searchLower) ||
    venue.name.toLowerCase().includes(searchLower) ||
    venue.sportsSupported.some(sport => 
      sport.toLowerCase().includes(searchLower)
    ) ||
    venue.amenities.some(amenity =>
      amenity.toLowerCase().includes(searchLower)
    )
  );
  
  console.log(`🔍 Search "${query}" found ${results.length} venues`);
  return results;
};
