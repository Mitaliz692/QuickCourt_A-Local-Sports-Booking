import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Rating,
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  IconButton,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  OutlinedInput,
  Chip
} from '@mui/material';
import { CloudUpload, Delete, Star } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { formatCurrency } from '../utils/currency';

interface Booking {
  _id: string;
  venueId: {
    _id: string;
    name: string;
  };
  bookingDate: string;
  totalAmount: number;
}

interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
  aspects: {
    cleanliness: number;
    facilities: number;
    staff: number;
    value: number;
  };
  photos: File[];
}

interface ReviewFormErrors {
  rating?: string;
  title?: string;
  comment?: string;
  aspects?: string;
  photos?: string;
}

interface ReviewFormProps {
  open: boolean;
  onClose: () => void;
  booking: Booking | null;
  onSubmit: (formData: FormData) => void;
  loading?: boolean;
}

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const ReviewForm: React.FC<ReviewFormProps> = ({ open, onClose, booking, onSubmit, loading = false }) => {
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 1,
    title: '',
    comment: '',
    aspects: {
      cleanliness: 1,
      facilities: 1,
      staff: 1,
      value: 1
    },
    photos: []
  });
  const [errors, setErrors] = useState<ReviewFormErrors>({});

  const aspectLabels: Record<keyof ReviewFormData['aspects'], string> = {
    cleanliness: 'Cleanliness',
    facilities: 'Facilities & Equipment',
    staff: 'Staff Service',
    value: 'Value for Money'
  };

  const handleRatingChange = (field: string, value: number | null) => {
    const ratingValue = Math.max(1, value || 1); // Ensure minimum value is 1
    
    if (field === 'rating') {
      setFormData(prev => ({ ...prev, rating: ratingValue }));
    } else {
      setFormData(prev => ({
        ...prev,
        aspects: { ...prev.aspects, [field]: ratingValue }
      }));
    }
    // Clear error when user interacts
    if (errors[field as keyof ReviewFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleInputChange = (field: keyof Pick<ReviewFormData, 'title' | 'comment'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file: File) => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });

    if (validFiles.length + formData.photos.length > 5) {
      setErrors(prev => ({ ...prev, photos: 'Maximum 5 photos allowed' }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...validFiles]
    }));
    setErrors(prev => ({ ...prev, photos: undefined }));
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: ReviewFormErrors = {};

    if (formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = 'Overall rating is required (1-5 stars)';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Review title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.comment.trim()) {
      newErrors.comment = 'Review comment is required';
    } else if (formData.comment.trim().length < 10) {
      newErrors.comment = 'Comment must be at least 10 characters';
    }

    // Check if all aspects are rated (minimum 1)
    const aspectRatings = Object.values(formData.aspects);
    if (aspectRatings.some(rating => rating < 1 || rating > 5)) {
      newErrors.aspects = 'Please rate all aspects (1-5 stars each)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm() || !booking) return;

    const submitData = new FormData();
    submitData.append('bookingId', booking._id);
    submitData.append('venueId', booking.venueId._id);
    submitData.append('rating', formData.rating.toString());
    submitData.append('title', formData.title.trim());
    submitData.append('comment', formData.comment.trim());
    submitData.append('aspects', JSON.stringify(formData.aspects));

    formData.photos.forEach((photo) => {
      submitData.append('photos', photo);
    });

    onSubmit(submitData);
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        rating: 1,
        title: '',
        comment: '',
        aspects: { cleanliness: 1, facilities: 1, staff: 1, value: 1 },
        photos: []
      });
      setErrors({});
      onClose();
    }
  };

  if (!booking) return null;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle>
        <Typography variant="h5" component="div" gutterBottom>
          Review Your Experience
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {booking.venueId.name} • {new Date(booking.bookingDate).toLocaleDateString()} • {formatCurrency(booking.totalAmount)}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          {/* Overall Rating */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Overall Rating *
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Rating
                value={formData.rating}
                onChange={(event, newValue) => handleRatingChange('rating', newValue)}
                size="large"
                precision={1}
              />
              <Typography variant="body2" color="text.secondary">
                {formData.rating > 0 && `${formData.rating} star${formData.rating !== 1 ? 's' : ''}`}
              </Typography>
            </Box>
            {errors.rating && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {errors.rating}
              </Typography>
            )}
          </Box>

          {/* Aspect Ratings */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Rate Different Aspects
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              {Object.entries(aspectLabels).map(([key, label]) => (
                <Box key={key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ minWidth: '120px' }}>
                    {label}
                  </Typography>
                  <Rating
                    value={formData.aspects[key as keyof ReviewFormData['aspects']]}
                    onChange={(event, newValue) => handleRatingChange(key, newValue)}
                    size="small"
                    precision={1}
                  />
                </Box>
              ))}
            </Box>
            {errors.aspects && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {errors.aspects}
              </Typography>
            )}
          </Box>

          {/* Review Title */}
          <FormControl fullWidth sx={{ mb: 3 }} error={!!errors.title}>
            <InputLabel htmlFor="review-title">Review Title *</InputLabel>
            <OutlinedInput
              id="review-title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              label="Review Title *"
              placeholder="Summarize your experience in a few words"
            />
            {errors.title && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                {errors.title}
              </Typography>
            )}
          </FormControl>

          {/* Review Comment */}
          <FormControl fullWidth sx={{ mb: 3 }} error={!!errors.comment}>
            <TextField
              label="Your Review *"
              multiline
              rows={4}
              value={formData.comment}
              onChange={(e) => handleInputChange('comment', e.target.value)}
              placeholder="Share details about your experience..."
              error={!!errors.comment}
              helperText={errors.comment}
            />
          </FormControl>

          {/* Photo Upload */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Add Photos (Optional)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Share photos of your experience (Max 5 photos, 5MB each)
            </Typography>
            
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUpload />}
              disabled={formData.photos.length >= 5}
              sx={{ mb: 2 }}
            >
              Upload Photos
              <VisuallyHiddenInput
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
              />
            </Button>

            {errors.photos && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.photos}
              </Alert>
            )}

            {formData.photos.length > 0 && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr' }, gap: 1 }}>
                {formData.photos.map((photo, index) => (
                  <Card key={index} sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="100"
                      image={URL.createObjectURL(photo)}
                      alt={`Preview ${index + 1}`}
                      sx={{ objectFit: 'cover' }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => removePhoto(index)}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.7)',
                        }
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          color="inherit"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Star />}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewForm;
