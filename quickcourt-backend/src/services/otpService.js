const OTP = require('../models/OTP');
const emailService = require('./emailService');

class OTPService {
  
  // Generate and send email verification OTP
  async sendEmailVerificationOTP(email, fullName) {
    try {
      console.log(`📧 Generating email verification OTP for: ${email}`);
      
      // Check if user can request new OTP (rate limiting)
      const status = await OTP.getOTPStatus(email, 'email_verification');
      
      if (status.exists && !status.canResend) {
        const timeLeftMinutes = Math.ceil(status.timeLeft / 60);
        return {
          success: false,
          message: `Please wait ${timeLeftMinutes} minutes before requesting a new OTP`,
          timeLeft: status.timeLeft,
        };
      }
      
      // Create new OTP
      const otpResult = await OTP.createOTP(email, 'email_verification', 10); // 10 minutes expiry
      
      // Send OTP via email
      const emailResult = await emailService.sendVerificationEmail(email, fullName, otpResult.otp);
      
      return {
        success: true,
        message: 'Verification OTP sent successfully',
        expiresAt: otpResult.expiresAt,
        emailSent: emailResult.mode === 'email',
        mode: emailResult.mode,
      };
    } catch (error) {
      console.error('Send email verification OTP error:', error);
      throw error;
    }
  }
  
  // Generate and send password reset OTP
  async sendPasswordResetOTP(email, fullName) {
    try {
      console.log(`🔑 Generating password reset OTP for: ${email}`);
      
      // Check if user can request new OTP
      const status = await OTP.getOTPStatus(email, 'password_reset');
      
      if (status.exists && !status.canResend) {
        const timeLeftMinutes = Math.ceil(status.timeLeft / 60);
        return {
          success: false,
          message: `Please wait ${timeLeftMinutes} minutes before requesting a new OTP`,
          timeLeft: status.timeLeft,
        };
      }
      
      // Create new OTP
      const otpResult = await OTP.createOTP(email, 'password_reset', 15); // 15 minutes expiry
      
      // Send OTP via email
      const emailResult = await emailService.sendPasswordResetEmail(email, fullName, otpResult.otp);
      
      return {
        success: true,
        message: 'Password reset OTP sent successfully',
        expiresAt: otpResult.expiresAt,
        emailSent: emailResult.mode === 'email',
        mode: emailResult.mode,
      };
    } catch (error) {
      console.error('Send password reset OTP error:', error);
      throw error;
    }
  }
  
  // Verify email verification OTP
  async verifyEmailVerificationOTP(email, otp) {
    try {
      console.log(`🔍 Verifying email verification OTP for: ${email}`);
      
      const result = await OTP.verifyOTP(email, otp, 'email_verification');
      
      if (!result.success) {
        console.log(`❌ Email verification failed for ${email}: ${result.message}`);
      }
      
      return result;
    } catch (error) {
      console.error('Verify email verification OTP error:', error);
      throw error;
    }
  }
  
  // Verify password reset OTP
  async verifyPasswordResetOTP(email, otp) {
    try {
      console.log(`🔍 Verifying password reset OTP for: ${email}`);
      
      const result = await OTP.verifyOTP(email, otp, 'password_reset');
      
      if (!result.success) {
        console.log(`❌ Password reset verification failed for ${email}: ${result.message}`);
      }
      
      return result;
    } catch (error) {
      console.error('Verify password reset OTP error:', error);
      throw error;
    }
  }
  
  // Get OTP status for a user
  async getOTPStatus(email, type) {
    try {
      return await OTP.getOTPStatus(email, type);
    } catch (error) {
      console.error('Get OTP status error:', error);
      throw error;
    }
  }
  
  // Resend OTP
  async resendOTP(email, type, fullName) {
    try {
      if (type === 'email_verification') {
        return await this.sendEmailVerificationOTP(email, fullName);
      } else if (type === 'password_reset') {
        return await this.sendPasswordResetOTP(email, fullName);
      } else {
        throw new Error('Invalid OTP type');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      throw error;
    }
  }
  
  // Clean up expired OTPs (can be called periodically)
  async cleanupExpiredOTPs() {
    try {
      return await OTP.cleanupExpired();
    } catch (error) {
      console.error('Cleanup expired OTPs error:', error);
      throw error;
    }
  }
  
  // Get statistics for admin dashboard
  async getOTPStatistics() {
    try {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const stats = await Promise.all([
        OTP.countDocuments({ type: 'email_verification', createdAt: { $gte: oneDayAgo } }),
        OTP.countDocuments({ type: 'password_reset', createdAt: { $gte: oneDayAgo } }),
        OTP.countDocuments({ isUsed: true, createdAt: { $gte: oneDayAgo } }),
        OTP.countDocuments({ expiresAt: { $lt: now }, isUsed: false }),
      ]);
      
      return {
        emailVerificationSent24h: stats[0],
        passwordResetSent24h: stats[1],
        successfulVerifications24h: stats[2],
        expiredUnused: stats[3],
      };
    } catch (error) {
      console.error('Get OTP statistics error:', error);
      throw error;
    }
  }
}

module.exports = new OTPService();
