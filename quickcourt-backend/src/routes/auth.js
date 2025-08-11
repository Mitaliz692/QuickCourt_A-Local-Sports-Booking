const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const otpService = require('../services/otpService');
const emailService = require('../services/emailService');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Validation rules
const signupValidation = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Full name should only contain letters and spaces'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .isLength({ min: 8, max: 20 })
    .withMessage('Password must be between 8 and 20 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .trim()
    .custom((value) => {
      if (!value || value.length === 0) {
        throw new Error('Phone number is required');
      }
      // Remove spaces, dashes, parentheses for validation (like frontend does)
      const cleanPhone = value.replace(/\s|-|\(|\)/g, '');
      if (cleanPhone.length < 10) {
        throw new Error('Phone number must be at least 10 digits');
      }
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(cleanPhone)) {
        throw new Error('Please enter a valid phone number (digits only)');
      }
      return true;
    }),
  body('role')
    .isIn(['user', 'facility_owner'])
    .withMessage('Role must be either user or facility_owner'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const verifyEmailValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be 6 digits'),
];

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', upload.single('profilePicture'), signupValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', JSON.stringify(errors.array(), null, 2));
      console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    console.log('✅ Validation passed for signup');
    console.log('📝 Request body:', JSON.stringify(req.body, null, 2));

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // For development, return a mock response when DB is not available
      console.log('⚠️  Signup attempted without database connection');
      const { fullName, email, password, phone, role } = req.body;
      return res.status(200).json({
        success: true,
        message: 'Registration successful (development mode). Please check your email for verification code.',
        data: {
          user: {
            id: 'dev-user-' + Date.now(),
            fullName,
            email,
            phone,
            role,
            isEmailVerified: false,
          },
        },
      });
    }

    const { fullName, email, password, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create user data
    const userData = {
      fullName,
      email,
      password,
      phone,
      role,
    };

    // Add profile picture if uploaded
    if (req.file) {
      userData.profilePicture = `/uploads/${req.file.filename}`;
    }

    // Create new user
    const user = new User(userData);
    
    // Save user
    await user.save();

    // Send verification OTP using OTP service
    try {
      const otpResult = await otpService.sendEmailVerificationOTP(user.email, user.fullName);
      
      res.status(201).json({
        success: true,
        message: otpResult.message || 'User registered successfully. Please check your email for verification code.',
        data: {
          user: user.profile,
          otpSent: otpResult.success,
          emailMode: otpResult.mode,
        },
      });
    } catch (otpError) {
      console.error('OTP sending failed:', otpError);
      // User is created, but OTP failed
      res.status(201).json({
        success: true,
        message: 'User registered successfully, but verification email failed. Please request a new verification code.',
        data: {
          user: user.profile,
          otpSent: false,
        },
      });
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Please try again later.',
      });
    }

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findByEmail(email).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.',
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in',
        requiresVerification: true,
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.profile,
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
    });
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify user email with OTP
// @access  Public
router.post('/verify-email', verifyEmailValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, otp } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify OTP using OTP service
    const verificationResult = await otpService.verifyEmailVerificationOTP(email, otp);
    
    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        message: verificationResult.message,
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    await user.save();

    // Generate token for the verified user
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: user.profile,
        token,
      },
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed. Please try again.',
    });
  }
});

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP for email verification
// @access  Public
router.post('/resend-otp', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address'),
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
      });
    }

    // Generate new OTP
    const otp = user.generateEmailVerificationToken();
    await user.save();

    // Send verification email
    try {
      await emailService.sendVerificationEmail(user.email, user.fullName, otp);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Verification code sent successfully',
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification code. Please try again.',
    });
  }
});

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP for email verification
// @access  Public
router.post('/resend-otp', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address'),
  body('type').isIn(['email_verification', 'password_reset']).withMessage('Invalid OTP type'),
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, type } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Resend OTP using OTP service
    const otpResult = await otpService.resendOTP(email, type, user.fullName);
    
    if (!otpResult.success) {
      return res.status(400).json({
        success: false,
        message: otpResult.message,
        timeLeft: otpResult.timeLeft,
      });
    }

    res.status(200).json({
      success: true,
      message: otpResult.message,
      data: {
        emailSent: otpResult.emailSent,
        mode: otpResult.mode,
        expiresAt: otpResult.expiresAt,
      },
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification code. Please try again.',
    });
  }
});

// @route   GET /api/auth/otp-status
// @desc    Get OTP status for a user
// @access  Public
router.get('/otp-status', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address'),
  body('type').isIn(['email_verification', 'password_reset']).withMessage('Invalid OTP type'),
], async (req, res) => {
  try {
    const { email, type } = req.query;

    if (!email || !type) {
      return res.status(400).json({
        success: false,
        message: 'Email and type are required',
      });
    }

    // Get OTP status
    const status = await otpService.getOTPStatus(email, type);

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error('Get OTP status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get OTP status',
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: user.profile,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just send a success response
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
    });
  }
});

// Forgot Password - Send reset OTP
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: errors.array(),
      });
    }

    const { email } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({
        success: true,
        message: 'If an account with this email exists, a password reset code has been sent.',
      });
    }

    // Generate password reset token
    const resetOTP = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    try {
      // Send password reset email
      await emailService.sendPasswordResetEmail(user.email, user.fullName, resetOTP);
      
      res.status(200).json({
        success: true,
        message: 'Password reset code has been sent to your email.',
      });
    } catch (emailError) {
      // Reset the token if email fails
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      console.error('Password reset email failed:', emailError);
      res.status(500).json({
        success: false,
        message: 'Failed to send password reset email. Please try again later.',
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
    });
  }
});

// Verify Reset OTP
router.post('/verify-reset-otp', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be 6 digits'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: errors.array(),
      });
    }

    const { email, otp } = req.body;

    // Find user with password reset token
    const user = await User.findOne({
      email: email.toLowerCase(),
      passwordResetToken: otp,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset code.',
      });
    }

    // Generate a temporary token for password reset
    const resetToken = jwt.sign(
      { userId: user._id, purpose: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' } // 15 minutes to reset password
    );

    res.status(200).json({
      success: true,
      message: 'Reset code verified successfully.',
      resetToken,
    });
  } catch (error) {
    console.error('Verify reset OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
    });
  }
});

// Reset Password
router.post('/reset-password', [
  body('resetToken')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 8, max: 20 })
    .withMessage('Password must be between 8 and 20 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: errors.array(),
      });
    }

    const { resetToken, newPassword } = req.body;

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token.',
      });
    }

    // Ensure token is for password reset
    if (decoded.purpose !== 'password-reset') {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token.',
      });
    }

    // Find user and ensure reset token is still valid
    const user = await User.findOne({
      _id: decoded.userId,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Reset session has expired. Please request a new password reset.',
      });
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Send confirmation email
    try {
      await emailService.sendPasswordResetConfirmationEmail(user.email, user.fullName);
    } catch (emailError) {
      console.error('Password reset confirmation email failed:', emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
    });
  }
});

module.exports = router;
