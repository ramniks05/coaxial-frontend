import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { getSubjects } from '../services/masterDataService';
import './SubjectFilterChat.css';

const SubjectFilterChat = () => {
  const { token, addNotification } = useApp();
  const [courseTypeId, setCourseTypeId] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);

  // Debounce function to delay API calls
  const debounce = useCallback((func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }, []);

  // API call function
  const fetchSubjectsByCourseType = useCallback(async (id) => {
    if (!id || !id.trim()) {
      setSubjects([]);
      setError(null);
      return;
    }

    const numericId = parseInt(id.trim());
    if (isNaN(numericId)) {
      setError('Please enter a valid numeric course type ID');
      setSubjects([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching subjects for course type ID: ${numericId}`);
      const data = await getSubjects(token, numericId);
      
      console.log(`Found ${data?.length || 0} subjects for course type ${numericId}`);
      setSubjects(data || []);
      
      // Add to search history
      const searchEntry = {
        id: numericId,
        timestamp: new Date().toISOString(),
        resultCount: data?.length || 0
      };
      setSearchHistory(prev => [searchEntry, ...prev.slice(0, 4)]); // Keep last 5 searches
      
    } catch (err) {
      console.error('Error fetching subjects:', err);
      
      if (err.message.includes('404')) {
        setError(`Course type ID ${numericId} not found`);
      } else if (err.message.includes('401') || err.message.includes('403')) {
        setError('Authentication required. Please log in again.');
      } else if (err.message.includes('500')) {
        setError('Server error. Please try again later.');
      } else {
        setError(`Failed to fetch subjects: ${err.message}`);
      }
      
      setSubjects([]);
      addNotification({
        type: 'error',
        message: `Failed to fetch subjects for course type ${numericId}`,
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  }, [token, addNotification]);

  // Debounced version of the API call
  const debouncedFetchSubjects = useCallback(
    debounce(fetchSubjectsByCourseType, 500),
    [fetchSubjectsByCourseType, debounce]
  );

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setCourseTypeId(value);
    
    if (value.trim()) {
      debouncedFetchSubjects(value);
    } else {
      setSubjects([]);
      setError(null);
      setLoading(false);
    }
  };

  // Handle search history click
  const handleHistoryClick = (id) => {
    setCourseTypeId(id.toString());
    fetchSubjectsByCourseType(id.toString());
  };

  // Clear search
  const handleClear = () => {
    setCourseTypeId('');
    setSubjects([]);
    setError(null);
    setLoading(false);
  };

  return (
    <div className="subject-filter-chat">
      <div className="chat-header">
        <h2>📚 Subject Filter Chat</h2>
        <p>Enter a course type ID to find related subjects in real-time</p>
      </div>

      <div className="chat-input-section">
        <div className="input-group">
          <input
            type="text"
            value={courseTypeId}
            onChange={handleInputChange}
            placeholder="Enter Course Type ID (e.g., 1, 2, 3...)"
            className="course-type-input"
            disabled={loading}
          />
          {courseTypeId && (
            <button
              onClick={handleClear}
              className="clear-button"
              disabled={loading}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        
        {loading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <span>Searching subjects...</span>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {searchHistory.length > 0 && (
        <div className="search-history">
          <h4>Recent Searches:</h4>
          <div className="history-items">
            {searchHistory.map((entry, index) => (
              <button
                key={index}
                onClick={() => handleHistoryClick(entry.id)}
                className="history-item"
                title={`Found ${entry.resultCount} subjects`}
              >
                <span className="history-id">#{entry.id}</span>
                <span className="history-count">{entry.resultCount} subjects</span>
                <span className="history-time">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="results-section">
        {subjects.length > 0 && (
          <div className="results-header">
            <h3>
              📋 Found {subjects.length} subject{subjects.length !== 1 ? 's' : ''} 
              {courseTypeId && ` for Course Type #${courseTypeId}`}
            </h3>
          </div>
        )}

        {subjects.length === 0 && courseTypeId && !loading && !error && (
          <div className="empty-results">
            <div className="empty-icon">🔍</div>
            <h4>No Subjects Found</h4>
            <p>No subjects are linked to course type #{courseTypeId}</p>
            <div className="empty-suggestions">
              <p><strong>Possible reasons:</strong></p>
              <ul>
                <li>Course type doesn't exist</li>
                <li>No courses are linked to this course type</li>
                <li>No subjects are linked to the courses</li>
                <li>All linked subjects are inactive</li>
              </ul>
            </div>
          </div>
        )}

        {subjects.length > 0 && (
          <div className="subjects-list">
            {subjects.map((subject) => (
              <div key={subject.id} className="subject-card">
                <div className="subject-header">
                  <h4 className="subject-name">{subject.name}</h4>
                  <span className={`status-badge ${subject.isActive ? 'active' : 'inactive'}`}>
                    {subject.isActive ? '✅ Active' : '❌ Inactive'}
                  </span>
                </div>
                
                {subject.description && (
                  <p className="subject-description">{subject.description}</p>
                )}
                
                <div className="subject-details">
                  <div className="detail-item">
                    <span className="detail-label">ID:</span>
                    <span className="detail-value">#{subject.id}</span>
                  </div>
                  
                  {subject.displayOrder && (
                    <div className="detail-item">
                      <span className="detail-label">Display Order:</span>
                      <span className="detail-value">{subject.displayOrder}</span>
                    </div>
                  )}
                  
                  <div className="detail-item">
                    <span className="detail-label">Course Type:</span>
                    <span className="detail-value">
                      {subject.courseType?.name || 'Unknown'}
                    </span>
                  </div>
                  
                  {subject.createdAt && (
                    <div className="detail-item">
                      <span className="detail-label">Created:</span>
                      <span className="detail-value">
                        {new Date(subject.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!courseTypeId && (
          <div className="welcome-message">
            <div className="welcome-icon">🎯</div>
            <h4>Welcome to Subject Filter Chat!</h4>
            <p>Start by entering a course type ID above to see all subjects linked to that course type.</p>
            <div className="feature-list">
              <h5>Features:</h5>
              <ul>
                <li>🔍 Real-time filtering as you type</li>
                <li>📊 Supports both Academic and Competitive course types</li>
                <li>⏱️ Search history for quick access</li>
                <li>🔄 Automatic deduplication of results</li>
                <li>📱 Responsive design</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectFilterChat;
