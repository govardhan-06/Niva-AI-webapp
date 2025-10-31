import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI, tokenManager } from '../services/auth';
import Sidebar from '../components/Sidebar';
import Interview from '../components/Interview';
import './Home.css';

const InterviewPage = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get course, agent, and student IDs from URL parameters
  // If studentId is not in URL, it will be retrieved from localStorage in Interview component
  const courseId = searchParams.get('courseId');
  const agentId = searchParams.get('agentId');
  const studentIdFromUrl = searchParams.get('studentId');
  
  // Get studentId from URL or localStorage
  const studentId = studentIdFromUrl || tokenManager.getStudentId();

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
              <h1>Interview</h1>
              <p>Conduct AI-powered interviews</p>
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
          <Interview 
            courseId={courseId}
            agentId={agentId}
            studentId={studentId}
          />
        </main>
      </div>
    </div>
  );
};

export default InterviewPage;
