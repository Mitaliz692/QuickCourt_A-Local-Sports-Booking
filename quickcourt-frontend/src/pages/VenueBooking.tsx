import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Rating,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  LocationOn,
  Star,
  Remove,
  Add,
  CalendarToday,
  AccessTime,
  SportsTennis,
  ArrowBack,
  Close,
} from '@mui/icons-material';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/common/Header';
import { Venue } from '../types';

// Utility function to get proper image URL
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

// Replace with your actual Stripe publishable key
const STRIPE_PK = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51Ruztk1tpJG4buBIrQhYYJCRw4FedKNY8hsDKCqp1ntYp8zyq8iUC4HVq8elAI8RjUR8YtO2wWxpt4GBfgPsmd9200uwrPN0pp';

console.log('Stripe PK being used:', STRIPE_PK);

const stripePromise = loadStripe(STRIPE_PK);

interface VenueComponent {
  id: string;
  name: string;
  type: string;
  sport: string;
  isAvailable: boolean;
  pricePerHour: number;
  features: string[];
  image?: string;
}

interface BookingData {
  sport: string;
  date: string;
  startTime: string;
  duration: number;
  selectedComponents: VenueComponent[];
  totalAmount: number;
}

const PaymentForm: React.FC<{
  bookingData: BookingData;
  venue: Venue;
  onPaymentSuccess: () => void;
  onClose: () => void;
}> = ({ bookingData, venue, onPaymentSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Create payment intent on the backend
      const response = await fetch('http://localhost:5000/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          amount: bookingData.totalAmount,
          venueId: venue._id,
          bookingDetails: {
            venueId: venue._id,
            sport: bookingData.sport,
            date: bookingData.date,
            startTime: bookingData.startTime,
            duration: bookingData.duration,
            selectedComponents: bookingData.selectedComponents,
          },
        }),
      });

      const paymentData = await response.json();

      if (!paymentData.success) {
        throw new Error(paymentData.message || 'Failed to create payment');
      }

      // Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        paymentData.data.clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message || 'Payment failed');
      }

      if (paymentIntent?.status === 'succeeded') {
        // Confirm booking on backend
        const confirmResponse = await fetch('http://localhost:5000/api/payments/confirm-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            bookingDetails: {
              venueId: venue._id,
              sport: bookingData.sport,
              date: bookingData.date,
              startTime: bookingData.startTime,
              duration: bookingData.duration,
              selectedComponents: bookingData.selectedComponents,
            },
          }),
        });

        const confirmData = await confirmResponse.json();

        if (confirmData.success) {
          onPaymentSuccess();
        } else {
          throw new Error(confirmData.message || 'Failed to confirm booking');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {/* Booking Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Booking Summary
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2">
              <strong>Venue:</strong> {venue.name}
            </Typography>
            <Typography variant="body2">
              <strong>Sport:</strong> {bookingData.sport}
            </Typography>
            <Typography variant="body2">
              <strong>Date:</strong> {bookingData.date}
            </Typography>
            <Typography variant="body2">
              <strong>Time:</strong> {bookingData.startTime}
            </Typography>
            <Typography variant="body2">
              <strong>Duration:</strong> {bookingData.duration} hour(s)
            </Typography>
            <Typography variant="body2">
              <strong>Selected Facilities:</strong>
            </Typography>
            {bookingData.selectedComponents.map((component) => (
              <Box key={component.id} sx={{ ml: 2 }}>
                <Typography variant="body2">
                  • {component.name} - ₹{component.pricePerHour}/hr × {bookingData.duration}hr = ₹{component.pricePerHour * bookingData.duration}
                </Typography>
              </Box>
            ))}
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6" color="primary">
              <strong>Total: ₹{bookingData.totalAmount}</strong>
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Payment Details
          </Typography>
          <Box sx={{ mt: 2 }}>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                },
              }}
            />
          </Box>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Payment Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={processing}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={!stripe || processing || bookingData.selectedComponents.length === 0}
          sx={{ minWidth: 200 }}
        >
          {processing ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Processing...
            </>
          ) : (
            `Pay ₹${bookingData.totalAmount}`
          )}
        </Button>
      </Box>
    </Box>
  );
};

// Function to generate venue components based on venue data and sport
const getVenueComponents = (venue: Venue | null, sport: string): VenueComponent[] => {
  if (!venue || !venue.sportsSupported.includes(sport)) {
    return [];
  }

  // Generate components based on sport and venue facilities
  const components: VenueComponent[] = [];
  const basePrice = venue.priceRange?.min || 500;
  
  // Generate different types of courts/fields based on sport
  switch (sport) {
    case 'Badminton':
      for (let i = 1; i <= 3; i++) {
        components.push({
          id: `${venue._id}-bad-court-${i}`,
          name: `Badminton Court ${i}`,
          type: i === 2 ? 'Premium Court' : 'Standard Court',
          sport: 'Badminton',
          isAvailable: i !== 3, // Make court 3 unavailable for demo
          pricePerHour: i === 2 ? basePrice + 150 : basePrice,
          features: ['Wooden Floor', 'LED Lighting', 'Professional Net', ...(i === 2 ? ['Air Conditioning', 'Sound System'] : [])]
        });
      }
      break;
      
    case 'Tennis':
      for (let i = 1; i <= 2; i++) {
        components.push({
          id: `${venue._id}-ten-court-${i}`,
          name: `Tennis Court ${i}`,
          type: i === 1 ? 'Clay Court' : 'Hard Court',
          sport: 'Tennis',
          isAvailable: true,
          pricePerHour: basePrice + 250,
          features: i === 1 ? ['Clay Surface', 'Floodlights', 'Professional Net'] : ['Hard Surface', 'Floodlights', 'Professional Net', 'Line Calling System']
        });
      }
      break;
      
    case 'Basketball':
      components.push({
        id: `${venue._id}-bas-court-1`,
        name: 'Basketball Court',
        type: 'Full Court',
        sport: 'Basketball',
        isAvailable: true,
        pricePerHour: basePrice + 450,
        features: ['Indoor Court', 'Professional Hoops', 'Scoreboards', 'Sound System']
      });
      break;
      
    case 'Football':
      components.push({
        id: `${venue._id}-foot-field-1`,
        name: 'Football Field (5-a-side)',
        type: '5-a-side',
        sport: 'Football',
        isAvailable: true,
        pricePerHour: basePrice + 650,
        features: ['Artificial Grass', 'Floodlights', 'Goals', 'Changing Rooms']
      });
      if (venue.amenities && venue.amenities.length > 2) {
        components.push({
          id: `${venue._id}-foot-field-2`,
          name: 'Football Field (7-a-side)',
          type: '7-a-side',
          sport: 'Football',
          isAvailable: true,
          pricePerHour: basePrice + 950,
          features: ['Artificial Grass', 'Floodlights', 'Goals', 'Changing Rooms', 'Spectator Area']
        });
      }
      break;
      
    default:
      // Generic court for other sports
      components.push({
        id: `${venue._id}-generic-1`,
        name: `${sport} Court 1`,
        type: 'Standard Court',
        sport: sport,
        isAvailable: true,
        pricePerHour: basePrice,
        features: ['Professional Equipment', 'Good Lighting', 'Changing Rooms']
      });
      break;
  }

  return components;
};

const VenueBooking: React.FC = () => {
  const { venueId } = useParams<{ venueId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [venueComponents, setVenueComponents] = useState<VenueComponent[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  
  const [bookingData, setBookingData] = useState<BookingData>({
    sport: '',
    date: '',
    startTime: '',
    duration: 1,
    selectedComponents: [],
    totalAmount: 0
  });

  // Generate time slots
  const timeSlots = [];
  for (let hour = 6; hour <= 22; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 22) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

  // Load venue data
  useEffect(() => {
    const fetchVenue = async () => {
      if (!venueId) {
        setError('Venue ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/venues/${venueId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch venue');
        }
        
        const data = await response.json();
        setVenue(data.data.venue);
        setError(null);
      } catch (err) {
        setError('Failed to load venue data');
        console.error('Error fetching venue:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVenue();
  }, [venueId]);

  // Load venue components when sport changes
  useEffect(() => {
    if (bookingData.sport && venue) {
      setVenueComponents(getVenueComponents(venue, bookingData.sport));
      // Clear selected components when sport changes
      setBookingData(prev => ({ ...prev, selectedComponents: [] }));
    }
  }, [bookingData.sport, venue]);

  // Calculate total amount
  useEffect(() => {
    if (bookingData.selectedComponents.length > 0) {
      const total = bookingData.selectedComponents.reduce((sum, component) => {
        return sum + (component.pricePerHour * bookingData.duration);
      }, 0);
      setBookingData(prev => ({ ...prev, totalAmount: total }));
    } else {
      setBookingData(prev => ({ ...prev, totalAmount: 0 }));
    }
  }, [bookingData.selectedComponents, bookingData.duration]);

  // Handle component selection
  const handleComponentSelection = (component: VenueComponent) => {
    if (!component.isAvailable) return;
    
    setBookingData(prev => {
      const isSelected = prev.selectedComponents.find(c => c.id === component.id);
      
      if (isSelected) {
        // Remove component if already selected
        return {
          ...prev,
          selectedComponents: prev.selectedComponents.filter(c => c.id !== component.id)
        };
      } else {
        // Add component if not selected
        return {
          ...prev,
          selectedComponents: [...prev.selectedComponents, component]
        };
      }
    });
  };

  const handlePayment = () => {
    if (bookingData.selectedComponents.length === 0) {
      alert('Please select at least one facility to book');
      return;
    }
    if (!bookingData.date || !bookingData.startTime) {
      alert('Please select date and time');
      return;
    }
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setBookingSuccess(true);
  };

  const handleBookingComplete = () => {
    navigate('/dashboard');
  };

  if (!user) {
    return (
      <Box>
        <Header />
        <Container sx={{ py: 4 }}>
          <Alert severity="warning">
            Please log in to book a venue.
          </Alert>
        </Container>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box>
        <Header />
        <Container sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      </Box>
    );
  }

  if (error || !venue) {
    return (
      <Box>
        <Header />
        <Container sx={{ py: 4 }}>
          <Alert severity="error">{error || 'Venue not found'}</Alert>
          <Button
            variant="outlined"
            onClick={() => navigate('/book-venue')}
            sx={{ mt: 2 }}
            startIcon={<ArrowBack />}
          >
            Back to Venues
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Back Button */}
        <Button
          variant="outlined"
          onClick={() => navigate('/book-venue')}
          sx={{ mb: 3 }}
          startIcon={<ArrowBack />}
        >
          Back to Venues
        </Button>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          {/* Left Side - Booking Form */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Book Your Slot
            </Typography>

            <Paper sx={{ p: 3 }}>
              <Stack spacing={3}>
                {/* Sport Selection */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Sport
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={bookingData.sport}
                      onChange={(e) => setBookingData(prev => ({ ...prev, sport: e.target.value }))}
                      displayEmpty
                    >
                      <MenuItem value="">Select Sport</MenuItem>
                      {venue.sportsSupported?.map((sport) => (
                        <MenuItem key={sport} value={sport}>
                          {sport}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Date Selection */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Date
                  </Typography>
                  <TextField
                    type="date"
                    fullWidth
                    value={bookingData.date}
                    onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                  />
                </Box>

                {/* Time Selection */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Start Time
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={bookingData.startTime}
                      onChange={(e) => setBookingData(prev => ({ ...prev, startTime: e.target.value }))}
                      displayEmpty
                    >
                      <MenuItem value="">Select Time</MenuItem>
                      {timeSlots.map((time) => (
                        <MenuItem key={time} value={time}>
                          {time}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Duration Selection */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Duration (Hours)
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton
                      onClick={() => setBookingData(prev => ({ 
                        ...prev, 
                        duration: Math.max(1, prev.duration - 1) 
                      }))}
                      disabled={bookingData.duration <= 1}
                    >
                      <Remove />
                    </IconButton>
                    <Typography variant="h6" sx={{ minWidth: 40, textAlign: 'center' }}>
                      {bookingData.duration}
                    </Typography>
                    <IconButton
                      onClick={() => setBookingData(prev => ({ 
                        ...prev, 
                        duration: Math.min(8, prev.duration + 1) 
                      }))}
                      disabled={bookingData.duration >= 8}
                    >
                      <Add />
                    </IconButton>
                  </Box>
                </Box>

                {/* Venue Components Selection */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Available {bookingData.sport} Facilities
                  </Typography>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Select the courts/facilities you want to book
                  </Typography>
                  
                  {venueComponents.length > 0 ? (
                    <Stack spacing={2} sx={{ mt: 2 }}>
                      {venueComponents.map((component) => (
                        <Card
                          key={component.id}
                          sx={{
                            cursor: component.isAvailable ? 'pointer' : 'not-allowed',
                            opacity: component.isAvailable ? 1 : 0.5,
                            border: bookingData.selectedComponents.find(c => c.id === component.id)
                              ? '2px solid'
                              : '1px solid',
                            borderColor: bookingData.selectedComponents.find(c => c.id === component.id)
                              ? 'success.main'
                              : 'divider',
                            '&:hover': component.isAvailable ? {
                              borderColor: 'primary.main',
                              boxShadow: 2
                            } : {}
                          }}
                          onClick={() => handleComponentSelection(component)}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" component="h3" fontWeight="bold">
                                  {component.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {component.type} • {component.sport}
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="h6" color="primary" fontWeight="bold">
                                  ₹{component.pricePerHour}/hr
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  color={component.isAvailable ? 'success.main' : 'error.main'}
                                  fontWeight="bold"
                                >
                                  {component.isAvailable ? 'Available' : 'Unavailable'}
                                </Typography>
                              </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                              {component.features.map((feature, index) => (
                                <Chip
                                  key={index}
                                  label={feature}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              ))}
                            </Box>
                            
                            {bookingData.selectedComponents.find(c => c.id === component.id) && (
                              <Box sx={{ 
                                mt: 1, 
                                p: 1, 
                                bgcolor: 'success.50', 
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'success.main'
                              }}>
                                <Typography variant="caption" color="success.main" fontWeight="bold">
                                  ✓ Selected for {bookingData.duration} hour(s) = ₹{component.pricePerHour * bookingData.duration}
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  ) : (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      No facilities available for {bookingData.sport}. Please select a different sport.
                    </Alert>
                  )}
                </Box>

                {/* Booking Summary and Payment Button */}
                {bookingData.selectedComponents.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Card sx={{ bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.main' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Booking Summary
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          {bookingData.selectedComponents.map((component) => (
                            <Typography key={component.id} variant="body2">
                              {component.name}: ₹{component.pricePerHour} × {bookingData.duration}hr = ₹{component.pricePerHour * bookingData.duration}
                            </Typography>
                          ))}
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="h6" color="primary" fontWeight="bold">
                          Total: ₹{bookingData.totalAmount}
                        </Typography>
                        <Button
                          variant="contained"
                          fullWidth
                          size="large"
                          onClick={handlePayment}
                          sx={{ mt: 2 }}
                        >
                          Proceed to Payment
                        </Button>
                      </CardContent>
                    </Card>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Box>

          {/* Right Side - Venue Info */}
          <Box sx={{ flex: 1, maxWidth: { md: 400 } }}>
            <Card>
              {venue.photos && venue.photos.length > 0 && (
                <Box
                  component="img"
                  sx={{
                    height: 200,
                    width: '100%',
                    objectFit: 'cover',
                  }}
                  src={getVenueImageUrl(venue.photos)}
                  alt={venue.name}
                />
              )}
              <CardContent>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  {venue.name}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {venue.address.street}, {venue.address.city}, {venue.address.state} {venue.address.zipCode}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Rating value={venue.rating.average} precision={0.1} size="small" readOnly />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {venue.rating.average} ({venue.rating.count} reviews)
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {venue.description}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                  Sports Available
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {venue.sportsSupported?.map((sport) => (
                    <Chip key={sport} label={sport} size="small" variant="outlined" />
                  ))}
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  Amenities
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {venue.amenities?.map((amenity) => (
                    <Chip key={amenity} label={amenity} size="small" />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Payment Dialog */}
        <Dialog
          open={showPayment}
          onClose={() => setShowPayment(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              Payment
              <IconButton onClick={() => setShowPayment(false)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Elements stripe={stripePromise}>
              <PaymentForm
                bookingData={bookingData}
                venue={venue}
                onPaymentSuccess={handlePaymentSuccess}
                onClose={() => setShowPayment(false)}
              />
            </Elements>
          </DialogContent>
        </Dialog>

        {/* Success Dialog */}
        <Dialog
          open={bookingSuccess}
          onClose={handleBookingComplete}
        >
          <DialogTitle>Booking Confirmed!</DialogTitle>
          <DialogContent>
            <Alert severity="success">
              Your booking has been confirmed. You will receive a confirmation email shortly.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={handleBookingComplete}>
              Continue
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default VenueBooking;
