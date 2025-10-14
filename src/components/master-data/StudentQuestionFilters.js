import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  getUserSubscriptions,
  getEntitySubjects,
  getTopicsForSubject,
  getModulesForTopic,
  getChaptersForModule
} from '../../services/subscriptionService';

const StudentQuestionFilters = ({ filters, onFilterChange, onApplyFilters, onClearFilters, questionCount, bookmarks = [] }) => {
  const { token } = useApp();
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [modules, setModules] = useState([]);
  const [chapters, setChapters] = useState([]);

  // Load subscriptions on mount
  useEffect(() => {
    if (token) {
      loadSubscriptions();
    }
  }, [token]);

  const loadSubscriptions = async () => {
    try {
      const data = await getUserSubscriptions(token);
      console.log('Loaded subscriptions:', data);
      
      // Filter only active and paid subscriptions
      // API returns 'status' and 'paymentStatus' fields
      const activeSubscriptions = (data || []).filter(
        sub => sub.status === 'ACTIVE' && sub.paymentStatus === 'PAID'
      );
      console.log('Active subscriptions:', activeSubscriptions);
      setSubscriptions(activeSubscriptions);
      
      // Auto-select first subscription if available
      if (activeSubscriptions.length > 0 && !selectedSubscription) {
        setSelectedSubscription(activeSubscriptions[0]);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  };

  // Load subjects when subscription changes
  useEffect(() => {
    if (selectedSubscription) {
      loadSubjectsForSubscription(selectedSubscription);
    } else {
      setSubjects([]);
      setTopics([]);
      setModules([]);
      setChapters([]);
    }
  }, [selectedSubscription]);

  const loadSubjectsForSubscription = async (subscription) => {
    try {
      // Use student-specific API: /api/student/course-content/subjects
      // Requires: entityId (class/exam/course ID) and courseTypeId
      console.log('Loading subjects for subscription:', subscription);
      
      const data = await getEntitySubjects(token, subscription.entityId, subscription.courseTypeId);
      console.log('Loaded subjects response:', data);
      console.log('Subjects type:', typeof data, 'isArray:', Array.isArray(data));
      
      // Handle different response formats
      let subjectsArray = [];
      if (Array.isArray(data)) {
        subjectsArray = data;
      } else if (data && Array.isArray(data.subjects)) {
        subjectsArray = data.subjects;
      } else if (data && typeof data === 'object') {
        // If it's a single object, wrap it in an array
        subjectsArray = [data];
      }
      
      console.log('Final subjects array:', subjectsArray);
      setSubjects(subjectsArray);
      
      // Reset lower levels
      setTopics([]);
      setModules([]);
      setChapters([]);
    } catch (error) {
      console.error('Error loading subjects:', error);
      setSubjects([]);
    }
  };

  // Load topics when subject (linkageId) changes
  useEffect(() => {
    if (filters.linkageId) {
      loadTopics(filters.linkageId);
    } else {
      setTopics([]);
      setModules([]);
      setChapters([]);
    }
  }, [filters.linkageId]);

  const loadTopics = async (subjectLinkageId) => {
    try {
      if (!selectedSubscription) return;
      
      // Use student-specific API: /api/student/course-content/topics
      // Requires: courseTypeId and linkageId (subjectLinkageId)
      console.log('Loading topics for linkageId:', subjectLinkageId, 'courseTypeId:', selectedSubscription.courseTypeId);
      
      const data = await getTopicsForSubject(token, selectedSubscription.courseTypeId, subjectLinkageId);
      console.log('Loaded topics response:', data);
      
      // Handle different response formats
      const topicsArray = Array.isArray(data) ? data : (data?.topics || []);
      console.log('Final topics array:', topicsArray);
      
      setTopics(topicsArray);
    } catch (error) {
      console.error('Error loading topics:', error);
      setTopics([]);
    }
  };

  // Load modules when topic changes
  useEffect(() => {
    if (filters.topicId) {
      loadModules(filters.topicId);
    } else {
      setModules([]);
      setChapters([]);
    }
  }, [filters.topicId]);

  const loadModules = async (topicId) => {
    try {
      // Use student-specific API: /api/student/course-content/modules
      console.log('Loading modules for topicId:', topicId);
      
      const data = await getModulesForTopic(token, topicId);
      console.log('Loaded modules response:', data);
      
      // Handle different response formats
      const modulesArray = Array.isArray(data) ? data : (data?.modules || []);
      console.log('Final modules array:', modulesArray);
      
      setModules(modulesArray);
    } catch (error) {
      console.error('Error loading modules:', error);
      setModules([]);
    }
  };

  // Load chapters when module changes
  useEffect(() => {
    if (filters.moduleId) {
      loadChapters(filters.moduleId);
    } else {
      setChapters([]);
    }
  }, [filters.moduleId]);

  const loadChapters = async (moduleId) => {
    try {
      // Use student-specific API: /api/student/course-content/chapters
      console.log('Loading chapters for moduleId:', moduleId);
      
      const data = await getChaptersForModule(token, moduleId);
      console.log('Loaded chapters response:', data);
      
      // Handle different response formats
      const chaptersArray = Array.isArray(data) ? data : (data?.chapters || []);
      console.log('Final chapters array:', chaptersArray);
      
      setChapters(chaptersArray);
    } catch (error) {
      console.error('Error loading chapters:', error);
      setChapters([]);
    }
  };

  const handleFilterUpdate = (key, value) => {
    // Also pass courseTypeId from selected subscription
    const updatedFilters = { 
      ...filters, 
      [key]: value, 
      page: 0,
      courseTypeId: selectedSubscription?.courseTypeId // Always include courseTypeId
    };
    onFilterChange(updatedFilters);
  };

  const getDifficultyLevels = () => ['EASY', 'MEDIUM', 'HARD'];
  const getQuestionTypes = () => [
    { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
    { value: 'TRUE_FALSE', label: 'True/False' },
    { value: 'FILL_BLANK', label: 'Fill in the Blank' },
    { value: 'ESSAY', label: 'Essay' }
  ];

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb',
      position: 'sticky',
      top: '20px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '18px',
          fontWeight: '700',
          color: '#1f2937',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🔍 Filters
          {questionCount !== undefined && (
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#667eea',
              background: '#e0e7ff',
              padding: '4px 12px',
              borderRadius: '12px'
            }}>
              {questionCount}
            </span>
          )}
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {isExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Search Filter */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              🔍 Search Questions
            </label>
            <input
              type="text"
              placeholder="Search by question text..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                handleFilterUpdate('searchText', e.target.value || undefined);
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                fontSize: '14px',
                color: '#374151',
                background: 'white'
              }}
            />
          </div>

          {/* Subscription Selection */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              🎓 My Subscription
            </label>
            <select
              value={selectedSubscription?.id || ''}
              onChange={(e) => {
                const subId = parseInt(e.target.value);
                const sub = subscriptions.find(s => s.id === subId);
                setSelectedSubscription(sub);
                // Reset all filters
                handleFilterUpdate('subjectId', undefined);
                handleFilterUpdate('topicId', undefined);
                handleFilterUpdate('moduleId', undefined);
                handleFilterUpdate('chapterId', undefined);
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '2px solid #667eea',
                fontSize: '14px',
                color: '#374151',
                background: 'white',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              {subscriptions.length === 0 && (
                <option value="">No active subscriptions</option>
              )}
              {subscriptions.map(sub => {
                // API returns: subscriptionLevel (CLASS/EXAM) and entityName
                const displayText = `${sub.subscriptionLevel} - ${sub.entityName || sub.courseName || 'Unknown'}`;
                
                return (
                  <option key={sub.id} value={sub.id}>
                    {displayText}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Hierarchy Filters - Only show if subscription is selected */}
          {selectedSubscription && (
            <>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  📚 Subject
                </label>
                <select
                  value={filters.linkageId || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    // linkageId is the ClassSubject/ExamSubject/CourseSubject ID
                    handleFilterUpdate('linkageId', value ? parseInt(value) : undefined);
                    handleFilterUpdate('topicId', undefined);
                    handleFilterUpdate('moduleId', undefined);
                    handleFilterUpdate('chapterId', undefined);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '14px',
                    color: '#374151',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">All Subjects</option>
                  {subjects.map(subject => (
                    <option key={subject.linkageId || subject.id} value={subject.linkageId || subject.id}>
                      {subject.subjectName || subject.name || 'Unknown Subject'}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {filters.linkageId && topics.length > 0 && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                📖 Topic
              </label>
              <select
                value={filters.topicId || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterUpdate('topicId', value ? parseInt(value) : undefined);
                  handleFilterUpdate('moduleId', undefined);
                  handleFilterUpdate('chapterId', undefined);
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  fontSize: '14px',
                  color: '#374151',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="">All Topics</option>
                {topics.map(topic => (
                  <option key={topic.id} value={topic.id}>
                    {topic.topicName || topic.name || 'Unknown Topic'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {filters.topicId && modules.length > 0 && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                📚 Module
              </label>
              <select
                value={filters.moduleId || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterUpdate('moduleId', value ? parseInt(value) : undefined);
                  handleFilterUpdate('chapterId', undefined);
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  fontSize: '14px',
                  color: '#374151',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="">All Modules</option>
                {modules.map(module => (
                  <option key={module.id} value={module.id}>
                    {module.moduleName || module.name || 'Unknown Module'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {filters.moduleId && chapters.length > 0 && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                📑 Chapter
              </label>
              <select
                value={filters.chapterId || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterUpdate('chapterId', value ? parseInt(value) : undefined);
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  fontSize: '14px',
                  color: '#374151',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="">All Chapters</option>
                {chapters.map(chapter => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.chapterName || chapter.name || 'Unknown Chapter'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Difficulty Level - Only show if subscription is selected */}
          {selectedSubscription && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                📊 Difficulty Level
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {getDifficultyLevels().map(level => {
                  const isSelected = filters.difficultyLevel === level;
                  const colors = {
                    EASY: { bg: '#dcfce7', text: '#166534', selected: '#86efac' },
                    MEDIUM: { bg: '#fef3c7', text: '#92400e', selected: '#fcd34d' },
                    HARD: { bg: '#fee2e2', text: '#991b1b', selected: '#fca5a5' }
                  };
                  const color = colors[level];
                  
                  return (
                    <button
                      key={level}
                      onClick={() => handleFilterUpdate('difficultyLevel', isSelected ? undefined : level)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: isSelected ? `2px solid ${color.selected}` : `2px solid ${color.bg}`,
                        background: isSelected ? color.selected : color.bg,
                        color: color.text,
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {isSelected && '✓ '}{level}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Question Type - Only show if subscription is selected */}
          {selectedSubscription && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                📝 Question Type
              </label>
              <select
                value={filters.questionType || ''}
                onChange={(e) => handleFilterUpdate('questionType', e.target.value || undefined)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  fontSize: '14px',
                  color: '#374151',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="">All Types</option>
                {getQuestionTypes().map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort Options */}
          {selectedSubscription && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                🔄 Sort By
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
                <select
                  value={filters.sortBy || 'id'}
                  onChange={(e) => handleFilterUpdate('sortBy', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '14px',
                    color: '#374151',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <option value="id">Question ID</option>
                  <option value="difficultyLevel">Difficulty</option>
                  <option value="marks">Marks</option>
                </select>
                <select
                  value={filters.sortDir || 'asc'}
                  onChange={(e) => handleFilterUpdate('sortDir', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '14px',
                    color: '#374151',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <option value="asc">↑ Asc</option>
                  <option value="desc">↓ Desc</option>
                </select>
              </div>
            </div>
          )}

          {/* Bookmarked Filter */}
          {bookmarks.length > 0 && (
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px',
                borderRadius: '8px',
                background: showBookmarkedOnly ? '#fef3c7' : '#f9fafb',
                border: `2px solid ${showBookmarkedOnly ? '#fbbf24' : '#e5e7eb'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
                <input
                  type="checkbox"
                  checked={showBookmarkedOnly}
                  onChange={(e) => {
                    setShowBookmarkedOnly(e.target.checked);
                    handleFilterUpdate('bookmarkedOnly', e.target.checked);
                  }}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  ❤️ Show Bookmarked Only ({bookmarks.length})
                </span>
              </label>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '12px',
            paddingTop: '16px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <button
              onClick={onApplyFilters}
              disabled={!selectedSubscription}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: '8px',
                border: 'none',
                background: selectedSubscription 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                  : '#e5e7eb',
                color: selectedSubscription ? 'white' : '#9ca3af',
                fontSize: '14px',
                fontWeight: '600',
                cursor: selectedSubscription ? 'pointer' : 'not-allowed',
                transition: 'transform 0.2s ease',
                opacity: selectedSubscription ? 1 : 0.6
              }}
              onMouseOver={(e) => {
                if (selectedSubscription) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseOut={(e) => {
                if (selectedSubscription) {
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              Apply Filters
            </button>
            <button
              onClick={() => {
                setSearchText('');
                setShowBookmarkedOnly(false);
                // Keep courseTypeId but clear other filters
                onFilterChange({
                  page: 0,
                  size: filters.size || 20,
                  sortBy: filters.sortBy || 'id',
                  sortDir: filters.sortDir || 'asc',
                  courseTypeId: selectedSubscription?.courseTypeId
                });
              }}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                background: 'white',
                color: '#6b7280',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#f3f4f6';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentQuestionFilters;

