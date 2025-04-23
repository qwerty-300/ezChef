import api from './api';

/**
 * Get all cookbooks for a user
 * @param {number|string} userId - User ID
 * @returns {Promise} Promise that resolves to an array of cookbooks
 */
export const getUserCookbooks = async (userId) => {
  return api.get(`/users/${userId}/cookbooks`);
};

/**
 * Get a cookbook by ID
 * @param {number|string} cookbookId - Cookbook ID
 * @returns {Promise} Promise that resolves to a cookbook object
 */
export const getCookbookById = async (cookbookId) => {
  return api.get(`/cookbooks/${cookbookId}`);
};

/**
 * Create a new cookbook
 * @param {Object} cookbookData - Cookbook data (title, description, userId)
 * @returns {Promise} Promise that resolves to the created cookbook
 */
export const createCookbook = async (cookbookData) => {
  return api.post('/cookbooks', cookbookData);
};

/**
 * Update an existing cookbook
 * @param {number|string} cookbookId - Cookbook ID
 * @param {Object} cookbookData - Updated cookbook data
 * @returns {Promise} Promise that resolves to the updated cookbook
 */
export const updateCookbook = async (cookbookId, cookbookData) => {
  return api.put(`/cookbooks/${cookbookId}`, cookbookData);
};

/**
 * Delete a cookbook
 * @param {number|string} cookbookId - Cookbook ID
 * @returns {Promise} Promise that resolves when the cookbook is deleted
 */
export const deleteCookbook = async (cookbookId) => {
  return api.delete(`/cookbooks/${cookbookId}`);
};

/**
 * Add a recipe to a cookbook
 * @param {number|string} cookbookId - Cookbook ID
 * @param {number|string} recipeId - Recipe ID
 * @returns {Promise} Promise that resolves when the recipe is added
 */
export const addRecipeToCookbook = async (cookbookId, recipeId) => {
  return api.post(`/cookbooks/${cookbookId}/recipes/${recipeId}`);
};

/**
 * Remove a recipe from a cookbook
 * @param {number|string} cookbookId - Cookbook ID
 * @param {number|string} recipeId - Recipe ID
 * @returns {Promise} Promise that resolves when the recipe is removed
 */
export const removeRecipeFromCookbook = async (cookbookId, recipeId) => {
  return api.delete(`/cookbooks/${cookbookId}/recipes/${recipeId}`);
};

/**
 * Get available recipes not in a cookbook
 * @param {number|string} cookbookId - Cookbook ID
 * @returns {Promise} Promise that resolves to an array of available recipes
 */
export const getAvailableRecipesForCookbook = async (cookbookId) => {
  return api.get(`/recipes?notInCookbook=${cookbookId}`);
};

export default {
  getUserCookbooks,
  getCookbookById,
  createCookbook,
  updateCookbook,
  deleteCookbook,
  addRecipeToCookbook,
  removeRecipeFromCookbook,
  getAvailableRecipesForCookbook
};