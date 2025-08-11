const nodemailer = require('nodemailer');

console.log('📧 Loading EmailService module...');

class EmailService {
  constructor() {
    console.log('📧 EmailService constructor called');
    this.transporter = null;
    this.initializeTransporter();
    console.log('📧 EmailService constructor completed');
  }

  initializeTransporter() {
    console.log('📧 Initializing transporter...');
    try {
      // Check if email credentials are configured
      const hasEmailConfig = process.env.EMAIL_USER && 
                           process.env.EMAIL_PASS && 
                           process.env.EMAIL_USER !== 'your_email@gmail.com';

      if (!hasEmailConfig) {
        console.log('📧 Email service running in CONSOLE MODE (no credentials configured)');
        console.log('💡 To enable real emails, configure EMAIL_USER and EMAIL_PASS in .env file');
        return;
      }

      // Create real email transporter
      this.transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      console.log('📧 Transporter created, verifying connection...');
      // Verify connection
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('❌ Email service connection failed:', error.message);
          console.log('📧 Falling back to console mode for OTP display');
          this.transporter = null;
        } else {
          console.log('✅ Email service connected successfully');
          console.log(`📧 Ready to send emails from: ${process.env.EMAIL_USER}`);
        }
      });

    } catch (error) {
      console.error('Email transporter initialization failed:', error);
      this.transporter = null;
    }
  }

  async sendVerificationEmail(email, fullName, otp) {
    console.log(`📧 sendVerificationEmail called for ${email}`);
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

      // Send real email
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject,
        html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Verification email sent to ${email}:`, result.messageId);
      return { success: true, messageId: result.messageId, mode: 'email' };
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
        <title>Email Verification - QuickCourt</title>
    </head>
    <body>
        <h1>Welcome ${fullName}!</h1>
        <p>Your verification code is: <strong>${otp}</strong></p>
        <p>This code expires in ${process.env.OTP_EXPIRY || 10} minutes.</p>
    </body>
    </html>
    `;
  }
}

console.log('📧 Creating EmailService instance...');
try {
  const emailServiceInstance = new EmailService();
  console.log('📧 EmailService instance created successfully');
  console.log('📧 sendVerificationEmail type:', typeof emailServiceInstance.sendVerificationEmail);
  
  module.exports = emailServiceInstance;
} catch (error) {
  console.error('❌ Failed to create EmailService instance:', error);
  module.exports = null;
}
