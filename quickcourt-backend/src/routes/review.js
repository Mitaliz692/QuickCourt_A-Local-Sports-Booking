const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for review photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/reviews/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// @route   POST /api/reviews
// @desc    Create a new review for a venue
// @access  Private
router.post('/', auth, upload.array('photos', 5), async (req, res) => {
  try {
    const { bookingId, venueId, rating, title, comment, aspects } = req.body;

    // Validate that the booking exists and belongs to the user
    const booking = await Booking.findOne({
      _id: bookingId,
      userId: req.user.id,
      venueId: venueId,
      status: { $in: ['completed', 'confirmed'] },
      'paymentDetails.paymentStatus': 'completed'
    });

    if (!booking) {
      return res.status(400).json({
        success: false,
        message: 'Booking not found or not eligible for review'
      });
    }

    // Check if review already exists for this booking
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this booking'
      });
    }

    // Parse aspects if it's a string
    let parsedAspects = aspects;
    if (typeof aspects === 'string') {
      try {
        parsedAspects = JSON.parse(aspects);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid aspects format'
        });
      }
    }

    // Process uploaded photos
    const photos = req.files ? req.files.map(file => ({
      url: `/uploads/reviews/${file.filename}`,
      caption: req.body.photoCaption || ''
    })) : [];

    // Create the review
    const review = new Review({
      userId: req.user.id,
      venueId,
      bookingId,
      rating: parseInt(rating),
      title: title.trim(),
      comment: comment.trim(),
      aspects: {
        cleanliness: parseInt(parsedAspects.cleanliness),
        facilities: parseInt(parsedAspects.facilities),
        staff: parseInt(parsedAspects.staff),
        value: parseInt(parsedAspects.value),
      },
      photos,
      isVerified: true // Mark as verified since it's based on a real booking
    });

    await review.save();

    // Update venue's average rating
    await updateVenueRating(venueId);

    // Populate the review with user and venue data for response
    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'fullName email')
      .populate('venueId', 'name address')
      .populate('bookingId', 'bookingDate startTime');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: populatedReview
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review'
    });
  }
});

// @route   GET /api/reviews/user/bookings
// @desc    Get user's bookings eligible for review
// @access  Private
router.get('/user/bookings', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Find completed bookings that don't have reviews yet
    const bookings = await Booking.find({
      userId: req.user.id,
      status: { $in: ['completed', 'confirmed'] },
      'paymentDetails.paymentStatus': 'completed'
    })
    .populate('venueId', 'name address photos rating')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);

    // Filter out bookings that already have reviews
    const bookingIds = bookings.map(booking => booking._id);
    const existingReviews = await Review.find({ 
      bookingId: { $in: bookingIds } 
    }).select('bookingId');
    
    const reviewedBookingIds = new Set(existingReviews.map(review => review.bookingId.toString()));
    
    const eligibleBookings = bookings.filter(booking => 
      !reviewedBookingIds.has(booking._id.toString())
    );

    // Get total count for pagination
    const totalEligibleBookings = await Booking.countDocuments({
      userId: req.user.id,
      status: { $in: ['completed', 'confirmed'] },
      'paymentDetails.paymentStatus': 'completed'
    });

    res.status(200).json({
      success: true,
      data: {
        bookings: eligibleBookings,
        pagination: {
          current: page,
          total: Math.ceil(totalEligibleBookings / limit),
          count: eligibleBookings.length,
          totalBookings: totalEligibleBookings
        }
      }
    });
  } catch (error) {
    console.error('Get eligible bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get eligible bookings'
    });
  }
});

// @route   GET /api/reviews/user
// @desc    Get user's reviews
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ userId: req.user.id })
      .populate('userId', 'fullName email')
      .populate('venueId', 'name address photos')
      .populate('bookingId', 'bookingDate startTime totalAmount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalReviews = await Review.countDocuments({ userId: req.user.id });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          current: page,
          total: Math.ceil(totalReviews / limit),
          count: reviews.length,
          totalReviews
        }
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user reviews'
    });
  }
});

// @route   GET /api/reviews/venue/:venueId
// @desc    Get reviews for a specific venue
// @access  Public
router.get('/venue/:venueId', async (req, res) => {
  try {
    const { venueId } = req.params;
    
    // Validate venueId format
    if (!mongoose.Types.ObjectId.isValid(venueId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid venue ID format'
      });
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const objectIdVenueId = new mongoose.Types.ObjectId(venueId);

    const reviews = await Review.find({ venueId: objectIdVenueId, isVerified: true })
      .populate('userId', 'fullName')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const totalReviews = await Review.countDocuments({ venueId: objectIdVenueId, isVerified: true });

    // Get rating statistics
    const ratingStats = await Review.aggregate([
      { $match: { venueId: objectIdVenueId, isVerified: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    // Calculate rating distribution
    let distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (ratingStats.length > 0) {
      ratingStats[0].ratingDistribution.forEach(rating => {
        distribution[rating]++;
      });
    }

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          current: page,
          total: Math.ceil(totalReviews / limit),
          count: reviews.length,
          totalReviews
        },
        statistics: ratingStats.length > 0 ? {
          averageRating: ratingStats[0].averageRating,
          totalReviews: ratingStats[0].totalReviews,
          ratingDistribution: distribution
        } : null
      }
    });
  } catch (error) {
    console.error('Get venue reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get venue reviews'
    });
  }
});

// @route   PUT /api/reviews/:reviewId
// @desc    Update a review
// @access  Private
router.put('/:reviewId', auth, upload.array('photos', 5), async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment, aspects } = req.body;

    const review = await Review.findOne({ _id: reviewId, userId: req.user.id });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or unauthorized'
      });
    }

    // Parse aspects if it's a string
    let parsedAspects = aspects;
    if (typeof aspects === 'string') {
      try {
        parsedAspects = JSON.parse(aspects);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid aspects format'
        });
      }
    }

    // Update review fields
    if (rating) review.rating = parseInt(rating);
    if (title) review.title = title.trim();
    if (comment) review.comment = comment.trim();
    if (parsedAspects) {
      review.aspects = {
        cleanliness: parseInt(parsedAspects.cleanliness),
        facilities: parseInt(parsedAspects.facilities),
        staff: parseInt(parsedAspects.staff),
        value: parseInt(parsedAspects.value),
      };
    }

    // Add new photos if provided
    if (req.files && req.files.length > 0) {
      const newPhotos = req.files.map(file => ({
        url: `/uploads/reviews/${file.filename}`,
        caption: req.body.photoCaption || ''
      }));
      review.photos = [...review.photos, ...newPhotos];
    }

    await review.save();

    // Update venue's average rating
    await updateVenueRating(review.venueId);

    // Populate and return updated review
    const updatedReview = await Review.findById(reviewId)
      .populate('userId', 'fullName email')
      .populate('venueId', 'name address')
      .populate('bookingId', 'bookingDate startTime');

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: updatedReview
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review'
    });
  }
});

// @route   DELETE /api/reviews/:reviewId
// @desc    Delete a review
// @access  Private
router.delete('/:reviewId', auth, async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findOne({ _id: reviewId, userId: req.user.id });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or unauthorized'
      });
    }

    const venueId = review.venueId;
    await Review.findByIdAndDelete(reviewId);

    // Update venue's average rating
    await updateVenueRating(venueId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review'
    });
  }
});

// @route   POST /api/reviews/:reviewId/helpful
// @desc    Mark review as helpful/unhelpful
// @access  Private
router.post('/:reviewId/helpful', auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { isHelpful } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user already voted
    const existingVoteIndex = review.helpfulVotes.findIndex(
      vote => vote.userId.toString() === req.user.id
    );

    if (existingVoteIndex > -1) {
      // Update existing vote
      review.helpfulVotes[existingVoteIndex].isHelpful = isHelpful;
    } else {
      // Add new vote
      review.helpfulVotes.push({
        userId: req.user.id,
        isHelpful
      });
    }

    // Recalculate helpful count
    review.helpful = review.helpfulVotes.filter(vote => vote.isHelpful).length;

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Vote recorded successfully',
      data: {
        helpful: review.helpful,
        userVote: isHelpful
      }
    });
  } catch (error) {
    console.error('Vote helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record vote'
    });
  }
});

// Debug route to check venue and reviews data
router.get('/debug/venue/:venueId', async (req, res) => {
  try {
    const { venueId } = req.params;
    console.log('Debug request for venue:', venueId);
    
    // Check venue
    const venue = await Venue.findById(venueId);
    console.log('Venue found:', !!venue);
    if (venue) {
      console.log('Venue rating:', venue.rating);
    }
    
    // Check reviews
    const reviews = await Review.find({ venueId: new mongoose.Types.ObjectId(venueId) });
    console.log('Reviews found:', reviews.length);
    
    res.json({
      success: true,
      venue: venue ? {
        id: venue._id,
        name: venue.name,
        rating: venue.rating
      } : null,
      reviews: reviews.map(r => ({
        id: r._id,
        rating: r.rating,
        isVerified: r.isVerified,
        venueId: r.venueId
      }))
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test route to manually update venue rating (for debugging)
router.post('/test-update-rating/:venueId', async (req, res) => {
  try {
    const { venueId } = req.params;
    console.log('Manual rating update test for venue:', venueId);
    
    await updateVenueRating(venueId);
    
    // Fetch the updated venue to verify
    const updatedVenue = await Venue.findById(venueId);
    
    res.json({
      success: true,
      message: 'Rating update completed',
      venueRating: updatedVenue?.rating,
      venueId: venueId
    });
  } catch (error) {
    console.error('Test update error:', error);
    res.status(500).json({
      success: false,
      message: 'Test update failed',
      error: error.message
    });
  }
});

// Helper function to update venue's average rating
async function updateVenueRating(venueId) {
  try {
    console.log('=== UPDATING VENUE RATING ===');
    console.log('Input venueId:', venueId, 'Type:', typeof venueId);
    
    // Convert to ObjectId if it's a string
    const objectIdVenueId = mongoose.Types.ObjectId.isValid(venueId) 
      ? new mongoose.Types.ObjectId(venueId) 
      : venueId;
      
    console.log('Converted venueId:', objectIdVenueId);
    
    // First, let's check if reviews exist for this venue
    const allReviews = await Review.find({ venueId: objectIdVenueId });
    console.log('All reviews found for venue:', allReviews.length);
    allReviews.forEach((review, index) => {
      console.log(`Review ${index + 1}: Rating=${review.rating}, Verified=${review.isVerified}`);
    });
    
    // Include all reviews (both verified and unverified) for real-time updates
    const ratingData = await Review.aggregate([
      { $match: { venueId: objectIdVenueId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    console.log('Aggregation result:', ratingData);

    if (ratingData.length > 0) {
      const newAverage = Math.round(ratingData[0].averageRating * 10) / 10;
      const newCount = ratingData[0].totalReviews;
      
      console.log('Calculated average:', newAverage);
      console.log('Calculated count:', newCount);
      
      const updateResult = await Venue.findByIdAndUpdate(objectIdVenueId, {
        'rating.average': newAverage,
        'rating.count': newCount
      }, { new: true });
      
      console.log('Update result - venue found:', !!updateResult);
      if (updateResult) {
        console.log('Updated venue rating:', updateResult.rating);
      } else {
        console.log('Venue not found for update!');
      }
    } else {
      console.log('No reviews found, setting rating to 0');
      await Venue.findByIdAndUpdate(objectIdVenueId, {
        'rating.average': 0,
        'rating.count': 0
      });
    }
    console.log('=== VENUE RATING UPDATE COMPLETE ===');
  } catch (error) {
    console.error('Update venue rating error:', error);
  }
}

module.exports = router;
