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
  Dialog,
  DialogContent,
  DialogActions,
  Tooltip,
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
  validateProfilePictureSync,
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
  const [isValidatingImage, setIsValidatingImage] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
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

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processImageFile(file);
    }
  };

  const handleRemoveProfilePicture = () => {
    setFormData((prev) => ({ ...prev, profilePicture: undefined }));
    setProfilePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processImageFile = async (file: File) => {
    setIsValidatingImage(true);
    setErrors((prev) => ({ ...prev, profilePicture: undefined }));
    
    try {
      // First do synchronous validation for quick feedback
      const syncValidation = validateProfilePictureSync(file);
      if (!syncValidation.isValid) {
        setErrors((prev) => ({ ...prev, profilePicture: syncValidation.error }));
        setProfilePreview('');
        return;
      }

      // Then do comprehensive async validation
      const validation = await validateProfilePicture(file);
      if (validation.isValid) {
        setFormData((prev) => ({ ...prev, profilePicture: file }));
        
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
    } catch (error) {
      setErrors((prev) => ({ ...prev, profilePicture: 'Failed to validate image. Please try again.' }));
      setProfilePreview('');
    } finally {
      setIsValidatingImage(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processImageFile(files[0]);
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
            <Box 
              sx={{ 
                position: 'relative', 
                textAlign: 'center',
                p: 2,
                border: '2px dashed',
                borderColor: isDragOver ? 'primary.main' : 'transparent',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                backgroundColor: isDragOver ? 'primary.50' : 'transparent',
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Tooltip title={profilePreview ? "Click to view full image" : "Click to upload or drag & drop image"}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    border: '3px solid',
                    borderColor: errors.profilePicture ? 'error.main' : 'primary.main',
                    cursor: 'pointer',
                    opacity: isValidatingImage ? 0.7 : 1,
                    transition: 'all 0.3s ease',
                    margin: '0 auto',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                  src={profilePreview}
                  onClick={() => {
                    if (!isValidatingImage) {
                      if (profilePreview) {
                        setShowImagePreview(true);
                      } else {
                        fileInputRef.current?.click();
                      }
                    }
                  }}
                >
                  {!profilePreview && <PhotoCamera />}
                </Avatar>
              </Tooltip>
              
              {/* Validation Loading Overlay */}
              {isValidatingImage && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '50%',
                  }}
                >
                  <CircularProgress size={24} />
                </Box>
              )}
              
              {profilePreview && !isValidatingImage && (
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
              
              {/* Success indicator */}
              {profilePreview && !isValidatingImage && !errors.profilePicture && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -8,
                    right: 8,
                    backgroundColor: 'success.main',
                    borderRadius: '50%',
                    p: 0.5,
                  }}
                >
                  <CheckCircle fontSize="small" sx={{ color: 'white' }} />
                </Box>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleProfilePictureChange}
                style={{ display: 'none' }}
                disabled={isValidatingImage}
              />
              
              {/* Helper text */}
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                {isValidatingImage ? 'Validating image...' : (isDragOver ? 'Drop image here' : 'Click to upload or drag & drop')}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Max 5MB • Min 100x100px • Max 2048x2048px
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Supported: JPEG, PNG, JPG, WebP
              </Typography>
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
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Forgot your password?{' '}
              <Link
                component="button"
                type="button"
                onClick={() => navigate('/forgot-password')}
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 'medium',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Reset it here
              </Link>
            </Typography>
          </Box>
        </Box>
        
        {/* Image Preview Modal */}
        <Dialog
          open={showImagePreview}
          onClose={() => setShowImagePreview(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogContent sx={{ p: 0 }}>
            {profilePreview && (
              <Box
                component="img"
                src={profilePreview}
                alt="Profile Preview"
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                }}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowImagePreview(false)}>Close</Button>
            <Button
              onClick={() => {
                setShowImagePreview(false);
                fileInputRef.current?.click();
              }}
              variant="outlined"
            >
              Change Image
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default Signup;
