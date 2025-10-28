import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const tabs = [
    { 
      id: 'course', 
      label: 'Courses', 
      path: '/course',
      description: 'Manage your courses'
    },
    { 
      id: 'interview', 
      label: 'Interviews', 
      path: '/interview',
      description: 'AI-powered interviews'
    },
    { 
      id: 'feedback', 
      label: 'Feedback', 
      path: '/feedback',
      description: 'View feedback reports'
    },
    { 
      id: 'student-profile', 
      label: 'Student Profile', 
      path: '/student-profile',
      description: 'Manage your profile'
    }
  ];

  const handleTabClick = (tab) => {
    navigate(tab.path);
    if (onTabChange) {
      onTabChange(tab.id);
    }
  };

  // Determine active tab based on current location
  const currentTab = location.pathname === '/course' ? 'course' : 
                    location.pathname === '/interview' ? 'interview' : 
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
              ) : tab.id === 'interview' ? (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1C12 1 8 3.5 8 8V11C8 12.0609 7.57857 13.0783 6.82843 13.8284C6.07828 14.5786 5.06087 15 4 15H3C2.46957 15 1.96086 15.2107 1.58579 15.5858C1.21071 15.9609 1 16.4696 1 17V18C1 18.5304 1.21071 19.0391 1.58579 19.4142C1.96086 19.7893 2.46957 20 3 20H21C21.5304 20 22.0391 19.7893 22.4142 19.4142C22.7893 19.0391 23 18.5304 23 18V17C23 16.4696 22.7893 15.9609 22.4142 15.5858C22.0391 15.2107 21.5304 15 21 15H20C18.9391 15 17.9217 14.5786 17.1716 13.8284C16.4214 13.0783 16 12.0609 16 11V8C16 3.5 12 1 12 1Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 20V22C9 22.7956 9.31607 23.5587 9.87868 24.1213C10.4413 24.6839 11.2044 25 12 25C12.7956 25 13.5587 24.6839 14.1213 24.1213C14.6839 23.5587 15 22.7956 15 22V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
