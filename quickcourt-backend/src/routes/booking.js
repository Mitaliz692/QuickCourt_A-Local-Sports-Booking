const express = require('express');
const auth = require('../middleware/auth');
const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const User = require('../models/User');
const { sendBookingConfirmationEmail } = require('../services/emailService');

const router = express.Router();

// @route   GET /api/bookings/my-bookings
// @desc    Get user's bookings
// @access  Private
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const bookings = await Booking.find({ userId: req.user.id })
      .populate('venueId', 'name address photos rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments({ userId: req.user.id });

    res.status(200).json({
      success: true,
      data: {
        bookings,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: bookings.length,
          totalBookings: total,
        },
      },
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bookings',
    });
  }
});

// @route   GET /api/bookings/venue-bookings
// @desc    Get bookings for venue owner
// @access  Private (Venue Owner)
router.get('/venue-bookings', auth, async (req, res) => {
  try {
    if (req.user.role !== 'facility_owner') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only facility owners can view venue bookings.',
      });
    }

    // Get venues owned by the user
    const ownedVenues = await Venue.find({ ownerId: req.user.id }).select('_id');
    const venueIds = ownedVenues.map(venue => venue._id);

    if (venueIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          bookings: [],
          pagination: { current: 1, total: 0, count: 0, totalBookings: 0 },
        },
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const bookings = await Booking.find({ venueId: { $in: venueIds } })
      .populate('venueId', 'name address photos')
      .populate('userId', 'fullName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments({ venueId: { $in: venueIds } });

    res.status(200).json({
      success: true,
      data: {
        bookings,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: bookings.length,
          totalBookings: total,
        },
      },
    });
  } catch (error) {
    console.error('Get venue bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get venue bookings',
    });
  }
});

// @route   GET /api/bookings/venue-stats
// @desc    Get booking statistics for facility owner
// @access  Private (Facility Owner)
router.get('/venue-stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'facility_owner') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only facility owners can view venue statistics.',
      });
    }

    // Get venues owned by the user
    const ownedVenues = await Venue.find({ ownerId: req.user.id }).select('_id');
    const venueIds = ownedVenues.map(venue => venue._id);

    if (venueIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalBookings: 0,
          todayBookings: 0,
          pendingBookings: 0,
          totalRevenue: 0,
          monthlyRevenue: 0,
        },
      });
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Get all statistics in parallel
    const [
      totalBookings,
      todayBookings,
      pendingBookings,
      totalRevenueResult,
      monthlyRevenueResult
    ] = await Promise.all([
      // Total bookings count
      Booking.countDocuments({ venueId: { $in: venueIds } }),
      
      // Today's bookings count
      Booking.countDocuments({ 
        venueId: { $in: venueIds },
        bookingDate: { $gte: startOfDay, $lt: endOfDay }
      }),
      
      // Pending bookings count
      Booking.countDocuments({ 
        venueId: { $in: venueIds },
        status: 'pending'
      }),
      
      // Total revenue (all completed/confirmed bookings)
      Booking.aggregate([
        { 
          $match: { 
            venueId: { $in: venueIds },
            status: { $in: ['confirmed', 'completed'] }
          }
        },
        { 
          $group: { 
            _id: null, 
            total: { $sum: '$totalAmount' } 
          } 
        }
      ]),
      
      // Monthly revenue
      Booking.aggregate([
        { 
          $match: { 
            venueId: { $in: venueIds },
            status: { $in: ['confirmed', 'completed'] },
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
          }
        },
        { 
          $group: { 
            _id: null, 
            total: { $sum: '$totalAmount' } 
          } 
        }
      ])
    ]);

    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;
    const monthlyRevenue = monthlyRevenueResult.length > 0 ? monthlyRevenueResult[0].total : 0;

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        todayBookings,
        pendingBookings,
        totalRevenue,
        monthlyRevenue,
      },
    });
  } catch (error) {
    console.error('Get venue booking stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get venue booking statistics',
    });
  }
});

// @route   GET /api/bookings/stats
// @desc    Get booking statistics for user
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const [totalBookings, upcomingBookings, completedBookings] = await Promise.all([
      Booking.countDocuments({ userId }),
      Booking.countDocuments({ 
        userId, 
        bookingDate: { $gte: now },
        status: { $in: ['confirmed', 'pending'] }
      }),
      Booking.countDocuments({ 
        userId, 
        status: 'completed'
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        upcomingBookings,
        completedBookings,
      },
    });
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get booking statistics',
    });
  }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check if user owns this booking
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking',
      });
    }

    // Check if booking can be cancelled (not in the past or already cancelled)
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled',
      });
    }

    if (new Date() > new Date(booking.bookingDate)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel past bookings',
      });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason || 'Cancelled by user';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking },
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
    });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get booking details
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('venueId', 'name address photos rating contactInfo')
      .populate('userId', 'fullName email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check if user has access to this booking
    const hasAccess = 
      booking.userId._id.toString() === req.user.id || // User owns booking
      (req.user.role === 'facility_owner' && booking.venueId.ownerId === req.user.id); // Owner of venue

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking',
      });
    }

    res.status(200).json({
      success: true,
      data: { booking },
    });
  } catch (error) {
    console.error('Get booking details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get booking details',
    });
  }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status (for facility owners)
// @access  Private (Facility Owner)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['confirmed', 'cancelled', 'completed', 'no_show'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

    const booking = await Booking.findById(req.params.id).populate('venueId');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check if the user owns the venue
    if (booking.venueId.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update bookings for your own venues.',
      });
    }

    // Update booking status
    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      data: { booking },
      message: `Booking ${status} successfully`,
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
    });
  }
});

// @route   GET /api/bookings/analytics/trends
// @desc    Get booking trends for facility owner (daily/weekly/monthly)
// @access  Private (Facility Owner)
router.get('/analytics/trends', auth, async (req, res) => {
  try {
    const { period = 'daily', range = '30' } = req.query;
    const days = parseInt(range);
    
    // Get user's venues
    const venues = await Venue.find({ ownerId: req.user.id }).select('_id');
    const venueIds = venues.map(v => v._id);

    console.log('Analytics trends - User venues:', venueIds);

    if (venueIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: { trends: [], summary: {} }
      });
    }

    // Check total bookings for debugging
    const totalBookings = await Booking.countDocuments({ venueId: { $in: venueIds } });
    console.log('Total bookings for user venues:', totalBookings);

    let groupBy, dateFormat, startDate;
    const now = new Date();

    switch (period) {
      case 'daily':
        startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        dateFormat = '%Y-%m-%d';
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - days * 7 * 24 * 60 * 60 * 1000);
        groupBy = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        dateFormat = '%Y-W%U';
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - days * 30 * 24 * 60 * 60 * 1000);
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        dateFormat = '%Y-%m';
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
    }

    console.log('Date range for trends:', { startDate, now, period });

    const trends = await Booking.aggregate([
      {
        $match: {
          venueId: { $in: venueIds },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          confirmedBookings: {
            $sum: {
              $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0]
            }
          },
          cancelledBookings: {
            $sum: {
              $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0]
            }
          },
          avgBookingValue: { $avg: '$totalAmount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 }
      }
    ]);

    console.log('Trends aggregation result:', trends);

    // Calculate summary statistics
    const summary = await Booking.aggregate([
      {
        $match: {
          venueId: { $in: venueIds },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgDailyBookings: { $avg: 1 },
          maxDailyRevenue: { $max: '$totalAmount' },
          confirmedRate: {
            $avg: {
              $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0]
            }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        trends,
        summary: summary[0] || {},
        period,
        range: days
      }
    });
  } catch (error) {
    console.error('Get booking trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get booking trends'
    });
  }
});

// @route   GET /api/bookings/analytics/earnings
// @desc    Get earnings breakdown for facility owner
// @access  Private (Facility Owner)
router.get('/analytics/earnings', auth, async (req, res) => {
  try {
    const { period = 'monthly', range = '12' } = req.query;
    const periods = parseInt(range);
    
    // Get user's venues
    const venues = await Venue.find({ ownerId: req.user.id }).select('_id name');
    const venueIds = venues.map(v => v._id);

    if (venueIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: { earnings: [], venueBreakdown: [], summary: {} }
      });
    }

    // Calculate start date based on period
    const now = new Date();
    let startDate, groupBy;

    switch (period) {
      case 'daily':
        startDate = new Date(now.getTime() - periods * 24 * 60 * 60 * 1000);
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - periods * 7 * 24 * 60 * 60 * 1000);
        groupBy = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - periods * 30 * 24 * 60 * 60 * 1000);
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      default:
        startDate = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000);
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
    }

    // Earnings over time
    const earnings = await Booking.aggregate([
      {
        $match: {
          venueId: { $in: venueIds },
          status: { $in: ['confirmed', 'completed'] },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          totalEarnings: { $sum: '$totalAmount' },
          bookingCount: { $sum: 1 },
          avgBookingValue: { $avg: '$totalAmount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 }
      }
    ]);

    // Earnings by venue
    const venueBreakdown = await Booking.aggregate([
      {
        $match: {
          venueId: { $in: venueIds },
          status: { $in: ['confirmed', 'completed'] },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$venueId',
          totalEarnings: { $sum: '$totalAmount' },
          bookingCount: { $sum: 1 },
          avgBookingValue: { $avg: '$totalAmount' }
        }
      },
      {
        $lookup: {
          from: 'venues',
          localField: '_id',
          foreignField: '_id',
          as: 'venue'
        }
      },
      {
        $unwind: '$venue'
      },
      {
        $project: {
          venueName: '$venue.name',
          totalEarnings: 1,
          bookingCount: 1,
          avgBookingValue: 1
        }
      },
      {
        $sort: { totalEarnings: -1 }
      }
    ]);

    // Overall summary
    const summary = await Booking.aggregate([
      {
        $match: {
          venueId: { $in: venueIds },
          status: { $in: ['confirmed', 'completed'] },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$totalAmount' },
          totalBookings: { $sum: 1 },
          avgBookingValue: { $avg: '$totalAmount' },
          maxBookingValue: { $max: '$totalAmount' },
          minBookingValue: { $min: '$totalAmount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        earnings,
        venueBreakdown,
        summary: summary[0] || {},
        period,
        range: periods
      }
    });
  } catch (error) {
    console.error('Get earnings analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get earnings analytics'
    });
  }
});

// @route   GET /api/bookings/analytics/peak-hours
// @desc    Get peak booking hours heatmap data
// @access  Private (Facility Owner)
router.get('/analytics/peak-hours', auth, async (req, res) => {
  try {
    const { range = '30' } = req.query;
    const days = parseInt(range);
    
    // Get user's venues
    const venues = await Venue.find({ ownerId: req.user.id }).select('_id');
    const venueIds = venues.map(v => v._id);

    if (venueIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: { heatmapData: [], peakTimes: [], insights: {} }
      });
    }

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get booking time patterns
    const heatmapData = await Booking.aggregate([
      {
        $match: {
          venueId: { $in: venueIds },
          createdAt: { $gte: startDate },
          status: { $in: ['confirmed', 'completed'] }
        }
      },
      {
        $addFields: {
          // Convert startTime string to hour number (assuming format like "09:00", "14:30", etc.)
          hourFromString: {
            $toInt: {
              $substr: ['$startTime', 0, 2]
            }
          }
        }
      },
      {
        $project: {
          dayOfWeek: { $dayOfWeek: '$bookingDate' },
          hour: '$hourFromString',
          totalAmount: 1
        }
      },
      {
        $group: {
          _id: {
            dayOfWeek: '$dayOfWeek',
            hour: '$hour'
          },
          bookingCount: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgRevenue: { $avg: '$totalAmount' }
        }
      },
      {
        $sort: { '_id.dayOfWeek': 1, '_id.hour': 1 }
      }
    ]);

    // Get peak times (top booking hours)
    const peakTimes = await Booking.aggregate([
      {
        $match: {
          venueId: { $in: venueIds },
          createdAt: { $gte: startDate },
          status: { $in: ['confirmed', 'completed'] }
        }
      },
      {
        $addFields: {
          hourFromString: {
            $toInt: {
              $substr: ['$startTime', 0, 2]
            }
          }
        }
      },
      {
        $project: {
          hour: '$hourFromString',
          totalAmount: 1
        }
      },
      {
        $group: {
          _id: '$hour',
          bookingCount: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { bookingCount: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Calculate insights
    const insights = await Booking.aggregate([
      {
        $match: {
          venueId: { $in: venueIds },
          createdAt: { $gte: startDate },
          status: { $in: ['confirmed', 'completed'] }
        }
      },
      {
        $addFields: {
          hourFromString: {
            $toInt: {
              $substr: ['$startTime', 0, 2]
            }
          }
        }
      },
      {
        $project: {
          dayOfWeek: { $dayOfWeek: '$bookingDate' },
          hour: '$hourFromString',
          isWeekend: {
            $in: [{ $dayOfWeek: '$bookingDate' }, [1, 7]] // Sunday = 1, Saturday = 7
          }
        }
      },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          weekendBookings: {
            $sum: {
              $cond: ['$isWeekend', 1, 0]
            }
          },
          morningBookings: {
            $sum: {
              $cond: [
                { $and: [{ $gte: ['$hour', 6] }, { $lt: ['$hour', 12] }] },
                1,
                0
              ]
            }
          },
          afternoonBookings: {
            $sum: {
              $cond: [
                { $and: [{ $gte: ['$hour', 12] }, { $lt: ['$hour', 18] }] },
                1,
                0
              ]
            }
          },
          eveningBookings: {
            $sum: {
              $cond: [
                { $and: [{ $gte: ['$hour', 18] }, { $lt: ['$hour', 24] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          totalBookings: 1,
          weekendPercentage: {
            $multiply: [
              { $divide: ['$weekendBookings', '$totalBookings'] },
              100
            ]
          },
          morningPercentage: {
            $multiply: [
              { $divide: ['$morningBookings', '$totalBookings'] },
              100
            ]
          },
          afternoonPercentage: {
            $multiply: [
              { $divide: ['$afternoonBookings', '$totalBookings'] },
              100
            ]
          },
          eveningPercentage: {
            $multiply: [
              { $divide: ['$eveningBookings', '$totalBookings'] },
              100
            ]
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        heatmapData,
        peakTimes,
        insights: insights[0] || {},
        range: days
      }
    });
  } catch (error) {
    console.error('Get peak hours analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get peak hours analytics'
    });
  }
});

module.exports = router;
