import { authenticatedApiCall } from './auth';

export const memoryAPI = {
  /**
   * Add Memory - Add a new memory (document or website) to a course
   * 
   * @param {string} courseId - The ID of the course
   * @param {Object} memoryData - Memory data
   * @param {string} memoryData.type - Type of memory: "document" or "website"
   * @param {string} memoryData.name - Name of the memory
   * @param {string} memoryData.url - URL (required for "website" type)
   * @param {File|string} memoryData.file - File (required for "document" type)
   * @returns {Promise<Object>} Response with success message and file path
   */
  addMemory: async (courseId, memoryData) => {
    const { type, name, url, file } = memoryData;
    
    if (!type || !name) {
      throw new Error('type and name are required');
    }
    
    if (type === 'website' && !url) {
      throw new Error('url is required for website type');
    }
    
    if (type === 'document' && !file) {
      throw new Error('file is required for document type');
    }
    
    // For document uploads, we need to use FormData
    const formData = new FormData();
    formData.append('type', type);
    formData.append('name', name);
    
    if (type === 'website' && url) {
      formData.append('url', url);
    }
    
    if (type === 'document' && file) {
      formData.append('file', file);
    }
    
    const response = await authenticatedApiCall(`/agent-memory/${courseId}/add-memory/`, {
      method: 'POST',
      body: formData,
      headers: {} // Remove Content-Type header to let browser set it with boundary for FormData
    });
    
    // Return the response directly as per API documentation
    return response;
  },
  
  /**
   * Delete Memory - Delete a memory from a course
   * 
   * @param {string} courseId - The ID of the course
   * @param {string} memoryId - The ID of the memory to delete
   * @returns {Promise<Object>} Empty response on success (204 No Content)
   */
  deleteMemory: async (courseId, memoryId) => {
    if (!courseId || !memoryId) {
      throw new Error('courseId and memoryId are required');
    }
    
    const response = await authenticatedApiCall(`/agent-memory/${courseId}/delete-memory/${memoryId}/`, {
      method: 'DELETE'
    });
    
    // Return the response directly as per API documentation (204 No Content)
    return response;
  },
  
  /**
   * Get Memory Content - Get the content of a specific memory
   * 
   * @param {string} courseId - The ID of the course
   * @param {string} memoryId - The ID of the memory
   * @returns {Promise<Object>} Response with memory content chunks
   */
  getMemoryContent: async (courseId, memoryId) => {
    if (!courseId || !memoryId) {
      throw new Error('courseId and memoryId are required');
    }
    
    const response = await authenticatedApiCall(`/agent-memory/${courseId}/memory/${memoryId}/content/`, {
      method: 'GET'
    });
    
    // Return the response directly as per API documentation
    return response;
  },
  
  /**
   * Get Memory Summary - Get summary information about a specific memory
   * 
   * @param {string} courseId - The ID of the course
   * @param {string} memoryId - The ID of the memory
   * @returns {Promise<Object>} Response with memory summary including metadata
   */
  getMemorySummary: async (courseId, memoryId) => {
    if (!courseId || !memoryId) {
      throw new Error('courseId and memoryId are required');
    }
    
    const response = await authenticatedApiCall(`/agent-memory/${courseId}/memory/${memoryId}/summary/`, {
      method: 'GET'
    });
    
    // Return the response directly as per API documentation
    return response;
  }
};

export default memoryAPI;
