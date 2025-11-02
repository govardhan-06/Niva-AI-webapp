const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

console.log('API_BASE_URL:', API_BASE_URL);

// Token and user management
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
  },

  // User ID management
  getUserId: () => {
    return localStorage.getItem('niva_user_id');
  },

  setUserId: (userId) => {
    localStorage.setItem('niva_user_id', userId);
  },

  removeUserId: () => {
    localStorage.removeItem('niva_user_id');
  },

  // Student ID management
  getStudentId: () => {
    return localStorage.getItem('niva_student_id');
  },

  setStudentId: (studentId) => {
    localStorage.setItem('niva_student_id', studentId);
  },

  removeStudentId: () => {
    localStorage.removeItem('niva_student_id');
  },

  hasStudentProfile: () => {
    return !!localStorage.getItem('niva_student_id');
  },

  // User role management
  getUserRole: () => {
    return localStorage.getItem('niva_user_role');
  },

  setUserRole: (role) => {
    localStorage.setItem('niva_user_role', role);
  },

  removeUserRole: () => {
    localStorage.removeItem('niva_user_role');
  },

  isAdmin: () => {
    const role = localStorage.getItem('niva_user_role');
    console.log('Checking admin role. Stored role:', role);
    // Check for various possible role values - according to API docs, it should be "Admin" or "User"
    const isAdminResult = role === 'Admin' || 
           role === 'admin' ||
           role === 'AdminUser' ||
           role === 'ADMIN';
    console.log('isAdmin result:', isAdminResult);
    return isAdminResult;
  },

  // User data management
  getUserData: () => {
    const data = localStorage.getItem('niva_user_data');
    return data ? JSON.parse(data) : null;
  },

  setUserData: (userData) => {
    localStorage.setItem('niva_user_data', JSON.stringify(userData));
    if (userData.role) {
      localStorage.setItem('niva_user_role', userData.role);
      console.log('Stored user role:', userData.role);
    }
    if (userData.id) {
      localStorage.setItem('niva_user_id', userData.id);
    }
  },

  removeUserData: () => {
    localStorage.removeItem('niva_user_data');
  },

  // Clear all stored data
  clearAll: () => {
    localStorage.removeItem('niva_auth_token');
    localStorage.removeItem('niva_user_id');
    localStorage.removeItem('niva_student_id');
    localStorage.removeItem('niva_user_role');
    localStorage.removeItem('niva_user_data');
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
      ...(token && { 'Authorization': `Token ${token}` })
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
    
    console.log('Register API response:', response);
    
    // Store user ID if available in response
    const user = response.data?.user || response.user;
    console.log('Register - Extracted user:', user);
    if (user && user.id) {
      tokenManager.setUserId(user.id);
      // Also try to store role if available in registration response
      if (user.role) {
        console.log('Register - Role from response:', user.role);
        tokenManager.setUserRole(user.role);
      }
    }
    
    // Return the response with proper structure
    return {
      message: response.message || 'User created successfully',
      user: user
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
    
    console.log('Login API response:', response);
    
    // Store token and user ID after successful login
    if (response.success && response.data && response.data.token) {
      tokenManager.setToken(response.data.token);
      
      console.log('Login - response.data:', response.data);
      
      // Store user ID if available
      if (response.data.user && response.data.user.id) {
        tokenManager.setUserId(response.data.user.id);
        // Also try to store role if available in login response
        if (response.data.user.role) {
          console.log('Login - Role from response:', response.data.user.role);
          tokenManager.setUserRole(response.data.user.role);
        }
      }
    } else {
      throw new Error('Login failed: No token received');
    }
    
    return response;
  },
  
  // Logout user
  logout: () => {
    tokenManager.clearAll();
  },

  // Get current user data
  getUserData: async () => {
    const response = await authenticatedApiCall('/auth/user/data/', {
      method: 'GET'
    });
    
    console.log('getUserData API response:', response);
    
    // Handle different response structures
    // API returns: { data: { user: {...} } } or { user: {...} }
    const user = response.data?.user || response.user;
    
    if (user) {
      console.log('User data from API:', user);
      console.log('User role from API:', user.role);
      
      // Store the user data and role
      tokenManager.setUserData(user);
      
      // Ensure role is explicitly stored
      if (user.role) {
        console.log('Storing role:', user.role);
        tokenManager.setUserRole(user.role);
      }
    } else {
      console.warn('No user data in API response:', response);
      console.warn('Full response structure:', JSON.stringify(response, null, 2));
    }
    
    return response;
  },
  
  // Get authenticated API headers
  getAuthHeaders: () => {
    const token = tokenManager.getToken();
    return token ? { 'Authorization': `Token ${token}` } : {};
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
      'Authorization': `Token ${token}`
    }
  });
};

export default authAPI;
