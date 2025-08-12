import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
  Chip,
  Rating,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Stack,
} from '@mui/material';
import {
  LocationOn,
  Search,
  FilterList,
  SportsTennis,
  BookOnline,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/common/Header';
import { Venue } from '../types';

// Utility function to get proper image URL
const getVenueImageUrl = (photos: string[] | undefined): string => {
  if (!photos || photos.length === 0) {
    return '/placeholder-venue.svg';
  }
  
  const photo = photos[0];
  // If photo already has full URL, return as is
  if (photo.startsWith('http')) {
    return photo;
  }
  
  // If photo starts with /, prepend backend URL
  if (photo.startsWith('/')) {
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${photo}`;
  }
  
  // Otherwise, assume it needs /uploads/ prefix
  return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/${photo}`;
};

const BookingMenu: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch venues
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/venues', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch venues');
        }
        
        const data = await response.json();
        console.log('API Response:', data); // Debug log
        
        // Handle the correct API response structure: { success: true, data: { venues: [...] } }
        if (data.success && data.data && data.data.venues) {
          setVenues(data.data.venues);
        } else {
          // Fallback for other response formats
          const venuesArray = Array.isArray(data) ? data : (data.venues || data.data || []);
          setVenues(venuesArray);
        }
      } catch (error) {
        console.error('Error fetching venues:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setError(`Failed to load venues: ${errorMessage}`);
        
        // Only use fallback mock data if the backend is completely unreachable
        if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
          // Fallback mock data for demo purposes when backend is down
          const mockVenues = [
          {
            _id: '1',
            name: 'SBR Badminton',
            description: 'Premium badminton courts with professional setup',
            ownerId: 'mock-owner-1',
            address: {
              street: 'Satellite',
              city: 'Jodhpur',
              state: 'Rajasthan',
              zipCode: '342001',
              country: 'India'
            },
            sportsSupported: ['Badminton'],
            amenities: ['Parking', 'Water', 'Changing Room'],
            photos: ['/placeholder-venue.svg'],
            rating: {
              average: 4.5,
              count: 6
            },
            operatingHours: {
              Monday: { open: '06:00', close: '22:00', isClosed: false },
              Tuesday: { open: '06:00', close: '22:00', isClosed: false },
              Wednesday: { open: '06:00', close: '22:00', isClosed: false },
              Thursday: { open: '06:00', close: '22:00', isClosed: false },
              Friday: { open: '06:00', close: '22:00', isClosed: false },
              Saturday: { open: '06:00', close: '23:00', isClosed: false },
              Sunday: { open: '07:00', close: '21:00', isClosed: false }
            },
            priceRange: {
              min: 500,
              max: 1200
            },
            status: 'approved' as const,
            contactInfo: {
              phone: '+91-9999999999',
              email: 'contact@sbr.com'
            },
            isActive: true
          },
          {
            _id: '2',
            name: 'City Sports Complex',
            description: 'Multi-sport facility with tennis and basketball courts',
            ownerId: 'mock-owner-2',
            address: {
              street: 'Civil Lines',
              city: 'Jodhpur',
              state: 'Rajasthan',
              zipCode: '342001',
              country: 'India'
            },
            sportsSupported: ['Tennis', 'Basketball'],
            amenities: ['Parking', 'Cafeteria', 'Locker Room'],
            photos: ['/placeholder-venue.svg'],
            rating: {
              average: 4.2,
              count: 15
            },
            operatingHours: {
              Monday: { open: '05:00', close: '23:00', isClosed: false },
              Tuesday: { open: '05:00', close: '23:00', isClosed: false },
              Wednesday: { open: '05:00', close: '23:00', isClosed: false },
              Thursday: { open: '05:00', close: '23:00', isClosed: false },
              Friday: { open: '05:00', close: '23:00', isClosed: false },
              Saturday: { open: '05:00', close: '24:00', isClosed: false },
              Sunday: { open: '06:00', close: '22:00', isClosed: false }
            },
            priceRange: {
              min: 800,
              max: 1500
            },
            status: 'approved' as const,
            contactInfo: {
              phone: '+91-8888888888',
              email: 'info@citysports.com'
            },
            isActive: true
          }
        ];
        
        setVenues(mockVenues);
        setError('Using demo data. Backend API not available.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  const handleBookVenue = (venueId: string) => {
    navigate(`/book-venue/${venueId}`);
  };

  const filteredVenues = Array.isArray(venues) ? venues.filter(venue =>
    venue.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (venue.sportsSupported && venue.sportsSupported.some(sport => 
      sport?.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  ) : [];

  if (loading) {
    return (
      <>
        <Header 
          isAuthenticated={isAuthenticated}
          user={user ? {
            name: user.fullName,
            avatar: user.avatar,
            role: user.role,
          } : undefined}
          onLogout={logout}
        />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading venues...</Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header 
        isAuthenticated={isAuthenticated}
        user={user ? {
          name: user.fullName,
          avatar: user.avatar,
          role: user.role,
        } : undefined}
        onLogout={logout}
      />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Book a Venue
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Choose from our available sports venues and book your court
          </Typography>
          
          {/* Search Bar */}
          <Box sx={{ mt: 3, mb: 4 }}>
            <TextField
              fullWidth
              placeholder="Search venues by name, location, or sport..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton>
                      <FilterList />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {/* Venues Grid */}
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {filteredVenues.map((venue) => (
            <Card 
              key={venue._id}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                },
              }}
            >
                <CardMedia
                  component="img"
                  height="200"
                  image={getVenueImageUrl(venue.photos)}
                  alt={venue.name || 'Venue'}
                  sx={{ objectFit: 'cover' }}
                />
                
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography variant="h6" component="h2" fontWeight="bold" gutterBottom>
                    {venue.name || 'Unknown Venue'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {venue.address?.city || 'Unknown'}, {venue.address?.state || 'Unknown'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Rating 
                      value={venue.rating?.average || 0} 
                      precision={0.1} 
                      size="small" 
                      readOnly 
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      ({venue.rating?.count || 0} reviews)
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {venue.description ? venue.description.substring(0, 100) + '...' : 'No description available'}
                  </Typography>

                  {/* Sports Supported */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Sports Available:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {venue.sportsSupported && venue.sportsSupported.length > 0 ? (
                        <>
                          {venue.sportsSupported.slice(0, 3).map((sport) => (
                            <Chip
                              key={sport}
                              label={sport}
                              size="small"
                              sx={{ fontSize: '0.75rem' }}
                            />
                          ))}
                          {venue.sportsSupported.length > 3 && (
                            <Chip
                              label={`+${venue.sportsSupported.length - 3} more`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.75rem' }}
                            />
                          )}
                        </>
                      ) : (
                        <Chip
                          label="No sports listed"
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Price Range */}
                  <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
                    ₹{venue.priceRange?.min || 0} - ₹{venue.priceRange?.max || 0}/hour
                  </Typography>
                  
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<BookOnline />}
                    onClick={() => handleBookVenue(venue._id)}
                    sx={{
                      mt: 2,
                      bgcolor: 'success.main',
                      '&:hover': {
                        bgcolor: 'success.dark',
                      },
                      fontWeight: 'bold',
                    }}
                  >
                    Book Venue
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>

        {/* No Results */}
        {filteredVenues.length === 0 && !loading && !error && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <SportsTennis sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No venues found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Try adjusting your search criteria
            </Typography>
          </Box>
        )}
      </Container>
    </>
  );
};

export default BookingMenu;
