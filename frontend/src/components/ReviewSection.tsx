import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Rating,
  TextField,
  Button,
  Stack,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import { Favorite, FavoriteBorder, Reply as ReplyIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { formatDistanceToNow } from 'date-fns';

interface User {
  _id: string;
  name: string;
  avatar: string;
}

interface Review {
  _id: string;
  userId: User;
  rating: number;
  comment: string;
  createdAt: string;
  likes: number; // Placeholder for future enhancement if needed
}

interface Reply {
  _id: string;
  userId: User;
  comment: string;
  createdAt: string;
}

const ReviewSection: React.FC<{ productId: string }> = ({ productId }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [replies, setReplies] = useState<{ [reviewId: string]: Reply[] }>({});
  const [replyInputs, setReplyInputs] = useState<{ [reviewId: string]: string }>({});
  const [likes, setLikes] = useState<{ [reviewId: string]: boolean }>({});
  const { socket, isConnected } = useSocket();

  const API_URL = import.meta.env.VITE_REALTIME_URL || 'http://localhost:5006';

  const fetchReviews = async () => {
    try {
      const { data } = await api.get(`/api/v1/reviews/product/${productId}`, { baseURL: API_URL });
      setReviews(data);
      // Fetch replies for each review
      data.forEach((review: Review) => fetchReplies(review._id));
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    }
  };

  const fetchReplies = async (reviewId: string) => {
    try {
      const { data } = await api.get(`/api/v1/replies/review/${reviewId}`, { baseURL: API_URL });
      setReplies((prev) => ({ ...prev, [reviewId]: data }));
    } catch (err) {
      console.error('Failed to fetch replies', err);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    try {
      await api.post(
        `/api/v1/reviews`,
        { productId, ...newReview },
        { baseURL: API_URL }
      );
      setNewReview({ rating: 5, comment: '' });
      fetchReviews();
    } catch (err) {
      console.error('Failed to submit review', err);
    }
  };

  const handleToggleLike = async (reviewId: string) => {
    if (!isAuthenticated) return;
    try {
      const { data } = await api.post(
        `/api/v1/reviews/${reviewId}/like`,
        {},
        { baseURL: API_URL }
      );
      setLikes((prev) => ({ ...prev, [reviewId]: data.liked }));
    } catch (err) {
      console.error('Failed to toggle like', err);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!isAdmin()) return;
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await api.delete(`/api/v1/reviews/${reviewId}`, { baseURL: API_URL });
      fetchReviews();
    } catch (err) {
      console.error('Failed to delete review', err);
    }
  };

  const handleSubmitReply = async (reviewId: string) => {
    if (!isAuthenticated || !replyInputs[reviewId]) return;
    try {
      await api.post(
        `/api/v1/replies`,
        { reviewId, comment: replyInputs[reviewId] },
        { baseURL: API_URL }
      );
      setReplyInputs((prev) => ({ ...prev, [reviewId]: '' }));
      fetchReplies(reviewId);
    } catch (err) {
      console.error('Failed to submit reply', err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  useEffect(() => {
    if (!socket || !isConnected) return;
    
    socket.emit('joinProductRoom', productId);

    const onUpdate = () => {
      fetchReviews();
    };

    socket.on('review:updated', onUpdate);

    return () => {
      socket.emit('leaveProductRoom', productId);
      socket.off('review:updated', onUpdate);
    };
  }, [socket, isConnected, productId]);

  return (
    <Box sx={{ mt: 10 }}>
      <Typography variant="h4" sx={{ fontFamily: 'Montserrat', mb: 4 }}>Reviews & Discussion</Typography>

      {/* New Review Form */}
      {isAuthenticated ? (
        <Paper sx={{ p: 3, mb: 6, borderRadius: 0, bgcolor: 'action.hover' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Write a Review</Typography>
          <Box component="form" onSubmit={handleSubmitReview}>
            <Stack spacing={2}>
              <Box>
                <Typography component="legend" variant="body2">Rating</Typography>
                <Rating
                  value={newReview.rating}
                  onChange={(_, value) => setNewReview({ ...newReview, rating: value || 5 })}
                />
              </Box>
              <TextField
                multiline
                rows={3}
                placeholder="Share your thoughts about this tea..."
                fullWidth
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                sx={{ bgcolor: 'background.paper' }}
              />
              <Button type="submit" variant="contained" disabled={!newReview.comment} sx={{ width: 'fit-content' }}>
                Post Review
              </Button>
            </Stack>
          </Box>
        </Paper>
      ) : (
        <Alert severity="info" sx={{ mb: 6 }}>Please log in to share your review.</Alert>
      )}

      {/* Reviews List */}
      <Stack spacing={4}>
        {reviews.length === 0 ? (
          <Typography color="text.secondary">No reviews yet. Be the first to review!</Typography>
        ) : (
          reviews.map((review) => (
            <Box key={review._id}>
              <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                <Avatar src={review.userId?.avatar}>{review.userId?.name?.[0]}</Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{review.userId?.name}</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Rating value={review.rating} size="small" readOnly />
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
              <Typography sx={{ mb: 2, pl: 7 }}>{review.comment}</Typography>
              
              {/* Review Actions */}
              <Stack direction="row" spacing={2} sx={{ pl: 7, mb: 2 }}>
                <Tooltip title="Helpful">
                  <IconButton size="small" onClick={() => handleToggleLike(review._id)} color={likes[review._id] ? 'primary' : 'default'}>
                    {likes[review._id] ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
                  </IconButton>
                </Tooltip>
                <Typography variant="body2" sx={{ ml: 0.5, mr: 2, display: 'flex', alignItems: 'center' }}>
                  {review.likes || 0}
                </Typography>
                {isAdmin && isAdmin() && (
                  <Tooltip title="Delete Review">
                    <IconButton size="small" onClick={() => handleDeleteReview(review._id)} color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                {/* Reply logic... */}
              </Stack>

              {/* Replies */}
              <Box sx={{ pl: 7, borderLeft: '2px solid', borderColor: 'action.hover' }}>
                {replies[review._id]?.map((reply) => (
                  <Box key={reply._id} sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: '12px' }}>{reply.userId?.name?.[0]}</Avatar>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{reply.userId?.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                      </Typography>
                    </Stack>
                    <Typography variant="body2">{reply.comment}</Typography>
                  </Box>
                ))}

                {/* Reply Input */}
                {isAuthenticated && (
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <TextField
                      size="small"
                      placeholder="Write a reply..."
                      fullWidth
                      value={replyInputs[review._id] || ''}
                      onChange={(e) => setReplyInputs({ ...replyInputs, [review._id]: e.target.value })}
                    />
                    <IconButton color="primary" onClick={() => handleSubmitReply(review._id)} disabled={!replyInputs[review._id]}>
                      <ReplyIcon />
                    </IconButton>
                  </Stack>
                )}
              </Box>
              <Divider sx={{ mt: 4 }} />
            </Box>
          ))
        )}
      </Stack>
    </Box>
  );
};

export default ReviewSection;
