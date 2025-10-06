import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useOptimizedApi, useBatchApi } from '../../../hooks/useApiCache';
import { masterDataService } from '../../../services/masterDataService';
import { API_ENDPOINTS, PAGINATION, DEFAULT_SORT } from '../../../constants';
import QuestionFilters from './QuestionFilters';
import QuestionTable from './QuestionTable';
import QuestionModal from './QuestionModal';

/**
 * Optimized Question Management Component
 * Main component that orchestrates all question management functionality
 */
const QuestionManagementOptimized = () => {
  // State management
  const [filters, setFilters] = useState({
    search: '',
    subjectId: null,
    topicId: null,
    questionType: null,
    difficultyLevel: null,
    status: null,
    createdFrom: null,
    createdTo: null
  });

  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [sortConfig, setSortConfig] = useState(DEFAULT_SORT);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: PAGINATION.DEFAULT_PAGE_SIZE
  });

  const [modalState, setModalState] = useState({
    isOpen: false,
    question: null,
    mode: 'create' // 'create' or 'edit'
  });

  // API hooks with caching
  const {
    data: questionsData,
    loading: questionsLoading,
    error: questionsError,
    refetch: refetchQuestions
  } = useOptimizedApi(
    masterDataService.getQuestions,
    {
      cacheKey: 'questions_list',
      ttl: 300000 // 5 minutes
    }
  );

  const {
    data: masterData,
    loading: masterDataLoading,
    refetch: refetchMasterData
  } = useBatchApi();

  // Load master data on component mount
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        await masterData.executeBatch({
          subjects: () => masterDataService.getSubjects(),
          topics: () => masterDataService.getTopics(),
          questionTypes: () => masterDataService.getQuestionTypes(),
          difficultyLevels: () => masterDataService.getDifficultyLevels()
        });
      } catch (error) {
        console.error('Failed to load master data:', error);
      }
    };

    loadMasterData();
  }, [masterData]);

  // Memoized filtered and sorted questions
  const processedQuestions = useMemo(() => {
    if (!questionsData?.data) return [];

    let filtered = questionsData.data;

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(q => 
        q.questionText?.toLowerCase().includes(searchLower) ||
        q.description?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.subjectId) {
      filtered = filtered.filter(q => q.subjectId === filters.subjectId);
    }

    if (filters.topicId) {
      filtered = filtered.filter(q => q.topicId === filters.topicId);
    }

    if (filters.questionType) {
      filtered = filtered.filter(q => q.questionType === filters.questionType);
    }

    if (filters.difficultyLevel) {
      filtered = filtered.filter(q => q.difficultyLevel === filters.difficultyLevel);
    }

    if (filters.status) {
      filtered = filtered.filter(q => q.status === filters.status);
    }

    if (filters.createdFrom) {
      filtered = filtered.filter(q => 
        new Date(q.createdAt) >= new Date(filters.createdFrom)
      );
    }

    if (filters.createdTo) {
      filtered = filtered.filter(q => 
        new Date(q.createdAt) <= new Date(filters.createdTo)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];
      
      if (aValue < bValue) return sortConfig.order === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.order === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [questionsData, filters, sortConfig]);

  // Pagination
  const paginatedQuestions = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return processedQuestions.slice(startIndex, endIndex);
  }, [processedQuestions, pagination]);

  // Event handlers
  const handleFilterChange = useCallback((filterName, value) => {
    if (filterName === 'clear') {
      setFilters({
        search: '',
        subjectId: null,
        topicId: null,
        questionType: null,
        difficultyLevel: null,
        status: null,
        createdFrom: null,
        createdTo: null
      });
    } else {
      setFilters(prev => ({ ...prev, [filterName]: value }));
    }
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  const handleSort = useCallback((field) => {
    setSortConfig(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const handleSelectQuestion = useCallback((questionId) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  }, []);

  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      setSelectedQuestions(paginatedQuestions.map(q => q.id));
    } else {
      setSelectedQuestions([]);
    }
  }, [paginatedQuestions]);

  const handleCreateQuestion = useCallback(() => {
    setModalState({
      isOpen: true,
      question: null,
      mode: 'create'
    });
  }, []);

  const handleEditQuestion = useCallback((question) => {
    setModalState({
      isOpen: true,
      question,
      mode: 'edit'
    });
  }, []);

  const handleViewQuestion = useCallback((question) => {
    // Implement view functionality
    console.log('View question:', question);
  }, []);

  const handleDeleteQuestion = useCallback(async (question) => {
    if (window.confirm(`Are you sure you want to delete "${question.questionText}"?`)) {
      try {
        await masterDataService.deleteQuestion(question.id);
        await refetchQuestions();
        setSelectedQuestions(prev => prev.filter(id => id !== question.id));
      } catch (error) {
        console.error('Failed to delete question:', error);
      }
    }
  }, [refetchQuestions]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedQuestions.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedQuestions.length} questions?`)) {
      try {
        await Promise.all(
          selectedQuestions.map(id => masterDataService.deleteQuestion(id))
        );
        await refetchQuestions();
        setSelectedQuestions([]);
      } catch (error) {
        console.error('Failed to delete questions:', error);
      }
    }
  }, [selectedQuestions, refetchQuestions]);

  const handleModalSubmit = useCallback(async (formData) => {
    try {
      if (modalState.mode === 'create') {
        await masterDataService.createQuestion(formData);
      } else {
        await masterDataService.updateQuestion(modalState.question.id, formData);
      }
      
      await refetchQuestions();
      setModalState({ isOpen: false, question: null, mode: 'create' });
    } catch (error) {
      console.error('Failed to save question:', error);
    }
  }, [modalState, refetchQuestions]);

  const handleModalClose = useCallback(() => {
    setModalState({ isOpen: false, question: null, mode: 'create' });
  }, []);

  // Pagination handlers
  const handlePageChange = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const handlePageSizeChange = useCallback((pageSize) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);

  // Calculate pagination info
  const totalPages = Math.ceil(processedQuestions.length / pagination.pageSize);
  const hasNextPage = pagination.page < totalPages;
  const hasPrevPage = pagination.page > 1;

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Question Management</h1>
          <p className="text-gray-600 mt-1">
            Manage and organize your question bank
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleCreateQuestion}
        >
          ➕ Create Question
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <QuestionFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          masterData={masterData.results || {}}
        />
      </div>

      {/* Stats and Actions */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          Showing {paginatedQuestions.length} of {processedQuestions.length} questions
          {selectedQuestions.length > 0 && (
            <span className="ml-2 text-blue-600">
              ({selectedQuestions.length} selected)
            </span>
          )}
        </div>
        
        {selectedQuestions.length > 0 && (
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-outline btn-sm text-red-600"
              onClick={handleBulkDelete}
            >
              🗑️ Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Questions Table */}
      <div className="mb-6">
        <QuestionTable
          questions={paginatedQuestions}
          loading={questionsLoading}
          selectedQuestions={selectedQuestions}
          onSelectQuestion={handleSelectQuestion}
          onSelectAll={handleSelectAll}
          onSort={handleSort}
          sortField={sortConfig.field}
          sortOrder={sortConfig.order}
          onEdit={handleEditQuestion}
          onDelete={handleDeleteQuestion}
          onView={handleViewQuestion}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <select
              className="form-select w-20"
              value={pagination.pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              {PAGINATION.PAGE_SIZE_OPTIONS.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!hasPrevPage}
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {totalPages}
            </span>
            
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!hasNextPage}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Question Modal */}
      <QuestionModal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        question={modalState.question}
        onSubmit={handleModalSubmit}
        loading={false}
        masterData={masterData.results || {}}
      />

      {/* Error Display */}
      {questionsError && (
        <div className="alert alert-error mt-4">
          <strong>Error:</strong> {questionsError.message}
        </div>
      )}
    </div>
  );
};

export default QuestionManagementOptimized;
