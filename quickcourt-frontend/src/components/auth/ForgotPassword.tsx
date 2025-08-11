import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Email,
  Security,
  CheckCircle,
  ArrowBack,
  Lock,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { isValidEmail, isValidPassword, isValidOTP, ValidationMessages, sanitizeInput, getPasswordStrength } from '../../utils/validation';

interface ForgotPasswordData {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  email?: string;
  otp?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<ForgotPasswordData>({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] as string[] });
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleInputChange = (field: keyof ForgotPasswordData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = event.target.value;
    
    // Sanitize input based on field type
    switch (field) {
      case 'email':
        value = sanitizeInput(value).toLowerCase().trim();
        break;
      case 'otp':
        // Only allow numeric input for OTP
        value = value.replace(/[^0-9]/g, '').slice(0, 6);
        break;
      case 'newPassword':
      case 'confirmPassword':
        // Don't trim passwords as spaces might be intentional
        value = sanitizeInput(value);
        break;
      default:
        value = sanitizeInput(value);
    }
    
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Real-time validation
    validateField(field, value);
  };

  const validateField = (field: keyof ForgotPasswordData, value: string) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'email':
        if (!value) {
          newErrors.email = ValidationMessages.EMAIL_REQUIRED;
        } else if (!isValidEmail(value)) {
          newErrors.email = ValidationMessages.INVALID_EMAIL;
        } else {
          delete newErrors.email;
        }
        break;
        
      case 'otp':
        if (!value) {
          newErrors.otp = ValidationMessages.OTP_REQUIRED;
        } else if (!isValidOTP(value)) {
          newErrors.otp = ValidationMessages.INVALID_OTP;
        } else {
          delete newErrors.otp;
        }
        break;
        
      case 'newPassword':
        if (!value) {
          newErrors.newPassword = ValidationMessages.PASSWORD_REQUIRED;
        } else if (!isValidPassword(value)) {
          newErrors.newPassword = ValidationMessages.INVALID_PASSWORD;
        } else {
          delete newErrors.newPassword;
          // Update password strength
          const strength = getPasswordStrength(value);
          setPasswordStrength(strength);
        }
        // Re-validate confirm password if it exists
        if (formData.confirmPassword) {
          if (formData.confirmPassword !== value) {
            newErrors.confirmPassword = ValidationMessages.PASSWORD_MISMATCH;
          } else {
            delete newErrors.confirmPassword;
          }
        }
        break;
        
      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = ValidationMessages.CONFIRM_PASSWORD_REQUIRED;
        } else if (value !== formData.newPassword) {
          newErrors.confirmPassword = ValidationMessages.PASSWORD_MISMATCH;
        } else {
          delete newErrors.confirmPassword;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    switch (step) {
      case 0: // Email step
        if (!formData.email.trim()) {
          newErrors.email = ValidationMessages.EMAIL_REQUIRED;
        } else if (!isValidEmail(formData.email)) {
          newErrors.email = ValidationMessages.INVALID_EMAIL;
        } else if (formData.email.length > 254) {
          newErrors.email = 'Email address is too long';
        }
        break;
        
      case 1: // OTP step
        if (!formData.otp.trim()) {
          newErrors.otp = ValidationMessages.OTP_REQUIRED;
        } else if (!isValidOTP(formData.otp)) {
          newErrors.otp = ValidationMessages.INVALID_OTP;
        } else if (!/^\d{6}$/.test(formData.otp)) {
          newErrors.otp = 'OTP must be exactly 6 digits';
        }
        break;
        
      case 2: // New password step
        // Validate new password
        if (!formData.newPassword) {
          newErrors.newPassword = ValidationMessages.PASSWORD_REQUIRED;
        } else if (formData.newPassword.length < 8) {
          newErrors.newPassword = 'Password must be at least 8 characters long';
        } else if (formData.newPassword.length > 128) {
          newErrors.newPassword = 'Password is too long (max 128 characters)';
        } else if (!isValidPassword(formData.newPassword)) {
          newErrors.newPassword = ValidationMessages.INVALID_PASSWORD;
        } else if (formData.newPassword === formData.email) {
          newErrors.newPassword = 'Password cannot be the same as your email';
        } else if (/(.)\1{2,}/.test(formData.newPassword)) {
          newErrors.newPassword = 'Password cannot contain repeated characters (e.g., aaa, 111)';
        } else {
          // Check password strength
          const strength = getPasswordStrength(formData.newPassword);
          if (strength.score < 3) {
            newErrors.newPassword = 'Password is too weak. Please choose a stronger password.';
          }
        }
        
        // Validate confirm password
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = ValidationMessages.CONFIRM_PASSWORD_REQUIRED;
        } else if (formData.newPassword !== formData.confirmPassword) {
          newErrors.confirmPassword = ValidationMessages.PASSWORD_MISMATCH;
        }
        
        // Additional security checks
        const commonPasswords = ['password', '12345678', 'qwerty123', 'admin123', 'welcome123'];
        if (commonPasswords.some(pwd => formData.newPassword.toLowerCase().includes(pwd))) {
          newErrors.newPassword = 'Password is too common. Please choose a more secure password';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendResetEmail = async () => {
    if (!validateStep(0)) return;

    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const sanitizedEmail = sanitizeInput(formData.email.toLowerCase().trim());
      
      // Additional client-side validation
      if (!sanitizedEmail || !isValidEmail(sanitizedEmail)) {
        setErrors({ general: 'Please enter a valid email address' });
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: sanitizedEmail }),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment before trying again.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else if (response.status === 404) {
          throw new Error('Service not found. Please contact support.');
        }
      }

      const data = await response.json();

      if (data.success) {
        setActiveStep(1);
        setSuccessMessage('Password reset code has been sent to your email. Please check your inbox and spam folder.');
        // Start resend cooldown (60 seconds)
        setResendCooldown(60);
        const interval = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setErrors({ general: data.message || 'Failed to send reset email. Please try again.' });
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        setErrors({ general: 'Request timed out. Please check your internet connection and try again.' });
      } else if (error.message.includes('fetch')) {
        setErrors({ general: 'Unable to connect to the server. Please check your internet connection.' });
      } else {
        setErrors({ general: error.message || 'Network error. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || loading) return;
    
    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const sanitizedEmail = sanitizeInput(formData.email.toLowerCase().trim());
      
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: sanitizedEmail }),
        signal: AbortSignal.timeout(30000),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('New reset code has been sent to your email.');
        // Start resend cooldown (60 seconds)
        setResendCooldown(60);
        const interval = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setErrors({ general: data.message || 'Failed to resend code. Please try again.' });
      }
    } catch (error: any) {
      console.error('Resend code error:', error);
      setErrors({ general: 'Failed to resend code. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!validateStep(1)) return;

    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const sanitizedOTP = formData.otp.replace(/[^0-9]/g, '');
      const sanitizedEmail = sanitizeInput(formData.email.toLowerCase().trim());
      
      // Additional validation
      if (sanitizedOTP.length !== 6) {
        setErrors({ general: 'Please enter a valid 6-digit code' });
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/auth/verify-reset-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: sanitizedEmail,
          otp: sanitizedOTP,
        }),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Too many attempts. Please wait before trying again.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
      }

      const data = await response.json();

      if (data.success) {
        setResetToken(data.resetToken);
        setActiveStep(2);
        setSuccessMessage('Reset code verified successfully. Please set your new password.');
      } else {
        setErrors({ general: data.message || 'Invalid or expired reset code. Please try again.' });
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        setErrors({ general: 'Request timed out. Please try again.' });
      } else if (error.message.includes('fetch')) {
        setErrors({ general: 'Unable to connect to the server. Please check your internet connection.' });
      } else {
        setErrors({ general: error.message || 'Network error. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validateStep(2)) return;

    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      // Additional client-side validation
      const sanitizedPassword = sanitizeInput(formData.newPassword);
      const sanitizedConfirmPassword = sanitizeInput(formData.confirmPassword);
      
      if (!sanitizedPassword || !sanitizedConfirmPassword) {
        setErrors({ general: 'Password fields cannot be empty' });
        setLoading(false);
        return;
      }
      
      if (sanitizedPassword !== sanitizedConfirmPassword) {
        setErrors({ confirmPassword: ValidationMessages.PASSWORD_MISMATCH });
        setLoading(false);
        return;
      }
      
      if (!isValidPassword(sanitizedPassword)) {
        setErrors({ newPassword: ValidationMessages.INVALID_PASSWORD });
        setLoading(false);
        return;
      }

      if (!resetToken) {
        setErrors({ general: 'Reset session expired. Please start over.' });
        setActiveStep(0);
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resetToken,
          newPassword: sanitizedPassword,
          confirmPassword: sanitizedConfirmPassword,
        }),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Too many attempts. Please wait before trying again.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else if (response.status === 401) {
          throw new Error('Reset session expired. Please start over.');
        }
      }

      const data = await response.json();

      if (data.success) {
        setActiveStep(3);
        setSuccessMessage('Password has been reset successfully! You will be redirected to login.');
        
        // Clear sensitive data
        setFormData({
          email: '',
          otp: '',
          newPassword: '',
          confirmPassword: '',
        });
        setResetToken('');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setErrors({ general: data.message || 'Failed to reset password. Please try again.' });
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        setErrors({ general: 'Request timed out. Please try again.' });
      } else if (error.message.includes('fetch')) {
        setErrors({ general: 'Unable to connect to the server. Please check your internet connection.' });
      } else if (error.message.includes('expired')) {
        setErrors({ general: 'Reset session expired. Please start over.' });
        setActiveStep(0);
      } else {
        setErrors({ general: error.message || 'Network error. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      label: 'Enter Email',
      description: 'Enter your email address to receive a reset code',
    },
    {
      label: 'Verify Code',
      description: 'Enter the 6-digit code sent to your email',
    },
    {
      label: 'New Password',
      description: 'Create a new secure password',
    },
    {
      label: 'Complete',
      description: 'Password reset successful',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          p: 4,
          maxWidth: 500,
          width: '100%',
          borderRadius: 3,
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Security
            sx={{
              fontSize: 60,
              color: 'primary.main',
              mb: 2,
            }}
          />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            Reset Password
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Follow the steps below to reset your password
          </Typography>
        </Box>

        {/* Back to Login Link */}
        <Box sx={{ mb: 3 }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/login')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textDecoration: 'none',
              color: 'primary.main',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            <ArrowBack fontSize="small" />
            Back to Login
          </Link>
        </Box>

        {/* Error Alert */}
        {errors.general && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.general}
          </Alert>
        )}

        {/* Success Alert */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

        {/* Stepper */}
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {step.description}
                </Typography>

                {/* Step 0: Email Input */}
                {index === 0 && (
                  <Box>
                    <TextField
                      fullWidth
                      type="email"
                      label="Email Address"
                      value={formData.email}
                      onChange={handleInputChange('email')}
                      error={!!errors.email}
                      helperText={errors.email}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleSendResetEmail}
                      disabled={loading}
                      fullWidth
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #5a6fd8, #6a419a)',
                        },
                      }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Code'}
                    </Button>
                  </Box>
                )}

                {/* Step 1: OTP Input */}
                {index === 1 && (
                  <Box>
                    <TextField
                      fullWidth
                      label="6-Digit Reset Code"
                      value={formData.otp}
                      onChange={handleInputChange('otp')}
                      error={!!errors.otp}
                      helperText={errors.otp || 'Check your email for the reset code'}
                      inputProps={{
                        maxLength: 6,
                        style: { textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.5rem' },
                      }}
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleVerifyOTP}
                      disabled={loading}
                      fullWidth
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #5a6fd8, #6a419a)',
                        },
                      }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify Code'}
                    </Button>
                    
                    {/* Resend Code Section */}
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Didn't receive the code?
                      </Typography>
                      <Button
                        variant="text"
                        onClick={handleResendCode}
                        disabled={loading || resendCooldown > 0}
                        sx={{
                          textDecoration: 'none',
                          color: resendCooldown > 0 ? 'text.disabled' : 'primary.main',
                          '&:hover': {
                            textDecoration: resendCooldown > 0 ? 'none' : 'underline',
                          },
                        }}
                      >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                      </Button>
                    </Box>
                  </Box>
                )}

                {/* Step 2: New Password Input */}
                {index === 2 && (
                  <Box>
                    <TextField
                      fullWidth
                      type={showPassword ? 'text' : 'password'}
                      label="New Password"
                      value={formData.newPassword}
                      onChange={handleInputChange('newPassword')}
                      error={!!errors.newPassword}
                      helperText={errors.newPassword}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <Button
                              onClick={() => setShowPassword(!showPassword)}
                              sx={{ minWidth: 'auto', p: 1 }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </Button>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        mb: 1,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                    
                    {/* Password Strength Indicator */}
                    {formData.newPassword && (
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Password Strength:
                          </Typography>
                          <Chip
                            label={
                              passwordStrength.score <= 1 ? 'Weak' :
                              passwordStrength.score <= 2 ? 'Fair' :
                              passwordStrength.score <= 3 ? 'Good' : 'Strong'
                            }
                            size="small"
                            color={
                              passwordStrength.score <= 1 ? 'error' :
                              passwordStrength.score <= 2 ? 'warning' :
                              passwordStrength.score <= 3 ? 'info' : 'success'
                            }
                          />
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(passwordStrength.score / 5) * 100}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: 'grey.300',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor:
                                passwordStrength.score <= 1 ? 'error.main' :
                                passwordStrength.score <= 2 ? 'warning.main' :
                                passwordStrength.score <= 3 ? 'info.main' : 'success.main',
                            },
                          }}
                        />
                        {passwordStrength.feedback.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            {passwordStrength.feedback.slice(0, 2).map((feedback, idx) => (
                              <Typography key={idx} variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                • {feedback}
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </Box>
                    )}
                    <TextField
                      fullWidth
                      type={showConfirmPassword ? 'text' : 'password'}
                      label="Confirm New Password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange('confirmPassword')}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <Button
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              sx={{ minWidth: 'auto', p: 1 }}
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </Button>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleResetPassword}
                      disabled={loading}
                      fullWidth
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #5a6fd8, #6a419a)',
                        },
                      }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
                    </Button>
                  </Box>
                )}

                {/* Step 3: Success */}
                {index === 3 && (
                  <Box sx={{ textAlign: 'center' }}>
                    <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Password Reset Successful!
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Your password has been reset successfully. You will be redirected to the login page in a few seconds.
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/login')}
                      sx={{ borderRadius: 2 }}
                    >
                      Go to Login Now
                    </Button>
                  </Box>
                )}
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;
