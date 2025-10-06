import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';

const StudentContentBrowser = () => {
  const { token, addNotification } = useApp();
  // Using dummy data for now - will be replaced with actual API calls
  const courseTypes = [
    { id: 1, name: "Academic Course", description: "Complete school curriculum courses" },
    { id: 2, name: "Competitive Exam", description: "Preparation courses for various competitive examinations" },
    { id: 3, name: "Professional Course", description: "Skill-based professional development courses" }
  ];
  
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [modules, setModules] = useState([]);
  const [chapters, setChapters] = useState([]);
  
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [contentData, setContentData] = useState({
    subjects: [],
    topics: [],
    modules: [],
    chapters: []
  });
  const [loading, setLoading] = useState(false);
  const [selectedPath, setSelectedPath] = useState({
    subjectId: null,
    topicId: null,
    moduleId: null,
    chapterId: null
  });
  
  // Refs for deduplication
  const subjectsLoadingRef = useRef(false);
  const topicsLoadingRef = useRef(false);
  const modulesLoadingRef = useRef(false);
  const chaptersLoadingRef = useRef(false);
  
  // Removed apiCall - using dummy data for now

  // Load course types on mount - using dummy data for now
  useEffect(() => {
    // Course types are already loaded as dummy data
    console.log('Course types loaded:', courseTypes);
  }, [courseTypes]);

  // Load student subscriptions - using dummy data for now
  const loadSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      // Using dummy data for now
      const dummySubscriptions = [
        {
          id: 1,
          courseTypeId: 1,
          courseId: 1,
          classId: 6,
          examId: null,
          subscriptionType: 'class',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          isActive: true,
          courseTypeName: 'Academic Course',
          courseName: 'Academic Course Class 1-10',
          className: 'Grade 1'
        },
        {
          id: 2,
          courseTypeId: 2,
          courseId: 2,
          classId: null,
          examId: 1,
          subscriptionType: 'exam',
          startDate: '2024-01-01',
          endDate: '2024-06-30',
          isActive: true,
          courseTypeName: 'Competitive Exam',
          courseName: 'SSC',
          examName: 'SSC MTS'
        }
      ];
      
      setSubscriptions(dummySubscriptions);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      addNotification('Failed to load subscriptions', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load subscriptions on mount
  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  // Load content when subscription changes
  useEffect(() => {
    if (selectedSubscription) {
      loadContentForSubscription();
    }
  }, [selectedSubscription]);

  const loadContentForSubscription = async () => {
    if (!selectedSubscription) return;

    try {
      setLoading(true);
      
      // Using dummy data for now
      const dummySubjects = [
        { 
          id: 1, 
          linkageId: 5, 
          name: 'Mathematics', 
          subjectName: 'Mathematics',
          description: 'Mathematical concepts and problem solving' 
        },
        { 
          id: 2, 
          linkageId: 6, 
          name: 'Hindi', 
          subjectName: 'Hindi',
          description: 'Hindi language and literature' 
        },
        { 
          id: 3, 
          linkageId: 7, 
          name: 'English', 
          subjectName: 'English',
          description: 'English language and communication' 
        },
        { 
          id: 4, 
          linkageId: 8, 
          name: 'Science', 
          subjectName: 'Science',
          description: 'Scientific concepts and experiments' 
        }
      ];
      
      setContentData(prev => ({
        ...prev,
        subjects: dummySubjects
      }));

      // Reset selected path
      setSelectedPath({
        subjectId: null,
        topicId: null,
        moduleId: null,
        chapterId: null
      });

    } catch (error) {
      console.error('Error loading content:', error);
      addNotification('Failed to load content', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadTopicsForSubject = async (subjectId, linkageId) => {
    if (subjectsLoadingRef.current) return;
    
    try {
      subjectsLoadingRef.current = true;
      // Using dummy data for now
      const dummyTopics = [
        { id: 1, name: 'Basic Addition', description: 'Introduction to addition' },
        { id: 2, name: 'Basic Subtraction', description: 'Introduction to subtraction' },
        { id: 3, name: 'Multiplication', description: 'Learning multiplication' },
        { id: 4, name: 'Division', description: 'Learning division' },
        { id: 5, name: 'Fractions', description: 'Understanding fractions' }
      ];
      
      setContentData(prev => ({
        ...prev,
        topics: dummyTopics
      }));
      setSelectedPath(prev => ({
        ...prev,
        subjectId,
        topicId: null,
        moduleId: null,
        chapterId: null
      }));
    } catch (error) {
      console.error('Error loading topics:', error);
      addNotification('Failed to load topics', 'error');
    } finally {
      subjectsLoadingRef.current = false;
    }
  };

  const loadModulesForTopic = async (topicId) => {
    if (topicsLoadingRef.current) return;
    
    try {
      topicsLoadingRef.current = true;
      // Using dummy data for now
      const dummyModules = [
        { id: 1, name: 'Module 1: Introduction', description: 'Basic concepts and introduction' },
        { id: 2, name: 'Module 2: Practice', description: 'Practice exercises and examples' },
        { id: 3, name: 'Module 3: Advanced', description: 'Advanced concepts and applications' },
        { id: 4, name: 'Module 4: Assessment', description: 'Assessment and evaluation' }
      ];
      
      setContentData(prev => ({
        ...prev,
        modules: dummyModules
      }));
      setSelectedPath(prev => ({
        ...prev,
        topicId,
        moduleId: null,
        chapterId: null
      }));
    } catch (error) {
      console.error('Error loading modules:', error);
      addNotification('Failed to load modules', 'error');
    } finally {
      topicsLoadingRef.current = false;
    }
  };

  const loadChaptersForModule = async (moduleId) => {
    if (modulesLoadingRef.current) return;
    
    try {
      modulesLoadingRef.current = true;
      // Using dummy data for now
      const dummyChapters = [
        { id: 1, name: 'Chapter 1: Getting Started', description: 'Introduction to the topic' },
        { id: 2, name: 'Chapter 2: Core Concepts', description: 'Understanding the fundamentals' },
        { id: 3, name: 'Chapter 3: Examples', description: 'Real-world examples and applications' },
        { id: 4, name: 'Chapter 4: Practice', description: 'Practice problems and exercises' },
        { id: 5, name: 'Chapter 5: Summary', description: 'Summary and key takeaways' }
      ];
      
      setContentData(prev => ({
        ...prev,
        chapters: dummyChapters
      }));
      setSelectedPath(prev => ({
        ...prev,
        moduleId,
        chapterId: null
      }));
    } catch (error) {
      console.error('Error loading chapters:', error);
      addNotification('Failed to load chapters', 'error');
    } finally {
      modulesLoadingRef.current = false;
    }
  };

  const getSubscriptionDisplayText = (subscription) => {
    const courseType = courseTypes.find(ct => ct.id === subscription.courseTypeId);
    const course = courses.find(c => c.id === subscription.courseId);
    
    let text = `${courseType?.name || 'Unknown'} - ${course?.name || 'Unknown'}`;
    
    if (subscription.classId) {
      const classItem = classes.find(c => c.id === subscription.classId);
      text += ` - ${classItem?.name || 'Unknown Class'}`;
    } else if (subscription.examId) {
      const exam = exams.find(e => e.id === subscription.examId);
      text += ` - ${exam?.name || 'Unknown Exam'}`;
    }
    
    return text;
  };

  const getSubjectDisplayText = (subject) => {
    return subject.subjectName || subject.name || 'Unknown Subject';
  };

  const resetContent = () => {
    setContentData({
      subjects: [],
      topics: [],
      modules: [],
      chapters: []
    });
    setSelectedPath({
      subjectId: null,
      topicId: null,
      moduleId: null,
      chapterId: null
    });
  };

  return (
    <div className="student-content-browser">
      <div className="page-header">
        <h2>Content Browser</h2>
      </div>

      {/* Subscription Selection */}
      <div className="subscription-section">
        <h3>Select Subscription</h3>
        {loading && subscriptions.length === 0 ? (
          <div className="loading">Loading subscriptions...</div>
        ) : subscriptions.length === 0 ? (
          <div className="empty-state">
            <p>No active subscriptions found. Please create a subscription first.</p>
          </div>
        ) : (
          <div className="subscription-cards">
            {subscriptions
              .filter(sub => sub.isActive)
              .map(subscription => (
                <div 
                  key={subscription.id} 
                  className={`subscription-card ${selectedSubscription?.id === subscription.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedSubscription(subscription);
                    resetContent();
                  }}
                >
                  <h4>{getSubscriptionDisplayText(subscription)}</h4>
                  <p className="subscription-details">
                    <span>Type: {subscription.subscriptionType}</span>
                    <span>Start: {new Date(subscription.startDate).toLocaleDateString()}</span>
                    {subscription.endDate && (
                      <span>End: {new Date(subscription.endDate).toLocaleDateString()}</span>
                    )}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Content Navigation */}
      {selectedSubscription && (
        <div className="content-navigation">
          <h3>Browse Content</h3>
          
          {/* Subjects */}
          <div className="content-section">
            <h4>Subjects ({contentData.subjects.length})</h4>
            {contentData.subjects.length === 0 ? (
              <p className="empty-state">No subjects available for this subscription.</p>
            ) : (
              <div className="content-grid">
                {contentData.subjects.map(subject => (
                  <div 
                    key={subject.linkageId || subject.id}
                    className={`content-card ${selectedPath.subjectId === subject.linkageId ? 'selected' : ''}`}
                    onClick={() => loadTopicsForSubject(subject.linkageId || subject.id, subject.linkageId)}
                  >
                    <h5>{getSubjectDisplayText(subject)}</h5>
                    <p>{subject.description || 'No description available'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Topics */}
          {selectedPath.subjectId && (
            <div className="content-section">
              <h4>Topics ({contentData.topics.length})</h4>
              {contentData.topics.length === 0 ? (
                <p className="empty-state">No topics available for this subject.</p>
              ) : (
                <div className="content-grid">
                  {contentData.topics.map(topic => (
                    <div 
                      key={topic.id}
                      className={`content-card ${selectedPath.topicId === topic.id ? 'selected' : ''}`}
                      onClick={() => loadModulesForTopic(topic.id)}
                    >
                      <h5>{topic.name}</h5>
                      <p>{topic.description || 'No description available'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Modules */}
          {selectedPath.topicId && (
            <div className="content-section">
              <h4>Modules ({contentData.modules.length})</h4>
              {contentData.modules.length === 0 ? (
                <p className="empty-state">No modules available for this topic.</p>
              ) : (
                <div className="content-grid">
                  {contentData.modules.map(module => (
                    <div 
                      key={module.id}
                      className={`content-card ${selectedPath.moduleId === module.id ? 'selected' : ''}`}
                      onClick={() => loadChaptersForModule(module.id)}
                    >
                      <h5>{module.name}</h5>
                      <p>{module.description || 'No description available'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Chapters */}
          {selectedPath.moduleId && (
            <div className="content-section">
              <h4>Chapters ({contentData.chapters.length})</h4>
              {contentData.chapters.length === 0 ? (
                <p className="empty-state">No chapters available for this module.</p>
              ) : (
                <div className="content-grid">
                  {contentData.chapters.map(chapter => (
                    <div 
                      key={chapter.id}
                      className={`content-card ${selectedPath.chapterId === chapter.id ? 'selected' : ''}`}
                    >
                      <h5>{chapter.name}</h5>
                      <p>{chapter.description || 'No description available'}</p>
                      <div className="content-actions">
                        <button className="btn btn-primary btn-sm">
                          Start Learning
                        </button>
                        <button className="btn btn-secondary btn-sm">
                          View Questions
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentContentBrowser;
