import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Rating,
  Box,
  Avatar,
  Chip,
  Grid,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  ImageList,
  ImageListItem,
  Divider,
  Tooltip
} from '@mui/material';
import {
  ThumbUp,
  ThumbDown,
  Verified,
  PhotoLibrary,
  Close
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

interface Review {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
  } | string; // Can be either populated object or just string ID
  venueId: {
    _id: string;
    name: string;
  };
  rating: number;
  title: string;
  comment: string;
  aspects: {
    cleanliness: number;
    facilities: number;
    staff: number;
    value: number;
  };
  photos: Array<{
    url: string;
    caption?: string;
  }>;
  isVerified: boolean;
  helpful: number;
  createdAt: string;
  updatedAt: string;
}

interface ReviewCardProps {
  review: Review;
  onHelpful?: (reviewId: string, isHelpful: boolean) => void;
  showVenueName?: boolean;
  currentUserId?: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ 
  review, 
  onHelpful, 
  showVenueName = false,
  currentUserId 
}) => {
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [userVote, setUserVote] = useState<boolean | null>(null);

  const aspectLabels: Record<keyof Review['aspects'], string> = {
    cleanliness: 'Cleanliness',
    facilities: 'Facilities',
    staff: 'Staff',
    value: 'Value'
  };

  const handlePhotoClick = (index: number) => {
    setSelectedPhotoIndex(index);
    setPhotoDialogOpen(true);
  };

  const handleHelpfulClick = (isHelpful: boolean) => {
    if (onHelpful && currentUserId && currentUserId !== getUserId()) {
      onHelpful(review._id, isHelpful);
      setUserVote(isHelpful);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'success.main';
    if (rating >= 3) return 'warning.main';
    return 'error.main';
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U'; // Default to 'U' for User if no name provided
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserName = () => {
    if (typeof review.userId === 'object' && review.userId.fullName) {
      return review.userId.fullName;
    }
    return 'You'; // Default for current user when userId is not populated
  };

  const getUserId = () => {
    if (typeof review.userId === 'object') {
      return review.userId._id;
    }
    return review.userId; // It's already a string ID
  };

  return (
    <>
      <Card sx={{ mb: 2, boxShadow: 2 }}>
        <CardContent>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
              {getInitials(getUserName())}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {getUserName()}
                </Typography>
                {review.isVerified && (
                  <Tooltip title="Verified booking">
                    <Verified color="primary" fontSize="small" />
                  </Tooltip>
                )}
              </Box>
              <Typography variant="caption" color="text.secondary">
                {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                {showVenueName && ` • ${review.venueId.name}`}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Rating 
                value={review.rating} 
                readOnly 
                size="small"
                sx={{ mb: 0.5 }}
              />
              <Typography 
                variant="caption" 
                sx={{ 
                  color: getRatingColor(review.rating),
                  fontWeight: 'bold'
                }}
              >
                {review.rating}/5
              </Typography>
            </Box>
          </Box>

          {/* Review Title */}
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            {review.title}
          </Typography>

          {/* Review Comment */}
          <Typography variant="body2" color="text.secondary" paragraph>
            {review.comment}
          </Typography>

          {/* Aspect Ratings */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Detailed Ratings
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
              {Object.entries(review.aspects).map(([key, value]) => (
                value > 0 && (
                  <Box key={key} sx={{ textAlign: 'center', p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {aspectLabels[key as keyof Review['aspects']]}
                    </Typography>
                    <Rating 
                      value={value} 
                      readOnly 
                      size="small"
                      sx={{ display: 'block', mt: 0.5 }}
                    />
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                      {value}/5
                    </Typography>
                  </Box>
                )
              ))}
            </Box>
          </Box>

          {/* Photos */}
          {review.photos && review.photos.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PhotoLibrary fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Photos ({review.photos.length})
                </Typography>
              </Box>
              <ImageList 
                sx={{ width: '100%', height: 120 }} 
                cols={Math.min(review.photos.length, 4)} 
                rowHeight={120}
                gap={8}
              >
                {review.photos.slice(0, 4).map((photo, index) => (
                  <ImageListItem 
                    key={index}
                    sx={{ 
                      cursor: 'pointer',
                      borderRadius: 1,
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                    onClick={() => handlePhotoClick(index)}
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || `Review photo ${index + 1}`}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    {index === 3 && review.photos.length > 4 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          bgcolor: 'rgba(0,0,0,0.6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      >
                        +{review.photos.length - 4}
                      </Box>
                    )}
                  </ImageListItem>
                ))}
              </ImageList>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {currentUserId && currentUserId !== getUserId() && (
                <>
                  <IconButton
                    size="small"
                    onClick={() => handleHelpfulClick(true)}
                    color={userVote === true ? 'primary' : 'default'}
                  >
                    <ThumbUp fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleHelpfulClick(false)}
                    color={userVote === false ? 'primary' : 'default'}
                  >
                    <ThumbDown fontSize="small" />
                  </IconButton>
                </>
              )}
              <Typography variant="caption" color="text.secondary">
                {review.helpful} found this helpful
              </Typography>
            </Box>
            
            {review.createdAt !== review.updatedAt && (
              <Chip 
                label="Edited" 
                size="small" 
                variant="outlined" 
                color="info"
              />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Photo Dialog */}
      <Dialog
        open={photoDialogOpen}
        onClose={() => setPhotoDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogActions sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}>
          <IconButton
            onClick={() => setPhotoDialogOpen(false)}
            sx={{
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)',
              }
            }}
          >
            <Close />
          </IconButton>
        </DialogActions>
        <DialogContent sx={{ p: 0 }}>
          {review.photos && review.photos[selectedPhotoIndex] && (
            <Box sx={{ textAlign: 'center' }}>
              <img
                src={review.photos[selectedPhotoIndex].url}
                alt={review.photos[selectedPhotoIndex].caption || `Review photo ${selectedPhotoIndex + 1}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  objectFit: 'contain'
                }}
              />
              {review.photos[selectedPhotoIndex].caption && (
                <Typography 
                  variant="body2" 
                  sx={{ p: 2, bgcolor: 'grey.100' }}
                >
                  {review.photos[selectedPhotoIndex].caption}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          {review.photos && review.photos.length > 1 && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {review.photos.map((_, index) => (
                <Button
                  key={index}
                  size="small"
                  variant={index === selectedPhotoIndex ? 'contained' : 'outlined'}
                  onClick={() => setSelectedPhotoIndex(index)}
                >
                  {index + 1}
                </Button>
              ))}
            </Box>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReviewCard;
