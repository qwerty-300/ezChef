// Base API utility functions for interacting with the backend

/**
 * Get the authentication token from local storage
 * @returns {string} The authentication token
 */
const getAuthToken = () => localStorage.getItem('authToken');

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export const getHeaders = (includeJson = true) => {
  const headers = {};
  if (includeJson) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const csrftoken = getCookie('csrftoken');
  if (csrftoken) {
    headers['X-CSRFToken'] = csrftoken;
  }

  return headers;
};

/**
 * Handle API response - checks for errors and parses JSON
 * @param {Response} response - Fetch API response
 * @returns {Promise} Promise that resolves to parsed response data
 * @throws {Error} If response is not ok
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    // Check if the response is JSON before trying to parse it
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.statusText}`);
      } catch (jsonError) {
        // If JSON parsing fails, handle the raw response
        const text = await response.text();
        console.error('Non-JSON error response:', text);
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
    } else {
      // Not a JSON response, handle as text
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new Error(`Error: ${response.status} ${response.statusText} (non-JSON response)`);
    }
  }
  
  return response.json();
};

/**
 * Generic GET request
 * @param {string} endpoint - API endpoint
 * @returns {Promise} Promise that resolves to parsed response data
 */
export const get = async (endpoint) => {
  const response = await fetch(`/api${endpoint}`, {
    method: 'GET',
    credentials: 'include',
    headers: getHeaders()
  });
  
  return handleResponse(response);
};

/**
 * Generic POST request
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body data
 * @returns {Promise} Promise that resolves to parsed response data
 */
export const post = async (endpoint, data) => {
  const response = await fetch(`/api${endpoint}`, {
    method: 'POST',
    credentials: 'include',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  
  return handleResponse(response);
};

/**
 * Generic PUT request
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body data
 * @returns {Promise} Promise that resolves to parsed response data
 */
export const put = async (endpoint, data) => {
  const response = await fetch(`/api${endpoint}`, {
    method: 'PUT',
    credentials: 'include',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  
  return handleResponse(response);
};

/**
 * Generic PATCH request
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body data
 * @returns {Promise} Promise that resolves to parsed response data
 */
export const patch = async (endpoint, data) => {
  const response = await fetch(`/api${endpoint}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  
  return handleResponse(response);
};

/**
 * Generic DELETE request
 * @param {string} endpoint - API endpoint
 * @returns {Promise} Promise that resolves to parsed response data
 */
export const del = async (endpoint) => {
  const response = await fetch(`/api${endpoint}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: getHeaders()
  });
  
  return handleResponse(response);
};

const api = {
  get,
  post,
  put,
  patch,
  delete: del,
  getHeaders
};

export default api;
