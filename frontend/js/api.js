/**
 * LSR Frontend API Service
 * Handles all API calls to the backend server
 */

const API_BASE_URL = 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Set token in localStorage
const setToken = (token) => localStorage.setItem('token', token);

// Remove token from localStorage
const removeToken = () => localStorage.removeItem('token');

/**
 * Generic API call wrapper
 * @param {string} endpoint - API endpoint (e.g., '/auth/login')
 * @param {object} options - Fetch options
 * @returns {Promise} - API response
 */
const apiCall = async (endpoint, options = {}) => {
  const token = getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    }
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      // Handle authentication errors
      if (response.status === 401) {
        removeToken();
        localStorage.removeItem('authenticated');
        localStorage.removeItem('username');
        localStorage.removeItem('userRole');
        window.location.href = 'login.html';
      }
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ==================== AUTH API ====================
const authAPI = {
  /**
   * Login user
   * @param {string} username 
   * @param {string} password 
   * @returns {Promise} - { success, token, user }
   */
  login: async (username, password) => {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    
    if (response.success && response.token) {
      setToken(response.token);
    }
    
    return response;
  },
  
  /**
   * Logout user
   * @returns {Promise}
   */
  logout: async () => {
    try {
      await apiCall('/auth/logout', { method: 'POST' });
    } finally {
      removeToken();
      localStorage.removeItem('authenticated');
      localStorage.removeItem('username');
      localStorage.removeItem('userRole');
    }
  },
  
  /**
   * Get current user info
   * @returns {Promise} - { success, user }
   */
  getMe: () => apiCall('/auth/me'),
  
  /**
   * Register new user (Admin only)
   * @param {object} userData - { username, password, role, department }
   * @returns {Promise}
   */
  register: (userData) => apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  })
};

// ==================== REQUESTS API ====================
const requestsAPI = {
  /**
   * Get all requests with optional filters
   * @param {object} filters - { status, requesterName, department, etc. }
   * @returns {Promise} - { success, count, data }
   */
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/requests?${params}`);
  },
  
  /**
   * Get request by ID
   * @param {string} id - Request ID
   * @returns {Promise} - { success, data: { request, machine, logistic } }
   */
  getById: (id) => apiCall(`/requests/${id}`),
  
  /**
   * Get request by SR number
   * @param {string} srNumber - SR number
   * @returns {Promise} - { success, data: { request, machine, logistic } }
   */
  getBySR: (srNumber) => apiCall(`/requests/sr/${srNumber}`),
  
  /**
   * Create new request
   * @param {object} requestData - Request data
   * @returns {Promise} - { success, data }
   */
  create: (requestData) => apiCall('/requests', {
    method: 'POST',
    body: JSON.stringify(requestData)
  }),
  
  /**
   * Update request
   * @param {string} id - Request ID
   * @param {object} requestData - Updated data
   * @returns {Promise} - { success, data }
   */
  update: (id, requestData) => apiCall(`/requests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(requestData)
  }),
  
  /**
   * Delete request (Admin only)
   * @param {string} id - Request ID
   * @returns {Promise} - { success, message }
   */
  delete: (id) => apiCall(`/requests/${id}`, { method: 'DELETE' }),
  
  /**
   * Approve request (Chief)
   * @param {string} id - Request ID
   * @returns {Promise} - { success, data }
   */
  approve: (id) => apiCall(`/requests/${id}/approve`, { method: 'POST' }),
  
  /**
   * Reject request (Chief)
   * @param {string} id - Request ID
   * @returns {Promise} - { success, data }
   */
  reject: (id) => apiCall(`/requests/${id}/reject`, { method: 'POST' }),
  
  /**
   * Send request back to requester
   * @param {string} id - Request ID
   * @param {string} note - Note for requester
   * @returns {Promise} - { success, data }
   */
  sendBack: (id, note) => apiCall(`/requests/${id}/send-back`, {
    method: 'POST',
    body: JSON.stringify({ note })
  }),
  
  /**
   * Assign request to viewer (Logistic Control)
   * @param {string} id - Request ID
   * @param {string} assignedTo - Username to assign to
   * @returns {Promise} - { success, data }
   */
  assign: (id, assignedTo) => apiCall(`/requests/${id}/assign`, {
    method: 'POST',
    body: JSON.stringify({ assignedTo })
  })
};

// ==================== MACHINES API ====================
const machinesAPI = {
  /**
   * Get all machine data
   * @returns {Promise} - { success, count, data }
   */
  getAll: () => apiCall('/machines'),
  
  /**
   * Get machine data by request ID
   * @param {string} requestId - Request ID
   * @returns {Promise} - { success, data }
   */
  getByRequestId: (requestId) => apiCall(`/machines/request/${requestId}`),
  
  /**
   * Get machine data by SR number
   * @param {string} srNumber - SR number
   * @returns {Promise} - { success, data }
   */
  getBySR: (srNumber) => apiCall(`/machines/sr/${srNumber}`),
  
  /**
   * Create machine data
   * @param {object} machineData - Machine data
   * @returns {Promise} - { success, data }
   */
  create: (machineData) => apiCall('/machines', {
    method: 'POST',
    body: JSON.stringify(machineData)
  }),
  
  /**
   * Update machine data
   * @param {string} id - Machine ID
   * @param {object} machineData - Updated data
   * @returns {Promise} - { success, data }
   */
  update: (id, machineData) => apiCall(`/machines/${id}`, {
    method: 'PUT',
    body: JSON.stringify(machineData)
  }),
  
  /**
   * Update machine data by request ID
   * @param {string} requestId - Request ID
   * @param {object} machineData - Updated data
   * @returns {Promise} - { success, data }
   */
  updateByRequestId: (requestId, machineData) => apiCall(`/machines/request/${requestId}`, {
    method: 'PUT',
    body: JSON.stringify(machineData)
  }),
  
  /**
   * Approve work completion (Chief)
   * @param {string} id - Machine ID
   * @returns {Promise} - { success, data }
   */
  approveWork: (id) => apiCall(`/machines/${id}/approve-work`, { method: 'POST' }),
  
  /**
   * Approve completion (Chief)
   * @param {string} id - Machine ID
   * @returns {Promise} - { success, data }
   */
  approveCompletion: (id) => apiCall(`/machines/${id}/approve-completion`, { method: 'POST' })
};

// ==================== LOGISTICS API ====================
const logisticsAPI = {
  /**
   * Get all logistics
   * @returns {Promise} - { success, count, data }
   */
  getAll: () => apiCall('/logistics'),
  
  /**
   * Get logistic data by request ID
   * @param {string} requestId - Request ID
   * @returns {Promise} - { success, data }
   */
  getByRequestId: (requestId) => apiCall(`/logistics/request/${requestId}`),
  
  /**
   * Get logistic data by SR number
   * @param {string} srNumber - SR number
   * @returns {Promise} - { success, data }
   */
  getBySR: (srNumber) => apiCall(`/logistics/sr/${srNumber}`),
  
  /**
   * Create logistic data (finalize request)
   * @param {object} logisticData - Logistic data
   * @returns {Promise} - { success, data }
   */
  create: (logisticData) => apiCall('/logistics', {
    method: 'POST',
    body: JSON.stringify(logisticData)
  }),
  
  /**
   * Update logistic data
   * @param {string} id - Logistic ID
   * @param {object} logisticData - Updated data
   * @returns {Promise} - { success, data }
   */
  update: (id, logisticData) => apiCall(`/logistics/${id}`, {
    method: 'PUT',
    body: JSON.stringify(logisticData)
  })
};

// ==================== USERS API ====================
const usersAPI = {
  /**
   * Get all users (Admin only)
   * @param {object} filters - { role, isActive }
   * @returns {Promise} - { success, count, data }
   */
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/users?${params}`);
  },
  
  /**
   * Get all chief users
   * @returns {Promise} - { success, count, data }
   */
  getChiefs: () => apiCall('/users/chiefs'),
  
  /**
   * Get all request viewer users
   * @returns {Promise} - { success, count, data }
   */
  getViewers: () => apiCall('/users/viewers'),
  
  /**
   * Create user (Admin only)
   * @param {object} userData - { username, password, role, department }
   * @returns {Promise} - { success, data }
   */
  create: (userData) => apiCall('/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  
  /**
   * Update user (Admin only)
   * @param {string} id - User ID
   * @param {object} userData - Updated data
   * @returns {Promise} - { success, data }
   */
  update: (id, userData) => apiCall(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  }),
  
  /**
   * Delete user (Admin only)
   * @param {string} id - User ID
   * @returns {Promise} - { success, message }
   */
  delete: (id) => apiCall(`/users/${id}`, { method: 'DELETE' }),
  
  /**
   * Activate user (Admin only)
   * @param {string} id - User ID
   * @returns {Promise} - { success, data }
   */
  activate: (id) => apiCall(`/users/${id}/activate`, { method: 'PUT' }),
  
  /**
   * Deactivate user (Admin only)
   * @param {string} id - User ID
   * @returns {Promise} - { success, data }
   */
  deactivate: (id) => apiCall(`/users/${id}/deactivate`, { method: 'PUT' })
};

// ==================== DEPARTMENTS API ====================
const departmentsAPI = {
  /**
   * Get all departments
   * @param {object} filters - { isActive }
   * @returns {Promise} - { success, count, data }
   */
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/departments?${params}`);
  },
  
  /**
   * Create department (Admin only)
   * @param {object} deptData - { name, isDefault }
   * @returns {Promise} - { success, data }
   */
  create: (deptData) => apiCall('/departments', {
    method: 'POST',
    body: JSON.stringify(deptData)
  }),
  
  /**
   * Update department (Admin only)
   * @param {string} id - Department ID
   * @param {object} deptData - Updated data
   * @returns {Promise} - { success, data }
   */
  update: (id, deptData) => apiCall(`/departments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(deptData)
  }),
  
  /**
   * Delete department (Admin only)
   * @param {string} id - Department ID
   * @returns {Promise} - { success, message }
   */
  delete: (id) => apiCall(`/departments/${id}`, { method: 'DELETE' })
};

// ==================== SERVICE DETAILS API ====================
const serviceDetailsAPI = {
  /**
   * Get all service details
   * @param {object} filters - { isActive, category }
   * @returns {Promise} - { success, count, data }
   */
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/service-details?${params}`);
  },
  
  /**
   * Create service detail (Admin only)
   * @param {object} serviceData - { name, category }
   * @returns {Promise} - { success, data }
   */
  create: (serviceData) => apiCall('/service-details', {
    method: 'POST',
    body: JSON.stringify(serviceData)
  }),
  
  /**
   * Create multiple service details (Admin only)
   * @param {array} serviceDetails - Array of service detail objects
   * @returns {Promise} - { success, count, data }
   */
  createBulk: (serviceDetails) => apiCall('/service-details/bulk', {
    method: 'POST',
    body: JSON.stringify({ serviceDetails })
  }),
  
  /**
   * Update service detail (Admin only)
   * @param {string} id - Service detail ID
   * @param {object} serviceData - Updated data
   * @returns {Promise} - { success, data }
   */
  update: (id, serviceData) => apiCall(`/service-details/${id}`, {
    method: 'PUT',
    body: JSON.stringify(serviceData)
  }),
  
  /**
   * Delete service detail (Admin only)
   * @param {string} id - Service detail ID
   * @returns {Promise} - { success, message }
   */
  delete: (id) => apiCall(`/service-details/${id}`, { method: 'DELETE' })
};

// ==================== STATS API ====================
const statsAPI = {
  /**
   * Get dashboard statistics
   * @returns {Promise} - { success, data }
   */
  getDashboard: () => apiCall('/stats/dashboard'),
  
  /**
   * Get user-specific statistics
   * @param {string} username - Username
   * @returns {Promise} - { success, data }
   */
  getUserStats: (username) => apiCall(`/stats/user/${username}`),
  
  /**
   * Get detailed reports
   * @param {object} filters - { fromDate, toDate, department, status }
   * @returns {Promise} - { success, data }
   */
  getReports: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/stats/reports?${params}`);
  }
};

// ==================== EXPORT API ====================
window.API = {
  auth: authAPI,
  requests: requestsAPI,
  machines: machinesAPI,
  logistics: logisticsAPI,
  users: usersAPI,
  departments: departmentsAPI,
  serviceDetails: serviceDetailsAPI,
  stats: statsAPI
};

// Also export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.API;
}
