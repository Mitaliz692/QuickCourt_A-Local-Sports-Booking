import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Button,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/common/Header';
import SearchBar from '../components/common/SearchBar';
import VenueCard from '../components/common/VenueCard';
import PopularSports from '../components/common/PopularSports';
import { Venue } from '../types';

const HomePage: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [allVenues, setAllVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteVenues, setFavoriteVenues] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load real venues from backend (only facility owner registered venues)
    const loadVenues = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/venues', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (data.success) {
          // Only show approved venues that are active
          const approvedVenues = data.data.venues.filter((venue: Venue) => 
            venue.status === 'approved' && venue.isActive
          );
          setVenues(approvedVenues);
          setAllVenues(approvedVenues);
          setError(null);
        } else {
          setError('Failed to load venues. Please try again.');
        }
      } catch (err) {
        setError('Failed to load venues. Please try again.');
        console.error('Error loading venues:', err);
      } finally {
        setLoading(false);
      }
    };

    loadVenues();
  }, []);

  const handleSearch = async (location: string) => {
    console.log('Searching for venues:', location);
    
    try {
      setLoading(true);
      
      if (!location.trim()) {
        // If empty search, show all venues
        setVenues(allVenues);
        setError(null);
        setLoading(false);
        return;
      }

      // Filter venues locally based on location search
      const results = allVenues.filter(venue => {
        const searchTerm = location.toLowerCase();
        return (
          venue.name.toLowerCase().includes(searchTerm) ||
          venue.address.city.toLowerCase().includes(searchTerm) ||
          venue.address.state.toLowerCase().includes(searchTerm) ||
          venue.address.street.toLowerCase().includes(searchTerm) ||
          venue.sportsSupported.some(sport => sport.toLowerCase().includes(searchTerm)) ||
          venue.description.toLowerCase().includes(searchTerm)
        );
      });

      setVenues(results);
      setError(null);
      
      // Show message if no venues found
      if (results.length === 0 && location.trim()) {
        setError(`No venues found for "${location}". Try searching for different areas or sports.`);
      }
    } catch (err) {
      setError('Failed to search venues. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (venueId: string) => {
    console.log('Booking venue:', venueId);
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Redirect to login page if not authenticated
      navigate('/login');
      return;
    }
    
    // If authenticated, navigate to booking page (to be implemented)
    console.log('User is authenticated, proceeding with booking...');
    // TODO: Navigate to booking page when implemented
    // navigate(`/booking/${venueId}`);
  };

  const handleViewDetails = (venueId: string) => {
    console.log('Viewing venue details:', venueId);
    // Navigate to venue details page
    navigate(`/venue/${venueId}`);
  };

  const handleToggleFavorite = (venueId: string, isFavorite: boolean) => {
    const newFavorites = new Set(favoriteVenues);
    if (isFavorite) {
      newFavorites.add(venueId);
    } else {
      newFavorites.delete(venueId);
    }
    setFavoriteVenues(newFavorites);
  };

  const handleSportClick = (sportId: string) => {
    console.log('Selected sport:', sportId);
    // Filter venues by sport or navigate to venues page with sport filter
  };

  const handleViewAllVenues = () => {
    console.log('Viewing all venues');
    // Navigate to venues page
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    // Handle logout using auth context
    logout();
    navigate('/');
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Header */}
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

      {/* Hero Section with Search */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 6, md: 8 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
            }}
          >
            Find Sports Venues in Ahmedabad
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 300,
              mb: 4,
              opacity: 0.9,
              fontSize: { xs: '1.1rem', md: '1.3rem' },
            }}
          >
            Book premium sports facilities across Ahmedabad's best locations - 
            from S.G. Highway to Sabarmati Riverfront
          </Typography>
          <SearchBar 
            onSearch={handleSearch} 
            placeholder="Search for sports venues in Ahmedabad..."
            defaultValue=""
          />
        </Container>
      </Box>

      {/* Statistics Section */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
          <Box sx={{ flex: { xs: '0 0 calc(50% - 8px)', md: '0 0 calc(25% - 12px)' } }}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                height: '100%',
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {venues.length}
              </Typography>
              <Typography variant="body2">
                Live Venues
              </Typography>
            </Paper>
          </Box>
          <Box sx={{ flex: { xs: '0 0 calc(50% - 8px)', md: '0 0 calc(25% - 12px)' } }}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                height: '100%',
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                15+
              </Typography>
              <Typography variant="body2">
                Sports Types
              </Typography>
            </Paper>
          </Box>
          <Box sx={{ flex: { xs: '0 0 calc(50% - 8px)', md: '0 0 calc(25% - 12px)' } }}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                color: 'white',
                height: '100%',
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                24/7
              </Typography>
              <Typography variant="body2">
                Booking Support
              </Typography>
            </Paper>
          </Box>
          <Box sx={{ flex: { xs: '0 0 calc(50% - 8px)', md: '0 0 calc(25% - 12px)' } }}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                color: 'primary.main',
                height: '100%',
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                4.5★
              </Typography>
              <Typography variant="body2">
                Average Rating
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Container>

      {/* Popular Venues Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography
              variant="h4"
              component="h2"
              sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}
            >
              Live Ahmedabad Venues
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Real-time data from top sports facilities across Ahmedabad
            </Typography>
          </Box>
          <Button
            variant="outlined"
            endIcon={<ArrowForwardIcon />}
            onClick={handleViewAllVenues}
            sx={{
              display: { xs: 'none', md: 'flex' },
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.04)',
              },
            }}
          >
            See all venues
          </Button>
        </Box>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={40} />
            <Typography sx={{ ml: 2, alignSelf: 'center' }}>
              Loading live Ahmedabad venues...
            </Typography>
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {/* Venues Grid */}
        {!loading && venues.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {venues.map((venue) => (
              <Box
                key={venue._id}
                sx={{
                  flex: {
                    xs: '1 1 100%',
                    sm: '1 1 calc(50% - 12px)',
                    md: '1 1 calc(33.333% - 16px)',
                  },
                  minWidth: 0,
                }}
              >
                <VenueCard
                  venue={venue}
                  isFavorite={favoriteVenues.has(venue._id)}
                  onBookNow={handleBookNow}
                  onViewDetails={handleViewDetails}
                  onToggleFavorite={handleToggleFavorite}
                />
              </Box>
            ))}
          </Box>
        )}

        {/* No venues found */}
        {!loading && venues.length === 0 && !error && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No venues found. Try adjusting your search criteria.
            </Typography>
          </Box>
        )}
      </Container>

      {/* Popular Sports Section */}
      <Box sx={{ backgroundColor: 'grey.50', py: 6 }}>
        <PopularSports onSportClick={handleSportClick} />
      </Box>

      {/* Call to Action */}
      <Container maxWidth="md" sx={{ py: 6, textAlign: 'center' }}>
        <Typography
          variant="h4"
          component="h2"
          sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}
        >
          Ready to Book Your Next Game?
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
          Join thousands of sports enthusiasts in Ahmedabad who trust QuickCourt for their venue bookings
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 600,
          }}
          onClick={handleViewAllVenues}
        >
          Browse All Venues
        </Button>
      </Container>
    </Box>
  );
};

export default HomePage;
