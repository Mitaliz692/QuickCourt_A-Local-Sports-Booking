import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Email, Security, CheckCircle } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import { isValidOTP, ValidationMessages } from '../../utils/validation';

interface LocationState {
  email?: string;
  message?: string;
}

interface FormErrors {
  otp?: string;
  general?: string;
}

const EmailVerification: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const locationState = location.state as LocationState;
  
  const [email, setEmail] = useState(locationState?.email || '');
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [successMessage, setSuccessMessage] = useState(locationState?.message || '');

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  const handleOtpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, '').slice(0, 6); // Only digits, max 6
    setOtp(value);
    
    // Clear OTP error when user starts typing
    if (errors.otp) {
      setErrors((prev) => ({ ...prev, otp: undefined }));
    }
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    setErrors((prev) => ({ ...prev, general: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!otp.trim()) {
      newErrors.otp = ValidationMessages.OTP_REQUIRED;
    } else if (!isValidOTP(otp)) {
      newErrors.otp = ValidationMessages.INVALID_OTP;
    }

    if (!email.trim()) {
      newErrors.general = 'Email is required for verification';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerifyEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await authService.verifyEmail({ email, otp });
      
      if (response.success && response.data) {
        // Use auth context to login
        login(response.data.token, response.data.user);
        
        // Show success message and redirect based on user role
        setSuccessMessage('Email verified successfully! Redirecting...');
        
        setTimeout(() => {
          if (response.data?.user.role === 'facility_owner') {
            navigate('/facility-dashboard');
          } else {
            navigate('/');
          }
        }, 2000);
      } else {
        setErrors({ general: response.message || 'Verification failed' });
      }
    } catch (error: any) {
      setErrors({ 
        general: error.response?.data?.message || 'Verification failed. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    setResendLoading(true);
    setErrors({});

    try {
      const response = await authService.resendOTP(email);
      
      if (response.success) {
        setSuccessMessage('OTP sent successfully! Please check your email.');
        setResendCooldown(60); // 60 seconds cooldown
      } else {
        setErrors({ general: response.message || 'Failed to resend OTP' });
      }
    } catch (error: any) {
      setErrors({ 
        general: error.response?.data?.message || 'Failed to resend OTP. Please try again.' 
      });
    } finally {
      setResendLoading(false);
    }
  };

  const handleChangeEmail = () => {
    navigate('/signup');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
      }}
    >
      <Paper
        elevation={24}
        sx={{
          width: '100%',
          maxWidth: 400,
          padding: 4,
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              mb: 2,
            }}
          >
            <Email sx={{ fontSize: 40, color: 'white' }} />
          </Box>
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
            Verify Your Email
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            We've sent a 6-digit verification code to:
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'primary.main' }}>
            {email}
          </Typography>
        </Box>

        {/* Success Message */}
        {successMessage && (
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
            icon={<CheckCircle />}
          >
            {successMessage}
          </Alert>
        )}

        {/* Error Alert */}
        {errors.general && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.general}
          </Alert>
        )}

        {/* Verification Form */}
        <Box component="form" onSubmit={handleVerifyEmail} noValidate>
          {/* Email Field (editable) */}
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={handleEmailChange}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
              mb: 2,
            }}
          />

          {/* OTP Field */}
          <TextField
            fullWidth
            label="Enter 6-digit code"
            value={otp}
            onChange={handleOtpChange}
            error={!!errors.otp}
            helperText={errors.otp}
            margin="normal"
            inputProps={{
              maxLength: 6,
              style: { 
                textAlign: 'center', 
                fontSize: '1.5rem',
                letterSpacing: '0.5rem',
                fontWeight: 'bold',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Security color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          {/* Verify Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              height: 48,
              borderRadius: 2,
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a67d8, #6b46c1)',
              },
              mt: 3,
              mb: 3,
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Verify Email'
            )}
          </Button>

          {/* Resend OTP */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Didn't receive the code?
            </Typography>
            <Button
              variant="text"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0 || resendLoading}
              sx={{
                textTransform: 'none',
                fontWeight: 'medium',
              }}
            >
              {resendLoading ? (
                <CircularProgress size={16} sx={{ mr: 1 }} />
              ) : null}
              {resendCooldown > 0 
                ? `Resend code in ${resendCooldown}s` 
                : 'Resend code'
              }
            </Button>
          </Box>

          {/* Change Email Link */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Wrong email address?{' '}
              <Link
                component="button"
                type="button"
                onClick={handleChangeEmail}
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 'medium',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Change email
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default EmailVerification;
