import { Venue } from '../types';

// Enhanced Ahmedabad Venues with Real Sports Facilities
export const additionalAhmedabadVenues: Venue[] = [
  {
    _id: 'ahm007',
    name: 'Naroda Sports Complex',
    description: 'Community sports complex serving North Ahmedabad with affordable facilities for all age groups',
    ownerId: 'owner007',
    address: {
      street: 'Naroda GIDC, Naroda',
      city: 'Ahmedabad',
      state: 'Gujarat',
      zipCode: '382330',
      country: 'India',
      coordinates: {
        latitude: 23.0726,
        longitude: 72.6425
      }
    },
    sportsSupported: ['Cricket', 'Football', 'Kabaddi', 'Volleyball', 'Basketball'],
    amenities: ['Community Pricing', 'Youth Programs', 'Basic Facilities', 'Equipment Rental', 'Free Parking', 'Local Coaching'],
    photos: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1594736797933-d0dc1b4827e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    rating: {
      average: 4.2,
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
      phone: '+91-79-25567890',
      email: 'info@narodasports.com'
    },
    isActive: true,
    priceRange: {
      min: 200,
      max: 800
    }
  },
  {
    _id: 'ahm008',
    name: 'Satellite Fitness & Sports Hub',
    description: 'Modern fitness center and sports facility in the heart of Satellite area with 24/7 access',
    ownerId: 'owner008',
    address: {
      street: 'Satellite Road, Near Jodhpur Cross Roads',
      city: 'Ahmedabad',
      state: 'Gujarat',
      zipCode: '380015',
      country: 'India',
      coordinates: {
        latitude: 23.0258,
        longitude: 72.5194
      }
    },
    sportsSupported: ['Gym', 'Yoga', 'Aerobics', 'Zumba', 'Personal Training'],
    amenities: ['24/7 Access', 'Modern Equipment', 'Group Classes', 'Personal Trainers', 'Nutrition Counseling', 'Steam & Sauna', 'Juice Bar'],
    photos: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    rating: {
      average: 4.6,
      count: 289
    },
    operatingHours: {
      monday: { open: '05:00', close: '23:59', isClosed: false },
      tuesday: { open: '05:00', close: '23:59', isClosed: false },
      wednesday: { open: '05:00', close: '23:59', isClosed: false },
      thursday: { open: '05:00', close: '23:59', isClosed: false },
      friday: { open: '05:00', close: '23:59', isClosed: false },
      saturday: { open: '05:00', close: '23:59', isClosed: false },
      sunday: { open: '05:00', close: '23:59', isClosed: false }
    },
    status: 'approved',
    contactInfo: {
      phone: '+91-79-40987654',
      email: 'contact@satellitefitness.com'
    },
    isActive: true,
    priceRange: {
      min: 1200,
      max: 3500
    }
  },
  {
    _id: 'ahm009',
    name: 'Paldi Swimming Academy',
    description: 'Premier swimming facility with Olympic-standard pool and professional swimming coaches',
    ownerId: 'owner009',
    address: {
      street: 'Paldi, Near Ellis Bridge',
      city: 'Ahmedabad',
      state: 'Gujarat',
      zipCode: '380007',
      country: 'India',
      coordinates: {
        latitude: 23.0145,
        longitude: 72.5713
      }
    },
    sportsSupported: ['Swimming', 'Water Aerobics', 'Synchronized Swimming', 'Diving'],
    amenities: ['Olympic Pool', 'Kids Pool', 'Professional Coaches', 'Swimming Gear Shop', 'Lockers', 'Poolside Cafe', 'Medical Support'],
    photos: [
      'https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    rating: {
      average: 4.8,
      count: 312
    },
    operatingHours: {
      monday: { open: '05:30', close: '21:00', isClosed: false },
      tuesday: { open: '05:30', close: '21:00', isClosed: false },
      wednesday: { open: '05:30', close: '21:00', isClosed: false },
      thursday: { open: '05:30', close: '21:00', isClosed: false },
      friday: { open: '05:30', close: '21:00', isClosed: false },
      saturday: { open: '06:00', close: '21:30', isClosed: false },
      sunday: { open: '06:00', close: '20:00', isClosed: false }
    },
    status: 'approved',
    contactInfo: {
      phone: '+91-79-26123456',
      email: 'info@paldiswimming.com'
    },
    isActive: true,
    priceRange: {
      min: 800,
      max: 2000
    }
  },
  {
    _id: 'ahm010',
    name: 'Iscon Badminton Arena',
    description: 'State-of-the-art badminton facility with 12 courts and international tournament standards',
    ownerId: 'owner010',
    address: {
      street: 'ISCON Cross Roads, S.G. Highway',
      city: 'Ahmedabad',
      state: 'Gujarat',
      zipCode: '380051',
      country: 'India',
      coordinates: {
        latitude: 23.0258,
        longitude: 72.5194
      }
    },
    sportsSupported: ['Badminton', 'Table Tennis', 'Squash'],
    amenities: ['12 Badminton Courts', 'Central AC', 'Professional Lighting', 'Equipment Rental', 'Coaching Classes', 'Tournament Hosting', 'Sports Shop'],
    photos: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1594736797933-d0dc1b4827e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1596464716127-f2a82984de30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    rating: {
      average: 4.7,
      count: 425
    },
    operatingHours: {
      monday: { open: '06:00', close: '23:00', isClosed: false },
      tuesday: { open: '06:00', close: '23:00', isClosed: false },
      wednesday: { open: '06:00', close: '23:00', isClosed: false },
      thursday: { open: '06:00', close: '23:00', isClosed: false },
      friday: { open: '06:00', close: '23:00', isClosed: false },
      saturday: { open: '06:00', close: '23:30', isClosed: false },
      sunday: { open: '06:30', close: '22:00', isClosed: false }
    },
    status: 'approved',
    contactInfo: {
      phone: '+91-79-40567890',
      email: 'bookings@isconbadminton.com'
    },
    isActive: true,
    priceRange: {
      min: 600,
      max: 1500
    }
  }
];

export default additionalAhmedabadVenues;
