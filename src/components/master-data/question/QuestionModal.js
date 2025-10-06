import React, { memo, useCallback, useEffect } from 'react';
import { QUESTION_TYPES, DIFFICULTY_LEVELS } from '../../../constants';

/**
 * Question Modal Component
 * Handles creating and editing questions
 */
const QuestionModal = memo(({ 
  isOpen, 
  onClose, 
  question, 
  onSubmit, 
  loading, 
  masterData = {} 
}) => {
  const [formData, setFormData] = React.useState({
    questionText: '',
    description: '',
    questionType: QUESTION_TYPES.MCQ,
    difficultyLevel: DIFFICULTY_LEVELS.MEDIUM,
    subjectId: '',
    topicId: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    tags: '',
    status: 'DRAFT'
  });

  const [errors, setErrors] = React.useState({});

  // Initialize form data when question prop changes
  useEffect(() => {
    if (question) {
      setFormData({
        questionText: question.questionText || '',
        description: question.description || '',
        questionType: question.questionType || QUESTION_TYPES.MCQ,
        difficultyLevel: question.difficultyLevel || DIFFICULTY_LEVELS.MEDIUM,
        subjectId: question.subjectId || '',
        topicId: question.topicId || '',
        options: question.options || ['', '', '', ''],
        correctAnswer: question.correctAnswer || '',
        explanation: question.explanation || '',
        tags: question.tags?.join(', ') || '',
        status: question.status || 'DRAFT'
      });
    } else {
      // Reset form for new question
      setFormData({
        questionText: '',
        description: '',
        questionType: QUESTION_TYPES.MCQ,
        difficultyLevel: DIFFICULTY_LEVELS.MEDIUM,
        subjectId: '',
        topicId: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: '',
        tags: '',
        status: 'DRAFT'
      });
    }
    setErrors({});
  }, [question]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  const handleOptionChange = useCallback((index, value) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => i === index ? value : option)
    }));
  }, []);

  const addOption = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  }, []);

  const removeOption = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.questionText.trim()) {
      newErrors.questionText = 'Question text is required';
    }

    if (!formData.subjectId) {
      newErrors.subjectId = 'Subject is required';
    }

    if (!formData.topicId) {
      newErrors.topicId = 'Topic is required';
    }

    if (formData.questionType === QUESTION_TYPES.MCQ) {
      const validOptions = formData.options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        newErrors.options = 'At least 2 options are required for MCQ';
      }
      if (!formData.correctAnswer) {
        newErrors.correctAnswer = 'Correct answer is required for MCQ';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      options: formData.options.filter(opt => opt.trim())
    };

    onSubmit(submitData);
  }, [formData, validateForm, onSubmit]);

  const handleClose = useCallback(() => {
    setErrors({});
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-xl font-semibold text-gray-900">
            {question ? 'Edit Question' : 'Create New Question'}
          </h2>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Question Text */}
                <div className="form-group">
                  <label className="form-label">Question Text *</label>
                  <textarea
                    className={`form-textarea ${errors.questionText ? 'border-red-500' : ''}`}
                    value={formData.questionText}
                    onChange={(e) => handleInputChange('questionText', e.target.value)}
                    placeholder="Enter your question here..."
                    rows={4}
                  />
                  {errors.questionText && (
                    <p className="text-red-500 text-sm mt-1">{errors.questionText}</p>
                  )}
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Optional description or additional context..."
                    rows={2}
                  />
                </div>

                {/* Question Type */}
                <div className="form-group">
                  <label className="form-label">Question Type *</label>
                  <select
                    className="form-select"
                    value={formData.questionType}
                    onChange={(e) => handleInputChange('questionType', e.target.value)}
                  >
                    {Object.entries(QUESTION_TYPES).map(([key, value]) => (
                      <option key={key} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Level */}
                <div className="form-group">
                  <label className="form-label">Difficulty Level *</label>
                  <select
                    className="form-select"
                    value={formData.difficultyLevel}
                    onChange={(e) => handleInputChange('difficultyLevel', e.target.value)}
                  >
                    {Object.entries(DIFFICULTY_LEVELS).map(([key, value]) => (
                      <option key={key} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Subject */}
                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <select
                    className={`form-select ${errors.subjectId ? 'border-red-500' : ''}`}
                    value={formData.subjectId}
                    onChange={(e) => {
                      handleInputChange('subjectId', e.target.value);
                      handleInputChange('topicId', ''); // Reset topic when subject changes
                    }}
                  >
                    <option value="">Select Subject</option>
                    {masterData.subjects?.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                  {errors.subjectId && (
                    <p className="text-red-500 text-sm mt-1">{errors.subjectId}</p>
                  )}
                </div>

                {/* Topic */}
                <div className="form-group">
                  <label className="form-label">Topic *</label>
                  <select
                    className={`form-select ${errors.topicId ? 'border-red-500' : ''}`}
                    value={formData.topicId}
                    onChange={(e) => handleInputChange('topicId', e.target.value)}
                    disabled={!formData.subjectId}
                  >
                    <option value="">Select Topic</option>
                    {masterData.topics
                      ?.filter(topic => topic.subjectId === formData.subjectId)
                      ?.map(topic => (
                        <option key={topic.id} value={topic.id}>
                          {topic.name}
                        </option>
                      ))}
                  </select>
                  {errors.topicId && (
                    <p className="text-red-500 text-sm mt-1">{errors.topicId}</p>
                  )}
                </div>

                {/* Status */}
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                {/* Tags */}
                <div className="form-group">
                  <label className="form-label">Tags</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="Enter tags separated by commas..."
                  />
                </div>
              </div>
            </div>

            {/* MCQ Options */}
            {formData.questionType === QUESTION_TYPES.MCQ && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Options</h3>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={addOption}
                  >
                    Add Option
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="correctAnswer"
                        value={index}
                        checked={formData.correctAnswer === index.toString()}
                        onChange={(e) => handleInputChange('correctAnswer', e.target.value)}
                        className="form-input"
                      />
                      <input
                        type="text"
                        className="form-input flex-1"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      {formData.options.length > 2 && (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm text-red-600"
                          onClick={() => removeOption(index)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {errors.options && (
                  <p className="text-red-500 text-sm mt-2">{errors.options}</p>
                )}
                {errors.correctAnswer && (
                  <p className="text-red-500 text-sm mt-2">{errors.correctAnswer}</p>
                )}
              </div>
            )}

            {/* Explanation */}
            <div className="form-group mt-6">
              <label className="form-label">Explanation</label>
              <textarea
                className="form-textarea"
                value={formData.explanation}
                onChange={(e) => handleInputChange('explanation', e.target.value)}
                placeholder="Explain why this is the correct answer..."
                rows={3}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading"></div>
                  {question ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                question ? 'Update Question' : 'Create Question'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

QuestionModal.displayName = 'QuestionModal';

export default QuestionModal;
