/**
 * Course API Usage Examples
 * 
 * This file demonstrates how to use the updated course API service with the correct response structure.
 */

import { courseAPI } from './course';

// =============================================================================
// COURSE API USAGE EXAMPLES
// =============================================================================

export const courseUsageExamples = {
  // Example 1: Create a new course
  async createCourse() {
    try {
      const courseData = {
        name: 'Introduction to AI',
        description: 'Learn the basics of artificial intelligence and machine learning',
        is_active: true,
        passing_score: 70.0,
        max_score: 100.0,
        syllabus: 'Week 1: Introduction to AI\nWeek 2: Machine Learning Basics\nWeek 3: Deep Learning',
        instructions: 'Complete all assignments and pass the final exam to receive certification',
        evaluation_criteria: 'Based on assignments (40%), quizzes (30%), and final exam (30%)'
      };
      
      const response = await courseAPI.createCourse(courseData);
      
      // Response structure as per API documentation:
      // {
      //   "message": "Course and associated agent created successfully",
      //   "course": {
      //     "id": "UUID",
      //     "name": "Introduction to AI",
      //     "description": "...",
      //     "is_active": true,
      //     "passing_score": "70.0",
      //     "max_score": "100.0",
      //     "syllabus": "...",
      //     "instructions": "...",
      //     "evaluation_criteria": "...",
      //     "created_at": "2025-01-XX...",
      //     "updated_at": "2025-01-XX...",
      //     "agents": [...]
      //   }
      // }
      
      console.log('Course created successfully:', response.message);
      console.log('Course ID:', response.course.id);
      console.log('Agent ID:', response.course.agents[0].id);
      
      return response.course;
    } catch (error) {
      console.error('Failed to create course:', error.message);
      throw error;
    }
  },

  // Example 2: Get all courses
  async getAllCourses() {
    try {
      // Get all active courses
      const response = await courseAPI.getAllCourses(true);
      
      // Response structure:
      // {
      //   "courses": [
      //     {
      //       "id": "UUID",
      //       "name": "Course Name",
      //       "description": "...",
      //       "is_active": true,
      //       "passing_score": "70.0",
      //       "max_score": "100.0",
      //       "syllabus": "...",
      //       "instructions": "...",
      //       "evaluation_criteria": "...",
      //       "created_at": "2025-01-XX...",
      //       "updated_at": "2025-01-XX..."
      //     }
      //   ]
      // }
      
      console.log('Total courses:', response.courses.length);
      return response.courses;
    } catch (error) {
      console.error('Failed to get courses:', error.message);
      throw error;
    }
  },

  // Example 3: Get a specific course
  async getCourse(courseId) {
    try {
      const response = await courseAPI.getCourse(courseId);
      
      // Response structure:
      // {
      //   "course": {
      //     "id": "UUID",
      //     "name": "Course Name",
      //     "description": "...",
      //     "is_active": true,
      //     "passing_score": "70.0",
      //     "max_score": "100.0",
      //     "syllabus": "...",
      //     "instructions": "...",
      //     "evaluation_criteria": "...",
      //     "created_at": "2025-01-XX...",
      //     "updated_at": "2025-01-XX...",
      //     "agents": [...]
      //   }
      // }
      
      console.log('Course details:', response.course.name);
      console.log('Course agents:', response.course.agents);
      
      return response.course;
    } catch (error) {
      console.error('Failed to get course:', error.message);
      throw error;
    }
  },

  // Example 4: Update a course
  async updateCourse(courseId) {
    try {
      const updateData = {
        name: 'Advanced AI Concepts',
        description: 'Deep dive into advanced AI topics and applications',
        is_active: false // Deactivate the course
      };
      
      const response = await courseAPI.updateCourse(courseId, updateData);
      
      // Response structure:
      // {
      //   "message": "Course updated successfully",
      //   "course": {
      //     "id": "UUID",
      //     "name": "Advanced AI Concepts",
      //     "description": "...",
      //     "is_active": false,
      //     "passing_score": "70.0",
      //     "max_score": "100.0",
      //     "syllabus": "...",
      //     "instructions": "...",
      //     "evaluation_criteria": "...",
      //     "created_at": "2025-01-XX...",
      //     "updated_at": "2025-01-XX..."
      //   }
      // }
      
      console.log('Course updated:', response.message);
      return response.course;
    } catch (error) {
      console.error('Failed to update course:', error.message);
      throw error;
    }
  },

  // Example 5: Delete a course
  async deleteCourse(courseId) {
    try {
      const response = await courseAPI.deleteCourse(courseId);
      
      // Response structure:
      // {
      //   "message": "Course deleted successfully"
      // }
      
      console.log('Course deleted:', response.message);
      return response;
    } catch (error) {
      console.error('Failed to delete course:', error.message);
      throw error;
    }
  }
};

// =============================================================================
// REACT COMPONENT USAGE EXAMPLES
// =============================================================================

export const reactComponentExamples = {
  // Example: Course list component
  async loadCoursesInComponent() {
    try {
      const response = await courseAPI.getAllCourses(true);
      const courses = response.courses || [];
      
      // Display courses in UI
      return courses.map(course => ({
        id: course.id,
        name: course.name,
        description: course.description,
        isActive: course.is_active,
        passingScore: parseFloat(course.passing_score),
        maxScore: parseFloat(course.max_score),
        createdAt: new Date(course.created_at),
        updatedAt: new Date(course.updated_at)
      }));
    } catch (error) {
      console.error('Failed to load courses:', error);
      return [];
    }
  },

  // Example: Create course form submission
  async handleCreateCourse(formData) {
    try {
      const response = await courseAPI.createCourse(formData);
      
      if (response.course) {
        // Success - show success message and redirect
        console.log('Course created successfully!');
        return {
          success: true,
          course: response.course,
          message: response.message
        };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Course creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

export default {
  course: courseUsageExamples,
  react: reactComponentExamples
};
