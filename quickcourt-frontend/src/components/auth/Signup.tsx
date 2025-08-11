import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Link,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  PhotoCamera,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { 
  isValidEmail, 
  isValidPassword, 
  isValidName, 
  isValidPhoneNumber,
  validateProfilePicture,
  getPasswordStrength,
  ValidationMessages 
} from '../../utils/validation';

interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  role: 'user' | 'facility_owner';
  profilePicture?: File;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  role?: string;
  profilePicture?: string;
  general?: string;
}

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<SignupFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'user',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string>('');
  const [passwordStrength, setPasswordStrength] = useState<{ score: number; feedback: string[] }>({ score: 0, feedback: [] });

  const handleInputChange = (field: keyof SignupFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    console.log(`📝 Field "${field}" changed to:`, value);
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Update password strength for password field
    if (field === 'password') {
      setPasswordStrength(getPasswordStrength(value));
    }
  };

  const handleRoleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ 
      ...prev, 
      role: event.target.value as 'user' | 'facility_owner' 
    }));
    
    if (errors.role) {
      setErrors((prev) => ({ ...prev, role: undefined }));
    }
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = validateProfilePicture(file);
      if (validation.isValid) {
        setFormData((prev) => ({ ...prev, profilePicture: file }));
        setErrors((prev) => ({ ...prev, profilePicture: undefined }));
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setProfilePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setErrors((prev) => ({ ...prev, profilePicture: validation.error }));
        setProfilePreview('');
      }
    }
  };

  const handleRemoveProfilePicture = () => {
    setFormData((prev) => ({ ...prev, profilePicture: undefined }));
    setProfilePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = ValidationMessages.NAME_REQUIRED;
    } else if (!isValidName(formData.fullName)) {
      newErrors.fullName = ValidationMessages.INVALID_NAME;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = ValidationMessages.EMAIL_REQUIRED;
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = ValidationMessages.INVALID_EMAIL;
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = ValidationMessages.PHONE_REQUIRED;
    } else if (!isValidPhoneNumber(formData.phone)) {
      newErrors.phone = ValidationMessages.INVALID_PHONE;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = ValidationMessages.PASSWORD_REQUIRED;
    } else if (!isValidPassword(formData.password)) {
      newErrors.password = ValidationMessages.INVALID_PASSWORD;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = ValidationMessages.CONFIRM_PASSWORD_REQUIRED;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = ValidationMessages.PASSWORD_MISMATCH;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    console.log('🔍 Form data before submit:', formData);

    try {
      const signupData = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: formData.phone,
        role: formData.role,
        profilePicture: formData.profilePicture,
      };

      console.log('📤 Signup data being sent:', signupData);

      const response = await authService.signup(signupData);
      
      if (response.success) {
        // Navigate to email verification
        navigate('/verify-email', { 
          state: { 
            email: formData.email,
            message: 'Account created successfully! Please verify your email.' 
          } 
        });
      } else {
        setErrors({ general: response.message || 'Signup failed' });
      }
    } catch (error: any) {
      setErrors({ 
        general: error.response?.data?.message || 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score <= 1) return 'error';
    if (score <= 3) return 'warning';
    return 'success';
  };

  const getPasswordStrengthLabel = (score: number) => {
    if (score <= 1) return 'Weak';
    if (score <= 3) return 'Medium';
    return 'Strong';
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
          maxWidth: 480,
          padding: 4,
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
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
            Join QuickCourt
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your account to start booking sports facilities
          </Typography>
        </Box>

        {/* Error Alert */}
        {errors.general && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.general}
          </Alert>
        )}

        {/* Signup Form */}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          {/* Profile Picture Upload */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  border: '3px solid',
                  borderColor: 'primary.main',
                  cursor: 'pointer',
                }}
                src={profilePreview}
                onClick={() => fileInputRef.current?.click()}
              >
                {!profilePreview && <PhotoCamera />}
              </Avatar>
              {profilePreview && (
                <IconButton
                  size="small"
                  onClick={handleRemoveProfilePicture}
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    backgroundColor: 'error.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'error.dark',
                    },
                  }}
                >
                  <Cancel fontSize="small" />
                </IconButton>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                style={{ display: 'none' }}
              />
            </Box>
          </Box>
          
          {errors.profilePicture && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.profilePicture}
            </Alert>
          )}

          {/* Full Name Field */}
          <TextField
            fullWidth
            label="Full Name"
            value={formData.fullName}
            onChange={handleInputChange('fullName')}
            error={!!errors.fullName}
            helperText={errors.fullName}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          {/* Email Field */}
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            error={!!errors.email}
            helperText={errors.email}
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
            }}
          />

          {/* Phone Field */}
          <TextField
            fullWidth
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange('phone')}
            error={!!errors.phone}
            helperText={errors.phone}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          {/* Role Selection */}
          <FormControl component="fieldset" margin="normal" fullWidth>
            <FormLabel component="legend" sx={{ mb: 1 }}>
              I am a:
            </FormLabel>
            <RadioGroup
              row
              value={formData.role}
              onChange={handleRoleChange}
            >
              <FormControlLabel
                value="user"
                control={<Radio />}
                label="Sports Enthusiast"
              />
              <FormControlLabel
                value="facility_owner"
                control={<Radio />}
                label="Facility Owner"
              />
            </RadioGroup>
          </FormControl>

          {/* Password Field */}
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInputChange('password')}
            error={!!errors.password}
            helperText={errors.password}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          {/* Password Strength Indicator */}
          {formData.password && (
            <Box sx={{ mt: 1, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Password Strength
                </Typography>
                <Typography 
                  variant="caption" 
                  color={`${getPasswordStrengthColor(passwordStrength.score)}.main`}
                  sx={{ fontWeight: 'medium' }}
                >
                  {getPasswordStrengthLabel(passwordStrength.score)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(passwordStrength.score / 5) * 100}
                color={getPasswordStrengthColor(passwordStrength.score)}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          )}

          {/* Confirm Password Field */}
          <TextField
            fullWidth
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    size="small"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <CheckCircle color="success" sx={{ ml: 1 }} />
                  )}
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          {/* Signup Button */}
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
              'Create Account'
            )}
          </Button>

          {/* Sign In Link */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link
                component="button"
                type="button"
                onClick={() => navigate('/login')}
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 'medium',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Sign in here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Signup;
