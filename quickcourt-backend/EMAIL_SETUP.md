# QuickCourt Email Configuration Guide

## Setting Up Real Email Sending with Gmail

### Step 1: Enable 2-Factor Authentication on Your Gmail Account
1. Go to your Google Account settings (https://myaccount.google.com/)
2. Click on "Security" in the left sidebar
3. Enable "2-Step Verification" if not already enabled

### Step 2: Generate App Password
1. In Google Account Security settings, go to "2-Step Verification"
2. Scroll down to "App passwords"
3. Click "Generate" and select "Mail" as the app
4. Copy the 16-character password that's generated

### Step 3: Update Your .env File
Replace the placeholder values in your `.env` file:

```env
# Email Configuration (Replace with your actual Gmail credentials)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_actual_email@gmail.com
EMAIL_PASS=your_16_character_app_password
EMAIL_FROM=noreply@quickcourt.com
```

### Step 4: Alternative Email Services

#### Using Outlook/Hotmail:
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your_email@outlook.com
EMAIL_PASS=your_password
```

#### Using Yahoo:
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your_email@yahoo.com
EMAIL_PASS=your_app_password
```

### Step 5: Test Email Configuration
1. Update your `.env` file with real credentials
2. Restart the backend server
3. Register a new user
4. Check that you receive the verification email

### Current Behavior:
- **Console Mode**: If no email credentials are configured, OTP will be displayed in the backend console
- **Email Mode**: If credentials are configured and working, OTP will be sent to the user's email
- **Fallback Mode**: If email sending fails, OTP will be shown in console as backup

### Security Notes:
- Never commit your actual email credentials to version control
- Use app passwords instead of your main email password
- Consider using environment-specific configurations for production

### Troubleshooting:
- If Gmail blocks the connection, ensure 2FA is enabled and you're using an app password
- Check firewall settings if connection fails
- Verify the EMAIL_HOST and EMAIL_PORT are correct for your provider
