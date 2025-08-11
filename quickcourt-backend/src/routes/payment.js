const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const auth = require('../middleware/auth');
const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const User = require('../models/User');
const emailService = require('../services/emailService');

const router = express.Router();

// @route   POST /api/payments/create-payment-intent
// @desc    Create payment intent for booking
// @access  Private
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { amount, currency = 'inr', venueId, bookingDetails } = req.body;

    // Validate required fields
    if (!amount || !venueId || !bookingDetails) {
      return res.status(400).json({
        success: false,
        message: 'Amount, venue ID, and booking details are required',
      });
    }

    // Verify venue exists
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found',
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to paise/cents
      currency: currency,
      metadata: {
        userId: req.user.id,
        venueId: venueId,
        // Store basic booking info only, not complex objects
        sport: bookingDetails.sport,
        date: bookingDetails.date,
        startTime: bookingDetails.startTime,
        duration: bookingDetails.duration.toString(),
      },
    });

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message,
    });
  }
});

// @route   POST /api/payments/confirm-payment
// @desc    Confirm payment and create booking
// @access  Private
router.post('/confirm-payment', auth, async (req, res) => {
  try {
    const { paymentIntentId, bookingDetails } = req.body;

    if (!paymentIntentId || !bookingDetails) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID and booking details are required',
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed',
      });
    }

    // Validate and clean selectedComponents data
    let selectedComponents = bookingDetails.selectedComponents;
    
    // Ensure selectedComponents is an array of objects, not strings
    if (typeof selectedComponents === 'string') {
      try {
        selectedComponents = JSON.parse(selectedComponents);
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid selectedComponents format',
        });
      }
    }

    // Validate that selectedComponents is an array
    if (!Array.isArray(selectedComponents)) {
      return res.status(400).json({
        success: false,
        message: 'selectedComponents must be an array',
      });
    }

    // Create booking record
    const booking = new Booking({
      userId: req.user.id,
      venueId: bookingDetails.venueId,
      sport: bookingDetails.sport,
      bookingDate: new Date(bookingDetails.date),
      startTime: bookingDetails.startTime,
      duration: bookingDetails.duration,
      selectedComponents: selectedComponents,
      totalAmount: paymentIntent.amount / 100, // Convert back from paise
      status: 'confirmed',
      paymentDetails: {
        transactionId: paymentIntent.id,
        paymentMethod: 'stripe',
        paymentStatus: 'completed',
        paidAmount: paymentIntent.amount / 100,
      },
    });

    await booking.save();

    // Send booking confirmation email
    try {
      const user = await User.findById(req.user.id);
      const venue = await Venue.findById(bookingDetails.venueId);
      
      if (user && venue) {
        await emailService.sendBookingConfirmationEmail(booking, venue, user);
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the booking if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully',
      data: {
        booking: booking,
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100,
        },
      },
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment',
      error: error.message,
    });
  }
});

// @route   GET /api/payments/test-connection
// @desc    Test Stripe connection
// @access  Private
router.get('/test-connection', auth, async (req, res) => {
  try {
    // Test Stripe connection by creating a test payment intent
    const testIntent = await stripe.paymentIntents.create({
      amount: 100, // ₹1.00 for testing
      currency: 'inr',
      metadata: {
        test: 'true',
        userId: req.user.id,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Stripe connection successful',
      data: {
        testIntentId: testIntent.id,
        status: testIntent.status,
      },
    });
  } catch (error) {
    console.error('Stripe connection test error:', error);
    res.status(500).json({
      success: false,
      message: 'Stripe connection failed',
      error: error.message,
    });
  }
});

module.exports = router;
