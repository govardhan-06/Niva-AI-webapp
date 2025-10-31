import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseAPI } from '../services/course';
import { tokenManager } from '../services/auth';
import CreateCourseModal from './CreateCourseModal';
import EditCourseModal from './EditCourseModal';
import ConfirmDialog from './ConfirmDialog';
import './CourseList.css';

const CourseList = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deletingCourse, setDeletingCourse] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleCourseUpdated = (updatedCourse) => {
    setCourses(prev => prev.map(course => 
      course.id === updatedCourse.id ? updatedCourse : course
    ));
    setEditingCourse(null);
  };

  const handleDeleteClick = (course) => {
    setDeletingCourse(course);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCourse) return;
    
    setIsDeleting(true);
    try {
      await courseAPI.deleteCourse(deletingCourse.id);
      setCourses(prev => prev.filter(course => course.id !== deletingCourse.id));
      setDeletingCourse(null);
    } catch (err) {
      console.error('Failed to delete course:', err);
      setError('Failed to delete course. Please try again.');
      setDeletingCourse(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingCourse(null);
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
          <div className="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2>Welcome to Niva AI</h2>
          <p>
            Niva AI is your intelligent interviewer that helps you practice and improve your skills. 
            Create your first course to get started with personalized AI-powered interviews.
          </p>
          <div className="empty-state-features">
            <div className="feature-item">
              <svg className="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>AI-powered interviews</span>
            </div>
            <div className="feature-item">
              <svg className="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18 17L13 12L9 16L3 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Real-time feedback</span>
            </div>
            <div className="feature-item">
              <svg className="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Progress tracking</span>
            </div>
          </div>
          <button 
            className="get-started-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Create Your First Course</span>
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
              <button 
                className="action-btn primary"
                onClick={() => navigate(`/interview?courseId=${course.id}`)}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polygon points="5 3 19 12 5 21 5 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor"/>
                </svg>
                Start Interview
              </button>
              <button 
                className="action-btn secondary"
                onClick={() => setEditingCourse(course)}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Edit
              </button>
              <button 
                className="action-btn danger"
                onClick={() => handleDeleteClick(course)}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Delete
              </button>
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

      {editingCourse && (
        <EditCourseModal
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          onCourseUpdated={handleCourseUpdated}
        />
      )}

      <ConfirmDialog
        isOpen={!!deletingCourse}
        title="Delete Course"
        message={`Are you sure you want to delete "${deletingCourse?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default CourseList;
