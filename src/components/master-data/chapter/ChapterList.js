import React, { useEffect, useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useMasterData } from '../../../hooks/useMasterData';
import { getCourseTypesCached } from '../../../services/globalApiCache';
import ChapterListCard from '../ChapterListCard';
import '../MasterDataComponent.css';

/**
 * Chapter List Component
 * Handles the display of chapters with filtering and actions
 */
const ChapterList = ({ 
  filters, 
  onEdit, 
  onDelete, 
  onPreviewVideo,
  onPreviewDocument,
  loading = false,
  chapters = []
}) => {
  const { token, addNotification } = useApp();
  const { getCourseTypeName, getCourseName } = useMasterData();
  const [courseTypes, setCourseTypes] = useState([]);

  // Load course types for display
  useEffect(() => {
    const loadCourseTypes = async () => {
      if (!token) return;
      try {
        const data = await getCourseTypesCached(token);
        console.log('Raw courseTypes API response (ChapterList):', data);
        console.log('CourseTypes data type:', typeof data);
        console.log('CourseTypes is array:', Array.isArray(data));
        
        // Handle different response formats
        let courseTypesArray = [];
        if (Array.isArray(data)) {
          courseTypesArray = data;
        } else if (data && Array.isArray(data.content)) {
          // Handle paginated response
          courseTypesArray = data.content;
        } else if (data && Array.isArray(data.data)) {
          // Handle wrapped response
          courseTypesArray = data.data;
        } else if (data && data.courseTypes && Array.isArray(data.courseTypes)) {
          // Handle nested response
          courseTypesArray = data.courseTypes;
        } else {
          console.warn('Unexpected courseTypes data format (ChapterList):', data);
          courseTypesArray = [];
        }
        
        console.log('Processed courseTypes array (ChapterList):', courseTypesArray);
        setCourseTypes(courseTypesArray);
      } catch (error) {
        console.error('Error loading course types:', error);
      }
    };
    loadCourseTypes();
  }, [token]);

  // Helper function to get course type name
  const getCourseTypeNameForChapter = (chapter) => {
    return chapter.courseTypeName || 
           chapter.course?.courseTypeName || 
           getCourseTypeName(chapter.course?.courseType?.id || 
                           chapter.courseType?.id || 
                           chapter.courseTypeId);
  };

  // Helper function to get course name
  const getCourseNameForChapter = (chapter) => {
    return chapter.courseName || 
           getCourseName(chapter.course?.id || chapter.courseId);
  };

  // Group chapters by course type for better organization
  const groupChaptersByType = () => {
    const grouped = {};
    (chapters || []).forEach(chapter => {
      const courseTypeName = getCourseTypeNameForChapter(chapter);
      if (!grouped[courseTypeName]) {
        grouped[courseTypeName] = [];
      }
      grouped[courseTypeName].push(chapter);
    });
    return grouped;
  };

  const groupedChapters = groupChaptersByType();
  const courseTypeNames = Object.keys(groupedChapters).sort();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading chapters...</p>
      </div>
    );
  }

  if (!chapters || chapters.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">No Chapters</div>
        <h4>No chapters found</h4>
        <p>
          {Object.keys(filters).some(key => filters[key] && filters[key] !== '') 
            ? 'No chapters match your current filters. Try adjusting your search criteria.'
            : 'Start by creating your first chapter using the form above.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="data-section">
      <div className="data-header">
        <h4>Chapters ({chapters.length})</h4>
        <div className="data-header-actions">
          <span className="data-count">
            Showing {chapters.length} chapter{chapters.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Grouped chapters by course type */}
      <div className="chapters-by-type">
        {courseTypeNames.map((courseTypeName) => (
          <div key={courseTypeName} className="chapter-type-section">
            <div className="section-header">
              <h4>{courseTypeName} ({groupedChapters[courseTypeName].length})</h4>
            </div>
            <div className="data-grid">
              {groupedChapters[courseTypeName].map((chapter) => (
                <ChapterListCard
                  key={chapter.id}
                  chapter={chapter}
                  onEdit={() => onEdit(chapter)}
                  onDelete={() => onDelete(chapter)}
                  onPreviewVideo={onPreviewVideo}
                  onPreviewDocument={onPreviewDocument}
                  getCourseTypeName={getCourseTypeNameForChapter}
                  getCourseName={getCourseNameForChapter}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Alternative: Simple list view (uncomment if needed) */}
      {/*
      <div className="data-grid">
        {chapters.map((chapter) => (
          <ChapterListCard
            key={chapter.id}
            chapter={chapter}
            onEdit={() => onEdit(chapter)}
            onDelete={() => onDelete(chapter)}
            getCourseTypeName={getCourseTypeNameForChapter}
            getCourseName={getCourseNameForChapter}
          />
        ))}
      </div>
      */}
    </div>
  );
};

export default ChapterList;
