import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Pagination,
  Rating,
  Divider
} from '@mui/material';
import { Star, CalendarToday, LocationOn, Payment } from '@mui/icons-material';
import { format } from 'date-fns';
import { formatCurrency } from '../utils/currency';
import ReviewForm from './ReviewForm';

interface Venue {
  _id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
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
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: string;
  paymentDetails: {
    paymentStatus: string;
  };
  createdAt: string;
}

interface BookingsResponse {
  success: boolean;
  data: {
    bookings: Booking[];
    pagination: {
      current: number;
      total: number;
      count: number;
      totalBookings: number;
    };
  };
  message?: string;
}

interface ReviewEligibleBookingsProps {
  onReviewSubmitted?: () => void;
}

const ReviewEligibleBookings: React.FC<ReviewEligibleBookingsProps> = ({ onReviewSubmitted }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchEligibleBookings = useCallback(async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please log in.');
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/reviews/user/bookings?page=${pageNum}&limit=6`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      const data: BookingsResponse = await response.json();

      if (data.success) {
        setBookings(data.data.bookings);
        setTotalPages(data.data.pagination.total);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch bookings');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch bookings. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEligibleBookings(page);
  }, [page, fetchEligibleBookings]);

  const handleCreateReview = (booking: Booking) => {
    setSelectedBooking(booking);
    setReviewFormOpen(true);
  };

  const handleReviewSubmit = async (formData: FormData) => {
    try {
      setSubmittingReview(true);
      setError(null);
      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setReviewFormOpen(false);
        setSelectedBooking(null);
        setSuccessMessage('Review submitted successfully! Venue ratings will be updated.');
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(null), 5000);
        // Refresh the bookings list
        fetchEligibleBookings(page);
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
      } else {
        throw new Error(data.message || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Review submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'success';
      case 'confirmed': return 'primary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (bookings.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No bookings available for review
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Complete a booking to leave a review for the venue
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Rate Your Recent Experiences
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Share your feedback on venues you've booked. Your reviews help other users make informed decisions.
      </Typography>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {bookings.map((booking) => {
          console.log('Booking venue photos:', booking.venueId.photos); // Debug log
          return (
          <Card key={booking._id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {booking.venueId.photos && booking.venueId.photos.length > 0 ? (
                <CardMedia
                  component="img"
                  height="200"
                  image={`http://localhost:5000${booking.venueId.photos[0]}`}
                  alt={booking.venueId.name}
                  sx={{ objectFit: 'cover' }}
                  onError={(e) => {
                    console.error('Image failed to load:', `http://localhost:5000${booking.venueId.photos[0]}`);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <Box 
                  sx={{ 
                    height: 200, 
                    backgroundColor: '#f5f5f5', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#999'
                  }}
                >
                  No Image Available
                </Box>
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                    {booking.venueId.name}
                  </Typography>
                  <Chip 
                    label={booking.status}
                    color={getStatusColor(booking.status) as any}
                    size="small"
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {typeof booking.venueId.address === 'string' 
                      ? booking.venueId.address 
                      : `${booking.venueId.address.street}, ${booking.venueId.address.city}, ${booking.venueId.address.state}`}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarToday fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {format(new Date(booking.bookingDate), 'PPP')} • {booking.startTime} - {booking.endTime}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Payment fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {formatCurrency(booking.totalAmount)}
                  </Typography>
                </Box>

                {booking.venueId.rating && booking.venueId.rating.average > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Rating value={booking.venueId.rating.average} readOnly size="small" precision={0.1} />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      Current rating
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <Button
                  variant="contained"
                  startIcon={<Star />}
                  fullWidth
                  onClick={() => handleCreateReview(booking)}
                  sx={{ mt: 'auto' }}
                >
                  Write Review
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(event, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      <ReviewForm
        open={reviewFormOpen}
        onClose={() => {
          setReviewFormOpen(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
        onSubmit={handleReviewSubmit}
        loading={submittingReview}
      />
    </Box>
  );
};

export default ReviewEligibleBookings;
