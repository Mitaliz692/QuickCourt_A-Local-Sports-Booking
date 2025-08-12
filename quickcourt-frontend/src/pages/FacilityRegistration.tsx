import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  FormHelperText,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
  IconButton,
  AppBar,
  Toolbar,
  CircularProgress,
  Autocomplete,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack,
  CloudUpload,
  Delete,
  Add,
  LocationOn,
  Phone,
  Email,
  AccessTime,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

const steps = ['Basic Information', 'Location & Contact', 'Sports & Amenities', 'Operating Hours & Pricing', 'Photos & Documents'];

const sportsOptions = [
  'Cricket', 'Football', 'Basketball', 'Tennis', 'Badminton', 
  'Swimming', 'Volleyball', 'Table Tennis', 'Squash', 'Hockey',
  'Athletics', 'Gymnastics', 'Boxing', 'Wrestling', 'Weightlifting',
  'Cycling', 'Running', 'Yoga', 'Fitness', 'Water Polo', 'Diving'
];

const amenitiesOptions = [
  'Parking', 'Restrooms', 'Changing Rooms', 'Showers', 'Lockers',
  'Cafeteria', 'Pro Shop', 'Equipment Rental', 'First Aid', 'WiFi',
  'Air Conditioning', 'Lighting', 'Sound System', 'Scoreboard',
  'Seating Area', 'CCTV Security', 'Water Fountain', 'Towel Service'
];

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

interface VenueFormData {
  name: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  sportsSupported: string[];
  amenities: string[];
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
      isClosed: boolean;
    };
  };
  contactInfo: {
    phone: string;
    email: string;
    website: string;
  };
  priceRange: {
    min: number;
    max: number;
  };
  facilities: Array<{
    name: string;
    description: string;
    available: boolean;
  }>;
  rules: string[];
  cancellationPolicy: string;
}

const FacilityRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { venueId } = useParams();
  const isEdit = Boolean(venueId);

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [facilityDialog, setFacilityDialog] = useState(false);
  const [newFacility, setNewFacility] = useState({ name: '', description: '', available: true });
  const [newRule, setNewRule] = useState('');

  // Validation state
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  const validateZipCode = (zipCode: string): boolean => {
    const zipRegex = /^[1-9][0-9]{5}$/;
    return zipRegex.test(zipCode);
  };

  const validateURL = (url: string): boolean => {
    if (!url) return true; // Optional field
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const validateField = (fieldName: string, value: any): string => {
    switch (fieldName) {
      case 'name':
        if (!value || value.trim().length < 2) {
          return 'Facility name is required';
        }
        return '';

      case 'description':
        if (!value || value.trim().length < 5) {
          return 'Please provide a brief description';
        }
        return '';

      case 'address.street':
        if (!value || value.trim().length < 3) {
          return 'Street address is required';
        }
        return '';

      case 'address.city':
        if (!value || value.trim().length < 2) {
          return 'City name is required';
        }
        return '';

      case 'address.zipCode':
        if (!value || value.trim().length < 5) {
          return 'PIN code is required';
        }
        return '';

      case 'contactInfo.phone':
        if (!value || value.trim().length < 10) {
          return 'Phone number is required';
        }
        return '';

      case 'contactInfo.email':
        if (!value || !validateEmail(value)) {
          return 'Valid email address is required';
        }
        return '';

      case 'contactInfo.website':
        // Website is optional, no validation needed
        return '';

      case 'sportsSupported':
        if (!value || value.length === 0) {
          return 'Please select at least one sport';
        }
        return '';

      case 'priceRange.min':
        if (!value || value <= 0) {
          return 'Minimum price is required';
        }
        return '';

      case 'priceRange.max':
        if (!value || value <= 0) {
          return 'Maximum price is required';
        }
        if (formData.priceRange.min && value < formData.priceRange.min) {
          return 'Maximum price should be greater than minimum price';
        }
        return '';

      default:
        return '';
    }
  };

  const handleFieldBlur = useCallback((fieldName: string) => {
    // Only validate critical fields on blur, not all fields
    const criticalFields = ['contactInfo.email', 'priceRange.min', 'priceRange.max'];
    
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    if (criticalFields.includes(fieldName)) {
      const value = getFieldValue(fieldName);
      const error = validateField(fieldName, value);
      setValidationErrors(prev => ({ ...prev, [fieldName]: error }));
    }
  }, []);

  const getFieldValue = (fieldName: string): any => {
    if (fieldName.includes('.')) {
      const parts = fieldName.split('.');
      let current = formData as any;
      for (const part of parts) {
        current = current?.[part];
      }
      return current;
    }
    return (formData as any)[fieldName];
  };

  const validateStep = (step: number): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    let fieldsToValidate: string[] = [];

    switch (step) {
      case 0:
        fieldsToValidate = ['name', 'description'];
        break;
      case 1:
        fieldsToValidate = [
          'address.street',
          'address.city',
          'address.zipCode',
          'contactInfo.phone',
          'contactInfo.email',
          'contactInfo.website'
        ];
        break;
      case 2:
        fieldsToValidate = ['sportsSupported'];
        break;
      case 3:
        fieldsToValidate = ['priceRange.min', 'priceRange.max'];
        break;
      case 4:
        // Photos are optional
        return { isValid: true, errors: [] };
      default:
        return { isValid: false, errors: ['Invalid step'] };
    }

    const stepErrors: {[key: string]: string} = {};
    
    for (const fieldName of fieldsToValidate) {
      const value = getFieldValue(fieldName);
      const error = validateField(fieldName, value);
      if (error) {
        errors.push(error);
        stepErrors[fieldName] = error;
      }
    }

    // Update validation errors for this step
    setValidationErrors(prev => ({ ...prev, ...stepErrors }));
    
    // Mark all fields in this step as touched
    const touchedFields: {[key: string]: boolean} = {};
    for (const fieldName of fieldsToValidate) {
      touchedFields[fieldName] = true;
    }
    setTouched(prev => ({ ...prev, ...touchedFields }));

    return { isValid: errors.length === 0, errors };
  };

  const [formData, setFormData] = useState<VenueFormData>({
    name: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: 'Gujarat',
      zipCode: '',
      country: 'India',
      coordinates: {
        latitude: 0,
        longitude: 0,
      },
    },
    sportsSupported: [],
    amenities: [],
    operatingHours: {
      monday: { open: '06:00', close: '22:00', isClosed: false },
      tuesday: { open: '06:00', close: '22:00', isClosed: false },
      wednesday: { open: '06:00', close: '22:00', isClosed: false },
      thursday: { open: '06:00', close: '22:00', isClosed: false },
      friday: { open: '06:00', close: '22:00', isClosed: false },
      saturday: { open: '06:00', close: '22:00', isClosed: false },
      sunday: { open: '07:00', close: '21:00', isClosed: false },
    },
    contactInfo: {
      phone: '',
      email: '',
      website: '',
    },
    priceRange: {
      min: 0,
      max: 0,
    },
    facilities: [],
    rules: [],
    cancellationPolicy: 'Cancellation allowed up to 24 hours before booking time',
  });

  useEffect(() => {
    if (isEdit && venueId) {
      fetchVenueData(venueId);
    }
  }, [isEdit, venueId]);

  const fetchVenueData = async (id: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/venues/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        const venue = data.data.venue;
        setFormData({
          name: venue.name,
          description: venue.description,
          address: venue.address,
          sportsSupported: venue.sportsSupported,
          amenities: venue.amenities || [],
          operatingHours: venue.operatingHours,
          contactInfo: venue.contactInfo,
          priceRange: venue.priceRange,
          facilities: venue.facilities || [],
          rules: venue.rules || [],
          cancellationPolicy: venue.cancellationPolicy || 'Cancellation allowed up to 24 hours before booking time',
        });
        setExistingPhotos(venue.photos || []);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch venue data');
      console.error('Fetch venue error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = useCallback((field: string, value: any) => {
    if (field.includes('.')) {
      const parts = field.split('.');
      setFormData(prev => {
        const newFormData = { ...prev };
        let current = newFormData as any;
        
        // Navigate to the parent object
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) {
            current[parts[i]] = {};
          }
          current = current[parts[i]];
        }
        
        // Set the final value
        current[parts[parts.length - 1]] = value;
        
        return newFormData;
      });
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    // Clear any existing error for this field when user starts typing
    setValidationErrors(prev => {
      if (prev[field]) {
        return { ...prev, [field]: '' };
      }
      return prev;
    });
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setSelectedFiles(prev => [...prev, ...files].slice(0, 5)); // Max 5 photos
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingPhoto = (index: number) => {
    setExistingPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const addFacility = () => {
    if (newFacility.name.trim()) {
      setFormData(prev => ({
        ...prev,
        facilities: [...prev.facilities, newFacility],
      }));
      setNewFacility({ name: '', description: '', available: true });
      setFacilityDialog(false);
    }
  };

  const removeFacility = (index: number) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.filter((_, i) => i !== index),
    }));
  };

  const addRule = () => {
    if (newRule.trim()) {
      setFormData(prev => ({
        ...prev,
        rules: [...prev.rules, newRule],
      }));
      setNewRule('');
    }
  };

  const removeRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true);
      setError(null);

      // Validate all steps before submission
      const allErrors: string[] = [];
      for (let step = 0; step < 4; step++) {
        const validation = validateStep(step);
        if (!validation.isValid) {
          allErrors.push(...validation.errors);
        }
      }

      if (allErrors.length > 0) {
        setError(`Please fix the following errors before submitting: ${allErrors.join(', ')}`);
        setSubmitLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const submitFormData = new FormData();

      // Append all form data
      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof VenueFormData];
        if (typeof value === 'object' && !Array.isArray(value)) {
          submitFormData.append(key, JSON.stringify(value));
        } else if (Array.isArray(value)) {
          submitFormData.append(key, JSON.stringify(value));
        } else {
          submitFormData.append(key, String(value));
        }
      });

      // Append photos
      selectedFiles.forEach((file, index) => {
        submitFormData.append('photos', file);
      });

      // For editing, also send existing photos that should be preserved
      if (isEdit && existingPhotos.length > 0) {
        submitFormData.append('existingPhotos', JSON.stringify(existingPhotos));
      }

      const url = isEdit 
        ? `http://localhost:5000/api/venues/${venueId}`
        : 'http://localhost:5000/api/venues';
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: submitFormData,
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/facility-dashboard', { state: { refresh: true } });
        }, 2000);
      } else {
        setError(data.message || 'Failed to save venue');
      }
    } catch (err) {
      setError('Failed to save venue');
      console.error('Submit venue error:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const isStepValid = (step: number): boolean => {
    // Simplified validation - only check if required fields have values
    switch (step) {
      case 0:
        return formData.name.trim() !== '' && formData.description.trim() !== '';
      case 1:
        return (
          formData.address.street.trim() !== '' &&
          formData.address.city.trim() !== '' &&
          formData.address.zipCode.trim() !== '' &&
          formData.contactInfo.phone.trim() !== '' &&
          formData.contactInfo.email.trim() !== ''
        );
      case 2:
        return formData.sportsSupported.length > 0;
      case 3:
        return formData.priceRange.min > 0 && formData.priceRange.max > 0;
      case 4:
        return true; // Photos are optional
      default:
        return false;
    }
  };

  const validateCurrentStep = () => {
    // This function can update state and should only be called on user actions
    const validation = validateStep(activeStep);
    
    // Only show user-friendly messages, not technical validation errors
    if (!validation.isValid) {
      const friendlyMessages: string[] = [];
      
      switch (activeStep) {
        case 0:
          if (!formData.name.trim()) friendlyMessages.push('Facility name is required');
          if (!formData.description.trim()) friendlyMessages.push('Description is required');
          break;
        case 1:
          if (!formData.address.street.trim()) friendlyMessages.push('Address is required');
          if (!formData.address.city.trim()) friendlyMessages.push('City is required');
          if (!formData.address.zipCode.trim()) friendlyMessages.push('PIN code is required');
          if (!formData.contactInfo.phone.trim()) friendlyMessages.push('Phone number is required');
          if (!formData.contactInfo.email.trim()) friendlyMessages.push('Email is required');
          break;
        case 2:
          if (formData.sportsSupported.length === 0) friendlyMessages.push('Please select at least one sport');
          break;
        case 3:
          if (formData.priceRange.min <= 0) friendlyMessages.push('Minimum price is required');
          if (formData.priceRange.max <= 0) friendlyMessages.push('Maximum price is required');
          break;
      }
      
      return { isValid: false, errors: friendlyMessages };
    }
    
    return validation;
  };

  const handleNext = () => {
    const validation = validateCurrentStep();
    if (validation.isValid) {
      setError(null);
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    } else {
      setError(`Please fix the following errors: ${validation.errors.join(', ')}`);
    }
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* App Bar */}
      <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/facility-dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {isEdit ? 'Edit Venue' : 'Register New Venue'}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Venue {isEdit ? 'updated' : 'registered and approved'} successfully! Redirecting to dashboard...
          </Alert>
        )}

        {/* Stepper */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Form Content */}
        <Paper sx={{ p: 4 }}>
          {/* Step 0: Basic Information */}
          {activeStep === 0 && (
            <Box>
              <Typography variant="h5" gutterBottom>
                Basic Information
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Tell us about your sports facility
              </Typography>

              <TextField
                fullWidth
                label="Facility Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                error={touched.name && !!validationErrors.name}
                helperText={
                  touched.name && validationErrors.name 
                    ? validationErrors.name 
                    : "Enter the name of your sports facility"
                }
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
                multiline
                rows={4}
                error={touched.description && !!validationErrors.description}
                helperText={
                  touched.description && validationErrors.description 
                    ? validationErrors.description 
                    : "Describe your facility, its features, and what makes it special"
                }
                sx={{ mb: 3 }}
              />
            </Box>
          )}

          {/* Step 1: Location & Contact */}
          {activeStep === 1 && (
            <Box>
              <Typography variant="h5" gutterBottom>
                Location & Contact Information
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Where is your facility located and how can customers reach you?
              </Typography>

              <TextField
                fullWidth
                label="Street Address"
                value={formData.address.street}
                onChange={(e) => handleInputChange('address.street', e.target.value)}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn />
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                  required
                />
                <Autocomplete
                  fullWidth
                  options={indianStates}
                  value={formData.address.state}
                  onChange={(e, value) => handleInputChange('address.state', value || 'Gujarat')}
                  renderInput={(params) => <TextField {...params} label="State" required />}
                />
                <TextField
                  fullWidth
                  label="PIN Code"
                  value={formData.address.zipCode}
                  onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                  onBlur={() => handleFieldBlur('address.zipCode')}
                  required
                  error={touched['address.zipCode'] && !!validationErrors['address.zipCode']}
                  helperText={touched['address.zipCode'] && validationErrors['address.zipCode']}
                  inputProps={{ maxLength: 6 }}
                />
              </Box>

              <TextField
                fullWidth
                label="Contact Phone"
                value={formData.contactInfo.phone}
                onChange={(e) => handleInputChange('contactInfo.phone', e.target.value)}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Contact Email"
                type="email"
                value={formData.contactInfo.email}
                onChange={(e) => handleInputChange('contactInfo.email', e.target.value)}
                onBlur={() => handleFieldBlur('contactInfo.email')}
                required
                error={touched['contactInfo.email'] && !!validationErrors['contactInfo.email']}
                helperText={
                  touched['contactInfo.email'] && validationErrors['contactInfo.email']
                    ? validationErrors['contactInfo.email']
                    : "Enter your facility's contact email address"
                }
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Website (Optional)"
                value={formData.contactInfo.website}
                onChange={(e) => handleInputChange('contactInfo.website', e.target.value)}
                helperText="Your facility's website URL (if any)"
                sx={{ mb: 3 }}
              />
            </Box>
          )}

          {/* Step 2: Sports & Amenities */}
          {activeStep === 2 && (
            <Box>
              <Typography variant="h5" gutterBottom>
                Sports & Amenities
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                What sports does your facility support and what amenities do you offer?
              </Typography>

              <FormControl 
                fullWidth 
                sx={{ mb: 3 }}
                error={touched.sportsSupported && !!validationErrors.sportsSupported}
              >
                <InputLabel>Sports Supported *</InputLabel>
                <Select
                  multiple
                  value={formData.sportsSupported}
                  onChange={(e) => {
                    handleInputChange('sportsSupported', e.target.value);
                    handleFieldBlur('sportsSupported');
                  }}
                  input={<OutlinedInput label="Sports Supported *" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {sportsOptions.map((sport) => (
                    <MenuItem key={sport} value={sport}>
                      {sport}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {touched.sportsSupported && validationErrors.sportsSupported 
                    ? validationErrors.sportsSupported 
                    : "Select all sports that your facility supports"
                  }
                </FormHelperText>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Amenities</InputLabel>
                <Select
                  multiple
                  value={formData.amenities}
                  onChange={(e) => handleInputChange('amenities', e.target.value)}
                  input={<OutlinedInput label="Amenities" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {amenitiesOptions.map((amenity) => (
                    <MenuItem key={amenity} value={amenity}>
                      {amenity}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Select all amenities available at your facility</FormHelperText>
              </FormControl>

              {/* Additional Facilities */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Additional Facilities</Typography>
                  <Button
                    startIcon={<Add />}
                    onClick={() => setFacilityDialog(true)}
                    variant="outlined"
                  >
                    Add Facility
                  </Button>
                </Box>
                {formData.facilities.map((facility, index) => (
                  <Chip
                    key={index}
                    label={`${facility.name} - ${facility.description}`}
                    onDelete={() => removeFacility(index)}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>

              {/* Rules */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Facility Rules</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    placeholder="Add a rule (e.g., No smoking allowed)"
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addRule()}
                  />
                  <Button onClick={addRule} variant="outlined">
                    Add
                  </Button>
                </Box>
                {formData.rules.map((rule, index) => (
                  <Chip
                    key={index}
                    label={rule}
                    onDelete={() => removeRule(index)}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Step 3: Operating Hours & Pricing */}
          {activeStep === 3 && (
            <Box>
              <Typography variant="h5" gutterBottom>
                Operating Hours & Pricing
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Set your facility's operating hours and pricing information
              </Typography>

              {/* Operating Hours */}
              <Typography variant="h6" sx={{ mb: 2 }}>
                <AccessTime sx={{ mr: 1, verticalAlign: 'middle' }} />
                Operating Hours
              </Typography>
              {Object.keys(formData.operatingHours).map((day) => (
                <Box key={day} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography sx={{ minWidth: 100, textTransform: 'capitalize' }}>
                    {day}
                  </Typography>
                  <TextField
                    type="time"
                    label="Open"
                    value={formData.operatingHours[day].open}
                    onChange={(e) => 
                      handleInputChange(`operatingHours.${day}.open`, e.target.value)
                    }
                    size="small"
                  />
                  <TextField
                    type="time"
                    label="Close"
                    value={formData.operatingHours[day].close}
                    onChange={(e) => 
                      handleInputChange(`operatingHours.${day}.close`, e.target.value)
                    }
                    size="small"
                  />
                  <Button
                    variant={formData.operatingHours[day].isClosed ? 'contained' : 'outlined'}
                    onClick={() => 
                      handleInputChange(`operatingHours.${day}.isClosed`, !formData.operatingHours[day].isClosed)
                    }
                    size="small"
                  >
                    {formData.operatingHours[day].isClosed ? 'Closed' : 'Open'}
                  </Button>
                </Box>
              ))}

              {/* Pricing */}
              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                Pricing (per hour)
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                  fullWidth
                  label="Minimum Price (₹)"
                  type="number"
                  value={formData.priceRange.min}
                  onChange={(e) => handleInputChange('priceRange.min', parseInt(e.target.value) || 0)}
                  onBlur={() => handleFieldBlur('priceRange.min')}
                  required
                  error={touched['priceRange.min'] && !!validationErrors['priceRange.min']}
                  helperText={touched['priceRange.min'] && validationErrors['priceRange.min']}
                  inputProps={{ min: 1, max: 10000 }}
                />
                <TextField
                  fullWidth
                  label="Maximum Price (₹)"
                  type="number"
                  value={formData.priceRange.max}
                  onChange={(e) => handleInputChange('priceRange.max', parseInt(e.target.value) || 0)}
                  onBlur={() => handleFieldBlur('priceRange.max')}
                  required
                  error={touched['priceRange.max'] && !!validationErrors['priceRange.max']}
                  helperText={touched['priceRange.max'] && validationErrors['priceRange.max']}
                  inputProps={{ min: 1, max: 10000 }}
                />
              </Box>

              <TextField
                fullWidth
                label="Cancellation Policy"
                value={formData.cancellationPolicy}
                onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
                multiline
                rows={3}
                sx={{ mb: 3 }}
                helperText="Describe your cancellation and refund policy"
              />
            </Box>
          )}

          {/* Step 4: Photos & Documents */}
          {activeStep === 4 && (
            <Box>
              <Typography variant="h5" gutterBottom>
                Photos & Documents
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Upload photos of your facility to attract more customers
              </Typography>

              {/* Existing Photos (for edit mode) */}
              {isEdit && existingPhotos.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Current Photos</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {existingPhotos.map((photo, index) => (
                      <Box key={index} sx={{ position: 'relative' }}>
                        <img
                          src={photo.startsWith('http') ? photo : `http://localhost:5000${photo}`}
                          alt={`Venue ${index + 1}`}
                          style={{
                            width: 150,
                            height: 100,
                            objectFit: 'cover',
                            borderRadius: 8,
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: 'error.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'error.dark' },
                          }}
                          onClick={() => removeExistingPhoto(index)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Photo Upload */}
              <Box sx={{ mb: 3 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="photo-upload"
                  multiple
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="photo-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUpload />}
                    fullWidth
                    sx={{ height: 60 }}
                  >
                    Upload Photos (Max 5)
                  </Button>
                </label>
              </Box>

              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>Selected Photos</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {selectedFiles.map((file, index) => (
                      <Box key={index} sx={{ position: 'relative' }}>
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          style={{
                            width: 150,
                            height: 100,
                            objectFit: 'cover',
                            borderRadius: 8,
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: 'error.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'error.dark' },
                          }}
                          onClick={() => removeFile(index)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              variant="outlined"
            >
              Back
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={submitLoading}
                startIcon={submitLoading ? <CircularProgress size={20} /> : null}
              >
                {submitLoading ? 'Saving...' : (isEdit ? 'Update Venue' : 'Register Venue')}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepValid(activeStep)}
              >
                Next
              </Button>
            )}
          </Box>
        </Paper>
      </Container>

      {/* Add Facility Dialog */}
      <Dialog open={facilityDialog} onClose={() => setFacilityDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Facility</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Facility Name"
            value={newFacility.name}
            onChange={(e) => setNewFacility(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={newFacility.description}
            onChange={(e) => setNewFacility(prev => ({ ...prev, description: e.target.value }))}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFacilityDialog(false)}>Cancel</Button>
          <Button onClick={addFacility} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FacilityRegistration;
