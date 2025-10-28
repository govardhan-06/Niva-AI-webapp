import { useState, useEffect } from 'react';
import { studentAPI } from '../services/student';
import { courseAPI } from '../services/course';
import { tokenManager } from '../services/auth';
import { useToast } from './ToastContainer';
import './StudentProfileModal.css';

const StudentProfileModal = ({ isOpen, onClose, onSuccess }) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
    gender: 'UNKNOWN',
    date_of_birth: '',
    course_ids: []
  });
  const [errors, setErrors] = useState({});

  // Load courses when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCourses();
    }
  }, [isOpen]);

  const loadCourses = async () => {
    try {
      const response = await courseAPI.getAllCourses();
      if (response.courses) {
        setCourses(response.courses.filter(course => course.is_active));
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
      // Don't block the modal if courses fail to load
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCourseToggle = (courseId) => {
    setFormData(prev => ({
      ...prev,
      course_ids: prev.course_ids.includes(courseId)
        ? prev.course_ids.filter(id => id !== courseId)
        : [...prev.course_ids, courseId]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!/^\+?[\d\s\-()]+$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Please enter a valid phone number';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.date_of_birth) {
      const selectedDate = new Date(formData.date_of_birth);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.date_of_birth = 'Date of birth cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.showError('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);

    try {
      const userId = tokenManager.getUserId();
      if (!userId) {
        throw new Error('User ID not found. Please log in again.');
      }

      // Create student profile according to API spec:
      // Required: first_name, phone_number
      // Optional: last_name (defaults to ""), email (defaults to ""), 
      //           gender (defaults to "UNKNOWN"), date_of_birth (defaults to null),
      //           course_ids (defaults to [])
      const studentData = {
        first_name: formData.first_name.trim(),
        phone_number: formData.phone_number.trim(),
        gender: formData.gender || 'UNKNOWN'
      };

      // Include optional fields only if they have values (API will use defaults otherwise)
      if (formData.last_name && formData.last_name.trim()) {
        studentData.last_name = formData.last_name.trim();
      }
      if (formData.email && formData.email.trim()) {
        studentData.email = formData.email.trim();
      }
      if (formData.date_of_birth) {
        studentData.date_of_birth = formData.date_of_birth;
      }
      if (formData.course_ids && Array.isArray(formData.course_ids) && formData.course_ids.length > 0) {
        studentData.course_ids = formData.course_ids;
      }

      let createResponse;
      try {
        createResponse = await studentAPI.createStudent(studentData);
        console.log('Create student response (full):', JSON.stringify(createResponse, null, 2));
        console.log('Response type:', typeof createResponse);
        console.log('Response keys:', Object.keys(createResponse || {}));
      } catch (apiError) {
        console.error('Error calling createStudent API:', apiError);
        throw new Error(`API call failed: ${apiError.message || 'Unknown error'}`);
      }

      // Check if response has the expected structure
      if (!createResponse) {
        console.error('Create response is null or undefined');
        throw new Error('Failed to create student profile - no response received');
      }

      // Handle different possible response structures
      let studentObj = null;
      let studentId = null;

      if (createResponse.student) {
        studentObj = createResponse.student;
        studentId = createResponse.student.id;
      } else if (createResponse.id) {
        // Handle case where response might be the student object directly
        studentObj = createResponse;
        studentId = createResponse.id;
      } else if (createResponse.data && createResponse.data.student) {
        // Handle case where response might be wrapped in a data property
        studentObj = createResponse.data.student;
        studentId = createResponse.data.student.id;
      }

      if (!studentObj || !studentId) {
        console.error('Invalid create response structure:', createResponse);
        console.error('Expected structure: { message: "...", student: { id: "...", ... } }');
        throw new Error(`Failed to create student profile - invalid response structure. Received: ${JSON.stringify(createResponse)}`);
      }

      console.log('Extracted student ID:', studentId);

      // Associate user with student
      try {
        const associateResponse = await studentAPI.associateUserWithStudent(userId, studentId);
        console.log('Associate user response:', associateResponse);
      } catch (associateError) {
        console.error('Error associating user with student:', associateError);
        // Even if association fails, we can still store the student ID
        // and show a warning instead of failing completely
        toast.showWarning('Student profile created but user association may have failed. Please try again from settings.');
      }

      // Store student ID
      tokenManager.setStudentId(studentId);

      toast.showSuccess('Student profile created successfully!');
      
      if (onSuccess) {
        onSuccess(studentObj);
      }
      
      onClose();
    } catch (error) {
      console.error('Error creating student profile:', error);
      toast.showError(error.message || 'Failed to create student profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <h2>Complete Your Profile</h2>
            <p className="modal-subtitle">Join as a student to access courses and interviews</p>
          </div>
          <button 
            className="close-btn" 
            onClick={handleSkip}
            disabled={isLoading}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="info-banner">
              <span className="info-icon">ℹ️</span>
              <p>Create your student profile to participate in courses and mock interviews</p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">
                  First Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  disabled={isLoading}
                  className={errors.first_name ? 'error' : ''}
                />
                {errors.first_name && (
                  <span className="field-error">{errors.first_name}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="last_name">Last Name</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone_number">
                  Phone Number <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="+1234567890"
                  disabled={isLoading}
                  className={errors.phone_number ? 'error' : ''}
                />
                {errors.phone_number && (
                  <span className="field-error">{errors.phone_number}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email (Optional)</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  disabled={isLoading}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && (
                  <span className="field-error">{errors.email}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="UNKNOWN">Prefer not to say</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="RATHER_NOT_SAY">Rather not say</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="date_of_birth">Date of Birth</label>
                <input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  disabled={isLoading}
                  max={new Date().toISOString().split('T')[0]}
                  className={errors.date_of_birth ? 'error' : ''}
                />
                {errors.date_of_birth && (
                  <span className="field-error">{errors.date_of_birth}</span>
                )}
              </div>
            </div>

            {courses.length > 0 && (
              <div className="form-group">
                <label>Select Courses (Optional)</label>
                <div className="courses-grid">
                  {courses.map(course => (
                    <label key={course.id} className="course-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.course_ids.includes(course.id)}
                        onChange={() => handleCourseToggle(course.id)}
                        disabled={isLoading}
                      />
                      <div className="course-info">
                        <span className="course-name">{course.name}</span>
                        {course.description && (
                          <span className="course-description">{course.description}</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <div className="footer-buttons">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleSkip}
                disabled={isLoading}
              >
                Skip for Now
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Profile...' : 'Create Profile'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentProfileModal;

