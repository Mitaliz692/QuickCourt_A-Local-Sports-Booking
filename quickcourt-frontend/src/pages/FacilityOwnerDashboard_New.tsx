import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  Tab,
  Tabs,
  Divider,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  AccountCircle,
  Logout,
  Dashboard,
  LocationOn,
  Star,
  Visibility,
  Edit,
  Delete,
  Photo,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { filterVenues, getSearchResultsSummary } from '../utils/venueFilters';
import { SearchFilters } from '../components/common/AdvancedSearchBar';
import { Venue } from '../types';

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const FacilityOwnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tabValue, setTabValue] = useState(0);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [allVenues, setAllVenues] = useState<Venue[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    location: '',
    sports: [],
    priceRange: [0, 5000],
    rating: 0,
    amenities: [],
    sortBy: 'newest',
    sortOrder: 'desc',
  });

  const VENUES_PER_PAGE = 8;

  useEffect(() => {
    fetchMyVenues();
  }, []);

  useEffect(() => {
    // Refresh data when returning from venue edit/create
    if (location.state?.refresh) {
      fetchMyVenues();
      // Clear the state to prevent unnecessary refreshes
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Apply filters whenever search filters change
  useEffect(() => {
    const filtered = filterVenues(allVenues, searchFilters);
    setFilteredVenues(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [allVenues, searchFilters]);

  const fetchMyVenues = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/venues/my-venues', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setVenues(data.data.venues);
        setAllVenues(data.data.venues);
        setFilteredVenues(data.data.venues);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to fetch venues. Please try again.');
      console.error('Error fetching venues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
  };

  const handleQuickSearch = (searchTerm: string) => {
    setSearchFilters(prev => ({
      ...prev,
      location: searchTerm,
    }));
  };

  const handleSortChange = (sortBy: SearchFilters['sortBy'], sortOrder: SearchFilters['sortOrder']) => {
    setSearchFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder,
    }));
  };

  const handleClearFilters = () => {
    setSearchFilters({
      location: '',
      sports: [],
      priceRange: [0, 5000],
      rating: 0,
      amenities: [],
      sortBy: 'newest',
      sortOrder: 'desc',
    });
  };

  const handleAddNewVenue = () => {
    navigate('/facility-registration');
  };

  const handleEditVenue = (venueId: string) => {
    navigate(`/facility-registration/${venueId}`);
  };

  const handleDeleteVenue = async (venueId: string, venueName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${venueName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/venues/${venueId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        // Remove the venue from all state arrays
        setVenues(prevVenues => prevVenues.filter(venue => venue._id !== venueId));
        setAllVenues(prevVenues => prevVenues.filter(venue => venue._id !== venueId));
        setFilteredVenues(prevVenues => prevVenues.filter(venue => venue._id !== venueId));
        alert('Venue deleted successfully!');
      } else {
        alert('Failed to delete venue: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting venue:', error);
      alert('Failed to delete venue. Please try again.');
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'suspended': return 'secondary';
      default: return 'default';
    }
  };

  const dashboardStats = {
    totalVenues: venues.length,
    activeVenues: venues.filter(v => v.isActive).length,
    pendingVenues: venues.filter(v => v.status === 'pending').length,
    averageRating: venues.length > 0 
      ? (venues.reduce((sum, v) => sum + (v.rating?.average || 0), 0) / venues.length).toFixed(1)
      : '0.0',
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* App Bar */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Dashboard sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Facility Owner Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">
              Welcome, {user?.fullName || 'Facility Owner'}
            </Typography>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenuClick}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                <AccountCircle />
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Dashboard Stats */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Total Venues
              </Typography>
              <Typography variant="h4" component="h2">
                {dashboardStats.totalVenues}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Active Venues
              </Typography>
              <Typography variant="h4" component="h2">
                {dashboardStats.activeVenues}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Pending Approval
              </Typography>
              <Typography variant="h4" component="h2">
                {dashboardStats.pendingVenues}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Average Rating
              </Typography>
              <Typography variant="h4" component="h2">
                {dashboardStats.averageRating}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Action Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddNewVenue}
            size="large"
          >
            Add New Venue
          </Button>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="venue tabs">
            <Tab label="My Venues" />
            <Tab label="Analytics" />
            <Tab label="Settings" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : (
            <>
              {/* Search and Filter Section */}
              <Paper sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: 'grey.50' }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
                  {/* Quick Search */}
                  <TextField
                    placeholder="Search your venues..."
                    value={searchFilters.location}
                    onChange={(e) => handleQuickSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ flex: 1 }}
                  />
                  
                  {/* Sort By */}
                  <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={searchFilters.sortBy}
                      onChange={(e) => handleSortChange(e.target.value as SearchFilters['sortBy'], searchFilters.sortOrder)}
                      label="Sort By"
                    >
                      <MenuItem value="newest">Newest First</MenuItem>
                      <MenuItem value="name">Name</MenuItem>
                      <MenuItem value="rating">Rating</MenuItem>
                      <MenuItem value="price">Price</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Sort Order */}
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Order</InputLabel>
                    <Select
                      value={searchFilters.sortOrder}
                      onChange={(e) => handleSortChange(searchFilters.sortBy, e.target.value as SearchFilters['sortOrder'])}
                      label="Order"
                    >
                      <MenuItem value="asc">Ascending</MenuItem>
                      <MenuItem value="desc">Descending</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Clear Filters */}
                  <Button
                    variant="outlined"
                    onClick={handleClearFilters}
                    startIcon={<ClearIcon />}
                  >
                    Clear
                  </Button>
                </Box>

                {/* Results Summary */}
                <Typography variant="body2" color="text.secondary">
                  {getSearchResultsSummary(allVenues.length, filteredVenues.length, searchFilters)}
                </Typography>
              </Paper>

              {/* Venues Display */}
              {filteredVenues.length === 0 && allVenues.length > 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    No venues match your search criteria
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Try adjusting your search terms or filters.
                  </Typography>
                  <Button variant="outlined" onClick={handleClearFilters}>
                    Clear All Filters
                  </Button>
                </Paper>
              ) : filteredVenues.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No venues found
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    Get started by adding your first sports facility
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddNewVenue}
                  >
                    Add Your First Venue
                  </Button>
                </Box>
              ) : (
                <>
                  <Box 
                    sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, 
                      gap: 3,
                      mb: 4 
                    }}
                  >
                    {filteredVenues
                      .slice((currentPage - 1) * VENUES_PER_PAGE, currentPage * VENUES_PER_PAGE)
                      .map((venue) => (
                        <Card key={venue._id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                          {venue.photos && venue.photos.length > 0 ? (
                            <Box
                              sx={{
                                height: 200,
                                position: 'relative',
                                overflow: 'hidden',
                              }}
                            >
                              <img
                                src={venue.photos[0].startsWith('http') 
                                  ? venue.photos[0] 
                                  : `http://localhost:5000${venue.photos[0]}`}
                                alt={venue.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                }}
                                onError={(e) => {
                                  console.error('Image failed to load:', venue.photos[0]);
                                }}
                              />
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                }}
                              >
                                <Chip
                                  label={venue.status}
                                  color={getStatusColor(venue.status) as any}
                                  size="small"
                                />
                              </Box>
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                height: 200,
                                backgroundColor: 'grey.200',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                              }}
                            >
                              <Photo sx={{ fontSize: 40, color: 'grey.400' }} />
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                }}
                              >
                                <Chip
                                  label={venue.status}
                                  color={getStatusColor(venue.status) as any}
                                  size="small"
                                />
                              </Box>
                            </Box>
                          )}
                          
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" component="h2" gutterBottom>
                              {venue.name}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                              <Typography variant="body2" color="text.secondary">
                                {venue.address.city}, {venue.address.state}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Star sx={{ fontSize: 16, color: 'warning.main', mr: 0.5 }} />
                              <Typography variant="body2">
                                {venue.rating.average.toFixed(1)} ({venue.rating.count} reviews)
                              </Typography>
                            </Box>

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {venue.description.length > 100 
                                ? `${venue.description.substring(0, 100)}...` 
                                : venue.description}
                            </Typography>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                              {venue.sportsSupported.slice(0, 3).map((sport, index) => (
                                <Chip 
                                  key={index} 
                                  label={sport} 
                                  size="small" 
                                  variant="outlined"
                                />
                              ))}
                              {venue.sportsSupported.length > 3 && (
                                <Chip 
                                  label={`+${venue.sportsSupported.length - 3} more`} 
                                  size="small" 
                                  variant="outlined" 
                                  color="primary"
                                />
                              )}
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="h6" color="primary">
                                ₹{venue.priceRange.min} - ₹{venue.priceRange.max}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                per hour
                              </Typography>
                            </Box>
                          </CardContent>

                          <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                            <Button
                              startIcon={<Visibility />}
                              size="small"
                              variant="outlined"
                              onClick={() => navigate(`/venue/${venue._id}`)}
                            >
                              View
                            </Button>
                            <Button
                              startIcon={<Edit />}
                              size="small"
                              variant="contained"
                              onClick={() => handleEditVenue(venue._id)}
                            >
                              Edit
                            </Button>
                            <Button
                              startIcon={<Delete />}
                              size="small"
                              color="error"
                              onClick={() => handleDeleteVenue(venue._id, venue.name)}
                            >
                              Delete
                            </Button>
                          </Box>
                        </Card>
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
            </>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Analytics Dashboard
          </Typography>
          <Alert severity="info">
            Analytics features coming soon! Track your venue performance, booking statistics, and revenue insights.
          </Alert>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Account Settings
          </Typography>
          <Alert severity="info">
            Settings panel coming soon! Manage your account preferences, notification settings, and business information.
          </Alert>
        </TabPanel>
      </Container>
    </Box>
  );
};

export default FacilityOwnerDashboard;
