import { useState, useEffect } from 'react';
import { courseAPI } from '../services/course';
import CreateCourseModal from './CreateCourseModal';
import './CourseList.css';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await courseAPI.getAllCourses(true); // Get active courses
      setCourses(response.courses || []);
    } catch (err) {
      console.error('Failed to load courses:', err);
      setError('Failed to load courses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseCreated = (newCourse) => {
    setCourses(prev => [newCourse, ...prev]);
    setShowCreateModal(false);
  };

  if (isLoading) {
    return (
      <div className="course-list">
        <div className="course-list-header">
          <h1>My Courses</h1>
          <button 
            className="create-course-btn"
            onClick={() => setShowCreateModal(true)}
          >
            + Create Course
          </button>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-list">
        <div className="course-list-header">
          <h1>My Courses</h1>
          <button 
            className="create-course-btn"
            onClick={() => setShowCreateModal(true)}
          >
            + Create Course
          </button>
        </div>
        <div className="error-state">
          <p>{error}</p>
          <button onClick={loadCourses} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="course-list">
        <div className="course-list-header">
          <h1>My Courses</h1>
          <button 
            className="create-course-btn"
            onClick={() => setShowCreateModal(true)}
          >
            + Create Course
          </button>
        </div>
        
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <h2>Welcome to Niva AI</h2>
          <p>
            Niva AI is your intelligent interviewer that helps you practice and improve your skills. 
            Create your first course to get started with personalized AI-powered interviews.
          </p>
          <div className="empty-state-features">
            <div className="feature-item">
              <span className="feature-icon">🤖</span>
              <span>AI-powered interviews</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span>Real-time feedback</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📈</span>
              <span>Progress tracking</span>
            </div>
          </div>
          <button 
            className="get-started-btn"
            onClick={() => setShowCreateModal(true)}
          >
            Create Your First Course
          </button>
        </div>

        {showCreateModal && (
          <CreateCourseModal
            onClose={() => setShowCreateModal(false)}
            onCourseCreated={handleCourseCreated}
          />
        )}
      </div>
    );
  }

  return (
    <div className="course-list">
      <div className="course-list-header">
        <h1>My Courses ({courses.length})</h1>
        <button 
          className="create-course-btn"
          onClick={() => setShowCreateModal(true)}
        >
          + Create Course
        </button>
      </div>
      
      <div className="courses-grid">
        {courses.map(course => (
          <div key={course.id} className="course-card">
            <div className="course-header">
              <h3>{course.name}</h3>
              <span className={`course-status ${course.is_active ? 'active' : 'inactive'}`}>
                {course.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="course-description">{course.description}</p>
            <div className="course-meta">
              <div className="meta-item">
                <span className="meta-label">Passing Score:</span>
                <span className="meta-value">{course.passing_score}%</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Max Score:</span>
                <span className="meta-value">{course.max_score}%</span>
              </div>
            </div>
            <div className="course-actions">
              <button className="action-btn primary">Start Interview</button>
              <button className="action-btn secondary">Edit Course</button>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <CreateCourseModal
          onClose={() => setShowCreateModal(false)}
          onCourseCreated={handleCourseCreated}
        />
      )}
    </div>
  );
};

export default CourseList;
