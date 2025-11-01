import { authenticatedApiCall } from './auth';

const API_BASE = '/api/v1';

export const courseAPI = {
  /**
   * Create Course - Create a new course with associated agent
   * 
   * @param {Object} courseData - Course data
   * @param {string} courseData.name - Course name
   * @param {string} courseData.description - Course description
   * @param {boolean} courseData.is_active - Whether the course is active
   * @param {number} courseData.passing_score - Passing score for the course
   * @param {number} courseData.max_score - Maximum score for the course
   * @param {string} courseData.syllabus - Course syllabus
   * @param {string} courseData.instructions - Course instructions
   * @param {string} courseData.evaluation_criteria - Evaluation criteria
   * @returns {Promise<Object>} Response with created course and agent details
   */
  createCourse: async (courseData) => {
    const requiredFields = ['name', 'description', 'is_active', 'passing_score', 'max_score'];
    
    for (const field of requiredFields) {
      if (courseData[field] === undefined || courseData[field] === null) {
        throw new Error(`${field} is required`);
      }
    }
    
    const response = await authenticatedApiCall(`/course/create/`, {
      method: 'POST',
      body: JSON.stringify(courseData)
    });
    
    // Return the response with proper structure (data is nested)
    return {
      message: response.message || 'Course created successfully',
      course: response.data?.course || response.course
    };
  },
  
  /**
   * Get Course - Get a specific course by ID
   * 
   * @param {string} courseId - The ID of the course to retrieve
   * @returns {Promise<Object>} Response with course details including agents
   */
  getCourse: async (courseId) => {
    if (!courseId) {
      throw new Error('courseId is required');
    }
    
    const response = await authenticatedApiCall(`/course/get/`, {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId })
    });
    
    // Return the response with proper structure (data is nested)
    return {
      course: response.data?.course || response.course
    };
  },
  
  /**
   * Get All Courses - Get all courses with optional filtering
   * 
   * @param {boolean} isActive - Optional: Filter by active status
   * @returns {Promise<Object>} Response with array of courses
   */
  getAllCourses: async (isActive = null) => {
    const requestBody = {};
    if (isActive !== null) {
      requestBody.is_active = isActive;
    }
    
    const response = await authenticatedApiCall(`/course/all/`, {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });
    
    // Return the response with proper structure (data is nested)
    return {
      courses: response.data?.courses || response.courses || []
    };
  },
  
  /**
   * Update Course - Update an existing course
   * 
   * @param {string} courseId - The ID of the course to update
   * @param {Object} updateData - Fields to update
   * @param {string} updateData.name - Updated course name
   * @param {string} updateData.description - Updated description
   * @param {boolean} updateData.is_active - Updated active status
   * @param {number} updateData.passing_score - Updated passing score
   * @param {number} updateData.max_score - Updated max score
   * @param {string} updateData.syllabus - Updated syllabus
   * @param {string} updateData.instructions - Updated instructions
   * @param {string} updateData.evaluation_criteria - Updated evaluation criteria
   * @returns {Promise<Object>} Response with updated course details
   */
  updateCourse: async (courseId, updateData) => {
    if (!courseId) {
      throw new Error('courseId is required');
    }
    
    const response = await authenticatedApiCall(`/course/update/`, {
      method: 'POST',
      body: JSON.stringify({
        course_id: courseId,
        ...updateData
      })
    });
    
    // Return the response with proper structure (data is nested)
    return {
      message: response.message || 'Course updated successfully',
      course: response.data?.course || response.course
    };
  },
  
  /**
   * Delete Course - Delete a course
   * 
   * @param {string} courseId - The ID of the course to delete
   * @returns {Promise<Object>} Response with deletion confirmation
   */
  deleteCourse: async (courseId) => {
    if (!courseId) {
      throw new Error('courseId is required');
    }
    
    const response = await authenticatedApiCall(`/course/delete/`, {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId })
    });
    
    // Return the response with proper structure (data is nested)
    return {
      message: response.message || 'Course deleted successfully'
    };
  },
  
  /**
   * List All Courses - Get a simple list of all courses with ID and basic information
   * 
   * @returns {Promise<Object>} Response with array of courses
   */
  listAllCourses: async () => {
    const response = await authenticatedApiCall(`/course/list/`, {
      method: 'GET'
    });
    
    console.log('listAllCourses API response:', response);
    
    // Handle different possible response structures (similar to getUserData)
    // API might return: { data: { courses: [...] } } or { courses: [...] }
    const coursesList = response.data?.courses || 
                       response.courses || 
                       [];
    
    console.log('listAllCourses extracted courses:', coursesList);
    
    // Return the response with proper structure
    return {
      courses: coursesList
    };
  }
};

export default courseAPI;
