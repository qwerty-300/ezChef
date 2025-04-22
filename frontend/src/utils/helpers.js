// Utility functions for the application

/**
 * Format a date string into a readable format
 * @param {string} dateString - ISO date string
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
    if (!dateString) return '';
    
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', mergedOptions).format(date);
    } catch (err) {
      console.error('Error formatting date:', err);
      return dateString;
    }
  };
  
  /**
   * Calculate average rating from an array of reviews
   * @param {Array} reviews - Array of review objects with rating property
   * @returns {number} Average rating or 0 if no reviews
   */
  export const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) {
      return 0;
    }
    
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return sum / reviews.length;
  };
  
  /**
   * Truncate text to a specific length with ellipsis
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length before truncation
   * @returns {string} Truncated text
   */
  export const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) {
      return text;
    }
    
    return text.substring(0, maxLength) + '...';
  };
  
  /**
   * Convert difficulty level to text
   * @param {number} level - Difficulty level (1-5)
   * @returns {string} Difficulty text
   */
  export const difficultyToText = (level) => {
    const levels = {
      1: 'Very Easy',
      2: 'Easy',
      3: 'Medium',
      4: 'Hard',
      5: 'Very Hard'
    };
    
    return levels[level] || 'Unknown';
  };
  
  /**
   * Convert difficulty level to color
   * @param {number} level - Difficulty level (1-5)
   * @returns {string} Color name for Material UI
   */
  export const difficultyToColor = (level) => {
    if (level <= 2) return 'success';
    if (level <= 4) return 'primary';
    return 'error';
  };
  
  /**
   * Create a unique ID for temporary use in the UI
   * @returns {string} Unique ID
   */
  export const createTempId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };
  
  /**
   * Group an array of objects by a specified key
   * @param {Array} array - Array of objects to group
   * @param {string} key - Property name to group by
   * @returns {Object} Grouped object
   */
  export const groupBy = (array, key) => {
    return array.reduce((result, item) => {
      const groupKey = item[key];
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    }, {});
  };
  
  /**
   * Extract query parameters from a URL string
   * @param {string} urlString - URL string
   * @returns {Object} Object containing query parameters
   */
  export const getQueryParams = (urlString) => {
    try {
      const url = new URL(urlString);
      const params = {};
      url.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      return params;
    } catch (err) {
      console.error('Error parsing URL:', err);
      return {};
    }
  };
  
  /**
   * Format a number with commas as thousands separators
   * @param {number} number - Number to format
   * @returns {string} Formatted number string
   */
  export const formatNumber = (number) => {
    if (number === null || number === undefined) return '';
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  
  /**
   * Validate an email address
   * @param {string} email - Email address to validate
   * @returns {boolean} True if email is valid
   */
  export const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  /**
   * Convert an object to query parameters string
   * @param {Object} obj - Object to convert
   * @returns {string} Query string (without leading ?)
   */
  export const objectToQueryString = (obj) => {
    return Object.entries(obj)
      .filter(([_, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
  };
  
  export default {
    formatDate,
    calculateAverageRating,
    truncateText,
    difficultyToText,
    difficultyToColor,
    createTempId,
    groupBy,
    getQueryParams,
    formatNumber,
    isValidEmail,
    objectToQueryString
  };