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
  Tabs,
  Tab,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  Search as SearchIcon,
  RateReview as ReviewIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/common/Header';
import AdvancedSearchBar, { SearchFilters } from '../components/common/AdvancedSearchBar';
import VenueCard from '../components/common/VenueCard';
import PopularSports from '../components/common/PopularSports';
import ReviewEligibleBookings from '../components/ReviewEligibleBookings';
import UserReviews from '../components/UserReviews';
import { Venue } from '../types';
import { filterVenues, getSearchResultsSummary } from '../utils/venueFilters';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-dashboard-tabpanel-${index}`}
      aria-labelledby={`user-dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const UserDashboard: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [allVenues, setAllVenues] = useState<Venue[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteVenues, setFavoriteVenues] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTab, setCurrentTab] = useState(0);
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0);
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

  useEffect(() => {
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
    if (isFavorite) {
      setFavoriteVenues(prev => new Set([...Array.from(prev), venueId]));
    } else {
      setFavoriteVenues(prev => {
        const newSet = new Set(prev);
        newSet.delete(venueId);
        return newSet;
      });
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleReviewSubmitted = () => {
    setReviewRefreshTrigger(prev => prev + 1);
    // Refresh venues to update ratings in real-time
    loadVenues();
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate pagination
  const startIndex = (currentPage - 1) * VENUES_PER_PAGE;
  const endIndex = startIndex + VENUES_PER_PAGE;
  const paginatedVenues = filteredVenues.slice(startIndex, endIndex);

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

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
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

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 'bold',
                mb: 2,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
              }}
            >
              Welcome back, {user?.fullName}!
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                opacity: 0.9,
                maxWidth: 600,
                mx: 'auto',
                fontSize: { xs: '1rem', md: '1.25rem' },
              }}
            >
              Discover and explore premium sports venues in your area
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Navigation Tabs */}
        <Paper elevation={1} sx={{ mb: 4 }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab
              icon={<SearchIcon />}
              label="Discover Venues"
              iconPosition="start"
              sx={{ fontSize: '1rem', minHeight: 72 }}
            />
            <Tab
              icon={<ReviewIcon />}
              label="Write Reviews"
              iconPosition="start"
              sx={{ fontSize: '1rem', minHeight: 72 }}
            />
            <Tab
              icon={<HistoryIcon />}
              label="My Reviews"
              iconPosition="start"
              sx={{ fontSize: '1rem', minHeight: 72 }}
            />
          </Tabs>
        </Paper>

        {/* Tab Panels */}
        <TabPanel value={currentTab} index={0}>
          {/* Popular Sports Section */}
          <Box sx={{ mb: 6 }}>
            <PopularSports />
          </Box>

          {/* Advanced Search */}
          <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
            <AdvancedSearchBar
              onSearch={handleSearch}
              initialFilters={searchFilters}
              placeholder="Search venues by name, location, sport, or amenities..."
            />
          </Paper>

          {/* Search Results Summary */}
          {allVenues.length > 0 && (
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                Available Venues
              </Typography>
              <Chip
                label={getSearchResultsSummary(allVenues.length, filteredVenues.length, searchFilters)}
                color="primary"
                variant="outlined"
              />
            </Box>
          )}

          {/* Error State */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Loading State */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={60} />
            </Box>
          )}

          {/* Venues Grid */}
          {!loading && filteredVenues.length > 0 && (
            <>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                    lg: 'repeat(4, 1fr)',
                  },
                  gap: 3,
                  mb: 4,
                }}
              >
                {paginatedVenues.map((venue) => (
                  <Box
                    key={venue._id}
                    sx={{
                      height: 'fit-content',
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
                    onChange={handlePageChange}
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
                No venues found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Try adjusting your search filters to find more venues.
              </Typography>
              <Button
                variant="contained"
                onClick={() => setSearchFilters({
                  location: '',
                  sports: [],
                  priceRange: [0, 5000],
                  rating: 0,
                  amenities: [],
                  sortBy: 'rating',
                  sortOrder: 'desc',
                })}
              >
                Clear Filters
              </Button>
            </Paper>
          )}

          {/* No Venues at All */}
          {!loading && allVenues.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                No venues available
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                There are currently no venues registered in the system. Please check back later.
              </Typography>
            </Paper>
          )}

          {/* Call to Action Section */}
          {!loading && (
            <Paper
              sx={{
                p: 4,
                mt: 6,
                textAlign: 'center',
                background: 'linear-gradient(45deg, #f5f7fa 0%, #c3cfe2 100%)',
              }}
            >
              <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 2 }}>
                Looking for something specific?
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
                Can't find the perfect venue? Use our advanced search filters or contact us for personalized recommendations.
              </Typography>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={() => {
                  // Scroll to search bar
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
              >
                Refine Your Search
              </Button>
            </Paper>
          )}
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <ReviewEligibleBookings onReviewSubmitted={handleReviewSubmitted} />
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <UserReviews refreshTrigger={reviewRefreshTrigger} />
        </TabPanel>
      </Container>
    </Box>
  );
};

export default UserDashboard;
