import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Pagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import ReviewCard from './ReviewCard';

interface Review {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
  };
  venueId: {
    _id: string;
    name: string;
  };
  bookingId: {
    _id: string;
    bookingDate: string;
    startTime: string;
    totalAmount: number;
  };
  rating: number;
  title: string;
  comment: string;
  aspects: {
    cleanliness: number;
    facilities: number;
    staff: number;
    value: number;
  };
  photos: Array<{
    url: string;
    caption?: string;
  }>;
  isVerified: boolean;
  helpful: number;
  createdAt: string;
  updatedAt: string;
}

interface ReviewsResponse {
  success: boolean;
  data: {
    reviews: Review[];
    pagination: {
      current: number;
      total: number;
      count: number;
      totalReviews: number;
    };
  };
  message?: string;
}

interface UserReviewsProps {
  refreshTrigger?: number;
}

const UserReviews: React.FC<UserReviewsProps> = ({ refreshTrigger }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [editFormData, setEditFormData] = useState({
    rating: 0,
    title: '',
    comment: '',
    aspects: {
      cleanliness: 0,
      facilities: 0,
      staff: 0,
      value: 0
    }
  });

  const fetchUserReviews = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/reviews/user?page=${pageNum}&limit=5`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data: ReviewsResponse = await response.json();

      if (data.success) {
        setReviews(data.data.reviews);
        setTotalPages(data.data.pagination.total);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch reviews');
      }
    } catch (err) {
      setError('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserReviews(page);
  }, [page, refreshTrigger]);

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setEditFormData({
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      aspects: review.aspects
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingReview) return;

    try {
      const formData = new FormData();
      formData.append('rating', editFormData.rating.toString());
      formData.append('title', editFormData.title);
      formData.append('comment', editFormData.comment);
      formData.append('aspects', JSON.stringify(editFormData.aspects));

      const response = await fetch(`http://localhost:5000/api/reviews/${editingReview._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setEditDialogOpen(false);
        setEditingReview(null);
        fetchUserReviews(page);
      } else {
        throw new Error(data.message || 'Failed to update review');
      }
    } catch (err) {
      console.error('Edit review error:', err);
    }
  };

  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;

    try {
      const response = await fetch(`http://localhost:5000/api/reviews/${reviewToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setDeleteDialogOpen(false);
        setReviewToDelete(null);
        fetchUserReviews(page);
      } else {
        throw new Error(data.message || 'Failed to delete review');
      }
    } catch (err) {
      console.error('Delete review error:', err);
    }
  };

  const handleDeleteClick = (review: Review) => {
    setReviewToDelete(review);
    setDeleteDialogOpen(true);
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

  if (reviews.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No reviews yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your reviews will appear here after you rate venues
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Your Reviews ({reviews.length})
      </Typography>

      {reviews.map((review) => (
        <Box key={review._id} sx={{ position: 'relative', mb: 2 }}>
          <ReviewCard 
            review={review} 
            showVenueName={true}
          />
          <Box sx={{ 
            position: 'absolute', 
            top: 16, 
            right: 16, 
            display: 'flex', 
            gap: 1,
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderRadius: 1,
            p: 0.5
          }}>
            <Button
              size="small"
              startIcon={<Edit />}
              onClick={() => handleEditReview(review)}
              sx={{ minWidth: 'auto', px: 1 }}
            >
              Edit
            </Button>
            <Button
              size="small"
              color="error"
              startIcon={<Delete />}
              onClick={() => handleDeleteClick(review)}
              sx={{ minWidth: 'auto', px: 1 }}
            >
              Delete
            </Button>
          </Box>
        </Box>
      ))}

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

      {/* Edit Review Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Review</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Overall Rating
            </Typography>
            <Rating
              value={editFormData.rating}
              onChange={(event, newValue) => 
                setEditFormData(prev => ({ ...prev, rating: newValue || 0 }))
              }
              size="large"
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Review Title"
              value={editFormData.title}
              onChange={(e) => 
                setEditFormData(prev => ({ ...prev, title: e.target.value }))
              }
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Review Comment"
              multiline
              rows={4}
              value={editFormData.comment}
              onChange={(e) => 
                setEditFormData(prev => ({ ...prev, comment: e.target.value }))
              }
              sx={{ mb: 2 }}
            />

            <Typography variant="subtitle2" gutterBottom>
              Detailed Ratings
            </Typography>
            {Object.entries(editFormData.aspects).map(([key, value]) => (
              <Box key={key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ minWidth: '100px', textTransform: 'capitalize' }}>
                  {key}
                </Typography>
                <Rating
                  value={value}
                  onChange={(event, newValue) => 
                    setEditFormData(prev => ({
                      ...prev,
                      aspects: { ...prev.aspects, [key]: newValue || 0 }
                    }))
                  }
                  size="small"
                />
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Review</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete your review for "{reviewToDelete?.venueId.name}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteReview} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserReviews;
