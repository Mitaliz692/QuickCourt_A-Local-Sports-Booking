const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['email_verification', 'password_reset'],
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5, // Maximum 5 attempts
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }, // MongoDB TTL index for automatic cleanup
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastAttemptAt: {
    type: Date,
  },
});

// Index for faster queries
otpSchema.index({ email: 1, type: 1 });
otpSchema.index({ otp: 1 });

// Static method to generate OTP
otpSchema.statics.generateOTP = function() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// Static method to create new OTP
otpSchema.statics.createOTP = async function(email, type, expiryMinutes = 10) {
  try {
    // Remove any existing unused OTPs for this email and type
    await this.deleteMany({ 
      email, 
      type, 
      isUsed: false 
    });

    // Generate new OTP
    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Create new OTP record
    const otpRecord = new this({
      email,
      otp,
      type,
      expiresAt,
    });

    await otpRecord.save();
    
    console.log(`🔑 OTP created for ${email} (${type}): ${otp} - expires at ${expiresAt.toLocaleString()}`);
    
    return {
      success: true,
      otp,
      expiresAt,
      record: otpRecord,
    };
  } catch (error) {
    console.error('Error creating OTP:', error);
    throw error;
  }
};

// Static method to verify OTP
otpSchema.statics.verifyOTP = async function(email, otp, type) {
  try {
    // Find the OTP record
    const otpRecord = await this.findOne({
      email,
      otp,
      type,
      isUsed: false,
      expiresAt: { $gt: new Date() }, // Not expired
    });

    if (!otpRecord) {
      // Check if there's an expired or used OTP
      const expiredOTP = await this.findOne({ email, otp, type });
      
      if (expiredOTP) {
        if (expiredOTP.isUsed) {
          return { success: false, message: 'OTP has already been used' };
        }
        if (expiredOTP.expiresAt <= new Date()) {
          return { success: false, message: 'OTP has expired' };
        }
      }
      
      // Increment attempt count for any existing OTP
      await this.updateMany(
        { email, type, isUsed: false },
        { 
          $inc: { attempts: 1 },
          $set: { lastAttemptAt: new Date() }
        }
      );
      
      return { success: false, message: 'Invalid OTP' };
    }

    // Check attempt limit
    if (otpRecord.attempts >= 5) {
      return { success: false, message: 'Too many invalid attempts. Please request a new OTP.' };
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    otpRecord.lastAttemptAt = new Date();
    await otpRecord.save();

    console.log(`✅ OTP verified successfully for ${email} (${type})`);
    
    return { 
      success: true, 
      message: 'OTP verified successfully',
      record: otpRecord 
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

// Static method to get OTP status
otpSchema.statics.getOTPStatus = async function(email, type) {
  try {
    const otpRecord = await this.findOne({
      email,
      type,
      isUsed: false,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return { exists: false };
    }

    const now = new Date();
    const isExpired = otpRecord.expiresAt <= now;
    const timeLeft = isExpired ? 0 : Math.ceil((otpRecord.expiresAt - now) / 1000);

    return {
      exists: true,
      isExpired,
      timeLeft,
      attempts: otpRecord.attempts,
      maxAttempts: 5,
      canResend: isExpired || otpRecord.attempts >= 5,
      createdAt: otpRecord.createdAt,
      expiresAt: otpRecord.expiresAt,
    };
  } catch (error) {
    console.error('Error getting OTP status:', error);
    throw error;
  }
};

// Static method to clean up expired OTPs (optional manual cleanup)
otpSchema.statics.cleanupExpired = async function() {
  try {
    const result = await this.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    
    if (result.deletedCount > 0) {
      console.log(`🧹 Cleaned up ${result.deletedCount} expired OTP records`);
    }
    
    return result;
  } catch (error) {
    console.error('Error cleaning up expired OTPs:', error);
    throw error;
  }
};

module.exports = mongoose.model('OTP', otpSchema);
