import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/auth';
import { useToast } from '../components/ToastContainer';
import StudentProfileModal from '../components/StudentProfileModal';
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
  const [showStudentModal, setShowStudentModal] = useState(false);
  
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
          // Show student profile modal now that we have a token
          setShowStudentModal(true);
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

  const handleStudentProfileSuccess = () => {
    // Student profile created successfully, redirect to course page
    toast.showSuccess('Welcome! Your profile has been created.');
    navigate('/course');
  };

  const handleStudentModalClose = () => {
    // User skipped student profile creation, redirect to course page
    setShowStudentModal(false);
    toast.showInfo('You can create your student profile later from the Student Profile page.');
    navigate('/course');
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

      {/* Student Profile Modal */}
      <StudentProfileModal
        isOpen={showStudentModal}
        onClose={handleStudentModalClose}
        onSuccess={handleStudentProfileSuccess}
      />
    </>
  );
};

export default Signup;
