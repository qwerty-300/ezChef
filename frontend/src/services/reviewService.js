import api from './api';

/**
 * Get all reviews for a specific recipe
 * @param {number|string} recipeId - Recipe ID
 * @returns {Promise} Promise that resolves to an array of reviews
 */
export const getReviewsByRecipe = async (recipeId) => {
  return api.get(`/recipes/${recipeId}/reviews`);
};

/**
 * Get all reviews by a specific user
 * @param {number|string} userId - User ID
 * @returns {Promise} Promise that resolves to an array of reviews
 */
export const getUserReviews = async (userId) => {
  return api.get(`/users/${userId}/reviews`);
};

/**
 * Create a new review
 * @param {Object} reviewData - Review data containing recipeId, rating, comment
 * @returns {Promise} Promise that resolves to the created review
 */
export const createReview = async (reviewData) => {
  return api.post('/reviews', reviewData);
};

/**
 * Update an existing review
 * @param {number|string} reviewId - Review ID
 * @param {Object} reviewData - Updated review data
 * @returns {Promise} Promise that resolves to the updated review
 */
export const updateReview = async (reviewId, reviewData) => {
  return api.put(`/reviews/${reviewId}`, reviewData);
};

/**
 * Delete a review
 * @param {number|string} reviewId - Review ID
 * @returns {Promise} Promise that resolves when the review is deleted
 */
export const deleteReview = async (reviewId) => {
  return api.delete(`/reviews/${reviewId}`);
};

export default {
  getReviewsByRecipe,
  getUserReviews,
  createReview,
  updateReview,
  deleteReview
};