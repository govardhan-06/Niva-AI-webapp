/**
 * Agent Memory API Usage Examples
 * 
 * This file demonstrates how to use the updated agent memory API service with the correct response structure.
 */

import { memoryAPI } from './agent_memory';

// =============================================================================
// AGENT MEMORY API USAGE EXAMPLES
// =============================================================================

export const memoryUsageExamples = {
  // Example 1: Add a document memory
  async addDocumentMemory(courseId, file) {
    try {
      const memoryData = {
        type: 'document',
        name: 'Course Manual',
        file: file // File object from input element
      };
      
      const response = await memoryAPI.addMemory(courseId, memoryData);
      
      // Response structure for document:
      // {
      //   "message": "Document uploaded and processed successfully",
      //   "file_path": "/path/to/file"
      // }
      
      console.log('Document uploaded:', response.message);
      console.log('File path:', response.file_path);
      
      return response;
    } catch (error) {
      console.error('Failed to add document memory:', error.message);
      throw error;
    }
  },

  // Example 2: Add a website memory
  async addWebsiteMemory(courseId) {
    try {
      const memoryData = {
        type: 'website',
        name: 'AI Resources',
        url: 'https://example.com/ai-resources'
      };
      
      const response = await memoryAPI.addMemory(courseId, memoryData);
      
      // Response structure for website:
      // {
      //   "message": "Website memory added successfully"
      // }
      
      console.log('Website memory added:', response.message);
      
      return response;
    } catch (error) {
      console.error('Failed to add website memory:', error.message);
      throw error;
    }
  },

  // Example 3: Get memory content
  async getMemoryContent(courseId, memoryId) {
    try {
      const response = await memoryAPI.getMemoryContent(courseId, memoryId);
      
      // Response structure:
      // {
      //   "results": [
      //     {
      //       "content": "Document content...",
      //       "chunk_index": 0,
      //       "created_at": "2025-01-XX..."
      //     },
      //     {
      //       "content": "More document content...",
      //       "chunk_index": 1,
      //       "created_at": "2025-01-XX..."
      //     }
      //   ]
      // }
      
      console.log('Memory content chunks:', response.results.length);
      response.results.forEach((chunk, index) => {
        console.log(`Chunk ${index}: ${chunk.content.substring(0, 100)}...`);
      });
      
      return response.results;
    } catch (error) {
      console.error('Failed to get memory content:', error.message);
      throw error;
    }
  },

  // Example 4: Get memory summary
  async getMemorySummary(courseId, memoryId) {
    try {
      const response = await memoryAPI.getMemorySummary(courseId, memoryId);
      
      // Response structure:
      // {
      //   "memory_id": "UUID",
      //   "name": "Memory Name",
      //   "type": "document",
      //   "url": "/path/to/file",
      //   "course_id": "UUID",
      //   "course_name": "Course Name",
      //   "chunk_count": 5,
      //   "total_content_length": 1000,
      //   "preview": "First 500 characters of content...",
      //   "created_at": "2025-01-XX...",
      //   "updated_at": "2025-01-XX..."
      // }
      
      console.log('Memory summary:', response.name);
      console.log('Type:', response.type);
      console.log('Chunks:', response.chunk_count);
      console.log('Content length:', response.total_content_length);
      console.log('Preview:', response.preview);
      
      return response;
    } catch (error) {
      console.error('Failed to get memory summary:', error.message);
      throw error;
    }
  },

  // Example 5: Delete memory
  async deleteMemory(courseId, memoryId) {
    try {
      const response = await memoryAPI.deleteMemory(courseId, memoryId);
      
      // Response structure (204 No Content):
      // Empty response body
      
      console.log('Memory deleted successfully');
      
      return response;
    } catch (error) {
      console.error('Failed to delete memory:', error.message);
      throw error;
    }
  }
};

// =============================================================================
// REACT COMPONENT USAGE EXAMPLES
// =============================================================================

export const reactComponentExamples = {
  // Example: File upload for memory in course creation
  async handleFileUploadInCourseCreation(courseId, fileInput) {
    try {
      const file = fileInput.files[0];
      if (!file) {
        throw new Error('Please select a file');
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 
                           'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                           'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please select a PDF, DOC, DOCX, or TXT file');
      }
      
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 10MB');
      }
      
      const response = await memoryAPI.addMemory(courseId, {
        type: 'document',
        name: file.name,
        file: file
      });
      
      return {
        success: true,
        message: response.message,
        filePath: response.file_path
      };
    } catch (error) {
      console.error('File upload failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Example: Add website memory
  async handleWebsiteMemory(courseId, url, name) {
    try {
      // Validate URL
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(url)) {
        throw new Error('Please enter a valid URL starting with http:// or https://');
      }
      
      const response = await memoryAPI.addMemory(courseId, {
        type: 'website',
        name: name,
        url: url
      });
      
      return {
        success: true,
        message: response.message
      };
    } catch (error) {
      console.error('Website memory addition failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Example: Display memory list with summaries
  async loadMemorySummaries(courseId, memoryIds) {
    try {
      const memorySummaries = await Promise.all(
        memoryIds.map(async (memoryId) => {
          try {
            const summary = await memoryAPI.getMemorySummary(courseId, memoryId);
            return summary;
          } catch (error) {
            console.error(`Failed to load memory ${memoryId}:`, error);
            return null;
          }
        })
      );
      
      // Filter out null results (failed loads)
      return memorySummaries.filter(summary => summary !== null);
    } catch (error) {
      console.error('Failed to load memory summaries:', error);
      return [];
    }
  },

  // Example: Memory management in course settings
  async manageCourseMemory(courseId) {
    try {
      // This would typically be called from a course management component
      // where users can view, add, and delete memories for a specific course
      
      console.log(`Managing memory for course: ${courseId}`);
      
      // Example: Get all memory summaries for a course
      // Note: You would need to implement a "get all memories" endpoint
      // or maintain a list of memory IDs for each course
      
      return {
        success: true,
        message: 'Memory management initialized'
      };
    } catch (error) {
      console.error('Memory management failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export const memoryUtils = {
  // Validate file for memory upload
  validateFile: (file) => {
    const errors = [];
    
    if (!file) {
      errors.push('Please select a file');
      return errors;
    }
    
    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      errors.push('Please select a PDF, DOC, DOCX, or TXT file');
    }
    
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      errors.push('File size must be less than 10MB');
    }
    
    return errors;
  },

  // Validate URL for website memory
  validateUrl: (url) => {
    const errors = [];
    
    if (!url) {
      errors.push('URL is required');
      return errors;
    }
    
    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(url)) {
      errors.push('Please enter a valid URL starting with http:// or https://');
    }
    
    return errors;
  },

  // Format file size for display
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

export default {
  memory: memoryUsageExamples,
  react: reactComponentExamples,
  utils: memoryUtils
};
