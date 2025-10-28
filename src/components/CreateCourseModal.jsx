import { useState } from 'react';
import { courseAPI } from '../services/course';
import { memoryAPI } from '../services/agent_memory';
import { useToast } from './ToastContainer';
import './CreateCourseModal.css';

const CreateCourseModal = ({ onClose, onCourseCreated }) => {
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
  
  const [agentMemory, setAgentMemory] = useState({
    type: 'document',
    name: '',
    file: null,
    url: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMemoryChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'file') {
      setAgentMemory(prev => ({
        ...prev,
        [name]: e.target.files[0] || null
      }));
    } else {
      setAgentMemory(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleNext = () => {
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Step 1: Create the course
      const courseResponse = await courseAPI.createCourse(formData);
      const course = courseResponse.course;
      toast.showSuccess(courseResponse.message || 'Course created successfully');
      
      // Step 2: Add agent memory if provided
      if (agentMemory.name.trim()) {
        try {
          const memoryResponse = await memoryAPI.addMemory(course.id, agentMemory);
          toast.showSuccess(memoryResponse.message || 'Agent memory added successfully');
        } catch (memoryError) {
          console.warn('Failed to add agent memory:', memoryError);
          toast.showWarning(memoryError.message || 'Course created but failed to add agent memory');
        }
      }
      
      onCourseCreated(course);
      onClose();
    } catch (error) {
      console.error('Course creation failed:', error);
      toast.showError(error.message || 'Failed to create course. Please try again.');
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
          <h2>Create New Course</h2>
          <button className="close-btn" onClick={handleClose} disabled={isLoading}>
            ×
          </button>
        </div>
        
        <div className="modal-body">
          {/* Step Indicator */}
          <div className="step-indicator">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Course Details</span>
            </div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Agent Memory</span>
            </div>
          </div>
          
          {/* Step 1: Course Details */}
          {currentStep === 1 && (
            <div className="step-content">
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
                  <span className="checkmark"></span>
                  Active Course
                </label>
              </div>
            </div>
          )}
          
          {/* Step 2: Agent Memory */}
          {currentStep === 2 && (
            <div className="step-content">
              <div className="step-description">
                <h3>Agent Memory (Optional)</h3>
                <p>Add context documents or websites that the AI agent can reference during interviews.</p>
              </div>
              
              <div className="form-group">
                <label htmlFor="memory_name">Memory Name *</label>
                <input
                  type="text"
                  id="memory_name"
                  name="name"
                  value={agentMemory.name}
                  onChange={handleMemoryChange}
                  placeholder="Enter memory name"
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="memory_type">Memory Type</label>
                <select
                  id="memory_type"
                  name="type"
                  value={agentMemory.type}
                  onChange={handleMemoryChange}
                  disabled={isLoading}
                >
                  <option value="document">Document</option>
                  <option value="website">Website</option>
                </select>
              </div>
              
              {agentMemory.type === 'document' && (
                <div className="form-group">
                  <label htmlFor="memory_file">Upload Document *</label>
                  <div className="file-upload-wrapper">
                    <label htmlFor="memory_file" className="file-upload-label">
                      <svg className="upload-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="upload-text">
                        {agentMemory.file ? 'Change file' : 'Click to choose file or drag and drop'}
                      </span>
                      <span className="upload-hint">PDF, DOC, DOCX, TXT (Max 10MB)</span>
                    </label>
                    <input
                      type="file"
                      id="memory_file"
                      name="file"
                      onChange={handleMemoryChange}
                      accept=".pdf,.doc,.docx,.txt"
                      disabled={isLoading}
                      className="file-input-hidden"
                    />
                  </div>
                  {agentMemory.file && (
                    <div className="file-selected">
                      <svg className="file-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <div className="file-info">
                        <span className="file-name">{agentMemory.file.name}</span>
                        <span className="file-size">{(agentMemory.file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                      <button 
                        type="button" 
                        className="file-remove"
                        onClick={() => setAgentMemory(prev => ({ ...prev, file: null }))}
                      >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {agentMemory.type === 'website' && (
                <div className="form-group">
                  <label htmlFor="memory_url">Website URL *</label>
                  <input
                    type="url"
                    id="memory_url"
                    name="url"
                    value={agentMemory.url}
                    onChange={handleMemoryChange}
                    placeholder="https://example.com"
                    disabled={isLoading}
                  />
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <div className="footer-buttons">
            {currentStep === 1 ? (
              <button className="btn btn-secondary" onClick={handleClose} disabled={isLoading}>
                Cancel
              </button>
            ) : (
              <button className="btn btn-secondary" onClick={handleBack} disabled={isLoading}>
                Back
              </button>
            )}
            
            {currentStep === 1 ? (
              <button className="btn btn-primary" onClick={handleNext} disabled={isLoading}>
                Next
              </button>
            ) : (
              <button 
                className="btn btn-primary" 
                onClick={handleSubmit} 
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Course'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCourseModal;
