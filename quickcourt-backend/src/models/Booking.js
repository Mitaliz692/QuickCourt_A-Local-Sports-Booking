const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
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
  sport: {
    type: String,
    required: true,
  },
  bookingDate: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
    max: 8,
  },
  selectedComponents: [{
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    sport: {
      type: String,
      required: true
    },
    pricePerHour: {
      type: Number,
      required: true,
      min: 0
    },
    features: [{
      type: String
    }],
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
    default: 'pending',
  },
  paymentDetails: {
    transactionId: String,
    paymentMethod: {
      type: String,
      enum: ['stripe', 'razorpay', 'cash', 'upi'],
      default: 'stripe',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paidAmount: {
      type: Number,
      min: 0,
    },
  },
  bookingNotes: {
    type: String,
    maxlength: 500,
  },
  cancellationReason: {
    type: String,
    maxlength: 500,
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
bookingSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for better performance
bookingSchema.index({ userId: 1 });
bookingSchema.index({ venueId: 1 });
bookingSchema.index({ bookingDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ 'paymentDetails.transactionId': 1 });

module.exports = mongoose.model('Booking', bookingSchema);
