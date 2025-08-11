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
}

module.exports = new EmailService();
