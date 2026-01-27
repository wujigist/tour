/**
 * API Service
 * Handles all communication with the backend API
 */

import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens (if needed later)
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
      
      if (error.response.status === 401) {
        // Unauthorized - clear auth and redirect to login
        localStorage.removeItem('authToken');
        // You can add redirect logic here
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.request);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// TOURS API
// ============================================

export const toursAPI = {
  /**
   * Get all tours
   * @param {boolean} activeOnly - Filter for active tours only
   */
  getAll: async (activeOnly = true) => {
    const response = await api.get('/api/tours/', {
      params: { active_only: activeOnly },
    });
    return response.data;
  },

  /**
   * Get available tours (active and has tickets)
   */
  getAvailable: async () => {
    const response = await api.get('/api/tours/available');
    return response.data;
  },

  /**
   * Get specific tour by ID
   * @param {number} tourId
   */
  getById: async (tourId) => {
    const response = await api.get(`/api/tours/${tourId}`);
    return response.data;
  },

  /**
   * Create new tour (Admin)
   * @param {object} tourData
   */
  create: async (tourData) => {
    const response = await api.post('/api/tours/', tourData);
    return response.data;
  },

  /**
   * Update tour (Admin)
   * @param {number} tourId
   * @param {object} tourData
   */
  update: async (tourId, tourData) => {
    const response = await api.put(`/api/tours/${tourId}`, tourData);
    return response.data;
  },
};

// ============================================
// FANS API
// ============================================

export const fansAPI = {
  /**
   * Register a new fan
   * @param {object} fanData - { email, name, phone }
   */
  register: async (fanData) => {
    const response = await api.post('/api/fans/register', fanData);
    return response.data;
  },

  /**
   * Get fan by ID
   * @param {number} fanId
   */
  getById: async (fanId) => {
    const response = await api.get(`/api/fans/${fanId}`);
    return response.data;
  },

  /**
   * Get fan by email
   * @param {string} email
   */
  getByEmail: async (email) => {
    const response = await api.get(`/api/fans/email/${email}`);
    return response.data;
  },

  /**
   * Get fan by registration code
   * @param {string} code
   */
  getByCode: async (code) => {
    const response = await api.get(`/api/fans/code/${code}`);
    return response.data;
  },

  /**
   * Update fan information
   * @param {number} fanId
   * @param {object} fanData
   */
  update: async (fanId, fanData) => {
    const response = await api.put(`/api/fans/${fanId}`, fanData);
    return response.data;
  },

  /**
   * Get fan's tour selections
   * @param {number} fanId
   */
  getSelections: async (fanId) => {
    const response = await api.get(`/api/fans/${fanId}/selections`);
    return response.data;
  },

  /**
   * Add tour selection for fan
   * @param {number} fanId
   * @param {number} tourId
   */
  addSelection: async (fanId, tourId) => {
    const response = await api.post(`/api/fans/${fanId}/selections`, {
      tour_id: tourId,
    });
    return response.data;
  },

  /**
   * Add multiple tour selections (max 5)
   * @param {number} fanId
   * @param {Array<number>} tourIds
   */
  addBulkSelections: async (fanId, tourIds) => {
    const response = await api.post(`/api/fans/${fanId}/selections/bulk`, {
      tour_ids: tourIds,
    });
    return response.data;
  },

  /**
   * Remove tour selection
   * @param {number} fanId
   * @param {number} selectionId
   */
  removeSelection: async (fanId, selectionId) => {
    const response = await api.delete(`/api/fans/${fanId}/selections/${selectionId}`);
    return response.data;
  },
};

// ============================================
// CONSENT API
// ============================================

export const consentAPI = {
  /**
   * Submit consent form
   * @param {object} consentData
   */
  submit: async (consentData) => {
    const response = await api.post('/api/consent/submit', consentData);
    return response.data;
  },

  /**
   * Get consent for fan
   * @param {number} fanId
   */
  getByFanId: async (fanId) => {
    const response = await api.get(`/api/consent/${fanId}`);
    return response.data;
  },

  /**
   * Update consent
   * @param {number} fanId
   * @param {object} consentData
   */
  update: async (fanId, consentData) => {
    const response = await api.put(`/api/consent/${fanId}`, consentData);
    return response.data;
  },

  /**
   * Upload photo ID
   * @param {number} fanId
   * @param {File} photoFile
   */
  uploadPhotoId: async (fanId, photoFile) => {
    const formData = new FormData();
    formData.append('photo_id', photoFile);
    
    const response = await api.post(`/api/consent/${fanId}/upload-photo-id`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get consent status
   * @param {number} fanId
   */
  getStatus: async (fanId) => {
    const response = await api.get(`/api/consent/${fanId}/status`);
    return response.data;
  },
};

// ============================================
// TICKETS API
// ============================================

export const ticketsAPI = {
  /**
   * Generate all tickets for fan
   * @param {number} fanId
   */
  generateForFan: async (fanId) => {
    const response = await api.post(`/api/tickets/generate/${fanId}`);
    return response.data;
  },

  /**
   * Generate single ticket for selection
   * @param {number} fanId
   * @param {number} selectionId
   */
  generateSingle: async (fanId, selectionId) => {
    const response = await api.post(`/api/tickets/generate/${fanId}/selection/${selectionId}`);
    return response.data;
  },

  /**
   * Download ticket PDF
   * @param {string} ticketId
   */
  download: (ticketId) => {
    // Return download URL
    return `${api.defaults.baseURL}/api/tickets/download/${ticketId}`;
  },

  /**
   * Get all ticket downloads for fan
   * @param {number} fanId
   */
  getDownloads: async (fanId) => {
    const response = await api.get(`/api/tickets/fan/${fanId}/downloads`);
    return response.data;
  },

  /**
   * Verify ticket
   * @param {string} ticketId
   */
  verify: async (ticketId) => {
    const response = await api.get(`/api/tickets/verify/${ticketId}`);
    return response.data;
  },

  /**
   * Regenerate ticket
   * @param {number} selectionId
   */
  regenerate: async (selectionId) => {
    const response = await api.post(`/api/tickets/regenerate/${selectionId}`);
    return response.data;
  },

  /**
   * Get ticket info for selection
   * @param {number} selectionId
   */
  getInfo: async (selectionId) => {
    const response = await api.get(`/api/tickets/selection/${selectionId}/info`);
    return response.data;
  },
};

// Export the axios instance for direct use if needed
export default api;