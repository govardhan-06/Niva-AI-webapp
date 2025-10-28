import { useState, useEffect } from 'react';
import { courseAPI } from '../services/course';
import { useToast } from './ToastContainer';
import './CreateCourseModal.css';

const EditCourseModal = ({ course, onClose, onCourseUpdated }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
    passing_score: 70.0,
    max_score: 100.0,
    syllabus: '',
    instructions: '',
    evaluation_criteria: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name || '',
        description: course.description || '',
        is_active: course.is_active ?? true,
        passing_score: course.passing_score || 70.0,
        max_score: course.max_score || 100.0,
        syllabus: course.syllabus || '',
        instructions: course.instructions || '',
        evaluation_criteria: course.evaluation_criteria || ''
      });
    }
  }, [course]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    try {
      const response = await courseAPI.updateCourse(course.id, formData);
      toast.showSuccess(response.message || 'Course updated successfully');
      onCourseUpdated(response.course);
      onClose();
    } catch (error) {
      console.error('Course update failed:', error);
      toast.showError(error.message || 'Failed to update course. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Course</h2>
          <button className="close-btn" onClick={handleClose} disabled={isLoading}>
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="name">Course Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter course name"
                disabled={isLoading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter course description"
                rows="3"
                disabled={isLoading}
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="passing_score">Passing Score (%) *</label>
                <input
                  type="number"
                  id="passing_score"
                  name="passing_score"
                  value={formData.passing_score}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.1"
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="max_score">Max Score (%) *</label>
                <input
                  type="number"
                  id="max_score"
                  name="max_score"
                  value={formData.max_score}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.1"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="syllabus">Syllabus</label>
              <textarea
                id="syllabus"
                name="syllabus"
                value={formData.syllabus}
                onChange={handleInputChange}
                placeholder="Enter course syllabus"
                rows="3"
                disabled={isLoading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="instructions">Instructions</label>
              <textarea
                id="instructions"
                name="instructions"
                value={formData.instructions}
                onChange={handleInputChange}
                placeholder="Enter course instructions"
                rows="3"
                disabled={isLoading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="evaluation_criteria">Evaluation Criteria</label>
              <textarea
                id="evaluation_criteria"
                name="evaluation_criteria"
                value={formData.evaluation_criteria}
                onChange={handleInputChange}
                placeholder="Enter evaluation criteria"
                rows="3"
                disabled={isLoading}
              />
            </div>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <span>Active Course</span>
              </label>
            </div>
          </div>
          
          <div className="modal-footer">
            <div className="footer-buttons">
              <button 
                type="button"
                className="btn btn-secondary" 
                onClick={handleClose} 
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn btn-primary" 
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Course'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCourseModal;

