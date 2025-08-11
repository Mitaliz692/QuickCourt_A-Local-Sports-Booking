const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      // Check if email credentials are configured
      const hasEmailConfig = process.env.EMAIL_USER && 
                           process.env.EMAIL_PASS && 
                           process.env.EMAIL_USER.includes('@gmail.com');

      if (!hasEmailConfig) {
        console.log('📧 Email service running in CONSOLE MODE');
        console.log('💡 To enable real emails, configure Gmail credentials in .env file');
        return;
      }

      console.log('🔧 Configuring Gmail SMTP for live email sending...');
      console.log(`📧 Using Gmail account: ${process.env.EMAIL_USER}`);

      // Create Gmail SMTP transporter
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      console.log('📧 Testing Gmail connection...');
      // Verify Gmail connection
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('❌ Gmail connection failed:', error.message);
          console.log('📧 Falling back to console mode for OTP display');
          this.transporter = null;
        } else {
          console.log('✅ Gmail SMTP connected successfully!');
          console.log(`📤 Ready to send LIVE emails from: ${process.env.EMAIL_USER}`);
        }
      });

    } catch (error) {
      console.error('❌ Gmail transporter initialization failed:', error);
      this.transporter = null;
    }
  }

  async sendVerificationEmail(email, fullName, otp) {
    try {
      const subject = 'QuickCourt - Email Verification';
      const html = this.getVerificationEmailTemplate(fullName, otp);

      // If no transporter (console mode), display OTP in console
      if (!this.transporter) {
        console.log('\n=== 📧 EMAIL VERIFICATION OTP ===');
        console.log(`👤 To: ${email}`);
        console.log(`📋 Subject: ${subject}`);
        console.log(`🔑 OTP: ${otp}`);
        console.log(`⏰ Valid for: ${process.env.OTP_EXPIRY || 10} minutes`);
        console.log('================================\n');
        return { success: true, mode: 'console' };
      }

      // Send real email via Gmail
      const mailOptions = {
        from: `QuickCourt <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ LIVE EMAIL SENT to ${email}!`);
      console.log(`📧 Message ID: ${result.messageId}`);
      console.log(`📬 Check ${email} inbox for verification email`);
      
      return { success: true, messageId: result.messageId, mode: 'live-email' };
    } catch (error) {
      console.error('Send verification email error:', error);
      
      // Fallback to console mode if email fails
      console.log('\n=== 📧 EMAIL FALLBACK (OTP via Console) ===');
      console.log(`👤 To: ${email}`);
      console.log(`🔑 OTP: ${otp}`);
      console.log(`⚠️  Email failed: ${error.message}`);
      console.log('========================================\n');
      
      return { success: true, mode: 'console-fallback' };
    }
  }

  getVerificationEmailTemplate(fullName, otp) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Email Verification - QuickCourt</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 40px 30px; }
            .otp-box { background: #f8f9ff; border: 2px solid #667eea; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
            .otp-code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; margin: 15px 0; font-family: monospace; }
            .footer { background-color: #f8f9fa; padding: 30px; text-align: center; color: #666; border-radius: 0 0 12px 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏟️ QuickCourt</h1>
                <p>Email Verification Required</p>
            </div>
            <div class="content">
                <h2>Welcome ${fullName}!</h2>
                <p>Thank you for registering with QuickCourt. Please verify your email using the code below:</p>
                
                <div class="otp-box">
                    <p><strong>Your Verification Code</strong></p>
                    <div class="otp-code">${otp}</div>
                    <p>Code expires in ${process.env.OTP_EXPIRY || 10} minutes</p>
                </div>
                
                <p>Once verified, you'll be able to book sports facilities!</p>
            </div>
            <div class="footer">
                <p><strong>QuickCourt Sports Booking Platform</strong></p>
                <p>© 2024 QuickCourt. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Send booking confirmation email
  async sendBookingConfirmationEmail(booking, venue, user) {
    const subject = `Booking Confirmed - ${venue.name}`;
    const html = this.generateBookingConfirmationTemplate(booking, venue, user);

    try {
      if (this.transporter) {
        const mailOptions = {
          from: process.env.EMAIL_FROM || 'QuickCourt <noreply@quickcourt.com>',
          to: user.email,
          subject: subject,
          html: html,
        };

        const result = await this.transporter.sendMail(mailOptions);
        console.log('📧 Booking confirmation email sent successfully!');
        console.log(`📧 To: ${user.email}`);
        console.log(`📧 Booking ID: ${booking._id}`);
        return result;
      } else {
        console.log('\n📧 === BOOKING CONFIRMATION EMAIL (Console Mode) ===');
        console.log(`To: ${user.email}`);
        console.log(`Subject: ${subject}`);
        console.log('--- Booking Details ---');
        console.log(`Venue: ${venue.name}`);
        console.log(`Sport: ${booking.sport}`);
        console.log(`Date: ${new Date(booking.bookingDate).toLocaleDateString()}`);
        console.log(`Time: ${booking.startTime}`);
        console.log(`Duration: ${booking.duration} hour(s)`);
        console.log(`Total Amount: ₹${booking.totalAmount}`);
        console.log(`Transaction ID: ${booking.paymentDetails?.transactionId}`);
        console.log('=====================================\n');
        return true;
      }
    } catch (error) {
      console.error('❌ Failed to send booking confirmation email:', error);
      throw error;
    }
  }

  generateBookingConfirmationTemplate(booking, venue, user) {
    const bookingDate = new Date(booking.bookingDate).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Booking Confirmation - QuickCourt</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 40px 30px; }
            .booking-card { background: #f8f9ff; border: 2px solid #4caf50; border-radius: 12px; padding: 30px; margin: 30px 0; }
            .booking-detail { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
            .booking-detail:last-child { border-bottom: none; }
            .detail-label { font-weight: bold; color: #333; }
            .detail-value { color: #666; }
            .total-amount { background: #e8f5e8; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .components-list { background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .component-item { padding: 8px 0; border-bottom: 1px solid #ddd; }
            .component-item:last-child { border-bottom: none; }
            .footer { background-color: #f8f9fa; padding: 30px; text-align: center; color: #666; border-radius: 0 0 12px 12px; }
            .success-icon { font-size: 48px; margin-bottom: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="success-icon">✅</div>
                <h1>🏟️ QuickCourt</h1>
                <p>Booking Confirmed!</p>
            </div>
            <div class="content">
                <h2>Hello ${user.fullName}!</h2>
                <p>Your booking has been confirmed. Here are your booking details:</p>
                
                <div class="booking-card">
                    <h3 style="margin-top: 0; color: #4caf50;">Booking Details</h3>
                    
                    <div class="booking-detail">
                        <span class="detail-label">Booking ID:</span>
                        <span class="detail-value">${booking._id}</span>
                    </div>
                    
                    <div class="booking-detail">
                        <span class="detail-label">Venue:</span>
                        <span class="detail-value">${venue.name}</span>
                    </div>
                    
                    <div class="booking-detail">
                        <span class="detail-label">Sport:</span>
                        <span class="detail-value">${booking.sport}</span>
                    </div>
                    
                    <div class="booking-detail">
                        <span class="detail-label">Date:</span>
                        <span class="detail-value">${bookingDate}</span>
                    </div>
                    
                    <div class="booking-detail">
                        <span class="detail-label">Time:</span>
                        <span class="detail-value">${booking.startTime}</span>
                    </div>
                    
                    <div class="booking-detail">
                        <span class="detail-label">Duration:</span>
                        <span class="detail-value">${booking.duration} hour(s)</span>
                    </div>
                    
                    ${booking.selectedComponents && booking.selectedComponents.length > 0 ? `
                    <div style="margin-top: 20px;">
                        <span class="detail-label">Selected Facilities:</span>
                        <div class="components-list">
                            ${booking.selectedComponents.map(component => `
                                <div class="component-item">
                                    <strong>${component.name}</strong> (${component.type})<br>
                                    <small>₹${component.pricePerHour}/hr × ${booking.duration}hr = ₹${component.pricePerHour * booking.duration}</small>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="total-amount">
                        <h3 style="margin: 0; color: #4caf50;">Total Amount Paid: ₹${booking.totalAmount}</h3>
                        <p style="margin: 5px 0 0 0; color: #666;">Transaction ID: ${booking.paymentDetails?.transactionId || 'N/A'}</p>
                    </div>
                </div>
                
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="margin-top: 0; color: #856404;">Important Information:</h4>
                    <ul style="margin: 0; color: #856404;">
                        <li>Please arrive 15 minutes before your booking time</li>
                        <li>Bring valid ID for verification</li>
                        <li>Cancellation allowed up to 24 hours before booking time</li>
                        <li>Contact venue directly for any changes or queries</li>
                    </ul>
                </div>
                
                <p>If you have any questions, please contact us or the venue directly.</p>
                <p><strong>Venue Contact:</strong> ${venue.contactInfo?.phone || 'N/A'}</p>
            </div>
            <div class="footer">
                <p><strong>QuickCourt Sports Booking Platform</strong></p>
                <p>© 2024 QuickCourt. All rights reserved.</p>
                <p>Thank you for choosing QuickCourt!</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Send password reset email
  async sendPasswordResetEmail(userEmail, userName, resetOTP) {
    const subject = 'Password Reset Request - QuickCourt';
    const html = this.generatePasswordResetEmailTemplate(userName, resetOTP);

    if (!this.transporter) {
      console.log('\n📧 PASSWORD RESET EMAIL (Console Mode):');
      console.log(`To: ${userEmail}`);
      console.log(`Subject: ${subject}`);
      console.log(`Reset Code: ${resetOTP}`);
      console.log('⏰ Code expires in 10 minutes\n');
      return Promise.resolve();
    }

    const mailOptions = {
      from: `"QuickCourt Support" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: subject,
      html: html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Password reset email sent to ${userEmail}:`, info.messageId);
      return info;
    } catch (error) {
      console.error(`❌ Failed to send password reset email to ${userEmail}:`, error);
      throw error;
    }
  }

  // Send password reset confirmation email
  async sendPasswordResetConfirmationEmail(userEmail, userName) {
    const subject = 'Password Successfully Reset - QuickCourt';
    const html = this.generatePasswordResetConfirmationTemplate(userName);

    if (!this.transporter) {
      console.log('\n📧 PASSWORD RESET CONFIRMATION (Console Mode):');
      console.log(`To: ${userEmail}`);
      console.log(`Subject: ${subject}`);
      console.log('✅ Password has been successfully reset\n');
      return Promise.resolve();
    }

    const mailOptions = {
      from: `"QuickCourt Support" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: subject,
      html: html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Password reset confirmation sent to ${userEmail}:`, info.messageId);
      return info;
    } catch (error) {
      console.error(`❌ Failed to send password reset confirmation to ${userEmail}:`, error);
      throw error;
    }
  }

  // Generate password reset email template
  generatePasswordResetEmailTemplate(userName, resetOTP) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Request</title>
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                margin: 0; 
                padding: 20px; 
                background-color: #f5f5f5; 
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background-color: white; 
                border-radius: 10px; 
                overflow: hidden; 
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
            }
            .header { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 30px; 
                text-align: center; 
            }
            .content { 
                padding: 30px; 
                line-height: 1.6; 
                color: #333; 
            }
            .otp-box { 
                background-color: #f8f9fa; 
                border: 2px dashed #667eea; 
                border-radius: 8px; 
                padding: 20px; 
                text-align: center; 
                margin: 20px 0; 
            }
            .otp-code { 
                font-size: 32px; 
                font-weight: bold; 
                color: #667eea; 
                letter-spacing: 5px; 
                margin: 10px 0; 
            }
            .warning { 
                background-color: #fff3cd; 
                border: 1px solid #ffeaa7; 
                border-radius: 5px; 
                padding: 15px; 
                margin: 20px 0; 
                color: #856404; 
            }
            .footer { 
                background-color: #f8f9fa; 
                padding: 20px; 
                text-align: center; 
                color: #6c757d; 
                font-size: 14px; 
            }
            .btn { 
                display: inline-block; 
                padding: 12px 24px; 
                background-color: #667eea; 
                color: white; 
                text-decoration: none; 
                border-radius: 5px; 
                margin: 15px 0; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔒 Password Reset Request</h1>
                <p>QuickCourt Sports Booking Platform</p>
            </div>
            <div class="content">
                <h2>Hello ${userName}!</h2>
                <p>We received a request to reset your password for your QuickCourt account. If you made this request, please use the verification code below:</p>
                
                <div class="otp-box">
                    <p><strong>Your Password Reset Code:</strong></p>
                    <div class="otp-code">${resetOTP}</div>
                    <p><small>This code will expire in 10 minutes</small></p>
                </div>
                
                <div class="warning">
                    <p><strong>⚠️ Security Notice:</strong></p>
                    <ul>
                        <li>If you didn't request this password reset, please ignore this email</li>
                        <li>Never share this code with anyone</li>
                        <li>QuickCourt staff will never ask for this code</li>
                    </ul>
                </div>
                
                <p>To complete your password reset:</p>
                <ol>
                    <li>Enter the 6-digit code above in the password reset form</li>
                    <li>Create a new secure password</li>
                    <li>Confirm your new password</li>
                </ol>
                
                <p>If you need help, please contact our support team.</p>
                
                <p>Best regards,<br><strong>QuickCourt Support Team</strong></p>
            </div>
            <div class="footer">
                <p><strong>QuickCourt Sports Booking Platform</strong></p>
                <p>© 2024 QuickCourt. All rights reserved.</p>
                <p>If you didn't request this, please ignore this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Generate password reset confirmation email template
  generatePasswordResetConfirmationTemplate(userName) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Successfully Reset</title>
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                margin: 0; 
                padding: 20px; 
                background-color: #f5f5f5; 
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background-color: white; 
                border-radius: 10px; 
                overflow: hidden; 
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
            }
            .header { 
                background: linear-gradient(135deg, #00b894 0%, #00cec9 100%); 
                color: white; 
                padding: 30px; 
                text-align: center; 
            }
            .content { 
                padding: 30px; 
                line-height: 1.6; 
                color: #333; 
            }
            .success-box { 
                background-color: #d4edda; 
                border: 1px solid #c3e6cb; 
                border-radius: 8px; 
                padding: 20px; 
                text-align: center; 
                margin: 20px 0; 
                color: #155724; 
            }
            .footer { 
                background-color: #f8f9fa; 
                padding: 20px; 
                text-align: center; 
                color: #6c757d; 
                font-size: 14px; 
            }
            .security-tips { 
                background-color: #e3f2fd; 
                border: 1px solid #bbdefb; 
                border-radius: 5px; 
                padding: 15px; 
                margin: 20px 0; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✅ Password Successfully Reset</h1>
                <p>QuickCourt Sports Booking Platform</p>
            </div>
            <div class="content">
                <h2>Hello ${userName}!</h2>
                
                <div class="success-box">
                    <h3>🎉 Your password has been successfully reset!</h3>
                    <p>You can now log in to your QuickCourt account using your new password.</p>
                </div>
                
                <p>Your QuickCourt account password was recently changed. You can now access your account using your new credentials.</p>
                
                <div class="security-tips">
                    <h4>🔐 Security Tips:</h4>
                    <ul>
                        <li>Keep your password secure and don't share it with anyone</li>
                        <li>Use a strong, unique password for your QuickCourt account</li>
                        <li>Consider enabling two-factor authentication if available</li>
                        <li>If you notice any suspicious activity, contact support immediately</li>
                    </ul>
                </div>
                
                <p><strong>What's next?</strong></p>
                <ul>
                    <li>Log in to your account using your new password</li>
                    <li>Continue booking your favorite sports facilities</li>
                    <li>Enjoy your QuickCourt experience!</li>
                </ul>
                
                <p>If you didn't make this change or have any concerns, please contact our support team immediately.</p>
                
                <p>Thank you for using QuickCourt!</p>
                
                <p>Best regards,<br><strong>QuickCourt Support Team</strong></p>
            </div>
            <div class="footer">
                <p><strong>QuickCourt Sports Booking Platform</strong></p>
                <p>© 2024 QuickCourt. All rights reserved.</p>
                <p>For support, contact us at support@quickcourt.com</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}

module.exports = new EmailService();
