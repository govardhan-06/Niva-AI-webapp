import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, tokenManager } from '../services/auth';
import Sidebar from '../components/Sidebar';
import CourseList from '../components/CourseList';
import './Home.css';

const Course = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = async () => {
      // Check if user is authenticated
      if (!tokenManager.isAuthenticated()) {
        navigate('/login');
        return;
      }
      
      try {
        // Fetch user data from API
        const response = await authAPI.getUserData();
        if (response.user) {
          setUser(response.user);
        } else {
          // Fallback to stored user data if API fails
          const storedUser = tokenManager.getUserData();
          if (storedUser) {
            setUser(storedUser);
          }
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        // Fallback to stored user data
        const storedUser = tokenManager.getUserData();
        if (storedUser) {
          setUser(storedUser);
        } else {
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, [navigate]);

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
  };


  if (isLoading) {
    return (
      <div className="home-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <Sidebar />
      
      <div className="main-content">
        <header className="home-header">
          <div className="header-content">
            <div className="header-info">
              <h1>Course Management</h1>
              <p>Manage your courses and AI agent memory</p>
            </div>
            <div className="user-info">
              <span>Welcome, {user?.email}</span>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          </div>
        </header>
        
        <main className="home-main">
          <CourseList />
        </main>
      </div>
    </div>
  );
};

export default Course;
