import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const tabs = [
    { id: 'course', label: 'Course', icon: '📚', path: '/course' },
    { id: 'interview', label: 'Interview', icon: '🎤', path: '/interview' }
  ];

  const handleTabClick = (tab) => {
    navigate(tab.path);
    if (onTabChange) {
      onTabChange(tab.id);
    }
  };

  // Determine active tab based on current location
  const currentTab = location.pathname === '/course' ? 'course' : 
                    location.pathname === '/interview' ? 'interview' : 'course';

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Niva AI</h2>
        <p>AI Interviewer</p>
      </div>
      
      <nav className="sidebar-nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-item ${currentTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabClick(tab)}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
