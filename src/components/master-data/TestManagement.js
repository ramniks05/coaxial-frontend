import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useApiManager } from '../../hooks/useApiManager';
import { useFormManager } from '../../hooks/useFormManager';
import {
    createTest,
    deleteTest,
    updateTest,
    getTests,
    publishTest,
    unpublishTest,
    addQuestionToTest
} from '../../services/masterDataService';
import { getMasterExamsKV } from '../../services/questionTaggingService';
import TestListCard from './TestListCard';
import QuestionSelectionModal from './QuestionSelectionModal';
import TestQuestionManager from './TestQuestionManager';
import TestAnalytics from './TestAnalytics';
import TestTemplates from './TestTemplates';
import './MasterDataComponent.css';

const TestManagement = ({ onBackToDashboard }) => {
  console.log('=== TestManagement component rendering ===');
  const { token, addNotification } = useApp();
  console.log('Token available:', !!token);
  console.log('Token length:', token ? token.length : 0);
  const { executeApiCall } = useApiManager();
  console.log('executeApiCall function:', typeof executeApiCall);
  
  // State for master exams
  const [masterExams, setMasterExams] = useState([]);

  // Form management
  const initialFormData = {
    testName: '',
    description: '',
    instructions: '',
    timeLimitMinutes: '',
    totalMarks: '',
    passingMarks: '',
    negativeMarking: false,
    negativeMarkPercentage: 0,
    maxAttempts: 1,
    isPublished: false,
    startDate: '',
    endDate: '',
    masterExamId: '',
    testType: 'PRACTICE', // PRACTICE, MOCK, FINAL, QUIZ
    allowReview: true,
    showCorrectAnswers: false,
    shuffleQuestions: false,
    shuffleOptions: false,
    allowSkip: true,
    timePerQuestion: 0, // 0 = use total time limit
  };

  const validationRules = {
    testName: (value) => {
      if (!value) return 'Test name is required';
      if (value.length < 5) return 'Test name must be at least 5 characters';
      if (value.length > 100) return 'Test name must be less than 100 characters';
      return '';
    },
    timeLimitMinutes: (value) => {
      if (!value) return 'Time limit is required';
      if (value < 1) return 'Time limit must be at least 1 minute';
      if (value > 480) return 'Time limit cannot exceed 8 hours';
      return '';
    },
    totalMarks: (value) => {
      if (!value) return 'Total marks is required';
      if (value < 1) return 'Total marks must be at least 1';
      if (value > 1000) return 'Total marks cannot exceed 1000';
      return '';
    },
    passingMarks: (value, formData) => {
      if (!value) return 'Passing marks is required';
      if (value < 1) return 'Passing marks must be at least 1';
      if (formData.totalMarks && value > formData.totalMarks) {
        return 'Passing marks cannot exceed total marks';
      }
      return '';
    },
    masterExamId: (value) => !value ? 'Master exam is required' : '',
    maxAttempts: (value) => {
      if (value < 1) return 'Max attempts must be at least 1';
      if (value > 10) return 'Max attempts cannot exceed 10';
      return '';
    }
  };

  const {
    formData,
    errors,
    touched,
    handleInputChange: originalHandleInputChange,
    handleBlur: originalHandleBlur,
    validateForm,
    resetForm,
    setFormData
  } = useFormManager(initialFormData, validationRules);

  // Wrapper functions to handle event objects
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    originalHandleInputChange(name, fieldValue);
  }, [originalHandleInputChange]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    originalHandleBlur(name);
  }, [originalHandleBlur]);

  // Component state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  
  // Advanced UI states
  const [activeTab, setActiveTab] = useState('tests'); // tests, analytics, templates
  const [showQuestionSelection, setShowQuestionSelection] = useState(false);
  const [showTestQuestionManager, setShowTestQuestionManager] = useState(false);
  const [showTestAnalytics, setShowTestAnalytics] = useState(false);
  const [showTestTemplates, setShowTestTemplates] = useState(false);
  
  // Filter states
  const [selectedMasterExam, setSelectedMasterExam] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedTestType, setSelectedTestType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // Bulk operations state
  const [selectedTests, setSelectedTests] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Fetch master exams
  const fetchMasterExams = useCallback(async () => {
    try {
      const data = await executeApiCall(getMasterExamsKV, token);
      if (data) {
        setMasterExams(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching master exams:', error);
      addNotification('Failed to fetch master exams', 'error');
    }
  }, [token, executeApiCall, addNotification]);


  // Initialize master exams on component mount
  useEffect(() => {
    fetchMasterExams();
  }, [fetchMasterExams]); // Include fetchMasterExams as dependency

  // Fetch tests data when component mounts or filters change
  useEffect(() => {
    console.log('=== useEffect for fetchTestsData triggered ===');
    console.log('Token available:', !!token);
    console.log('Token value:', token);
    console.log('Current filter values:', { selectedMasterExam, selectedStatus, searchTerm, showActiveOnly });
    console.log('executeApiCall available:', !!executeApiCall);
    console.log('addNotification available:', !!addNotification);
    
    if (token) { // Only fetch if we have a token
      console.log('Token is available, proceeding with API call...');
      
      const fetchData = async () => {
        setLoading(true);
        try {
          const filters = {
            active: showActiveOnly,
            masterExamId: selectedMasterExam || undefined,
            status: selectedStatus || undefined,
            search: searchTerm || undefined
          };

          console.log('About to call getTests API with:', { token: !!token, filters });
          console.log('API endpoint will be: /api/admin/master-data/tests');
          
          const result = await executeApiCall(
            () => {
              console.log('Inside executeApiCall, calling getTests...');
              return getTests(token, filters);
            },
            'Failed to fetch tests'
          );

          console.log('Tests API result:', result);
          if (result) {
            const testsArray = Array.isArray(result) ? result : result.data || [];
            console.log('Setting tests array:', testsArray);
            setTests(testsArray);
          }
        } catch (error) {
          console.error('Error fetching tests:', error);
          addNotification('Failed to fetch tests', 'error');
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    } else {
      console.log('No token available, skipping fetchTestsData');
    }
  }, [token, selectedMasterExam, selectedStatus, searchTerm, showActiveOnly, executeApiCall, addNotification]); // Direct filter dependencies

  // Function to manually trigger data refresh
  const refreshTests = useCallback(async () => {
    console.log('Manually refreshing tests...');
    if (!token) return;
    
    setLoading(true);
    try {
      const filters = {
        active: showActiveOnly,
        masterExamId: selectedMasterExam || undefined,
        status: selectedStatus || undefined,
        search: searchTerm || undefined
      };

      console.log('Manually fetching tests with filters:', filters);
      const result = await executeApiCall(
        () => getTests(token, filters),
        'Failed to fetch tests'
      );

      if (result) {
        const testsArray = Array.isArray(result) ? result : result.data || [];
        setTests(testsArray);
      }
    } catch (error) {
      console.error('Error refreshing tests:', error);
      addNotification('Failed to refresh tests', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, selectedMasterExam, selectedStatus, searchTerm, showActiveOnly, executeApiCall, addNotification]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addNotification('Please fix the validation errors', 'error');
      return;
    }

    setLoading(true);
    try {
      const normalizedFormData = {
        ...formData,
        timeLimitMinutes: parseInt(formData.timeLimitMinutes),
        totalMarks: parseInt(formData.totalMarks),
        passingMarks: parseInt(formData.passingMarks),
        negativeMarkPercentage: parseFloat(formData.negativeMarkPercentage),
        maxAttempts: parseInt(formData.maxAttempts),
        masterExamId: parseInt(formData.masterExamId),
        timePerQuestion: parseInt(formData.timePerQuestion) || 0
      };

      if (editingId) {
        const result = await executeApiCall(
          () => updateTest(token, editingId, normalizedFormData),
          'Failed to update test'
        );
        if (result) {
          addNotification('Test updated successfully', 'success');
          handleCancel();
          refreshTests();
        }
      } else {
        const result = await executeApiCall(
          () => createTest(token, normalizedFormData),
          'Failed to create test'
        );
        if (result) {
          addNotification('Test created successfully', 'success');
          handleCancel();
          refreshTests();
        }
      }
    } catch (error) {
      console.error('Error saving test:', error);
      addNotification('Failed to save test', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (test) => {
    setEditingId(test.id);
    setFormData({
      testName: test.testName || '',
      description: test.description || '',
      instructions: test.instructions || '',
      timeLimitMinutes: test.timeLimitMinutes || '',
      totalMarks: test.totalMarks || '',
      passingMarks: test.passingMarks || '',
      negativeMarking: test.negativeMarking || false,
      negativeMarkPercentage: test.negativeMarkPercentage || 0,
      maxAttempts: test.maxAttempts || 1,
      isPublished: test.isPublished || false,
      startDate: test.startDate || '',
      endDate: test.endDate || '',
      masterExamId: test.masterExamId || '',
      testType: test.testType || 'PRACTICE',
      allowReview: test.allowReview !== undefined ? test.allowReview : true,
      showCorrectAnswers: test.showCorrectAnswers || false,
      shuffleQuestions: test.shuffleQuestions || false,
      shuffleOptions: test.shuffleOptions || false,
      allowSkip: test.allowSkip !== undefined ? test.allowSkip : true,
      timePerQuestion: test.timePerQuestion || 0
    });
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (testId) => {
    if (!window.confirm('Are you sure you want to delete this test?')) {
      return;
    }

    setLoading(true);
    try {
      const result = await executeApiCall(
        () => deleteTest(token, testId),
        'Failed to delete test'
      );
      if (result) {
        addNotification('Test deleted successfully', 'success');
        refreshTests();
      }
    } catch (error) {
      console.error('Error deleting test:', error);
      addNotification('Failed to delete test', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle publish/unpublish
  const handlePublishToggle = async (test) => {
    setLoading(true);
    try {
      const result = test.isPublished 
        ? await executeApiCall(
            () => unpublishTest(token, test.id),
            'Failed to unpublish test'
          )
        : await executeApiCall(
            () => publishTest(token, test.id),
            'Failed to publish test'
          );
      
      if (result) {
        addNotification(
          test.isPublished ? 'Test unpublished successfully' : 'Test published successfully',
          'success'
        );
        refreshTests();
      }
    } catch (error) {
      console.error('Error toggling test status:', error);
      addNotification('Failed to update test status', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Advanced question management
  const handleManageQuestions = async (test) => {
    setSelectedTest(test);
    setShowTestQuestionManager(true);
  };

  const handleQuestionSelectionComplete = async (selectedQuestions) => {
    if (!selectedTest) return;

    setLoading(true);
    try {
      // Add questions to test with proper ordering
      for (let i = 0; i < selectedQuestions.length; i++) {
        const question = selectedQuestions[i];
        const testQuestionData = {
          questionId: question.id,
          questionOrder: i + 1,
          marks: question.marks || 4, // Default marks
          negativeMarks: 0
        };
        
        await addQuestionToTest(token, selectedTest.id, testQuestionData);
      }

      addNotification(`Added ${selectedQuestions.length} questions to test`, 'success');
      setShowQuestionSelection(false);
      setSelectedTest(null);
      refreshTests();
    } catch (error) {
      console.error('Error adding questions to test:', error);
      addNotification('Failed to add questions to test', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Bulk operations
  const handleBulkOperation = async (operation) => {
    if (selectedTests.length === 0) {
      addNotification('Please select tests to perform bulk operation', 'warning');
      return;
    }

    const confirmMessage = `Are you sure you want to ${operation.toLowerCase()} ${selectedTests.length} test(s)?`;
    if (!window.confirm(confirmMessage)) return;

    setLoading(true);
    try {
      const promises = selectedTests.map(testId => {
        switch (operation) {
          case 'PUBLISH':
            return publishTest(token, testId);
          case 'UNPUBLISH':
            return unpublishTest(token, testId);
          case 'DELETE':
            return deleteTest(token, testId);
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);
      addNotification(`Bulk ${operation.toLowerCase()} completed successfully`, 'success');
      setSelectedTests([]);
      setShowBulkActions(false);
      refreshTests();
    } catch (error) {
      console.error('Error in bulk operation:', error);
      addNotification('Bulk operation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingId(null);
    resetForm();
    setShowForm(true);
  };

  // Helper function to get exam display name
  const getExamDisplayName = (exam) => {
    if (!exam) return 'Unknown Exam';
    return exam.exam || exam.examName || exam.name || `Exam ${exam.id}`;
  };


  // Filter tests based on current filters
  const filteredTests = useMemo(() => {
    let filtered = tests;

    if (selectedMasterExam) {
      filtered = filtered.filter(test => 
        test.masterExamId === parseInt(selectedMasterExam)
      );
    }

    if (selectedStatus) {
      if (selectedStatus === 'PUBLISHED') {
        filtered = filtered.filter(test => test.isPublished);
      } else if (selectedStatus === 'DRAFT') {
        filtered = filtered.filter(test => !test.isPublished && test.status === 'DRAFT');
      } else {
        filtered = filtered.filter(test => test.status === selectedStatus);
      }
    }

    if (selectedTestType) {
      filtered = filtered.filter(test => test.testType === selectedTestType);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(test =>
        test.testName?.toLowerCase().includes(term) ||
        test.description?.toLowerCase().includes(term) ||
        getExamDisplayName(test.masterExam).toLowerCase().includes(term)
      );
    }

    if (dateRange.start) {
      filtered = filtered.filter(test => 
        new Date(test.createdAt) >= new Date(dateRange.start)
      );
    }

    if (dateRange.end) {
      filtered = filtered.filter(test => 
        new Date(test.createdAt) <= new Date(dateRange.end)
      );
    }

    return filtered;
  }, [tests, selectedMasterExam, selectedStatus, selectedTestType, searchTerm, dateRange]);

  return (
    <div className="master-data-management advanced-test-management">
      {/* Header */}
      <div className="management-header">
        <div className="header-content">
          <button 
            className="btn btn-link btn-sm"
            onClick={onBackToDashboard}
          >
            ← Back to Dashboard
          </button>
          <div className="header-title">
            <h2>🚀 Advanced Test Management</h2>
            <p>Enterprise-grade test creation and management system</p>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-outline"
            onClick={() => setShowTestTemplates(true)}
          >
            📋 Templates
          </button>
          <button 
            className="btn btn-outline"
            onClick={() => setShowTestAnalytics(true)}
          >
            📊 Analytics
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleAddNew}
            disabled={loading}
          >
            ➕ Create Test
          </button>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'tests' ? 'active' : ''}`}
          onClick={() => setActiveTab('tests')}
        >
          📝 Tests ({filteredTests.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
        <button 
          className={`tab-button ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          📋 Templates
        </button>
      </div>

      {/* Enhanced Filters */}
      {activeTab === 'tests' && (
      <div className="filters-section">
        <div className="section-title">
          <span className="icon">🔍</span>
          <span>Filter Tests</span>
        </div>
        
        <div className="filter-row">
          <div className="filter-group">
            <label>Master Exam</label>
            <select 
              value={selectedMasterExam}
              onChange={(e) => setSelectedMasterExam(e.target.value)}
              className="form-input"
            >
              <option value="">All Exams</option>
              {masterExams?.map(exam => (
                <option key={exam.id} value={exam.id}>
                  {getExamDisplayName(exam)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="form-input"
            >
              <option value="">All Status</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Test Type</label>
            <select 
              value={selectedTestType}
              onChange={(e) => setSelectedTestType(e.target.value)}
              className="form-input"
            >
              <option value="">All Types</option>
              <option value="PRACTICE">Practice</option>
              <option value="MOCK">Mock Test</option>
              <option value="FINAL">Final Exam</option>
              <option value="QUIZ">Quiz</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tests..."
              className="form-input"
            />
          </div>

          <div className="filter-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
              />
              Active Only
            </label>
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label>Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="form-input"
            />
          </div>

          <div className="filter-group">
            <label>End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="form-input"
            />
          </div>

          <div className="filter-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
              />
              Active Only
            </label>
          </div>

          <div className="filter-group">
            <button 
              className="btn btn-outline"
              onClick={() => {
                setSelectedMasterExam('');
                setSelectedStatus('');
                setSelectedTestType('');
                setSearchTerm('');
                setShowActiveOnly(true);
                setDateRange({ start: '', end: '' });
              }}
            >
              🔄 Clear All
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedTests.length > 0 && (
          <div className="bulk-actions">
            <div className="bulk-info">
              <span>{selectedTests.length} test(s) selected</span>
            </div>
            <div className="bulk-buttons">
              <button 
                className="btn btn-success btn-sm"
                onClick={() => handleBulkOperation('PUBLISH')}
              >
                📢 Publish
              </button>
              <button 
                className="btn btn-warning btn-sm"
                onClick={() => handleBulkOperation('UNPUBLISH')}
              >
                🔒 Unpublish
              </button>
              <button 
                className="btn btn-danger btn-sm"
                onClick={() => handleBulkOperation('DELETE')}
              >
                🗑️ Delete
              </button>
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => setSelectedTests([])}
              >
                ✕ Clear
              </button>
            </div>
          </div>
        )}

        <div className="filter-actions">
          <button 
            className="btn btn-primary"
            onClick={refreshTests}
            disabled={loading}
          >
            Apply Filters
          </button>
          <button 
            className="btn btn-outline"
            onClick={() => {
              console.log('Manual test API call triggered');
              refreshTests();
            }}
            disabled={loading}
          >
            🔄 Test API Call
          </button>
        </div>
      </div>
      )}

      {/* Test Form */}
      {showForm && (
        <div className="form-section">
          <div className="form-header">
            <h3>{editingId ? 'Edit Test' : 'Add New Test'}</h3>
            <button 
              className="btn btn-link"
              onClick={handleCancel}
            >
              ✕ Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="test-form">
            {/* Basic Information Section */}
            <div className="form-section">
              <div className="section-title">
                <span className="icon">📋</span>
                <span>Basic Information</span>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="required">Test Name</label>
                  <input
                    type="text"
                    name="testName"
                    value={formData.testName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`form-control ${errors.testName && touched.testName ? 'error' : ''}`}
                    placeholder="Enter test name"
                  />
                  {errors.testName && touched.testName && (
                    <span className="error-message">{errors.testName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="required">Master Exam</label>
                  <select
                    name="masterExamId"
                    value={formData.masterExamId}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`form-input ${errors.masterExamId && touched.masterExamId ? 'error' : ''}`}
                  >
                    <option value="">Select Master Exam</option>
                    {masterExams?.map(exam => (
                      <option key={exam.id} value={exam.id}>
                        {getExamDisplayName(exam)}
                      </option>
                    ))}
                  </select>
                  {errors.masterExamId && touched.masterExamId && (
                    <span className="error-message">{errors.masterExamId}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Test Type</label>
                  <select
                    name="testType"
                    value={formData.testType}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className="form-input"
                  >
                    <option value="PRACTICE">Practice Test</option>
                    <option value="MOCK">Mock Test</option>
                    <option value="FINAL">Final Exam</option>
                    <option value="QUIZ">Quiz</option>
                  </select>
                </div>
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="form-input"
                  rows="3"
                  placeholder="Enter test description"
                />
              </div>

              <div className="form-group full-width">
                <label>Instructions</label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="form-input"
                  rows="4"
                  placeholder="Enter test instructions for students"
                />
              </div>
            </div>

            {/* Test Configuration Section */}
            <div className="form-section">
              <div className="section-title">
                <span className="icon">⚙️</span>
                <span>Test Configuration</span>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="required">Time Limit (Minutes)</label>
                  <input
                    type="number"
                    name="timeLimitMinutes"
                    value={formData.timeLimitMinutes}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`form-input ${errors.timeLimitMinutes && touched.timeLimitMinutes ? 'error' : ''}`}
                    placeholder="180"
                    min="1"
                  />
                  {errors.timeLimitMinutes && touched.timeLimitMinutes && (
                    <span className="error-message">{errors.timeLimitMinutes}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="required">Total Marks</label>
                  <input
                    type="number"
                    name="totalMarks"
                    value={formData.totalMarks}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`form-input ${errors.totalMarks && touched.totalMarks ? 'error' : ''}`}
                    placeholder="300"
                    min="1"
                  />
                  {errors.totalMarks && touched.totalMarks && (
                    <span className="error-message">{errors.totalMarks}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="required">Passing Marks</label>
                  <input
                    type="number"
                    name="passingMarks"
                    value={formData.passingMarks}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`form-input ${errors.passingMarks && touched.passingMarks ? 'error' : ''}`}
                    placeholder="120"
                    min="1"
                  />
                  {errors.passingMarks && touched.passingMarks && (
                    <span className="error-message">{errors.passingMarks}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Max Attempts</label>
                  <input
                    type="number"
                    name="maxAttempts"
                    value={formData.maxAttempts}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className="form-input"
                    placeholder="1"
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="negativeMarking"
                        checked={formData.negativeMarking}
                        onChange={handleInputChange}
                      />
                      Enable Negative Marking
                    </label>
                  </div>
                </div>

                {formData.negativeMarking && (
                  <div className="form-group">
                    <label>Negative Mark Percentage</label>
                    <input
                      type="number"
                      name="negativeMarkPercentage"
                      value={formData.negativeMarkPercentage}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className="form-input"
                      placeholder="25"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="allowReview"
                        checked={formData.allowReview}
                        onChange={handleInputChange}
                      />
                      Allow Review
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="showCorrectAnswers"
                        checked={formData.showCorrectAnswers}
                        onChange={handleInputChange}
                      />
                      Show Correct Answers
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="shuffleQuestions"
                        checked={formData.shuffleQuestions}
                        onChange={handleInputChange}
                      />
                      Shuffle Questions
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="shuffleOptions"
                        checked={formData.shuffleOptions}
                        onChange={handleInputChange}
                      />
                      Shuffle Options
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="allowSkip"
                        checked={formData.allowSkip}
                        onChange={handleInputChange}
                      />
                      Allow Skip
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Time Per Question (seconds)</label>
                  <input
                    type="number"
                    name="timePerQuestion"
                    value={formData.timePerQuestion}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className="form-input"
                    placeholder="0 (use total time limit)"
                    min="0"
                  />
                  <small className="form-text">0 = use total time limit</small>
                </div>
              </div>
            </div>

            {/* Availability Section */}
            <div className="form-section">
              <div className="section-title">
                <span className="icon">🕐</span>
                <span>Availability</span>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="isPublished"
                        checked={formData.isPublished}
                        onChange={handleInputChange}
                      />
                      Publish Test
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : (editingId ? 'Update Test' : 'Create Test')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tests List */}
      {activeTab === 'tests' && (
        <div className="tests-list">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading tests...</p>
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">No Tests</div>
              <h3>No tests found</h3>
              <p>Create your first test to get started with the advanced test management system.</p>
              <button 
                className="btn btn-primary"
                onClick={handleAddNew}
              >
                Create Test
              </button>
            </div>
          ) : loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading tests...</p>
            </div>
          ) : (
            <div className="tests-grid">
              {filteredTests.length === 0 ? (
                <div className="no-data-message">
                  <div className="no-data-icon">📝</div>
                  <h3>No Tests Found</h3>
                  <p>Create your first test to get started with test management.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={handleAddNew}
                  >
                    Create Test
                  </button>
                </div>
              ) : (
                filteredTests.map(test => (
                  <TestListCard
                    key={test.id}
                    test={test}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onPublishToggle={handlePublishToggle}
                    onManageQuestions={handleManageQuestions}
                    onSelect={(testId) => {
                      setSelectedTests(prev => 
                        prev.includes(testId) 
                          ? prev.filter(id => id !== testId)
                          : [...prev, testId]
                      );
                    }}
                    isSelected={selectedTests.includes(test.id)}
                  />
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Advanced Components */}
      {showQuestionSelection && (
        <QuestionSelectionModal
          isOpen={showQuestionSelection}
          onClose={() => setShowQuestionSelection(false)}
          onSelectQuestions={handleQuestionSelectionComplete}
        />
      )}

      {showTestQuestionManager && selectedTest && (
        <TestQuestionManager
          test={selectedTest}
          onClose={() => {
            setShowTestQuestionManager(false);
            setSelectedTest(null);
          }}
        />
      )}

      {showTestAnalytics && (
        <TestAnalytics
          onClose={() => setShowTestAnalytics(false)}
        />
      )}

      {showTestTemplates && (
        <TestTemplates
          onClose={() => setShowTestTemplates(false)}
        />
      )}
    </div>
  );
};

export default TestManagement;