import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/auth';
import { useToast } from '../components/ToastContainer';
import './Auth.css';

const Signup = () => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role_type: 'user'
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.showError('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      toast.showError('Password must be at least 6 characters long');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First, register the user
      const registerResponse = await authAPI.register({
        email: formData.email,
        password: formData.password,
        role_type: formData.role_type
      });
      
      if (registerResponse.message) {
        // Now automatically log the user in to get the auth token
        const loginResponse = await authAPI.login({
          email: formData.email,
          password: formData.password
        });
        
        if (loginResponse.success && loginResponse.data && loginResponse.data.token) {
          toast.showSuccess('Registration successful!');
          
          // Fetch and store user data including role
          try {
            const userDataResponse = await authAPI.getUserData();
            console.log('Signup - getUserData response:', userDataResponse);
            
            // Handle nested response structure
            const user = userDataResponse.data?.user || userDataResponse.user;
            
            if (user) {
              console.log('Signup - User role:', user.role);
              // User data is already stored in tokenManager by getUserData
              // Verify it was stored
              const storedRole = tokenManager.getUserRole();
              console.log('Signup - Stored role after getUserData:', storedRole);
            } else {
              console.error('Signup - No user in getUserData response');
            }
          } catch (error) {
            console.error('Failed to load user data:', error);
            // Continue anyway
          }
          
          // Redirect to course page
          navigate('/course');
        } else {
          // Registration succeeded but auto-login failed
          toast.showWarning('Registration successful! Please log in.');
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.showError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Join Niva AI</h1>
            <p>Create your account</p>
          </div>
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password (min. 6 characters)"
                disabled={isLoading}
                required
                minLength={6}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="role_type">Role</label>
              <select
                id="role_type"
                name="role_type"
                value={formData.role_type}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={isLoading}
            >
              <span>{isLoading ? 'Creating account...' : 'Create Account'}</span>
            </button>
          </form>
          
          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
