import React, { memo, useCallback } from 'react';
import { QUESTION_TYPES, DIFFICULTY_LEVELS } from '../../../constants';

/**
 * Question Table Component
 * Displays questions in a table format with sorting and selection
 */
const QuestionTable = memo(({ 
  questions, 
  loading, 
  selectedQuestions, 
  onSelectQuestion, 
  onSelectAll, 
  onSort, 
  sortField, 
  sortOrder,
  onEdit,
  onDelete,
  onView
}) => {
  const handleSelectQuestion = useCallback((questionId) => {
    onSelectQuestion(questionId);
  }, [onSelectQuestion]);

  const handleSelectAll = useCallback((e) => {
    onSelectAll(e.target.checked);
  }, [onSelectAll]);

  const handleSort = useCallback((field) => {
    onSort(field);
  }, [onSort]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case DIFFICULTY_LEVELS.EASY:
        return 'text-green-600 bg-green-100';
      case DIFFICULTY_LEVELS.MEDIUM:
        return 'text-yellow-600 bg-yellow-100';
      case DIFFICULTY_LEVELS.HARD:
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-100';
      case 'INACTIVE':
        return 'text-red-600 bg-red-100';
      case 'DRAFT':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <span className="text-gray-400">↕</span>;
    }
    return sortOrder === 'asc' ? <span>↑</span> : <span>↓</span>;
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-center py-12">
            <div className="loading"></div>
            <span className="ml-3 text-gray-600">Loading questions...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
            <p className="text-gray-600">Try adjusting your filters or create a new question.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-body p-0">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="w-12">
                  <input
                    type="checkbox"
                    className="form-input"
                    checked={selectedQuestions.length === questions.length && questions.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('questionText')}
                >
                  <div className="flex items-center gap-2">
                    Question
                    <SortIcon field="questionText" />
                  </div>
                </th>
                <th 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('questionType')}
                >
                  <div className="flex items-center gap-2">
                    Type
                    <SortIcon field="questionType" />
                  </div>
                </th>
                <th 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('difficultyLevel')}
                >
                  <div className="flex items-center gap-2">
                    Difficulty
                    <SortIcon field="difficultyLevel" />
                  </div>
                </th>
                <th 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('subject')}
                >
                  <div className="flex items-center gap-2">
                    Subject
                    <SortIcon field="subject" />
                  </div>
                </th>
                <th 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('topic')}
                >
                  <div className="flex items-center gap-2">
                    Topic
                    <SortIcon field="topic" />
                  </div>
                </th>
                <th 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-2">
                    Status
                    <SortIcon field="status" />
                  </div>
                </th>
                <th 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center gap-2">
                    Created
                    <SortIcon field="createdAt" />
                  </div>
                </th>
                <th className="w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((question) => (
                <tr key={question.id} className="hover:bg-gray-50">
                  <td>
                    <input
                      type="checkbox"
                      className="form-input"
                      checked={selectedQuestions.includes(question.id)}
                      onChange={() => handleSelectQuestion(question.id)}
                    />
                  </td>
                  <td>
                    <div className="max-w-xs">
                      <div className="font-medium text-gray-900 truncate">
                        {question.questionText}
                      </div>
                      {question.description && (
                        <div className="text-sm text-gray-500 truncate">
                          {question.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {question.questionType}
                    </span>
                  </td>
                  <td>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(question.difficultyLevel)}`}>
                      {question.difficultyLevel}
                    </span>
                  </td>
                  <td>
                    <div className="text-sm text-gray-900">
                      {question.subject?.name || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <div className="text-sm text-gray-900">
                      {question.topic?.name || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(question.status)}`}>
                      {question.status}
                    </span>
                  </td>
                  <td>
                    <div className="text-sm text-gray-900">
                      {new Date(question.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={() => onView(question)}
                        title="View Question"
                      >
                        👁️
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={() => onEdit(question)}
                        title="Edit Question"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline text-red-600 hover:text-red-700"
                        onClick={() => onDelete(question)}
                        title="Delete Question"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

QuestionTable.displayName = 'QuestionTable';

export default QuestionTable;
