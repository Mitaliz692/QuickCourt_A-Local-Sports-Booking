import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  Avatar,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Paper,
  Divider,
  Stack,
  Tabs,
  Tab,
  Chip,
  Alert,
  CircularProgress,
  CardContent,
  CardMedia,
  Grid,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Phone,
  Edit,
  Save,
  Cancel,
  Upload,
  BookOnline,
  LocationOn,
  AccessTime,
  SportsTennis,
  Receipt,
  CheckCircle,
  CancelOutlined,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/common/Header';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface BookingStats {
  totalBookings: number;
  upcomingBookings: number;
  completedBookings: number;
}

interface VenueComponent {
  id: string;
  name: string;
  type: string;
  sport: string;
  pricePerHour: number;
  features: string[];
  isAvailable: boolean;
}

interface Venue {
  _id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  photos: string[];
  rating: {
    average: number;
    count: number;
  };
}

interface Booking {
  _id: string;
  venueId: Venue;
  sport: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  selectedComponents: VenueComponent[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  paymentDetails: {
    transactionId: string;
    paymentMethod: string;
    paymentStatus: string;
    paidAmount: number;
  };
  createdAt: string;
}

const UserProfile: React.FC = () => {
  const { user, isAuthenticated, logout, updateUser, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingStats, setBookingStats] = useState<BookingStats>({
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
  });
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Refresh user data when component mounts to get latest verification status
  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
    }
  }, [isAuthenticated, refreshUser]);

  const [formData, setFormData] = useState<FormData>({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const fetchBookings = useCallback(async () => {
    try {
      setLoadingBookings(true);
      const response = await fetch('http://localhost:5000/api/bookings/my-bookings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setBookings(data.data.bookings);
      } else {
        setBookingError(data.message);
      }
    } catch (error) {
      setBookingError('Failed to load bookings');
      console.error('Error fetching bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  const fetchBookingStats = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/bookings/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setBookingStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching booking stats:', error);
    }
  }, []);

  // Fetch booking data on component mount
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchBookings();
      fetchBookingStats();
    }
  }, [isAuthenticated, user, fetchBookings, fetchBookingStats]);

  // Update form data when user data changes
  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'completed':
        return 'primary';
      case 'cancelled':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle />;
      case 'completed':
        return <CheckCircle />;
      case 'cancelled':
        return <CancelOutlined />;
      default:
        return <AccessTime />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getVenueImageUrl = (photos: string[] | undefined): string => {
    if (!photos || photos.length === 0) {
      return '/placeholder-venue.svg';
    }
    
    const photo = photos[0];
    if (photo.startsWith('http')) {
      return photo;
    }
    
    if (photo.startsWith('/')) {
      return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${photo}`;
    }
    
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/${photo}`;
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        // Refresh bookings after cancellation
        fetchBookings();
        alert('Booking cancelled successfully');
      } else {
        alert('Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // Here you would typically save the data to your backend
      console.log('Saving profile data:', formData);
      
      // Update the user in the auth context (you might want to make an API call here)
      if (user) {
        const updatedUser = {
          ...user,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        };
        updateUser(updatedUser);
      }
      
      setIsEditing(false);
      
      // Clear password fields after saving
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      
      // Show success message (you might want to use a proper notification system)
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    // Reset form data to original user values
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setIsEditing(false);
  };

  const toggleCurrentPasswordVisibility = () => {
    setShowCurrentPassword(!showCurrentPassword);
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Show loading if user data is not yet available
  if (!user && isAuthenticated) {
    return (
      <>
        <Header 
          isAuthenticated={isAuthenticated}
          onLogout={logout}
        />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
          <Typography variant="h6">Loading profile...</Typography>
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
        <Typography variant="h4" component="h1" gutterBottom>
          My Profile
        </Typography>

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {/* Left Panel - User Info */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33%' }, minWidth: 0 }}>
            <Card sx={{ textAlign: 'center', p: 3 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  fontSize: '3rem',
                  bgcolor: 'primary.main',
                }}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user?.fullName?.charAt(0).toUpperCase() || 'U'
                )}
              </Avatar>
              
              <Typography variant="h5" gutterBottom>
                {formData.fullName}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {formData.email}
              </Typography>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                Role: {user?.role?.replace('_', ' ').toUpperCase()}
              </Typography>

              <Typography 
                variant="body2" 
                color={user?.isVerified ? "success.main" : "warning.main"} 
                gutterBottom
              >
                {user?.isVerified ? "✓ Verified Account" : "⚠ Account Not Verified"}
              </Typography>

              <Button
                variant={isEditing ? "outlined" : "contained"}
                startIcon={<Edit />}
                onClick={handleEdit}
                disabled={isEditing}
                sx={{ mt: 2, mb: 3 }}
              >
                Edit Profile
              </Button>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Booking Statistics
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {bookingStats.totalBookings}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Bookings
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">
                    {bookingStats.upcomingBookings}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upcoming
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {bookingStats.completedBookings}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>

          {/* Right Panel - Tabs */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 66%' }, minWidth: 0 }}>
            <Card sx={{ p: 0 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  px: 3,
                  pt: 2,
                }}
              >
                <Tab label="Profile Information" />
                <Tab label="My Bookings" />
              </Tabs>

              {/* Profile Information Tab */}
              {activeTab === 0 && (
                <Box sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
                      Profile Information
                    </Typography>
                  </Box>

                  {/* Avatar Upload Section */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Profile Picture
                    </Typography>
                    <Box
                      sx={{
                        border: '2px dashed #ccc',
                        borderRadius: 2,
                        p: 3,
                        textAlign: 'center',
                        cursor: 'pointer',
                        '&:hover': { borderColor: 'primary.main' },
                      }}
                    >
                      <Upload sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Click to upload or drag and drop
                      </Typography>
                    </Box>
                  </Box>

                  <Box component="form" sx={{ mt: 3 }}>
                    <Stack spacing={3}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person />
                            </InputAdornment>
                          ),
                        }}
                      />

                      <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email />
                            </InputAdornment>
                          ),
                        }}
                      />

                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone />
                            </InputAdornment>
                          ),
                        }}
                      />

                      {isEditing && (
                        <Box>
                          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                            Change Password
                          </Typography>
                          <Stack spacing={2}>
                            <TextField
                              fullWidth
                              label="Current Password"
                              name="currentPassword"
                              type={showCurrentPassword ? 'text' : 'password'}
                              value={formData.currentPassword}
                              onChange={handleInputChange}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton onClick={toggleCurrentPasswordVisibility}>
                                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />

                            <TextField
                              fullWidth
                              label="New Password"
                              name="newPassword"
                              type={showNewPassword ? 'text' : 'password'}
                              value={formData.newPassword}
                              onChange={handleInputChange}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton onClick={toggleNewPasswordVisibility}>
                                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />

                            <TextField
                              fullWidth
                              label="Confirm New Password"
                              name="confirmPassword"
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton onClick={toggleConfirmPasswordVisibility}>
                                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Stack>
                        </Box>
                      )}

                      {isEditing && (
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                          <Button
                            variant="outlined"
                            startIcon={<Cancel />}
                            onClick={handleCancel}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="contained"
                            startIcon={<Save />}
                            onClick={handleSave}
                          >
                            Save
                          </Button>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                </Box>
              )}

              {/* My Bookings Tab */}
              {activeTab === 1 && (
                <Box sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
                      My Bookings
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={fetchBookings}
                      disabled={loadingBookings}
                      startIcon={loadingBookings ? <CircularProgress size={20} /> : undefined}
                    >
                      Refresh
                    </Button>
                  </Box>

                  {loadingBookings ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : bookings.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <SportsTennis sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        No bookings found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Start booking your favorite venues to see them here!
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={2}>
                      {bookings.map((booking) => (
                        <Card key={booking._id} sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                            <CardMedia
                              component="img"
                              sx={{ width: 120, height: 80, borderRadius: 1, mr: 2 }}
                              image={getVenueImageUrl(booking.venueId?.photos)}
                              alt={booking.venueId?.name || 'Venue'}
                            />
                            <CardContent sx={{ flex: 1, py: 0 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Typography variant="h6" component="h3">
                                  {booking.venueId?.name || 'Unknown Venue'}
                                </Typography>
                                <Chip
                                  icon={getStatusIcon(booking.status)}
                                  label={booking.status.toUpperCase()}
                                  color={getStatusColor(booking.status) as any}
                                  size="small"
                                />
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                📍 {booking.venueId?.address?.street ? 
                                  `${booking.venueId.address.street}, ${booking.venueId.address.city}` : 
                                  'Location not available'}
                              </Typography>
                              
                              <Typography variant="body2" gutterBottom>
                                📅 {formatDate(booking.bookingDate)}
                              </Typography>
                              
                              <Typography variant="body2" gutterBottom>
                                ⏰ {booking.startTime} - {booking.endTime}
                              </Typography>
                              
                              <Typography variant="body2" gutterBottom>
                                🏟️ Facilities: {booking.selectedComponents?.map(comp => comp.name).join(', ') || 'N/A'}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                <Typography variant="h6" color="primary">
                                  ₹{booking.totalAmount}
                                </Typography>
                                
                                {booking.status === 'confirmed' && (
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    onClick={() => handleCancelBooking(booking._id)}
                                  >
                                    Cancel Booking
                                  </Button>
                                )}
                              </Box>
                            </CardContent>
                          </Card>
                      ))}
                    </Stack>
                  )}
                </Box>
              )}
            </Card>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default UserProfile;