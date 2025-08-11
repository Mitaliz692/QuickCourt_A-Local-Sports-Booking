import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  Rating,
  Button,
  IconButton,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from '@mui/icons-material';
import { Venue } from '../../types';

interface VenueCardProps {
  venue: Venue;
  onViewDetails?: (venueId: string) => void;
  onToggleFavorite?: (venueId: string, isFavorite: boolean) => void;
  isFavorite?: boolean;
  showFullDetails?: boolean;
}

const VenueCard: React.FC<VenueCardProps> = ({
  venue,
  onViewDetails,
  onToggleFavorite,
  isFavorite = false,
  showFullDetails = true,
}) => {

  const handleViewDetails = () => {
    onViewDetails?.(venue._id);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(venue._id, !isFavorite);
  };

  const formatPrice = (min: number, max: number) => {
    if (min === max) return `₹${min}`;
    return `₹${min} - ₹${max}`;
  };

  const getMainImage = () => {
    if (venue.photos && venue.photos.length > 0) {
      const photoPath = venue.photos[0];
      // If it's already a full URL, return as is
      if (photoPath.startsWith('http')) {
        return photoPath;
      }
      // Otherwise, prepend the backend URL
      return `http://localhost:5000${photoPath}`;
    }
    return '/api/placeholder/400/250';
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-2px)',
          transition: 'transform 0.3s ease-in-out',
        },
      }}
      onClick={handleViewDetails}
    >
      {/* Favorite Button */}
      <IconButton
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 1)',
          },
        }}
        onClick={handleToggleFavorite}
        size="small"
      >
        {isFavorite ? (
          <FavoriteIcon sx={{ color: 'error.main', fontSize: 20 }} />
        ) : (
          <FavoriteBorderIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
        )}
      </IconButton>

      {/* Venue Image */}
      <CardMedia
        component="img"
        height="200"
        image={getMainImage()}
        alt={venue.name}
        sx={{
          objectFit: 'cover',
        }}
      />

      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        {/* Sports Tags */}
        <Box sx={{ mb: 1.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {venue.sportsSupported.slice(0, 3).map((sport) => (
            <Chip
              key={sport}
              label={sport}
              size="small"
              sx={{
                fontSize: '0.75rem',
                height: 24,
                backgroundColor: 'primary.main',
                color: 'white',
                '& .MuiChip-label': {
                  px: 1,
                },
              }}
            />
          ))}
          {venue.sportsSupported.length > 3 && (
            <Chip
              label={`+${venue.sportsSupported.length - 3}`}
              size="small"
              sx={{
                fontSize: '0.75rem',
                height: 24,
                backgroundColor: 'grey.300',
                color: 'text.secondary',
              }}
            />
          )}
        </Box>

        {/* Venue Name */}
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 600,
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.3,
          }}
        >
          {venue.name}
        </Typography>

        {/* Location */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 0.5 }}>
          <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {venue.address.city}, {venue.address.state}
          </Typography>
        </Box>

        {/* Rating and Reviews */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Rating
            value={venue.rating.average}
            precision={0.1}
            size="small"
            readOnly
            sx={{ fontSize: '1rem' }}
          />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {venue.rating.average.toFixed(1)} ({venue.rating.count})
          </Typography>
        </Box>

        {/* Price Range */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: 'primary.main',
            }}
          >
            {formatPrice(venue.priceRange.min, venue.priceRange.max)}
            <Typography
              component="span"
              variant="body2"
              sx={{ color: 'text.secondary', fontWeight: 400 }}
            >
              /hour
            </Typography>
          </Typography>
        </Box>

        {/* Amenities (if showing full details) */}
        {showFullDetails && venue.amenities.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
              Amenities:
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {venue.amenities.slice(0, 3).map((amenity) => (
                <Chip
                  key={amenity}
                  label={amenity}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: '0.7rem',
                    height: 20,
                    borderColor: 'grey.300',
                    color: 'text.secondary',
                  }}
                />
              ))}
              {venue.amenities.length > 3 && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  +{venue.amenities.length - 3} more
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
          <Button
            variant="contained"
            size="small"
            fullWidth
            onClick={handleViewDetails}
            sx={{
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            View Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default VenueCard;
