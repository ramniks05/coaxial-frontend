import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './MasterDataComponent.css';

const TestTemplates = ({ onClose, onCreateFromTemplate }) => {
  const { addNotification } = useApp();
  
  // Predefined test templates
  const templates = [
    {
      id: 'practice-basic',
      name: 'Basic Practice Test',
      description: 'Standard practice test with basic configuration',
      icon: '📝',
      category: 'Practice',
      difficulty: 'Beginner',
      config: {
        testType: 'PRACTICE',
        timeLimitMinutes: 60,
        totalMarks: 100,
        passingMarks: 40,
        negativeMarking: false,
        maxAttempts: 3,
        allowReview: true,
        showCorrectAnswers: true,
        shuffleQuestions: false,
        shuffleOptions: false,
        allowSkip: true,
        timePerQuestion: 0
      },
      recommendedQuestions: 25,
      estimatedDuration: '60 minutes'
    },
    {
      id: 'mock-exam',
      name: 'Mock Exam',
      description: 'Full-length mock exam with strict timing',
      icon: '🎯',
      category: 'Mock',
      difficulty: 'Advanced',
      config: {
        testType: 'MOCK',
        timeLimitMinutes: 180,
        totalMarks: 300,
        passingMarks: 120,
        negativeMarking: true,
        negativeMarkPercentage: 25,
        maxAttempts: 1,
        allowReview: false,
        showCorrectAnswers: false,
        shuffleQuestions: true,
        shuffleOptions: true,
        allowSkip: false,
        timePerQuestion: 0
      },
      recommendedQuestions: 100,
      estimatedDuration: '3 hours'
    },
    {
      id: 'quiz-short',
      name: 'Quick Quiz',
      description: 'Short quiz for quick assessment',
      icon: '⚡',
      category: 'Quiz',
      difficulty: 'Beginner',
      config: {
        testType: 'QUIZ',
        timeLimitMinutes: 15,
        totalMarks: 20,
        passingMarks: 10,
        negativeMarking: false,
        maxAttempts: 2,
        allowReview: true,
        showCorrectAnswers: true,
        shuffleQuestions: false,
        shuffleOptions: false,
        allowSkip: true,
        timePerQuestion: 30
      },
      recommendedQuestions: 10,
      estimatedDuration: '15 minutes'
    },
    {
      id: 'final-exam',
      name: 'Final Examination',
      description: 'Comprehensive final exam with all features',
      icon: '🎓',
      category: 'Final',
      difficulty: 'Expert',
      config: {
        testType: 'FINAL',
        timeLimitMinutes: 240,
        totalMarks: 400,
        passingMarks: 160,
        negativeMarking: true,
        negativeMarkPercentage: 33,
        maxAttempts: 1,
        allowReview: false,
        showCorrectAnswers: false,
        shuffleQuestions: true,
        shuffleOptions: true,
        allowSkip: false,
        timePerQuestion: 0
      },
      recommendedQuestions: 100,
      estimatedDuration: '4 hours'
    },
    {
      id: 'diagnostic-test',
      name: 'Diagnostic Test',
      description: 'Assessment test to identify knowledge gaps',
      icon: '🔍',
      category: 'Assessment',
      difficulty: 'Intermediate',
      config: {
        testType: 'PRACTICE',
        timeLimitMinutes: 90,
        totalMarks: 150,
        passingMarks: 60,
        negativeMarking: false,
        maxAttempts: 2,
        allowReview: true,
        showCorrectAnswers: true,
        shuffleQuestions: false,
        shuffleOptions: false,
        allowSkip: true,
        timePerQuestion: 0
      },
      recommendedQuestions: 50,
      estimatedDuration: '90 minutes'
    },
    {
      id: 'speed-test',
      name: 'Speed Test',
      description: 'Fast-paced test to improve speed and accuracy',
      icon: '🏃',
      category: 'Speed',
      difficulty: 'Advanced',
      config: {
        testType: 'PRACTICE',
        timeLimitMinutes: 30,
        totalMarks: 60,
        passingMarks: 30,
        negativeMarking: true,
        negativeMarkPercentage: 50,
        maxAttempts: 5,
        allowReview: false,
        showCorrectAnswers: false,
        shuffleQuestions: true,
        shuffleOptions: true,
        allowSkip: false,
        timePerQuestion: 30
      },
      recommendedQuestions: 30,
      estimatedDuration: '30 minutes'
    }
  ];
  
  // State for template selection and customization
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customizationMode, setCustomizationMode] = useState(false);
  const [customizedConfig, setCustomizedConfig] = useState({});
  
  // Handle template selection
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setCustomizedConfig({ ...template.config });
  };
  
  // Handle configuration change
  const handleConfigChange = (key, value) => {
    setCustomizedConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Handle create from template
  const handleCreateFromTemplate = () => {
    if (!selectedTemplate) {
      addNotification('Please select a template first', 'warning');
      return;
    }
    
    // Create the test configuration
    const testConfig = {
      testName: '',
      description: selectedTemplate.description,
      instructions: getDefaultInstructions(selectedTemplate.id),
      ...customizedConfig
    };
    
    onCreateFromTemplate(testConfig);
    addNotification(`Template "${selectedTemplate.name}" applied successfully!`, 'success');
  };
  
  // Get default instructions based on template
  const getDefaultInstructions = (templateId) => {
    const instructions = {
      'practice-basic': 'This is a practice test. Take your time to understand each question. You can review your answers before submitting.',
      'mock-exam': 'This is a mock exam simulating real exam conditions. No review allowed. Answer all questions within the time limit.',
      'quiz-short': 'This is a quick quiz. Answer all questions within the time limit. You can review your answers.',
      'final-exam': 'This is a final examination. Follow all instructions carefully. No external help allowed.',
      'diagnostic-test': 'This diagnostic test will help identify your strengths and areas for improvement. Answer honestly.',
      'speed-test': 'This is a speed test. Focus on accuracy while maintaining speed. Negative marking applies for wrong answers.'
    };
    
    return instructions[templateId] || 'Please read all questions carefully and answer to the best of your ability.';
  };
  
  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      'Practice': '#3b82f6',
      'Mock': '#8b5cf6',
      'Quiz': '#10b981',
      'Final': '#ef4444',
      'Assessment': '#f59e0b',
      'Speed': '#ec4899'
    };
    return colors[category] || '#6b7280';
  };
  
  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Beginner': '#22c55e',
      'Intermediate': '#f59e0b',
      'Advanced': '#ef4444',
      'Expert': '#8b5cf6'
    };
    return colors[difficulty] || '#6b7280';
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-content test-templates-modal">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title">
            <h3>📋 Test Templates</h3>
            <p>Choose from pre-configured test templates or customize your own</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="modal-body">
          {!customizationMode ? (
            // Template Selection
            <div className="templates-section">
              <div className="templates-grid">
                {templates.map(template => (
                  <div 
                    key={template.id} 
                    className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="template-header">
                      <div className="template-icon">{template.icon}</div>
                      <div className="template-info">
                        <h4>{template.name}</h4>
                        <p>{template.description}</p>
                      </div>
                    </div>
                    
                    <div className="template-meta">
                      <div className="template-tags">
                        <span 
                          className="category-tag"
                          style={{ backgroundColor: getCategoryColor(template.category) }}
                        >
                          {template.category}
                        </span>
                        <span 
                          className="difficulty-tag"
                          style={{ backgroundColor: getDifficultyColor(template.difficulty) }}
                        >
                          {template.difficulty}
                        </span>
                      </div>
                    </div>
                    
                    <div className="template-details">
                      <div className="detail-item">
                        <span className="detail-label">Duration:</span>
                        <span className="detail-value">{template.estimatedDuration}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Questions:</span>
                        <span className="detail-value">{template.recommendedQuestions}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Marks:</span>
                        <span className="detail-value">{template.config.totalMarks}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Attempts:</span>
                        <span className="detail-value">{template.config.maxAttempts}</span>
                      </div>
                    </div>
                    
                    {selectedTemplate?.id === template.id && (
                      <div className="template-selection">
                        <div className="selection-indicator">✓ Selected</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Template Preview */}
              {selectedTemplate && (
                <div className="template-preview">
                  <div className="preview-header">
                    <h4>📋 Template Preview</h4>
                    <span className="template-name">{selectedTemplate.name}</span>
                  </div>
                  
                  <div className="preview-content">
                    <div className="preview-section">
                      <h5>Configuration</h5>
                      <div className="config-grid">
                        <div className="config-item">
                          <span className="config-label">Time Limit:</span>
                          <span className="config-value">{selectedTemplate.config.timeLimitMinutes} minutes</span>
                        </div>
                        <div className="config-item">
                          <span className="config-label">Total Marks:</span>
                          <span className="config-value">{selectedTemplate.config.totalMarks}</span>
                        </div>
                        <div className="config-item">
                          <span className="config-label">Passing Marks:</span>
                          <span className="config-value">{selectedTemplate.config.passingMarks}</span>
                        </div>
                        <div className="config-item">
                          <span className="config-label">Negative Marking:</span>
                          <span className="config-value">{selectedTemplate.config.negativeMarking ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="config-item">
                          <span className="config-label">Max Attempts:</span>
                          <span className="config-value">{selectedTemplate.config.maxAttempts}</span>
                        </div>
                        <div className="config-item">
                          <span className="config-label">Shuffle Questions:</span>
                          <span className="config-value">{selectedTemplate.config.shuffleQuestions ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="preview-section">
                      <h5>Features</h5>
                      <div className="features-list">
                        {selectedTemplate.config.allowReview && <span className="feature">✓ Review Allowed</span>}
                        {selectedTemplate.config.showCorrectAnswers && <span className="feature">✓ Show Answers</span>}
                        {selectedTemplate.config.shuffleOptions && <span className="feature">✓ Shuffle Options</span>}
                        {selectedTemplate.config.allowSkip && <span className="feature">✓ Skip Questions</span>}
                        {selectedTemplate.config.timePerQuestion > 0 && <span className="feature">✓ Per-Question Timing</span>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Customization Mode
            <div className="customization-section">
              <div className="customization-header">
                <h4>⚙️ Customize Template</h4>
                <p>Adjust the template configuration to match your needs</p>
              </div>
              
              <div className="customization-form">
                <div className="form-section">
                  <h5>Basic Configuration</h5>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Time Limit (Minutes)</label>
                      <input
                        type="number"
                        value={customizedConfig.timeLimitMinutes || ''}
                        onChange={(e) => handleConfigChange('timeLimitMinutes', parseInt(e.target.value))}
                        className="form-control"
                        min="1"
                        max="480"
                      />
                    </div>
                    <div className="form-group">
                      <label>Total Marks</label>
                      <input
                        type="number"
                        value={customizedConfig.totalMarks || ''}
                        onChange={(e) => handleConfigChange('totalMarks', parseInt(e.target.value))}
                        className="form-control"
                        min="1"
                        max="1000"
                      />
                    </div>
                    <div className="form-group">
                      <label>Passing Marks</label>
                      <input
                        type="number"
                        value={customizedConfig.passingMarks || ''}
                        onChange={(e) => handleConfigChange('passingMarks', parseInt(e.target.value))}
                        className="form-control"
                        min="1"
                        max={customizedConfig.totalMarks || 1000}
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Max Attempts</label>
                      <input
                        type="number"
                        value={customizedConfig.maxAttempts || ''}
                        onChange={(e) => handleConfigChange('maxAttempts', parseInt(e.target.value))}
                        className="form-control"
                        min="1"
                        max="10"
                      />
                    </div>
                    <div className="form-group">
                      <label>Time per Question (Seconds)</label>
                      <input
                        type="number"
                        value={customizedConfig.timePerQuestion || ''}
                        onChange={(e) => handleConfigChange('timePerQuestion', parseInt(e.target.value))}
                        className="form-control"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="form-section">
                  <h5>Advanced Settings</h5>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={customizedConfig.negativeMarking || false}
                        onChange={(e) => handleConfigChange('negativeMarking', e.target.checked)}
                      />
                      Enable Negative Marking
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={customizedConfig.allowReview || false}
                        onChange={(e) => handleConfigChange('allowReview', e.target.checked)}
                      />
                      Allow Review
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={customizedConfig.showCorrectAnswers || false}
                        onChange={(e) => handleConfigChange('showCorrectAnswers', e.target.checked)}
                      />
                      Show Correct Answers
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={customizedConfig.shuffleQuestions || false}
                        onChange={(e) => handleConfigChange('shuffleQuestions', e.target.checked)}
                      />
                      Shuffle Questions
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={customizedConfig.shuffleOptions || false}
                        onChange={(e) => handleConfigChange('shuffleOptions', e.target.checked)}
                      />
                      Shuffle Options
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={customizedConfig.allowSkip || false}
                        onChange={(e) => handleConfigChange('allowSkip', e.target.checked)}
                      />
                      Allow Skip Questions
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Modal Footer */}
        <div className="modal-footer">
          <div className="footer-info">
            {selectedTemplate && (
              <span>
                Template: {selectedTemplate.name}
              </span>
            )}
          </div>
          <div className="footer-actions">
            <button 
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            {selectedTemplate && !customizationMode && (
              <button 
                className="btn btn-outline"
                onClick={() => setCustomizationMode(true)}
              >
                ⚙️ Customize
              </button>
            )}
            {customizationMode && (
              <button 
                className="btn btn-outline"
                onClick={() => setCustomizationMode(false)}
              >
                ← Back to Selection
              </button>
            )}
            {selectedTemplate && (
              <button 
                className="btn btn-primary"
                onClick={handleCreateFromTemplate}
              >
                {customizationMode ? 'Create Custom Test' : 'Use Template'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestTemplates;
