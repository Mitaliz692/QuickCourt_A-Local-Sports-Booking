const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Venue = require('../models/Venue');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/venues';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'venue-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// @route   GET /api/venues
// @desc    Get all venues with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { status: 'approved', isActive: true };
    
    if (req.query.sport) {
      filter.sportsSupported = { $in: [req.query.sport] };
    }
    
    if (req.query.city) {
      filter['address.city'] = new RegExp(req.query.city, 'i');
    }

    if (req.query.minPrice || req.query.maxPrice) {
      filter['priceRange.min'] = {};
      if (req.query.minPrice) filter['priceRange.min'].$gte = parseInt(req.query.minPrice);
      if (req.query.maxPrice) filter['priceRange.max'] = { $lte: parseInt(req.query.maxPrice) };
    }

    const venues = await Venue.find(filter)
      .populate('ownerId', 'fullName email phone')
      .sort({ 'rating.average': -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Venue.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        venues,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: venues.length,
          totalVenues: total,
        },
      },
    });
  } catch (error) {
    console.error('Get venues error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get venues',
    });
  }
});

// @route   GET /api/venues/my-venues
// @desc    Get venues owned by current user
// @access  Private (Facility Owner)
router.get('/my-venues', auth, async (req, res) => {
  try {
    if (req.user.role !== 'facility_owner' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only facility owners can view their venues.',
      });
    }

    const venues = await Venue.find({ ownerId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { venues },
    });
  } catch (error) {
    console.error('Get my venues error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get venues',
    });
  }
});

// @route   GET /api/venues/:id
// @desc    Get single venue by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id)
      .populate('ownerId', 'fullName email phone');

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { venue },
    });
  } catch (error) {
    console.error('Get venue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get venue',
    });
  }
});

// @route   POST /api/venues
// @desc    Create new venue
// @access  Private (Facility Owner)
router.post('/', auth, upload.array('photos', 5), async (req, res) => {
  try {
    // Check if user is facility owner
    if (req.user.role !== 'facility_owner' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only facility owners can create venues.',
      });
    }

    const {
      name,
      description,
      address,
      sportsSupported,
      amenities,
      operatingHours,
      contactInfo,
      priceRange,
      facilities,
      rules,
      cancellationPolicy,
    } = req.body;

    // Parse JSON strings if necessary
    const parsedAddress = typeof address === 'string' ? JSON.parse(address) : address;
    const parsedSportsSupported = typeof sportsSupported === 'string' ? JSON.parse(sportsSupported) : sportsSupported;
    const parsedAmenities = typeof amenities === 'string' ? JSON.parse(amenities) : amenities || [];
    const parsedOperatingHours = typeof operatingHours === 'string' ? JSON.parse(operatingHours) : operatingHours;
    const parsedContactInfo = typeof contactInfo === 'string' ? JSON.parse(contactInfo) : contactInfo;
    const parsedPriceRange = typeof priceRange === 'string' ? JSON.parse(priceRange) : priceRange;
    const parsedFacilities = typeof facilities === 'string' ? JSON.parse(facilities) : facilities || [];
    const parsedRules = typeof rules === 'string' ? JSON.parse(rules) : rules || [];

    // Process uploaded photos
    const photoUrls = req.files ? req.files.map(file => `/uploads/venues/${file.filename}`) : [];

    const venue = new Venue({
      name,
      description,
      ownerId: req.user.id,
      address: parsedAddress,
      sportsSupported: parsedSportsSupported,
      amenities: parsedAmenities,
      photos: photoUrls,
      operatingHours: parsedOperatingHours,
      contactInfo: parsedContactInfo,
      priceRange: parsedPriceRange,
      facilities: parsedFacilities,
      rules: parsedRules,
      cancellationPolicy: cancellationPolicy || 'Cancellation allowed up to 24 hours before booking time',
      status: 'approved', // Auto-approve venues
      isActive: true, // Make venue active immediately
    });

    await venue.save();

    res.status(201).json({
      success: true,
      message: 'Venue created and approved successfully!',
      data: { venue },
    });
  } catch (error) {
    console.error('Create venue error:', error);
    
    // Clean up uploaded files if venue creation fails
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create venue',
    });
  }
});

// @route   GET /api/venues/:id
// @desc    Get venue by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id)
      .populate('ownerId', 'fullName email phone');

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { venue },
    });
  } catch (error) {
    console.error('Get venue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get venue',
    });
  }
});

// @route   PUT /api/venues/:id
// @desc    Update venue
// @access  Private (Venue Owner or Admin)
router.put('/:id', auth, upload.array('photos', 5), async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found',
      });
    }

    // Check if user is the owner or admin
    if (venue.ownerId.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own venues.',
      });
    }

    const updateData = { ...req.body };

    // Parse JSON strings if necessary
    Object.keys(updateData).forEach(key => {
      if (typeof updateData[key] === 'string' && (key.includes('address') || key.includes('sports') || key.includes('amenities') || key.includes('operating') || key.includes('contact') || key.includes('price') || key.includes('facilities') || key.includes('rules') || key === 'existingPhotos')) {
        try {
          updateData[key] = JSON.parse(updateData[key]);
        } catch (e) {
          // Keep as string if not valid JSON
        }
      }
    });

    // Handle photo updates
    let finalPhotos = [];
    
    // If we have existing photos data from frontend, use it
    if (updateData.existingPhotos) {
      try {
        // existingPhotos might already be parsed by the forEach loop above
        const existingPhotos = Array.isArray(updateData.existingPhotos) 
          ? updateData.existingPhotos 
          : JSON.parse(updateData.existingPhotos);
        finalPhotos = [...existingPhotos];
      } catch (e) {
        // If parsing fails, keep current photos
        finalPhotos = [...(venue.photos || [])];
      }
    } else {
      // If no existing photos specified, keep current photos
      finalPhotos = [...(venue.photos || [])];
    }
    
    // Add new photos if any
    if (req.files && req.files.length > 0) {
      const newPhotoUrls = req.files.map(file => `/uploads/venues/${file.filename}`);
      finalPhotos = [...finalPhotos, ...newPhotoUrls];
    }
    
    // Update photos in updateData
    updateData.photos = finalPhotos;
    
    // Remove existingPhotos from updateData as it's not part of the schema
    delete updateData.existingPhotos;

    // Update venue
    const updatedVenue = await Venue.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('ownerId', 'fullName email phone');

    res.status(200).json({
      success: true,
      message: 'Venue updated successfully',
      data: { venue: updatedVenue },
    });
  } catch (error) {
    console.error('Update venue error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update venue',
    });
  }
});

// @route   DELETE /api/venues/:id
// @desc    Delete venue
// @access  Private (Venue Owner or Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found',
      });
    }

    // Check if user is the owner or admin
    if (venue.ownerId.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own venues.',
      });
    }

    // Delete associated photos
    if (venue.photos && venue.photos.length > 0) {
      venue.photos.forEach(photoUrl => {
        const filePath = path.join(__dirname, '../..', photoUrl);
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting photo:', err);
        });
      });
    }

    await Venue.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Venue deleted successfully',
    });
  } catch (error) {
    console.error('Delete venue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete venue',
    });
  }
});

// @route   POST /api/venues/:id/photos
// @desc    Add photos to venue
// @access  Private (Venue Owner or Admin)
router.post('/:id/photos', auth, upload.array('photos', 5), async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found',
      });
    }

    // Check if user is the owner or admin
    if (venue.ownerId.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own venues.',
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No photos uploaded',
      });
    }

    const newPhotoUrls = req.files.map(file => `/uploads/venues/${file.filename}`);
    venue.photos = [...(venue.photos || []), ...newPhotoUrls];
    await venue.save();

    res.status(200).json({
      success: true,
      message: 'Photos added successfully',
      data: { photos: newPhotoUrls },
    });
  } catch (error) {
    console.error('Add photos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add photos',
    });
  }
});

// @route   DELETE /api/venues/:id/photos/:photoIndex
// @desc    Remove photo from venue
// @access  Private (Venue Owner or Admin)
router.delete('/:id/photos/:photoIndex', auth, async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found',
      });
    }

    // Check if user is the owner or admin
    if (venue.ownerId.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own venues.',
      });
    }

    const photoIndex = parseInt(req.params.photoIndex);
    if (photoIndex < 0 || photoIndex >= venue.photos.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid photo index',
      });
    }

    const photoUrl = venue.photos[photoIndex];
    const filePath = path.join(__dirname, '../..', photoUrl);
    
    // Delete file from filesystem
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting photo file:', err);
    });

    // Remove from array
    venue.photos.splice(photoIndex, 1);
    await venue.save();

    res.status(200).json({
      success: true,
      message: 'Photo removed successfully',
    });
  } catch (error) {
    console.error('Remove photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove photo',
    });
  }
});

module.exports = router;
module.exports = router;
