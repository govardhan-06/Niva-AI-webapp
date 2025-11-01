import { useState, useEffect } from 'react';
import { feedbackAPI } from '../services/feedback';
import { studentAPI } from '../services/student';
import { courseAPI } from '../services/course';
import { tokenManager, authAPI } from '../services/auth';
import { useToast } from './ToastContainer';
import './FeedbackList.css';

const FeedbackList = () => {
  const toast = useToast();
  const [feedbackList, setFeedbackList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const currentUserId = tokenManager.getUserId();
  
  // Admin-specific filters
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  
  // Dropdown options (for admin)
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // Load options on mount and check user role
  useEffect(() => {
    // Check role first, then load options (which depends on role)
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      // Fetch fresh user data to ensure role is up to date
      const userDataResponse = await authAPI.getUserData();
      const adminStatus = tokenManager.isAdmin();
      console.log('Setting admin status:', adminStatus);
      setIsAdmin(adminStatus);
      
      // Load options after we know the role
      await loadOptions(adminStatus);
    } catch (error) {
      console.error('Failed to check user role:', error);
      const adminStatus = tokenManager.isAdmin();
      setIsAdmin(adminStatus);
      await loadOptions(adminStatus);
    }
  };
  
  // Auto-load feedbacks for regular users on mount
  useEffect(() => {
    // Only load user feedbacks if NOT admin
    if (!isAdmin && currentUserId && !isLoadingOptions) {
      loadUserFeedbacks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, currentUserId, isLoadingOptions]);

  // Auto-load all feedbacks for admin on mount (when students are loaded)
  useEffect(() => {
    if (isAdmin && students.length > 0 && !isLoadingOptions) {
      // Load all feedbacks when admin view loads (first time)
      // Subsequent loads are handled by the filter change effect
      if (feedbackList.length === 0) {
        loadAdminFeedbacks();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, students.length, isLoadingOptions]);

  const loadOptions = async (adminStatus = null) => {
    const isAdminUser = adminStatus !== null ? adminStatus : isAdmin;
    setIsLoadingOptions(true);
    try {
      // Load courses first
      console.log('Loading courses...');
      const coursesData = await courseAPI.listAllCourses();
      console.log('Courses API response:', coursesData);
      
      // Handle different possible response structures
      const coursesList = coursesData.data?.courses || 
                          coursesData.courses || 
                          [];
      
      console.log('Courses list extracted:', coursesList);
      console.log('Number of courses:', coursesList.length);
      
      setCourses(coursesList);
      
      // Only load students if admin (needed for admin filters)
      // Use getAllStudents to get full student data including user_id
      if (isAdminUser) {
        console.log('Loading students for admin...');
        try {
          const studentsData = await studentAPI.getAllStudents();
          console.log('getAllStudents response:', studentsData);
          
          // Handle different possible response structures
          const studentsList = studentsData.data?.students || 
                               studentsData.students || 
                               [];
          
          console.log('Students list extracted:', studentsList);
          console.log('Number of students:', studentsList.length);
          
          if (studentsList.length > 0) {
            console.log('First student structure:', studentsList[0]);
          }
          
          setStudents(studentsList);
        } catch (studentErr) {
          console.error('Failed to load students:', studentErr);
          toast.showError('Failed to load students list');
          setStudents([]);
        }
      }
    } catch (err) {
      console.error('Failed to load options:', err);
      toast.showError('Failed to load course list');
      setCourses([]);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  // When admin selects a student, extract user_id
  useEffect(() => {
    if (isAdmin && selectedStudentId) {
      const selectedStudent = students.find(s => s.id === selectedStudentId);
      if (selectedStudent && selectedStudent.user_id) {
        setSelectedUserId(selectedStudent.user_id);
      } else {
        setSelectedUserId('');
      }
    } else if (isAdmin && !selectedStudentId) {
      setSelectedUserId(''); // Clear user_id when no student selected (will show all)
    }
  }, [selectedStudentId, students, isAdmin]);

  // Reload feedbacks when admin filters change
  useEffect(() => {
    if (isAdmin && students.length > 0 && !isLoadingOptions) {
      loadAdminFeedbacks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId, selectedCourseId]);

  // Load feedbacks for admin (can filter by user_id and course_id)
  // When no filters are selected, we need to get all students' feedbacks
  const loadAdminFeedbacks = async () => {
    try {
      setIsLoading(true);
      
      // If a specific student is selected, get their feedbacks
      if (selectedUserId) {
        const requestOptions = {
          user_id: selectedUserId,
          course_id: selectedCourseId || undefined,
          limit: 100,
          offset: 0
        };
        
        const response = await feedbackAPI.getFeedbacksByUserId(requestOptions);
        const feedbacks = response.data?.feedbacks || response.feedbacks || [];
        const totalCount = response.data?.total_count || response.total_count || 0;
        
        setFeedbackList(feedbacks);
        setTotalCount(totalCount);
        toast.showSuccess(response.message || `Loaded ${feedbacks.length} feedback(s)`);
      } else {
        // For admin view with no student filter, we need to get all students' feedbacks
        // Since feedbacks are linked to user accounts (as seen when students log in),
        // we need to find each student's user_id and use the /feedback/user/ endpoint
        
        // First, try to get all feedbacks without user_id filter - see if API returns all for admin
        let allFeedbacks = [];
        let processedCount = 0;
        let studentsWithUsers = 0;
        let studentsWithoutUsers = 0;
        
        console.log('Attempting to get all feedbacks for admin...');
        try {
          // Try calling /feedback/user/ without user_id to see if admin gets all feedbacks
          const allFeedbacksResponse = await feedbackAPI.getFeedbacksByUserId({
            course_id: selectedCourseId || undefined,
            limit: 100,
            offset: 0
            // No user_id - see if API returns all feedbacks for admin
          });
          console.log('Response from getFeedbacksByUserId without user_id:', allFeedbacksResponse);
          const feedbacksFromAllCall = allFeedbacksResponse.data?.feedbacks || 
                                      allFeedbacksResponse.data?.data?.feedbacks || 
                                      allFeedbacksResponse.feedbacks || 
                                      [];
          if (feedbacksFromAllCall.length > 0) {
            console.log(`✓ Got ${feedbacksFromAllCall.length} feedbacks without user_id filter`);
            allFeedbacks = feedbacksFromAllCall;
            processedCount = 1; // Mark as processed
          }
        } catch (err) {
          console.log('Cannot get all feedbacks without user_id, will try per-student:', err.message);
        }
        
        // If we didn't get feedbacks from the bulk call, try per-student using /feedback/student/ endpoint
        if (allFeedbacks.length === 0) {
          console.log('Bulk call failed, trying per-student approach using /feedback/student/ endpoint...');
          console.log('Total students loaded:', students.length);
          console.log('Students data:', students);
          
          if (students.length === 0) {
            toast.showInfo('No students found. Please create students first.');
            setFeedbackList([]);
            setTotalCount(0);
            setIsLoading(false);
            return;
          }
        
          // Process each student - use /feedback/student/ endpoint with their enrolled courses
          // Each student record has a 'courses' array with their enrolled courses
          for (const student of students) {
            try {
              let studentFeedbacks = [];
              
              // Get student's enrolled courses from their record
              const studentCourses = student.courses || [];
              console.log(`Processing student ${student.id} (${student.first_name} ${student.last_name})`);
              console.log(`  Enrolled in ${studentCourses.length} course(s)`, studentCourses);
              
              // If a specific course is selected, only check that course
              // Otherwise, check all courses the student is enrolled in
              const coursesToCheck = selectedCourseId 
                ? studentCourses.filter(c => c.id === selectedCourseId || c === selectedCourseId)
                : studentCourses;
              
              console.log(`  Checking ${coursesToCheck.length} course(s) for feedbacks`);
              
              // Try to fetch feedbacks for each course
              for (const course of coursesToCheck) {
                try {
                  // Handle both course object and course ID string
                  const courseId = typeof course === 'object' ? course.id : course;
                  
                  if (!courseId) {
                    console.log(`  ⚠ Skipping course - no ID found:`, course);
                    continue;
                  }
                  
                  console.log(`  Fetching feedback for student ${student.id} in course ${courseId}...`);
                  
                  const response = await feedbackAPI.getStudentFeedbacks(
                    student.id, 
                    courseId,
                    { limit: 100, offset: 0 }
                  );
                  
                  console.log(`  Response for course ${courseId}:`, response);
                  
                  // Handle different response structures
                  const courseFeedbacks = response.data?.feedbacks || 
                                        response.data?.data?.feedbacks || 
                                        response.feedbacks || 
                                        [];
                  
                  if (courseFeedbacks.length > 0) {
                    console.log(`  ✓ Found ${courseFeedbacks.length} feedback(s) for course ${courseId}`);
                    studentFeedbacks = [...studentFeedbacks, ...courseFeedbacks];
                  } else {
                    console.log(`  No feedbacks found for course ${courseId}`);
                  }
                } catch (courseErr) {
                  // If error is "student not enrolled" or "no feedbacks", just skip this course
                  const errorMsg = courseErr.message || '';
                  if (errorMsg.includes('not enrolled') || 
                      errorMsg.includes('not found') || 
                      errorMsg.includes('no feedbacks')) {
                    console.log(`  No feedbacks available for course ${typeof course === 'object' ? course.id : course} (student may not be enrolled or has no feedbacks)`);
                  } else {
                    console.error(`  Error fetching feedback for course ${typeof course === 'object' ? course.id : course}:`, courseErr);
                  }
                  // Continue with next course
                }
              }
              
              if (studentFeedbacks.length > 0) {
                console.log(`✓ Collected ${studentFeedbacks.length} feedback(s) for student ${student.id}`);
                allFeedbacks = [...allFeedbacks, ...studentFeedbacks];
                processedCount++;
                studentsWithUsers++;
              } else {
                console.log(`✗ No feedbacks found for student ${student.id}`);
                studentsWithoutUsers++;
              }
            } catch (err) {
              console.error(`Failed to process student ${student.id}:`, err);
              studentsWithoutUsers++;
            }
          }
        }
        
        console.log(`Processed ${processedCount} students with feedbacks (${studentsWithUsers} with feedbacks, ${studentsWithoutUsers} without)`);
        console.log(`Total feedbacks collected: ${allFeedbacks.length}`);
        console.log(`All feedbacks:`, allFeedbacks);
        
        // Sort by created_at descending (most recent first)
        allFeedbacks.sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB - dateA;
        });
        
        setFeedbackList(allFeedbacks);
        setTotalCount(allFeedbacks.length);
        if (allFeedbacks.length === 0) {
          toast.showInfo(`No feedbacks found. Checked ${students.length} students (${studentsWithUsers} with user accounts, ${studentsWithoutUsers} without).`);
        } else {
          toast.showSuccess(`Loaded ${allFeedbacks.length} feedback(s) from ${processedCount} student(s)`);
        }
      }
    } catch (err) {
      console.error('Failed to load feedback:', err);
      toast.showError(err.message || 'Failed to load feedback. Please try again.');
      setFeedbackList([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Load feedbacks for regular users (only their own) - no filters, just show all
  const loadUserFeedbacks = async () => {
    if (!currentUserId) {
      toast.showError('User ID not found. Please log in again.');
      return;
    }
    
    try {
      setIsLoading(true);
      // For users, don't pass course_id filter - just get all their feedbacks
      const response = await feedbackAPI.getFeedbacksByUserId({
        user_id: currentUserId,
        limit: 100,
        offset: 0
      });
      
      // Handle response structure: response.data.feedbacks or response.feedbacks
      const feedbacks = response.data?.feedbacks || response.feedbacks || [];
      const totalCount = response.data?.total_count || response.total_count || 0;
      
      setFeedbackList(feedbacks);
      setTotalCount(totalCount);
    } catch (err) {
      console.error('Failed to load feedback:', err);
      
      // Check if the error is just "no feedbacks available" - treat as empty result, not error
      const errorMessage = err.message || '';
      if (errorMessage.includes('No student profile found for this user') || 
          errorMessage.includes('no feedbacks available') ||
          errorMessage.includes('no feedbacks')) {
        // This is expected - user doesn't have feedbacks yet, just show empty list
        setFeedbackList([]);
        setTotalCount(0);
        // Don't show error toast for this case
      } else {
        // Real error - show error message
        toast.showError(err.message || 'Failed to load feedback. Please try again.');
        setFeedbackList([]);
        setTotalCount(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getRatingColor = (rating) => {
    if (!rating) return 'gray';
    if (rating >= 8) return 'success';  // 8-10 is high (ratings are 1-10)
    if (rating >= 5) return 'warning';  // 5-7 is medium
    return 'error';  // 1-4 is low
  };

  const handleViewDetails = async (feedback) => {
    try {
      const response = await feedbackAPI.getFeedback(feedback.id);
      setSelectedFeedback(response.feedback);
    } catch (err) {
      console.error('Failed to load feedback details:', err);
      toast.showError(err.message || 'Failed to load feedback details');
    }
  };

  // Auto-load feedbacks for users (no filters, just show all their feedbacks)
  // Note: We load once on mount, not on filter changes since filters are removed for users

  // Note: Admin feedbacks are loaded manually via button click, not auto-loaded
  // This gives admin control over when to fetch feedbacks

  if (feedbackList.length === 0 && !isLoading) {
    return (
      <div className="feedback-list">
        <div className="feedback-list-header">
          <h1>{isAdmin ? 'All Interview Feedback' : 'My Interview Feedback'}</h1>
          <p className="header-subtitle">
            {isAdmin 
              ? 'View and analyze all student interview performance' 
              : 'View your interview feedback and track your progress'}
          </p>
        </div>
        
        {isAdmin ? (
          <div className="feedback-filters-container">
            <div className="filters-card">
              <div className="filters-header">
                <svg className="filters-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 4C3 3.44772 3.44772 3 4 3H20C20.5523 3 21 3.44772 21 4V6.58579C21 6.851 20.8946 7.10536 20.7071 7.29289L14.2929 13.7071C14.1054 13.8946 14 14.149 14 14.4142V17L10 21V14.4142C10 14.149 9.89464 13.8946 9.70711 13.7071L3.29289 7.29289C3.10536 7.10536 3 6.851 3 6.58579V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>
                  <h3>Filter Feedback</h3>
                  <p>Filter by user (student) and course. Leave empty to see all feedbacks.</p>
                </div>
              </div>
              
              <div className="filter-inputs-grid">
                <div className="input-group">
                  <label htmlFor="student-id">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Student (Optional)
                  </label>
                  <select
                    id="student-id"
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    disabled={isLoadingOptions}
                  >
                    <option value="">All Students</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Unnamed Student'}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="input-group">
                  <label htmlFor="course-id">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Course (Optional)
                  </label>
                  <select
                    id="course-id"
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    disabled={isLoadingOptions}
                  >
                    <option value="">All Courses</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <button 
                className="load-feedback-btn"
                onClick={loadAdminFeedbacks}
                disabled={isLoading || isLoadingOptions}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 16V8C20.9996 7.64927 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3.27002 6.96L12 12.01L20.73 6.96" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 22.08V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{isLoading ? 'Loading Feedback...' : 'Load Feedback'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3>No feedback yet</h3>
            <p>Complete interviews to see your feedback here.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="feedback-list">
      <div className="feedback-list-header">
        <h1>{isAdmin ? 'All Feedback' : 'My Feedback'} ({feedbackList.length})</h1>
        {isAdmin && (
          <div className="header-filters">
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              disabled={isLoadingOptions}
              className="inline-filter"
            >
              <option value="">All Students</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Unnamed Student'}
                </option>
              ))}
            </select>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              disabled={isLoadingOptions}
              className="inline-filter"
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <button 
          className="refresh-btn"
          onClick={isAdmin ? loadAdminFeedbacks : loadUserFeedbacks}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20.49 9C19.9828 7.56678 19.1209 6.28536 17.9845 5.27542C16.8482 4.26548 15.4745 3.55976 13.9917 3.22426C12.5089 2.88875 10.9652 2.93434 9.50481 3.35677C8.04437 3.77921 6.71475 4.56471 5.64 5.64L1 10M23 14L18.36 18.36C17.2853 19.4353 15.9556 20.2208 14.4952 20.6432C13.0348 21.0657 11.4911 21.1112 10.0083 20.7757C8.52547 20.4402 7.1518 19.7345 6.01547 18.7246C4.87913 17.7146 4.01717 16.4332 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Refresh
        </button>
      </div>
      
      <div className="feedback-grid">
        {feedbackList.map(feedback => (
          <div 
            key={feedback.id} 
            className="feedback-card"
            onClick={() => handleViewDetails(feedback)}
          >
            <div className="feedback-header">
              <div className="feedback-meta">
                <h3>{feedback.student_name || 'Unknown Student'}</h3>
                <span className="feedback-date">{formatDate(feedback.created_at)}</span>
              </div>
              {feedback.average_rating && (
                <div className={`feedback-rating ${getRatingColor(feedback.average_rating)}`}>
                  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                  </svg>
                  <span>{feedback.average_rating.toFixed(1)}/10</span>
                </div>
              )}
            </div>
            
            <div className="rating-breakdown">
              <div className="mini-rating">
                <span className="rating-label">Overall:</span>
                <span className="rating-value">{feedback.overall_rating}/10</span>
              </div>
              <div className="mini-rating">
                <span className="rating-label">Technical:</span>
                <span className="rating-value">{feedback.technical_rating}/10</span>
              </div>
              <div className="mini-rating">
                <span className="rating-label">Communication:</span>
                <span className="rating-value">{feedback.communication_rating}/10</span>
              </div>
            </div>
            
            <p className="feedback-content">
              {feedback.feedback_text || 'No feedback available'}
            </p>
            
            <div className="feedback-footer">
              <div className="footer-info">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{feedback.course_name || 'Unknown Course'}</span>
              </div>
              {feedback.agent_name && (
                <div className="footer-info">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{feedback.agent_name}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedFeedback && (
        <div className="feedback-modal-overlay" onClick={() => setSelectedFeedback(null)}>
          <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Feedback Details</h2>
              <button className="close-btn" onClick={() => setSelectedFeedback(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <label>Student:</label>
                <span>{selectedFeedback.student_name || 'Unknown'}</span>
              </div>
              <div className="detail-row">
                <label>Course:</label>
                <span>{selectedFeedback.course_name || 'Unknown'}</span>
              </div>
              <div className="detail-row">
                <label>Agent:</label>
                <span>{selectedFeedback.agent_name || 'Unknown'}</span>
              </div>
              <div className="detail-row">
                <label>Date:</label>
                <span>{formatDate(selectedFeedback.created_at)}</span>
              </div>
              
              <div className="ratings-section">
                <h4>Ratings (1-10 scale)</h4>
                <div className="ratings-grid">
                  <div className="rating-item">
                    <span className="rating-label">Overall Rating:</span>
                    <span className={`rating-badge ${getRatingColor(selectedFeedback.overall_rating)}`}>
                      {selectedFeedback.overall_rating}/10
                    </span>
                  </div>
                  <div className="rating-item">
                    <span className="rating-label">Communication:</span>
                    <span className={`rating-badge ${getRatingColor(selectedFeedback.communication_rating)}`}>
                      {selectedFeedback.communication_rating}/10
                    </span>
                  </div>
                  <div className="rating-item">
                    <span className="rating-label">Technical:</span>
                    <span className={`rating-badge ${getRatingColor(selectedFeedback.technical_rating)}`}>
                      {selectedFeedback.technical_rating}/10
                    </span>
                  </div>
                  <div className="rating-item">
                    <span className="rating-label">Confidence:</span>
                    <span className={`rating-badge ${getRatingColor(selectedFeedback.confidence_rating)}`}>
                      {selectedFeedback.confidence_rating}/10
                    </span>
                  </div>
                  <div className="rating-item average">
                    <span className="rating-label">Average Rating:</span>
                    <span className={`rating-badge ${getRatingColor(selectedFeedback.average_rating)}`}>
                      {selectedFeedback.average_rating?.toFixed(1)}/10
                    </span>
                  </div>
                </div>
              </div>
              
              {selectedFeedback.feedback_text && (
                <div className="detail-section">
                  <label>Overall Assessment:</label>
                  <p className="feedback-full-content">{selectedFeedback.feedback_text}</p>
                </div>
              )}
              
              {selectedFeedback.strengths && (
                <div className="detail-section">
                  <label>Strengths:</label>
                  <p className="feedback-full-content">{selectedFeedback.strengths}</p>
                </div>
              )}
              
              {selectedFeedback.improvements && (
                <div className="detail-section">
                  <label>Areas for Improvement:</label>
                  <p className="feedback-full-content">{selectedFeedback.improvements}</p>
                </div>
              )}
              
              {selectedFeedback.recommendations && (
                <div className="detail-section">
                  <label>Recommendations:</label>
                  <p className="feedback-full-content">{selectedFeedback.recommendations}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackList;

