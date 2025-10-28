import { authenticatedApiCall } from './auth';

export const studentAPI = {
  /**
   * List All Students - Get a simple list of all students with ID and names
   * 
   * @returns {Promise<Object>} Response with array of students
   */
  listAllStudents: async () => {
    const response = await authenticatedApiCall(`/student/list/`, {
      method: 'GET'
    });
    
    return {
      students: response.students || []
    };
  },

  /**
   * Create Student - Creates a new student profile
   * 
   * @param {Object} studentData - Student information
   * @param {string} studentData.first_name - Required
   * @param {string} studentData.last_name - Optional
   * @param {string} studentData.phone_number - Required
   * @param {string} studentData.email - Optional
   * @param {string} studentData.gender - Optional: "MALE", "FEMALE", "RATHER_NOT_SAY", "UNKNOWN"
   * @param {string} studentData.date_of_birth - Optional (YYYY-MM-DD format)
   * @param {Array<string>} studentData.course_ids - Optional array of course IDs
   * @returns {Promise<Object>} Response with created student data
   */
  createStudent: async (studentData) => {
    const response = await authenticatedApiCall(`/student/create/`, {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
    
    return response;
  },

  /**
   * Get Student - Gets a specific student by ID
   * 
   * @param {string} studentId - Student ID
   * @returns {Promise<Object>} Response with student data
   */
  getStudent: async (studentId) => {
    const response = await authenticatedApiCall(`/student/get/`, {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId })
    });
    
    return response;
  },

  /**
   * Get All Students - Gets all students with optional filtering
   * 
   * @param {Object} filters - Optional filters
   * @param {string} filters.course_id - Filter by course
   * @param {string} filters.phone_number - Filter by phone number
   * @param {string} filters.email - Filter by email
   * @returns {Promise<Object>} Response with array of students
   */
  getAllStudents: async (filters = {}) => {
    const response = await authenticatedApiCall(`/student/all/`, {
      method: 'POST',
      body: JSON.stringify(filters)
    });
    
    return response;
  },

  /**
   * Update Student - Updates an existing student's information
   * 
   * @param {string} studentId - Student ID (required)
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Response with updated student data
   */
  updateStudent: async (studentId, updateData) => {
    const response = await authenticatedApiCall(`/student/update/`, {
      method: 'POST',
      body: JSON.stringify({
        student_id: studentId,
        ...updateData
      })
    });
    
    return response;
  },

  /**
   * Delete Student - Deletes a student by ID
   * 
   * @param {string} studentId - Student ID
   * @returns {Promise<Object>} Response with success message
   */
  deleteStudent: async (studentId) => {
    const response = await authenticatedApiCall(`/student/delete/`, {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId })
    });
    
    return response;
  },

  /**
   * Associate User with Student - Links a user account with a student profile
   * 
   * @param {string} userId - User ID
   * @param {string} studentId - Student ID
   * @returns {Promise<Object>} Response with associated student data
   */
  associateUserWithStudent: async (userId, studentId) => {
    const response = await authenticatedApiCall(`/student/associate-user/`, {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        student_id: studentId
      })
    });
    
    return response;
  },

  /**
   * Get Student by User ID - Gets a student profile by user ID
   * 
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Response with student data
   */
  getStudentByUserId: async (userId) => {
    const response = await authenticatedApiCall(`/student/get-by-user/`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId })
    });
    
    return response;
  }
};

export default studentAPI;

