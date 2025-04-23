import React, { useState } from "react";
import {
  Box,
  Paper,
  Rating,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress
} from "@mui/material";
import { useAuth } from "../Auth/AuthContext";

const ReviewForm = ({ recipeId }) => {
  const { currentUser } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rating || !comment.trim()) {
      setError("Please provide both a rating and a comment");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess(false);
    
    try {
      const reviewData = {
        recipeId: recipeId,
        userId: currentUser.userId,
        rating: rating,
        comment: comment,
        date: new Date().toISOString()
      };
      
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to submit review');
      }
      
      setSuccess(true);
      setComment("");
      
      // Reload page after a short delay to show the new review
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Your review has been submitted successfully!
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 2 }}>
          <Typography component="legend">Your Rating</Typography>
          <Rating
            name="recipe-rating"
            value={rating}
            onChange={(event, newValue) => {
              setRating(newValue);
            }}
            precision={1}
            size="large"
          />
        </Box>
        
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Your Review"
          placeholder="Share your experience with this recipe..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={loading}
          sx={{ mb: 2 }}
        />
        
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Submit Review'}
        </Button>
      </form>
    </Paper>
  );
};

export default ReviewForm;