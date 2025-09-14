import { useState } from 'react';
import { courseAPI } from '../services/course';
import { memoryAPI } from '../services/agent_memory';
import './CreateCourseModal.css';

const CreateCourseModal = ({ onClose, onCourseCreated }) => {
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
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [createdCourseId, setCreatedCourseId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (apiError) {
      setApiError('');
    }
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
    
    // Clear error when user starts typing
    if (errors[`memory_${name}`]) {
      setErrors(prev => ({
        ...prev,
        [`memory_${name}`]: ''
      }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Course name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Course description is required';
    }
    
    if (formData.passing_score < 0 || formData.passing_score > 100) {
      newErrors.passing_score = 'Passing score must be between 0 and 100';
    }
    
    if (formData.max_score < 0 || formData.max_score > 100) {
      newErrors.max_score = 'Max score must be between 0 and 100';
    }
    
    if (formData.passing_score >= formData.max_score) {
      newErrors.passing_score = 'Passing score must be less than max score';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!agentMemory.name.trim()) {
      newErrors.memory_name = 'Memory name is required';
    }
    
    if (agentMemory.type === 'document' && !agentMemory.file) {
      newErrors.memory_file = 'Please select a document file';
    }
    
    if (agentMemory.type === 'website' && !agentMemory.url.trim()) {
      newErrors.memory_url = 'Website URL is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    if (!validateStep2()) {
      return;
    }
    
    setIsLoading(true);
    setApiError('');
    
    try {
      // Step 1: Create the course
      const courseResponse = await courseAPI.createCourse(formData);
      const course = courseResponse.course;
      setCreatedCourseId(course.id);
      
      // Step 2: Add agent memory if provided
      if (agentMemory.name.trim()) {
        try {
          const memoryResponse = await memoryAPI.addMemory(course.id, agentMemory);
          console.log('Agent memory added:', memoryResponse.message);
        } catch (memoryError) {
          console.warn('Failed to add agent memory:', memoryError);
          // Don't fail the entire operation if memory upload fails
        }
      }
      
      onCourseCreated(course);
      onClose();
    } catch (error) {
      console.error('Course creation failed:', error);
      setApiError(error.message || 'Failed to create course. Please try again.');
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
          {apiError && (
            <div className="error-message">
              {apiError}
            </div>
          )}
          
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
                  className={errors.name ? 'error' : ''}
                  placeholder="Enter course name"
                  disabled={isLoading}
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={errors.description ? 'error' : ''}
                  placeholder="Enter course description"
                  rows="3"
                  disabled={isLoading}
                />
                {errors.description && <span className="field-error">{errors.description}</span>}
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
                    className={errors.passing_score ? 'error' : ''}
                    min="0"
                    max="100"
                    step="0.1"
                    disabled={isLoading}
                  />
                  {errors.passing_score && <span className="field-error">{errors.passing_score}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="max_score">Max Score (%) *</label>
                  <input
                    type="number"
                    id="max_score"
                    name="max_score"
                    value={formData.max_score}
                    onChange={handleInputChange}
                    className={errors.max_score ? 'error' : ''}
                    min="0"
                    max="100"
                    step="0.1"
                    disabled={isLoading}
                  />
                  {errors.max_score && <span className="field-error">{errors.max_score}</span>}
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
                  className={errors.memory_name ? 'error' : ''}
                  placeholder="Enter memory name"
                  disabled={isLoading}
                />
                {errors.memory_name && <span className="field-error">{errors.memory_name}</span>}
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
                  <div className="file-upload">
                    <input
                      type="file"
                      id="memory_file"
                      name="file"
                      onChange={handleMemoryChange}
                      className={errors.memory_file ? 'error' : ''}
                      accept=".pdf,.doc,.docx,.txt"
                      disabled={isLoading}
                    />
                    <div className="file-upload-info">
                      <p>Supported formats: PDF, DOC, DOCX, TXT</p>
                      <p>Max file size: 10MB</p>
                    </div>
                  </div>
                  {errors.memory_file && <span className="field-error">{errors.memory_file}</span>}
                  {agentMemory.file && (
                    <div className="file-selected">
                      <span className="file-icon">📄</span>
                      <span className="file-name">{agentMemory.file.name}</span>
                      <span className="file-size">({(agentMemory.file.size / 1024 / 1024).toFixed(2)} MB)</span>
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
                    className={errors.memory_url ? 'error' : ''}
                    placeholder="https://example.com"
                    disabled={isLoading}
                  />
                  {errors.memory_url && <span className="field-error">{errors.memory_url}</span>}
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
