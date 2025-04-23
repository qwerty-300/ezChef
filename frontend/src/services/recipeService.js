import api from './api';

/**
 * Get all recipes with optional filtering
 * @param {Object} filters - Optional filter parameters (category, region, difficulty, search)
 * @param {string} sort - Sort parameter (newest, oldest, highest_rated, etc.)
 * @returns {Promise} Promise that resolves to an array of recipes
 */
export const getRecipes = async (filters = {}, sort = 'newest') => {
  let queryParams = new URLSearchParams();
  
  // Add filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      queryParams.append(key, value);
    }
  });
  
  // Add sort parameter
  if (sort) {
    queryParams.append('sort', sort);
  }
  
  const queryString = queryParams.toString();
  const endpoint = `/recipes${queryString ? `?${queryString}` : ''}`;
  
  return api.get(endpoint);
};

/**
 * Get a recipe by ID
 * @param {number|string} recipeId - Recipe ID
 * @returns {Promise} Promise that resolves to a recipe object
 */
export const getRecipeById = async (recipeId) => {
  return api.get(`/recipes/${recipeId}`);
};

/**
 * Get recipes for a specific category
 * @param {number|string} categoryId - Category ID
 * @param {Object} filters - Optional filter parameters
 * @returns {Promise} Promise that resolves to an array of recipes
 */
export const getRecipesByCategory = async (categoryId, filters = {}) => {
  let queryParams = new URLSearchParams(filters);
  const queryString = queryParams.toString();
  const endpoint = `/categories/${categoryId}/recipes${queryString ? `?${queryString}` : ''}`;
  
  return api.get(endpoint);
};

/**
 * Get recipes created by a specific user
 * @param {number|string} userId - User ID
 * @returns {Promise} Promise that resolves to an array of recipes
 */
export const getUserRecipes = async (userId) => {
  return api.get(`/users/${userId}/recipes`);
};

/**
 * Create a new recipe
 * @param {Object} recipeData - Recipe data
 * @returns {Promise} Promise that resolves to the created recipe
 */
export const createRecipe = async (recipeData) => {
  return api.post('/recipes', recipeData);
};

/**
 * Update an existing recipe
 * @param {number|string} recipeId - Recipe ID
 * @param {Object} recipeData - Updated recipe data
 * @returns {Promise} Promise that resolves to the updated recipe
 */
export const updateRecipe = async (recipeId, recipeData) => {
  return api.put(`/recipes/${recipeId}`, recipeData);
};

/**
 * Delete a recipe
 * @param {number|string} recipeId - Recipe ID
 * @returns {Promise} Promise that resolves when the recipe is deleted
 */
export const deleteRecipe = async (recipeId) => {
  return api.delete(`/recipes/${recipeId}`);
};

/**
 * Search recipes by name, description, or ingredients
 * @param {string} searchTerm - Search term
 * @param {Object} filters - Additional filters
 * @returns {Promise} Promise that resolves to an array of matching recipes
 */
export const searchRecipes = async (searchTerm, filters = {}) => {
  let queryParams = new URLSearchParams({
    ...filters,
    search: searchTerm
  });
  
  return api.get(`/recipes/search?${queryParams.toString()}`);
};

export default {
  getRecipes,
  getRecipeById,
  getRecipesByCategory,
  getUserRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  searchRecipes
};