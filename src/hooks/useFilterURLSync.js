import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useFilterURLSync = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Sync filters to URL
  const syncFiltersToURL = useCallback((filters) => {
    try {
      const searchParams = new URLSearchParams();
      
      // Basic filters
      if (filters.basic) {
        if (filters.basic.isActive !== null) {
          searchParams.set('isActive', filters.basic.isActive.toString());
        }
        if (filters.basic.questionType) {
          searchParams.set('questionType', filters.basic.questionType);
        }
        if (filters.basic.difficultyLevels?.length > 0) {
          searchParams.set('difficultyLevels', filters.basic.difficultyLevels.join(','));
        }
        if (filters.basic.minMarks !== 1) {
          searchParams.set('minMarks', filters.basic.minMarks.toString());
        }
        if (filters.basic.maxMarks !== 10) {
          searchParams.set('maxMarks', filters.basic.maxMarks.toString());
        }
      }
      
      // Academic filters
      if (filters.academic) {
        if (filters.academic.courseTypeId) {
          searchParams.set('courseTypeId', filters.academic.courseTypeId.toString());
        }
        if (filters.academic.courseId) {
          searchParams.set('courseId', filters.academic.courseId.toString());
        }
        if (filters.academic.relationshipId) {
          searchParams.set('relationshipId', filters.academic.relationshipId.toString());
        }
        if (filters.academic.subjectId) {
          searchParams.set('subjectId', filters.academic.subjectId.toString());
        }
        if (filters.academic.topicId) {
          searchParams.set('topicId', filters.academic.topicId.toString());
        }
        if (filters.academic.moduleId) {
          searchParams.set('moduleId', filters.academic.moduleId.toString());
        }
        if (filters.academic.chapterId) {
          searchParams.set('chapterId', filters.academic.chapterId.toString());
        }
      }
      
      // Exam suitability filters
      if (filters.examSuitability) {
        if (filters.examSuitability.examIds?.length > 0) {
          searchParams.set('examIds', filters.examSuitability.examIds.join(','));
        }
        if (filters.examSuitability.suitabilityLevels?.length > 0) {
          searchParams.set('suitabilityLevels', filters.examSuitability.suitabilityLevels.join(','));
        }
        if (filters.examSuitability.examTypes?.length > 0) {
          searchParams.set('examTypes', filters.examSuitability.examTypes.join(','));
        }
        if (filters.examSuitability.conductingBodies?.length > 0) {
          searchParams.set('conductingBodies', filters.examSuitability.conductingBodies.join(','));
        }
      }
      
      // Previously asked filters
      if (filters.previouslyAsked) {
        if (filters.previouslyAsked.examIds?.length > 0) {
          searchParams.set('prevExamIds', filters.previouslyAsked.examIds.join(','));
        }
        if (filters.previouslyAsked.appearedYears?.length > 0) {
          searchParams.set('appearedYears', filters.previouslyAsked.appearedYears.join(','));
        }
        if (filters.previouslyAsked.sessions?.length > 0) {
          searchParams.set('sessions', filters.previouslyAsked.sessions.join(','));
        }
        if (filters.previouslyAsked.minMarksInExam !== null) {
          searchParams.set('minMarksInExam', filters.previouslyAsked.minMarksInExam.toString());
        }
        if (filters.previouslyAsked.maxMarksInExam !== null) {
          searchParams.set('maxMarksInExam', filters.previouslyAsked.maxMarksInExam.toString());
        }
        if (filters.previouslyAsked.questionNumbers?.length > 0) {
          searchParams.set('questionNumbers', filters.previouslyAsked.questionNumbers.join(','));
        }
      }
      
      // Search & date filters
      if (filters.searchDate) {
        if (filters.searchDate.questionTextSearch) {
          searchParams.set('questionTextSearch', filters.searchDate.questionTextSearch);
        }
        if (filters.searchDate.explanationSearch) {
          searchParams.set('explanationSearch', filters.searchDate.explanationSearch);
        }
        if (filters.searchDate.dateFrom) {
          searchParams.set('dateFrom', filters.searchDate.dateFrom);
        }
        if (filters.searchDate.dateTo) {
          searchParams.set('dateTo', filters.searchDate.dateTo);
        }
        if (filters.searchDate.page !== 0) {
          searchParams.set('page', filters.searchDate.page.toString());
        }
        if (filters.searchDate.size !== 20) {
          searchParams.set('size', filters.searchDate.size.toString());
        }
      }
      
      // Update URL without causing a page reload
      const newSearch = searchParams.toString();
      const newPath = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;
      
      if (newPath !== location.pathname + location.search) {
        navigate(newPath, { replace: true });
      }
    } catch (error) {
      console.error('Error syncing filters to URL:', error);
    }
  }, [location.pathname, location.search, navigate]);

  // Load filters from URL
  const loadFiltersFromURL = useCallback(() => {
    try {
      const searchParams = new URLSearchParams(location.search);
      const filters = {
        basic: {},
        academic: {},
        examSuitability: {},
        previouslyAsked: {},
        searchDate: {}
      };
      
      // Basic filters
      if (searchParams.has('isActive')) {
        const value = searchParams.get('isActive');
        filters.basic.isActive = value === 'true' ? true : value === 'false' ? false : null;
      }
      if (searchParams.has('questionType')) {
        filters.basic.questionType = searchParams.get('questionType');
      }
      if (searchParams.has('difficultyLevels')) {
        filters.basic.difficultyLevels = searchParams.get('difficultyLevels').split(',');
      }
      if (searchParams.has('minMarks')) {
        filters.basic.minMarks = parseInt(searchParams.get('minMarks'));
      }
      if (searchParams.has('maxMarks')) {
        filters.basic.maxMarks = parseInt(searchParams.get('maxMarks'));
      }
      
      // Academic filters
      if (searchParams.has('courseTypeId')) {
        filters.academic.courseTypeId = parseInt(searchParams.get('courseTypeId'));
      }
      if (searchParams.has('courseId')) {
        filters.academic.courseId = parseInt(searchParams.get('courseId'));
      }
      if (searchParams.has('relationshipId')) {
        filters.academic.relationshipId = parseInt(searchParams.get('relationshipId'));
      }
      if (searchParams.has('subjectId')) {
        filters.academic.subjectId = parseInt(searchParams.get('subjectId'));
      }
      if (searchParams.has('topicId')) {
        filters.academic.topicId = parseInt(searchParams.get('topicId'));
      }
      if (searchParams.has('moduleId')) {
        filters.academic.moduleId = parseInt(searchParams.get('moduleId'));
      }
      if (searchParams.has('chapterId')) {
        filters.academic.chapterId = parseInt(searchParams.get('chapterId'));
      }
      
      // Exam suitability filters
      if (searchParams.has('examIds')) {
        filters.examSuitability.examIds = searchParams.get('examIds').split(',').map(id => parseInt(id));
      }
      if (searchParams.has('suitabilityLevels')) {
        filters.examSuitability.suitabilityLevels = searchParams.get('suitabilityLevels').split(',');
      }
      if (searchParams.has('examTypes')) {
        filters.examSuitability.examTypes = searchParams.get('examTypes').split(',');
      }
      if (searchParams.has('conductingBodies')) {
        filters.examSuitability.conductingBodies = searchParams.get('conductingBodies').split(',').map(id => parseInt(id));
      }
      
      // Previously asked filters
      if (searchParams.has('prevExamIds')) {
        filters.previouslyAsked.examIds = searchParams.get('prevExamIds').split(',').map(id => parseInt(id));
      }
      if (searchParams.has('appearedYears')) {
        filters.previouslyAsked.appearedYears = searchParams.get('appearedYears').split(',').map(year => parseInt(year));
      }
      if (searchParams.has('sessions')) {
        filters.previouslyAsked.sessions = searchParams.get('sessions').split(',');
      }
      if (searchParams.has('minMarksInExam')) {
        filters.previouslyAsked.minMarksInExam = parseInt(searchParams.get('minMarksInExam'));
      }
      if (searchParams.has('maxMarksInExam')) {
        filters.previouslyAsked.maxMarksInExam = parseInt(searchParams.get('maxMarksInExam'));
      }
      if (searchParams.has('questionNumbers')) {
        filters.previouslyAsked.questionNumbers = searchParams.get('questionNumbers').split(',');
      }
      
      // Search & date filters
      if (searchParams.has('questionTextSearch')) {
        filters.searchDate.questionTextSearch = searchParams.get('questionTextSearch');
      }
      if (searchParams.has('explanationSearch')) {
        filters.searchDate.explanationSearch = searchParams.get('explanationSearch');
      }
      if (searchParams.has('dateFrom')) {
        filters.searchDate.dateFrom = searchParams.get('dateFrom');
      }
      if (searchParams.has('dateTo')) {
        filters.searchDate.dateTo = searchParams.get('dateTo');
      }
      if (searchParams.has('page')) {
        filters.searchDate.page = parseInt(searchParams.get('page'));
      }
      if (searchParams.has('size')) {
        filters.searchDate.size = parseInt(searchParams.get('size'));
      }
      
      // Return filters only if there are any parameters
      const hasFilters = Object.values(filters).some(section => 
        Object.keys(section).length > 0
      );
      
      return hasFilters ? filters : null;
    } catch (error) {
      console.error('Error loading filters from URL:', error);
      return null;
    }
  }, [location.search]);

  // Clear URL parameters
  const clearFiltersFromURL = useCallback(() => {
    navigate(location.pathname, { replace: true });
  }, [location.pathname, navigate]);

  return {
    syncFiltersToURL,
    loadFiltersFromURL,
    clearFiltersFromURL
  };
};
