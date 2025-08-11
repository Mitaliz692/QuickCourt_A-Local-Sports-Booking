export interface User {
  _id: string;
  email: string;
  fullName: string;
  avatar?: string;
  role: 'user' | 'facility_owner' | 'admin';
  phone?: string;
  isVerified: boolean;
  isActive: boolean;
}

export interface Venue {
  _id: string;
  name: string;
  description: string;
  ownerId: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  sportsSupported: string[];
  amenities: string[];
  photos: string[];
  rating: {
    average: number;
    count: number;
  };
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
      isClosed: boolean;
    };
  };
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  contactInfo: {
    phone: string;
    email: string;
  };
  isActive: boolean;
  priceRange: {
    min: number;
    max: number;
  };
}

export interface Court {
  _id: string;
  venueId: string;
  name: string;
  sportType: string;
  pricePerHour: number;
  capacity: number;
  description: string;
  amenities: string[];
  photos: string[];
  isActive: boolean;
}

export interface Booking {
  _id: string;
  userId: string;
  venueId: string;
  courtId: string;
  bookingDate: Date;
  startTime: string;
  endTime: string;
  duration: number;
  totalAmount: number;
  status: 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  paymentDetails?: {
    transactionId: string;
    paymentMethod: string;
    paymentStatus: string;
    paidAmount: number;
  };
}

export interface SearchFilters {
  location?: string;
  sportType?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  amenities?: string[];
  date?: Date;
}

export interface PopularSport {
  id: string;
  name: string;
  image: string;
  venueCount: number;
}
