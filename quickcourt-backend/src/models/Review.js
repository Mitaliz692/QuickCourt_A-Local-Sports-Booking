const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  venueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: true,
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true,
  },
  comment: {
    type: String,
    required: true,
    maxlength: 1000,
    trim: true,
  },
  aspects: {
    cleanliness: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    facilities: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    staff: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    value: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
  },
  photos: [{
    url: String,
    caption: String,
  }],
  isVerified: {
    type: Boolean,
    default: false,
  },
  helpful: {
    type: Number,
    default: 0,
  },
  helpfulVotes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isHelpful: Boolean,
  }],
  response: {
    comment: String,
    respondedAt: Date,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
reviewSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for better performance
reviewSchema.index({ userId: 1 });
reviewSchema.index({ venueId: 1 });
reviewSchema.index({ bookingId: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ venueId: 1, rating: -1 });

// Compound index for venue reviews
reviewSchema.index({ venueId: 1, isVerified: 1, createdAt: -1 });

// Ensure one review per booking
reviewSchema.index({ bookingId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
