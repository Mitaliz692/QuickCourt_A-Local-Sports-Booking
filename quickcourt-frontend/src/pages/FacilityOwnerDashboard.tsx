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
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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

interface Venue {
  _id: string;
  name: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  sportsSupported: string[];
  photos: string[];
  rating: {
    average: number;
    count: number;
  };
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  isActive: boolean;
  priceRange: {
    min: number;
    max: number;
  };
  createdAt: string;
}

const FacilityOwnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tabValue, setTabValue] = useState(0);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch venues');
      console.error('Fetch venues error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout(); // Use the AuthContext logout function
    navigate('/');
    handleMenuClose();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'suspended': return 'secondary';
      default: return 'success'; // Default to success since venues auto-approve
    }
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
        // Remove the venue from the local state
        setVenues(prevVenues => prevVenues.filter(venue => venue._id !== venueId));
        // Show success message (you can replace this with a proper notification system)
        alert('Venue deleted successfully!');
      } else {
        alert('Failed to delete venue: ' + data.message);
      }
    } catch (err) {
      console.error('Delete venue error:', err);
      alert('Failed to delete venue. Please try again.');
    }
  };

  const dashboardStats = {
    totalVenues: venues.length,
    activeVenues: venues.filter(v => v.status === 'approved' && v.isActive).length,
    rejectedVenues: venues.filter(v => v.status === 'rejected').length,
    averageRating: venues.length > 0 
      ? (venues.reduce((sum, v) => sum + v.rating.average, 0) / venues.length).toFixed(1)
      : '0.0',
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* App Bar */}
      <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <Dashboard sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            QuickCourt - Facility Owner Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              Welcome, {user?.fullName || 'User'}
            </Typography>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.fullName?.charAt(0) || 'U'}
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
              <MenuItem onClick={handleMenuClose}>
                <AccountCircle sx={{ mr: 1 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Dashboard Stats */}
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, 
            gap: 3, 
            mb: 4 
          }}
        >
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Venues
              </Typography>
              <Typography variant="h4" component="div">
                {dashboardStats.totalVenues}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Venues
              </Typography>
              <Typography variant="h4" component="div" color="success.main">
                {dashboardStats.activeVenues}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Rejected Venues
              </Typography>
              <Typography variant="h4" component="div" color="error.main">
                {dashboardStats.rejectedVenues}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Rating
              </Typography>
              <Typography variant="h4" component="div">
                <Star sx={{ mr: 1, color: 'gold' }} />
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
          ) : venues.length === 0 ? (
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
            <Box 
              sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, 
                gap: 3 
              }}
            >
              {venues.map((venue) => {
                return (
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
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'grey.100',
                          position: 'relative',
                          border: '2px dashed',
                          borderColor: 'grey.300',
                        }}
                      >
                        <Photo sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                        <Typography variant="body2" color="grey.500" textAlign="center">
                          No images uploaded
                        </Typography>
                        <Typography variant="caption" color="grey.400" textAlign="center">
                          Upload images during registration
                        </Typography>
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
                      <Typography gutterBottom variant="h6" component="div">
                        {venue.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {venue.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOn sx={{ mr: 1, fontSize: 16, color: 'grey.500' }} />
                        <Typography variant="body2" color="text.secondary">
                          {venue.address.city}, {venue.address.state}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Star sx={{ mr: 1, fontSize: 16, color: 'gold' }} />
                        <Typography variant="body2">
                          {venue.rating.average.toFixed(1)} ({venue.rating.count} reviews)
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        {venue.sportsSupported.slice(0, 3).map((sport) => (
                          <Chip
                            key={sport}
                            label={sport}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                        {venue.sportsSupported.length > 3 && (
                          <Chip
                            label={`+${venue.sportsSupported.length - 3} more`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        ₹{venue.priceRange.min} - ₹{venue.priceRange.max} / hour
                      </Typography>
                    </CardContent>
                    <Divider />
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                      <Button
                        startIcon={<Visibility />}
                        size="small"
                        onClick={() => navigate(`/venue/${venue._id}`)}
                      >
                        View
                      </Button>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          startIcon={<Edit />}
                          size="small"
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
                    </Box>
                  </Card>
                );
              })}
            </Box>
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
