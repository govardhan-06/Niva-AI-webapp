import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { tokenManager, authAPI } from '../services/auth';
import './Sidebar.css';

const Sidebar = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      // Fetch fresh user data to ensure role is up to date
      const userDataResponse = await authAPI.getUserData();
      if (userDataResponse.user) {
        setIsAdmin(tokenManager.isAdmin());
      } else {
        setIsAdmin(tokenManager.isAdmin());
      }
    } catch (error) {
      console.error('Failed to check user role:', error);
      setIsAdmin(tokenManager.isAdmin());
    }
  };
  
  // Base tabs for all users
  const baseTabs = [
    { 
      id: 'course', 
      label: 'Courses', 
      path: '/course',
      description: 'Manage your courses'
    },
    { 
      id: 'feedback', 
      label: 'Feedback', 
      path: '/feedback',
      description: 'View feedback reports'
    }
  ];

  // Student profile tab (only for non-admin users)
  const studentProfileTab = { 
    id: 'student-profile', 
    label: 'Student Profile', 
    path: '/student-profile',
    description: 'Manage your profile'
  };

  // Combine tabs based on user role
  const tabs = isAdmin 
    ? baseTabs 
    : [...baseTabs, studentProfileTab];

  const handleTabClick = (tab) => {
    navigate(tab.path);
    if (onTabChange) {
      onTabChange(tab.id);
    }
  };

  // Determine active tab based on current location
  const currentTab = location.pathname === '/course' ? 'course' : 
                    location.pathname === '/feedback' ? 'feedback' : 
                    location.pathname === '/student-profile' ? 'student-profile' : 'course';

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <svg className="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="logo-text">
            <h2>Niva AI</h2>
            <p>Interview Platform</p>
          </div>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-item ${currentTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabClick(tab)}
            aria-label={tab.label}
          >
            <div className="nav-icon">
              {tab.id === 'course' ? (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : tab.id === 'feedback' ? (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 9H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 13H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : tab.id === 'student-profile' ? (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : null}
            </div>
            <div className="nav-content">
              <span className="nav-label">{tab.label}</span>
              <span className="nav-description">{tab.description}</span>
            </div>
          </button>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <div className="sidebar-info">
          <svg className="info-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>Version 1.0.0</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
