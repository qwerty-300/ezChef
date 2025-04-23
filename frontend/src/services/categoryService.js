import api from './api';

/**
 * Get all categories
 * @returns {Promise} Promise that resolves to an array of categories
 */
export const getCategories = async () => {
  return api.get('/categories');
};

/**
 * Get a category by ID
 * @param {number|string} categoryId - Category ID
 * @returns {Promise} Promise that resolves to a category object
 */
export const getCategoryById = async (categoryId) => {
  return api.get(`/categories/${categoryId}`);
};

/**
 * Get all possible category types
 * @returns {Promise} Promise that resolves to an array of category types
 */
export const getCategoryTypes = async () => {
  return api.get('/categories/types');
};

/**
 * Get all possible category regions
 * @returns {Promise} Promise that resolves to an array of category regions
 */
export const getCategoryRegions = async () => {
  return api.get('/categories/regions');
};

export default {
  getCategories,
  getCategoryById,
  getCategoryTypes,
  getCategoryRegions
};