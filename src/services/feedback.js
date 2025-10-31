import { authenticatedApiCall } from './auth';

const API_BASE = '/api/v1';

export const feedbackAPI = {
  /**
   * Get Specific Feedback by ID
   * 
   * Endpoint: GET /api/v1/feedback/get/
   * 
   * @param {string} feedbackId - The ID of the feedback to retrieve
   * @returns {Promise<Object>} Response with feedback details
   * 
   * Response includes:
   * - id, student, student_name, daily_call, agent, agent_name, course_name
   * - overall_rating, communication_rating, technical_rating, confidence_rating
   * - average_rating (computed from ratings)
   * - feedback_text, strengths, improvements, recommendations
   * - created_at, updated_at
   */
  getFeedback: async (feedbackId) => {
    const response = await authenticatedApiCall(
      `/feedback/get/?feedback_id=${feedbackId}`, 
      {
        method: 'GET'
      }
    );
    
    return response;
  },
  
  /**
   * Get Student Feedbacks
   * 
   * Endpoint: GET /api/v1/feedback/student/
   * 
   * @param {string} studentId - The ID of the student
   * @param {string} courseId - The ID of the course
   * @param {Object} options - Optional parameters
   * @param {number} options.limit - Maximum number of feedbacks to return (default: 10, max: 100)
   * @param {number} options.offset - Number of feedbacks to skip (default: 0)
   * @returns {Promise<Object>} Response with array of feedback entries
   * 
   * Response includes:
   * - feedbacks: Array of feedback objects
   * - total_count: Total number of feedbacks
   * - limit: Applied limit
   * - offset: Applied offset
   */
  getStudentFeedbacks: async (studentId, courseId, options = {}) => {
    const { limit = 10, offset = 0 } = options;
    
    const queryParams = new URLSearchParams({
      student_id: studentId,
      course_id: courseId,
      limit: limit.toString(),
      offset: offset.toString()
    });
    
    const response = await authenticatedApiCall(
      `/feedback/student/?${queryParams.toString()}`, 
      {
        method: 'GET'
      }
    );
    
    return response;
  },

  /**
   * Get Feedbacks by User ID
   * 
   * Endpoint: GET /api/v1/feedback/user/
   * 
   * @param {Object} options - Optional parameters
   * @param {string} options.user_id - User ID to get feedbacks for (defaults to current user)
   * @param {string} options.course_id - Optional course ID to filter by
   * @param {number} options.limit - Maximum number of feedbacks to return (default: 10, max: 100)
   * @param {number} options.offset - Number of feedbacks to skip (default: 0)
   * @returns {Promise<Object>} Response with array of feedback entries
   * 
   * Response includes:
   * - feedbacks: Array of feedback objects
   * - total_count: Total number of feedbacks
   * - limit: Applied limit
   * - offset: Applied offset
   */
  getFeedbacksByUserId: async (options = {}) => {
    const { user_id, course_id, limit = 10, offset = 0 } = options;
    
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });
    
    if (user_id) {
      queryParams.append('user_id', user_id);
    }
    
    if (course_id) {
      queryParams.append('course_id', course_id);
    }
    
    const response = await authenticatedApiCall(
      `/feedback/user/?${queryParams.toString()}`, 
      {
        method: 'GET'
      }
    );
    
    return response;
  }
};

export default feedbackAPI;

