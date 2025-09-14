import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, tokenManager } from '../services/auth';
import Sidebar from '../components/Sidebar';
import CourseList from '../components/CourseList';
import './Home.css';

const Home = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    if (!tokenManager.isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    // You can add an API call here to get user details if needed
    // For now, we'll just set a mock user
    setUser({
      email: 'user@example.com', // This should come from an API call
      role: 'User'
    });
    setIsLoading(false);
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
              <h1>Dashboard</h1>
              <p>Welcome to Niva AI Dashboard</p>
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

export default Home;
