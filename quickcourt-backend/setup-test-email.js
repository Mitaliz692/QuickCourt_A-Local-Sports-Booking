const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

async function setupTestEmail() {
  console.log('🔧 Setting up test email account with Ethereal Email...');
  
  try {
    // Generate test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount();
    
    console.log('✅ Test email account created successfully!');
    console.log('📧 Email:', testAccount.user);
    console.log('🔑 Password:', testAccount.pass);
    console.log('🌐 Web Interface:', 'https://ethereal.email');
    
    // Read current .env file
    const envPath = path.join(__dirname, '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update email configuration
    const emailConfig = `
# Test Email Configuration (Ethereal Email)
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=${testAccount.user}
EMAIL_PASS=${testAccount.pass}
EMAIL_FROM=noreply@quickcourt.com
`;
    
    // Replace existing email config or append
    const emailRegex = /# Email Configuration[\s\S]*?EMAIL_FROM=[^\r\n]*/;
    const testEmailRegex = /# Test Email Configuration[\s\S]*?EMAIL_FROM=[^\r\n]*/;
    
    if (emailRegex.test(envContent)) {
      envContent = envContent.replace(emailRegex, emailConfig.trim());
    } else if (testEmailRegex.test(envContent)) {
      envContent = envContent.replace(testEmailRegex, emailConfig.trim());
    } else {
      envContent += emailConfig;
    }
    
    // Write updated .env file
    fs.writeFileSync(envPath, envContent);
    
    console.log('📝 .env file updated with test email credentials');
    console.log('🔄 Please restart the backend server to apply changes');
    console.log('\n📋 How to use:');
    console.log('1. Restart the backend server');
    console.log('2. Register a new user');
    console.log('3. Check the console for email preview URL');
    console.log('4. Visit https://ethereal.email to view sent emails');
    
  } catch (error) {
    console.error('❌ Failed to set up test email:', error);
  }
}

setupTestEmail();
