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
  Chip,
  Pagination,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/common/Header';
import AdvancedSearchBar, { SearchFilters } from '../components/common/AdvancedSearchBar';
import VenueCard from '../components/common/VenueCard';
import PopularSports from '../components/common/PopularSports';
import { Venue } from '../types';
import { filterVenues, getSearchResultsSummary, getFilteredVenueStats } from '../utils/venueFilters';

const HomePage: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [allVenues, setAllVenues] = useState<Venue[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteVenues, setFavoriteVenues] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    location: '',
    sports: [],
    priceRange: [0, 5000],
    rating: 0,
    amenities: [],
    sortBy: 'rating',
    sortOrder: 'desc',
  });

  const VENUES_PER_PAGE = 12;

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
          credentials: 'include'
        });

        const data = await response.json();
        if (data.success) {
          // Only show approved venues that are active
          const approvedVenues = data.data.venues.filter((venue: Venue) => 
            venue.status === 'approved' && venue.isActive
          );
          setAllVenues(approvedVenues);
          setVenues(approvedVenues);
          setFilteredVenues(approvedVenues);
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

  // Apply filters whenever search filters change
  useEffect(() => {
    const filtered = filterVenues(allVenues, searchFilters);
    setFilteredVenues(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [allVenues, searchFilters]);

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
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
          <AdvancedSearchBar 
            onSearch={handleSearch} 
            placeholder="Search for sports venues in Ahmedabad..."
            showAdvancedFilters={true}
            initialFilters={searchFilters}
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

        {/* Search Results Summary */}
        {!loading && (
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              {getSearchResultsSummary(allVenues.length, filteredVenues.length, searchFilters)}
            </Typography>
            {filteredVenues.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                Page {currentPage} of {Math.ceil(filteredVenues.length / VENUES_PER_PAGE)}
              </Typography>
            )}
          </Box>
        )}

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
        {!loading && filteredVenues.length > 0 && (
          <>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {filteredVenues
                .slice((currentPage - 1) * VENUES_PER_PAGE, currentPage * VENUES_PER_PAGE)
                .map((venue) => (
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
                      onViewDetails={handleViewDetails}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  </Box>
                ))}
            </Box>

            {/* Pagination */}
            {Math.ceil(filteredVenues.length / VENUES_PER_PAGE) > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={Math.ceil(filteredVenues.length / VENUES_PER_PAGE)}
                  page={currentPage}
                  onChange={(_, page) => setCurrentPage(page)}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}

        {/* No Venues Found */}
        {!loading && filteredVenues.length === 0 && allVenues.length > 0 && (
          <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              No venues match your search criteria
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Try adjusting your filters or search terms to find more venues.
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => {
                setSearchFilters({
                  location: '',
                  sports: [],
                  priceRange: [0, 5000],
                  rating: 0,
                  amenities: [],
                  sortBy: 'rating',
                  sortOrder: 'desc',
                });
              }}
            >
              Clear All Filters
            </Button>
          </Paper>
        )}

        {/* No venues found */}
        {!loading && filteredVenues.length === 0 && allVenues.length === 0 && !error && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No venues available. Check back later for new venues in your area.
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
