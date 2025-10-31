import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, tokenManager } from '../services/auth';
import { studentAPI } from '../services/student';
import { useToast } from '../components/ToastContainer';
import './Auth.css';

const Login = () => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    
    setIsLoading(true);
    
    try {
      const response = await authAPI.login(formData);
      
      if (response.success && response.data && response.data.token) {
        toast.showSuccess('Login successful!');
        
        // Fetch and store user data including role
        try {
          const userDataResponse = await authAPI.getUserData();
          if (userDataResponse.user) {
            // User data is already stored in tokenManager by getUserData
          }
        } catch (error) {
          console.error('Failed to load user data:', error);
          // Continue anyway - user data might be in response
        }
        
        // Check if user has a student profile (only for non-admin users)
        const userId = tokenManager.getUserId();
        const userRole = tokenManager.getUserRole();
        if (userId && userRole !== 'Admin' && userRole !== 'admin') {
          try {
            const studentResponse = await studentAPI.getStudentByUserId(userId);
            if (studentResponse.student && studentResponse.student.id) {
              // Store student ID if found
              tokenManager.setStudentId(studentResponse.student.id);
            }
          } catch (error) {
            // User doesn't have a student profile yet, that's okay
            console.log('No student profile found for user');
          }
        }
        
        navigate('/course');
      } else {
        toast.showError('Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.showError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome to Niva AI</h1>
          <p>Sign in to your account</p>
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
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="auth-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
