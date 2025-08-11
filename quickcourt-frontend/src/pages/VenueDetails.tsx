import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Card,
  CardMedia,
  Grid,
  Chip,
  Button,
  Paper,
  Divider,
  IconButton,
  CircularProgress,
  Alert,
  Rating,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  AccessTime as AccessTimeIcon,
  AttachMoney as AttachMoneyIcon,
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/common/Header';
import { Venue } from '../types';

const VenueDetails: React.FC = () => {
  const { venueId } = useParams<{ venueId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const loadVenueDetails = async () => {
      if (!venueId) {
        setError('Venue ID not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/venues/${venueId}`);
        const data = await response.json();

        if (data.success) {
          setVenue(data.data.venue);
          setError(null);
        } else {
          setError('Failed to load venue details');
        }
      } catch (err) {
        setError('Failed to load venue details. Please try again.');
        console.error('Venue details error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadVenueDetails();
  }, [venueId]);

  const handleBack = () => {
    navigate('/');
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // TODO: Navigate to booking page
    console.log('Booking venue:', venueId);
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Update favorites in backend
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatPrice = (min: number, max: number) => {
    if (min === max) return `₹${min}`;
    return `₹${min} - ₹${max}`;
  };

  const getMainImage = (photos: string[]) => {
    if (photos && photos.length > 0) {
      const photoPath = photos[0];
      if (photoPath.startsWith('http')) {
        return photoPath;
      }
      return `http://localhost:5000${photoPath}`;
    }
    return 'https://via.placeholder.com/800x400/2196F3/ffffff?text=No+Image';
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        <Header
          isAuthenticated={isAuthenticated}
          user={user ? {
            name: user.fullName,
            avatar: user.avatar,
            role: user.role,
          } : undefined}
          onLogin={handleLogin}
          onSignUp={handleSignUp}
          onLogout={handleLogout}
        />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <CircularProgress size={40} />
            <Typography sx={{ ml: 2 }}>Loading venue details...</Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  if (error || !venue) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        <Header
          isAuthenticated={isAuthenticated}
          user={user ? {
            name: user.fullName,
            avatar: user.avatar,
            role: user.role,
          } : undefined}
          onLogin={handleLogin}
          onSignUp={handleSignUp}
          onLogout={handleLogout}
        />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 4 }}>
            {error || 'Venue not found'}
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Back to Home
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Header
        isAuthenticated={isAuthenticated}
        user={user ? {
          name: user.fullName,
          avatar: user.avatar,
          role: user.role,
        } : undefined}
        onLogin={handleLogin}
        onSignUp={handleSignUp}
        onLogout={handleLogout}
      />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Back Button */}
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 3 }}
        >
          Back to Home
        </Button>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          {/* Main Image and Gallery */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 66%' } }}>
            <Card sx={{ mb: 3 }}>
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="400"
                  image={getMainImage(venue.photos || [])}
                  alt={venue.name}
                  sx={{ objectFit: 'cover' }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    display: 'flex',
                    gap: 1,
                  }}
                >
                  <IconButton
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
                    }}
                    onClick={handleToggleFavorite}
                  >
                    {isFavorite ? (
                      <FavoriteIcon sx={{ color: 'error.main' }} />
                    ) : (
                      <FavoriteBorderIcon />
                    )}
                  </IconButton>
                  <IconButton
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
                    }}
                  >
                    <ShareIcon />
                  </IconButton>
                </Box>
              </Box>
            </Card>

            {/* Additional Photos */}
            {venue.photos && venue.photos.length > 1 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                {venue.photos.slice(1, 5).map((photo, index) => (
                  <Box key={index} sx={{ flex: '0 0 calc(25% - 12px)', minWidth: '120px' }}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="120"
                        image={photo.startsWith('http') ? photo : `http://localhost:5000${photo}`}
                        alt={`${venue.name} ${index + 2}`}
                        sx={{ objectFit: 'cover' }}
                      />
                    </Card>
                  </Box>
                ))}
              </Box>
            )}

            {/* Venue Description */}
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                About This Venue
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
                {venue.description}
              </Typography>
            </Card>

            {/* Amenities */}
            {venue.amenities && venue.amenities.length > 0 && (
              <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Amenities
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {venue.amenities.map((amenity, index) => (
                    <Chip
                      key={index}
                      label={amenity}
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Box>
              </Card>
            )}
          </Box>

          {/* Venue Info and Booking */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 34%' } }}>
            <Card sx={{ p: 3, position: 'sticky', top: 20 }}>
              {/* Venue Header */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {venue.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Rating
                    value={venue.rating?.average || 0}
                    precision={0.1}
                    readOnly
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    ({venue.rating?.count || 0} reviews)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    {venue.address.street}, {venue.address.city}, {venue.address.state}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Sports Supported */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  Sports Available
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {venue.sportsSupported.map((sport) => (
                    <Chip
                      key={sport}
                      label={sport}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Price Range */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  <AttachMoneyIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Price Range
                </Typography>
                <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
                  {formatPrice(venue.priceRange.min, venue.priceRange.max)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  per hour
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Contact Info */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Contact Information
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PhoneIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                  <Typography variant="body2">
                    {venue.contactInfo.phone}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmailIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                  <Typography variant="body2">
                    {venue.contactInfo.email}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Operating Hours */}
              {venue.operatingHours && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    <AccessTimeIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Operating Hours
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monday - Friday: {venue.operatingHours.monday?.open} - {venue.operatingHours.monday?.close}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Saturday: {venue.operatingHours.saturday?.open} - {venue.operatingHours.saturday?.close}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sunday: {venue.operatingHours.sunday?.open} - {venue.operatingHours.sunday?.close}
                  </Typography>
                </Box>
              )}

              {/* Book Now Button */}
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleBookNow}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                }}
              >
                Book Now
              </Button>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default VenueDetails;
