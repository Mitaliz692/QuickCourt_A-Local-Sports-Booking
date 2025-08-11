const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Venue name is required'],
    trim: true,
    minlength: [2, 'Venue name must be at least 2 characters'],
    maxlength: [100, 'Venue name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Venue description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner ID is required'],
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    zipCode: {
      type: String,
      required: [true, 'ZIP code is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      default: 'India',
    },
    coordinates: {
      latitude: {
        type: Number,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90'],
      },
      longitude: {
        type: Number,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180'],
      },
    },
  },
  sportsSupported: [{
    type: String,
    required: [true, 'At least one sport is required'],
    enum: [
      'Cricket', 'Football', 'Basketball', 'Tennis', 'Badminton', 
      'Swimming', 'Volleyball', 'Table Tennis', 'Squash', 'Hockey',
      'Athletics', 'Gymnastics', 'Boxing', 'Wrestling', 'Weightlifting',
      'Cycling', 'Running', 'Yoga', 'Fitness', 'Water Polo', 'Diving'
    ],
  }],
  amenities: [{
    type: String,
    trim: true,
  }],
  photos: [{
    type: String, // URLs to uploaded images
    trim: true,
  }],
  rating: {
    average: {
      type: Number,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
      default: 0,
    },
    count: {
      type: Number,
      min: [0, 'Rating count cannot be negative'],
      default: 0,
    },
  },
  operatingHours: {
    monday: {
      open: { type: String, default: '06:00' },
      close: { type: String, default: '22:00' },
      isClosed: { type: Boolean, default: false },
    },
    tuesday: {
      open: { type: String, default: '06:00' },
      close: { type: String, default: '22:00' },
      isClosed: { type: Boolean, default: false },
    },
    wednesday: {
      open: { type: String, default: '06:00' },
      close: { type: String, default: '22:00' },
      isClosed: { type: Boolean, default: false },
    },
    thursday: {
      open: { type: String, default: '06:00' },
      close: { type: String, default: '22:00' },
      isClosed: { type: Boolean, default: false },
    },
    friday: {
      open: { type: String, default: '06:00' },
      close: { type: String, default: '22:00' },
      isClosed: { type: Boolean, default: false },
    },
    saturday: {
      open: { type: String, default: '06:00' },
      close: { type: String, default: '22:00' },
      isClosed: { type: Boolean, default: false },
    },
    sunday: {
      open: { type: String, default: '07:00' },
      close: { type: String, default: '21:00' },
      isClosed: { type: Boolean, default: false },
    },
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending',
  },
  contactInfo: {
    phone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      lowercase: true,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved', // Auto-approve by default
  },
  priceRange: {
    min: {
      type: Number,
      required: [true, 'Minimum price is required'],
      min: [0, 'Price cannot be negative'],
    },
    max: {
      type: Number,
      required: [true, 'Maximum price is required'],
      min: [0, 'Price cannot be negative'],
    },
  },
  facilities: [{
    name: String,
    description: String,
    available: { type: Boolean, default: true },
  }],
  rules: [{
    type: String,
    trim: true,
  }],
  cancellationPolicy: {
    type: String,
    trim: true,
    default: 'Cancellation allowed up to 24 hours before booking time',
  },
  verificationDocuments: [{
    type: String, // URLs to verification documents
    trim: true,
  }],
}, {
  timestamps: true,
});

// Index for geospatial queries
venueSchema.index({ 'address.coordinates': '2dsphere' });

// Index for search functionality
venueSchema.index({ 
  name: 'text', 
  description: 'text',
  'address.city': 'text',
  'address.state': 'text',
  sportsSupported: 'text',
});

// Virtual for full address
venueSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}, ${this.address.country}`;
});

// Method to calculate average rating
venueSchema.methods.updateRating = function(newRating) {
  const totalRating = (this.rating.average * this.rating.count) + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return this.save();
};

// Static method to find venues by sport
venueSchema.statics.findBySport = function(sport) {
  return this.find({ 
    sportsSupported: { $in: [sport] },
    status: 'approved',
    isActive: true 
  });
};

// Static method to find venues near location
venueSchema.statics.findNearLocation = function(latitude, longitude, maxDistance = 10000) {
  return this.find({
    'address.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    },
    status: 'approved',
    isActive: true
  });
};

module.exports = mongoose.model('Venue', venueSchema);
