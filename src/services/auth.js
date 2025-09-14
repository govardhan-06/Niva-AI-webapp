const API_BASE_URL = 'http://localhost:8000/api/v1'; // Update this with your backend URL

// Token management
export const tokenManager = {
  getToken: () => {
    return localStorage.getItem('niva_auth_token');
  },
  
  setToken: (token) => {
    localStorage.setItem('niva_auth_token', token);
  },
  
  removeToken: () => {
    localStorage.removeItem('niva_auth_token');
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('niva_auth_token');
  }
};

// API helper function
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = tokenManager.getToken();
  
  // Determine if we're sending FormData (for file uploads)
  const isFormData = options.body instanceof FormData;
  
  const defaultOptions = {
    headers: {
      // Only set Content-Type for non-FormData requests
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };
  
  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };
  
  try {
    const response = await fetch(url, finalOptions);
    
    // Handle different response types
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else if (response.status === 204) {
      // No content response (like DELETE requests)
      data = { success: true };
    } else {
      // Handle other response types (text, etc.)
      data = { success: false, message: await response.text() };
    }
    
    if (!response.ok) {
      throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
    }
    
    // Check for API-level success/failure (only for auth endpoints that use success field)
    if (data.hasOwnProperty('success') && !data.success && (endpoint.includes('/auth/') || endpoint.includes('/initiate/'))) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Authentication API calls
export const authAPI = {
  // Register a new user
  register: async (userData) => {
    const { email, password, role_type } = userData;
    
    if (!email || !password || !role_type) {
      throw new Error('Email, password, and role_type are required');
    }
    
    const response = await apiCall('/auth/register/', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        role_type
      })
    });
    
    // Return the response with proper structure
    return {
      message: response.message || 'User created successfully',
      user: response.data?.user || response.user
    };
  },
  
  // Login user
  login: async (credentials) => {
    const { email, password } = credentials;
    
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    const response = await apiCall('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password
      })
    });
    
    // Store token after successful login - token is nested in data object
    if (response.success && response.data && response.data.token) {
      tokenManager.setToken(response.data.token);
    } else {
      throw new Error('Login failed: No token received');
    }
    
    return response;
  },
  
  // Logout user
  logout: () => {
    tokenManager.removeToken();
  },
  
  // Get authenticated API headers
  getAuthHeaders: () => {
    const token = tokenManager.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
};

// Generic API helper for authenticated requests
export const authenticatedApiCall = async (endpoint, options = {}) => {
  const token = tokenManager.getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  return apiCall(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });
};

export default authAPI;
