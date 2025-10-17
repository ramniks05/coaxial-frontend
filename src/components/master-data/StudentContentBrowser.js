import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { API_BASE } from '../../utils/apiUtils';
import {
    getActiveSubscriptions,
    getChaptersForModule,
    getEntitySubjects,
    getModulesForTopic,
    getTopicsForSubject
} from '../../services/subscriptionService';

const StudentContentBrowser = () => {
  const { token, addNotification } = useApp();
  
  // State management
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
  
  // Section collapse/expand state
  const [collapsedSections, setCollapsedSections] = useState({
    subjects: false,
    topics: false,
    modules: false,
    chapters: false
  });
  
  // Chapter viewer modal state
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [activeTab, setActiveTab] = useState('video'); // video, pdf, questions
  const [videoPlaybackSpeed, setVideoPlaybackSpeed] = useState(1);
  const [pdfZoom, setPdfZoom] = useState(100);
  const [currentPdfPage, setCurrentPdfPage] = useState(1);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0);
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);
  const [isPdfFullscreen, setIsPdfFullscreen] = useState(false);
  const videoRef = useRef(null);
  const pdfBlobUrlRef = useRef(null);
  const videoContainerRef = useRef(null);
  const pdfContainerRef = useRef(null);
  
  // Toggle section collapse/expand
  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Refs for deduplication
  const subjectsLoadingRef = useRef(false);
  const topicsLoadingRef = useRef(false);
  const modulesLoadingRef = useRef(false);
  const chaptersLoadingRef = useRef(false);
  
  // Refs for auto-scrolling to sections
  const topicsSectionRef = useRef(null);
  const modulesSectionRef = useRef(null);
  const chaptersSectionRef = useRef(null);

  // Load Active Subscriptions from API
  const loadSubscriptions = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      console.log('📥 Loading active subscriptions from API...');
      
      const response = await getActiveSubscriptions(token);
      console.log('📥 Active subscriptions loaded:', response);
      
      // Backend returns array directly
      const subscriptionsData = Array.isArray(response) ? response : [];
      
      // Filter only active subscriptions with essential info
      const activeSubscriptions = subscriptionsData.filter(sub => sub.isActive);
      
      console.log(`✅ Found ${activeSubscriptions.length} active subscriptions`);
      setSubscriptions(activeSubscriptions);
      
    } catch (error) {
      console.error('❌ Error loading subscriptions:', error);
      addNotification({ 
        message: 'Failed to load subscriptions: ' + error.message, 
        type: 'error' 
      });
      // Set empty array on error
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  }, [token, addNotification]);

  // Load subscriptions on mount
  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  // Load content when subscription changes
  useEffect(() => {
    if (selectedSubscription) {
      loadContentForSubscription();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubscription]);

  const loadContentForSubscription = async () => {
    if (!selectedSubscription || !token) return;

    try {
      setLoading(true);
      console.log('📥 Loading subjects for subscription:', selectedSubscription.entityName);
      
      // Call real API to get subjects
      const response = await getEntitySubjects(
        token,
        selectedSubscription.entityId,
        selectedSubscription.courseTypeId
      );
      
      console.log('📥 Subjects API response:', response);
      
      // Map API response to component format
      const subjects = (response.subjects || []).map(subject => ({
        id: subject.subjectId,
        linkageId: subject.linkageId,
        name: subject.subjectName,
        subjectName: subject.subjectName,
        description: subject.subjectDescription || 'No description available',
        // Mock data for now - will be replaced when we integrate progress tracking
        topicCount: 0,
        moduleCount: 0,
        chapterCount: 0,
        progress: 0,
        status: 'not-started'
      }));
      
      console.log(`✅ Loaded ${subjects.length} subjects`);
      
      setContentData(prev => ({
        ...prev,
        subjects: subjects
      }));

      // Reset selected path
      setSelectedPath({
        subjectId: null,
        topicId: null,
        moduleId: null,
        chapterId: null
      });

    } catch (error) {
      console.error('❌ Error loading subjects:', error);
      addNotification({ 
        message: 'Failed to load subjects: ' + error.message, 
        type: 'error' 
      });
      // Set empty subjects on error
      setContentData(prev => ({
        ...prev,
        subjects: []
      }));
    } finally {
      setLoading(false);
    }
  };

  const loadTopicsForSubject = async (subjectId, linkageId) => {
    if (subjectsLoadingRef.current || !token || !selectedSubscription) return;
    
    try {
      subjectsLoadingRef.current = true;
      console.log('📥 Loading topics for subject:', subjectId, 'linkageId:', linkageId);
      
      // Call real API to get topics
      const response = await getTopicsForSubject(
        token,
        selectedSubscription.courseTypeId,
        linkageId
      );
      
      console.log('📥 Topics API response:', response);
      
      // Map API response to component format
      const topics = (response.topics || []).map(topic => ({
        id: topic.id || topic.topicId,
        name: topic.name || topic.topicName,
        linkageId: topic.linkageId,
        subjectId: topic.subjectId,
        subjectName: topic.subjectName,
        description: topic.description || ''
      }));
      
      console.log(`✅ Loaded ${topics.length} topics`);
      
      setContentData(prev => ({
        ...prev,
        topics: topics
      }));
      setSelectedPath(prev => ({
        ...prev,
        subjectId: linkageId,
        topicId: null,
        moduleId: null,
        chapterId: null
      }));
      
      // Auto-scroll to topics section
      setTimeout(() => {
        if (topicsSectionRef.current) {
          topicsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (error) {
      console.error('❌ Error loading topics:', error);
      addNotification({ 
        message: 'Failed to load topics: ' + error.message, 
        type: 'error' 
      });
      setContentData(prev => ({
        ...prev,
        topics: []
      }));
    } finally {
      subjectsLoadingRef.current = false;
    }
  };

  const loadModulesForTopic = async (topicId) => {
    if (topicsLoadingRef.current || !token) return;
    
    try {
      topicsLoadingRef.current = true;
      console.log('📥 Loading modules for topic:', topicId);
      
      // Call real API to get modules
      const response = await getModulesForTopic(token, topicId);
      
      console.log('📥 Modules API response:', response);
      
      // Map API response to component format
      const modules = (response.modules || []).map(module => ({
        id: module.id || module.moduleId,
        name: module.name || module.moduleName,
        topicId: module.topicId,
        topicName: module.topicName,
        description: module.description || ''
      }));
      
      console.log(`✅ Loaded ${modules.length} modules`);
      
      setContentData(prev => ({
        ...prev,
        modules: modules
      }));
      setSelectedPath(prev => ({
        ...prev,
        topicId,
        moduleId: null,
        chapterId: null
      }));
      
      // Auto-scroll to modules section
      setTimeout(() => {
        if (modulesSectionRef.current) {
          modulesSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (error) {
      console.error('❌ Error loading modules:', error);
      addNotification({ 
        message: 'Failed to load modules: ' + error.message, 
        type: 'error' 
      });
      setContentData(prev => ({
        ...prev,
        modules: []
      }));
    } finally {
      topicsLoadingRef.current = false;
    }
  };

  const loadChaptersForModule = async (moduleId) => {
    if (modulesLoadingRef.current || !token) return;
    
    try {
      modulesLoadingRef.current = true;
      console.log('📥 Loading chapters for module:', moduleId);
      
      // Call real API to get chapters
      const response = await getChaptersForModule(token, moduleId);
      
      console.log('📥 Chapters API response:', response);
      
      // Map API response to component format
      const chapters = (response.chapters || []).map(chapter => ({
        id: chapter.id,
        name: chapter.name,
        description: chapter.description || 'No description available',
        moduleId: chapter.moduleId,
        moduleName: chapter.moduleName,
        topicId: chapter.topicId,
        topicName: chapter.topicName,
        subjectId: chapter.subjectId,
        subjectName: chapter.subjectName,
        displayOrder: chapter.displayOrder,
        
        // Video data
        videos: chapter.videos || [],
        hasVideo: (chapter.videos || []).length > 0,
        videoUrl: (chapter.videos || [])[0]?.youtubeLink || null,
        
        // PDF data
        documents: chapter.documents || [],
        hasPdf: (chapter.documents || []).length > 0,
        pdfUrl: (chapter.documents || [])[0]?.filePath || null,
        
        // Questions (placeholder for now)
        hasQuestions: false,
        questionCount: 0,
        
        // Progress tracking (placeholder for now)
        status: 'not-started',
        progress: 0,
        
        // Estimated duration (placeholder)
        duration: '45 min'
      }));
      
      console.log(`✅ Loaded ${chapters.length} chapters`);
      
      setContentData(prev => ({
        ...prev,
        chapters: chapters
      }));
      setSelectedPath(prev => ({
        ...prev,
        moduleId,
        chapterId: null
      }));
      
      // Auto-scroll to chapters section
      setTimeout(() => {
        if (chaptersSectionRef.current) {
          chaptersSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (error) {
      console.error('❌ Error loading chapters:', error);
      addNotification({ 
        message: 'Failed to load chapters: ' + error.message, 
        type: 'error' 
      });
      setContentData(prev => ({
        ...prev,
        chapters: []
      }));
    } finally {
      modulesLoadingRef.current = false;
    }
  };

  const getSubscriptionDisplayText = (subscription) => {
    return subscription.entityName || 'Unknown Subscription';
  };

  const getSubscriptionSubtitle = (subscription) => {
    return `${subscription.courseTypeName} - ${subscription.courseName}`;
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

  // Fetch PDF as blob when chapter, tab, or document index changes
  useEffect(() => {
    const fetchPdfBlob = async () => {
      if (!selectedChapter || !selectedChapter.documents || selectedChapter.documents.length === 0 || activeTab !== 'pdf') {
        return;
      }

      const currentDocument = selectedChapter.documents[currentDocumentIndex];
      if (!currentDocument || !currentDocument.filePath) {
        return;
      }

      try {
        setPdfLoading(true);
        console.log('📥 Fetching PDF from:', currentDocument.filePath);
        
        const pdfUrl = currentDocument.filePath.startsWith('http') 
          ? currentDocument.filePath 
          : `${API_BASE}${currentDocument.filePath}`;
        
        const response = await fetch(pdfUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        console.log('✅ PDF fetched, size:', blob.size);
        
        // Clean up previous blob URL
        if (pdfBlobUrlRef.current) {
          URL.revokeObjectURL(pdfBlobUrlRef.current);
        }
        
        const blobUrl = URL.createObjectURL(blob);
        pdfBlobUrlRef.current = blobUrl;
        setPdfBlobUrl(blobUrl);
        console.log('✅ PDF blob URL created');
        
      } catch (error) {
        console.error('❌ Error fetching PDF:', error);
        addNotification({ 
          message: 'Failed to load PDF: ' + error.message, 
          type: 'error' 
        });
        setPdfBlobUrl(null);
      } finally {
        setPdfLoading(false);
      }
    };

    fetchPdfBlob();

    // Cleanup on unmount or chapter change
    return () => {
      if (pdfBlobUrlRef.current) {
        URL.revokeObjectURL(pdfBlobUrlRef.current);
        pdfBlobUrlRef.current = null;
        setPdfBlobUrl(null);
      }
    };
  }, [selectedChapter, activeTab, currentDocumentIndex, addNotification]);

  // Chapter modal functions
  const openChapterModal = (chapter) => {
    setSelectedChapter(chapter);
    setShowChapterModal(true);
    setActiveTab('video');
    setPdfZoom(100);
    setCurrentPdfPage(1);
    setPdfBlobUrl(null);
    setCurrentVideoIndex(0);
    setCurrentDocumentIndex(0);
    setIsVideoFullscreen(false);
    setIsPdfFullscreen(false);
  };

  const closeChapterModal = () => {
    setShowChapterModal(false);
    setSelectedChapter(null);
    if (videoRef.current) {
      videoRef.current.pause();
    }
    // Clean up PDF blob URL
    if (pdfBlobUrlRef.current) {
      URL.revokeObjectURL(pdfBlobUrlRef.current);
      pdfBlobUrlRef.current = null;
      setPdfBlobUrl(null);
    }
    setIsVideoFullscreen(false);
    setIsPdfFullscreen(false);
  };

  // Fullscreen functions
  const toggleVideoFullscreen = () => {
    if (!isVideoFullscreen) {
      if (videoContainerRef.current.requestFullscreen) {
        videoContainerRef.current.requestFullscreen();
      } else if (videoContainerRef.current.webkitRequestFullscreen) {
        videoContainerRef.current.webkitRequestFullscreen();
      } else if (videoContainerRef.current.msRequestFullscreen) {
        videoContainerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    setIsVideoFullscreen(!isVideoFullscreen);
  };

  const togglePdfFullscreen = () => {
    if (!isPdfFullscreen) {
      if (pdfContainerRef.current.requestFullscreen) {
        pdfContainerRef.current.requestFullscreen();
      } else if (pdfContainerRef.current.webkitRequestFullscreen) {
        pdfContainerRef.current.webkitRequestFullscreen();
      } else if (pdfContainerRef.current.msRequestFullscreen) {
        pdfContainerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    setIsPdfFullscreen(!isPdfFullscreen);
  };

  const getCurrentChapterIndex = () => {
    if (!selectedChapter || !contentData.chapters.length) return -1;
    return contentData.chapters.findIndex(ch => ch.id === selectedChapter.id);
  };

  const goToPreviousChapter = () => {
    const currentIndex = getCurrentChapterIndex();
    if (currentIndex > 0) {
      const prevChapter = contentData.chapters[currentIndex - 1];
      setSelectedChapter(prevChapter);
      setActiveTab('video');
    }
  };

  const goToNextChapter = () => {
    const currentIndex = getCurrentChapterIndex();
    if (currentIndex < contentData.chapters.length - 1) {
      const nextChapter = contentData.chapters[currentIndex + 1];
      setSelectedChapter(nextChapter);
      setActiveTab('video');
    }
  };

  const hasPreviousChapter = () => getCurrentChapterIndex() > 0;
  const hasNextChapter = () => getCurrentChapterIndex() < contentData.chapters.length - 1;

  // Video player controls
  const handlePlaybackSpeedChange = (speed) => {
    setVideoPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // PDF viewer controls
  const handlePdfZoomIn = () => setPdfZoom(prev => Math.min(prev + 25, 200));
  const handlePdfZoomOut = () => setPdfZoom(prev => Math.max(prev - 25, 50));
  const handlePdfZoomReset = () => setPdfZoom(100);

  // Get status badge class and text
  const getStatusBadge = (status) => {
    const badges = {
      'completed': { text: 'Completed', class: 'status-completed' },
      'in-progress': { text: 'In Progress', class: 'status-in-progress' },
      'not-started': { text: 'Not Started', class: 'status-not-started' }
    };
    return badges[status] || badges['not-started'];
  };

  // Get icon for content type
  const getContentIcon = (type) => {
    const icons = {
      'subject': '📚',
      'topic': '📖',
      'module': '📦',
      'chapter': '📃'
    };
    return icons[type] || '📄';
  };

  // Convert YouTube URL to embeddable format
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    
    // Extract video ID from various YouTube URL formats
    let videoId = null;
    
    // Format: https://www.youtube.com/watch?v=abc123
    if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      videoId = urlParams.get('v');
    }
    // Format: https://youtu.be/abc123
    else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    // Format: https://www.youtube.com/embed/abc123
    else if (url.includes('youtube.com/embed/')) {
      return url; // Already in embed format
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  // Mock questions data for demo
  const getMockQuestions = (chapterId) => {
    return [
      {
        id: 1,
        question: 'What is the main concept covered in this chapter?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0,
        explanation: 'This is the correct answer explanation.'
      },
      {
        id: 2,
        question: 'Which of the following best describes the topic?',
        options: ['First option', 'Second option', 'Third option', 'Fourth option'],
        correctAnswer: 2,
        explanation: 'Third option is correct because...'
      },
      {
        id: 3,
        question: 'How would you apply this concept in real life?',
        options: ['Practical use 1', 'Practical use 2', 'Practical use 3', 'Practical use 4'],
        correctAnswer: 1,
        explanation: 'The second option provides the best practical application.'
      }
    ];
  };

  // Breadcrumb component
  const renderBreadcrumb = () => {
    const crumbs = [];
    
    if (selectedSubscription) {
      crumbs.push({ 
        label: getSubscriptionDisplayText(selectedSubscription), 
        onClick: () => {
          setSelectedPath({
            subjectId: null,
            topicId: null,
            moduleId: null,
            chapterId: null
          });
          setContentData(prev => ({
            ...prev,
            topics: [],
            modules: [],
            chapters: []
          }));
        }
      });
    }

    if (selectedPath.subjectId) {
      const subject = contentData.subjects.find(s => s.linkageId === selectedPath.subjectId);
      if (subject) {
        crumbs.push({ 
          label: subject.name,
          onClick: () => {
            setSelectedPath(prev => ({
              ...prev,
              topicId: null,
              moduleId: null,
              chapterId: null
            }));
            setContentData(prev => ({
              ...prev,
              modules: [],
              chapters: []
            }));
          }
        });
      }
    }

    if (selectedPath.topicId) {
      const topic = contentData.topics.find(t => t.id === selectedPath.topicId);
      if (topic) {
        crumbs.push({ 
          label: topic.name,
          onClick: () => {
            setSelectedPath(prev => ({
              ...prev,
              moduleId: null,
              chapterId: null
            }));
            setContentData(prev => ({
              ...prev,
              chapters: []
            }));
          }
        });
      }
    }

    if (selectedPath.moduleId) {
      const module = contentData.modules.find(m => m.id === selectedPath.moduleId);
      if (module) {
        crumbs.push({ label: module.name, onClick: null });
      }
    }

    return crumbs;
  };

  return (
    <div className="student-content-browser">
      <div className="page-header">
        <h2>📚 Content Browser</h2>
        <p>Access your study materials, videos, PDFs, and practice questions</p>
      </div>

      {/* Subscription Selection */}
      <div className="subscription-section">
        <h3>📋 Select Your Subscription</h3>
        {loading && subscriptions.length === 0 ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading subscriptions...</p>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h4>No Active Subscriptions</h4>
            <p>You don't have any active subscriptions. Please subscribe to a course to access content.</p>
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
                  <div className="subscription-card-header">
                  <h4>{getSubscriptionDisplayText(subscription)}</h4>
                    <span className="subscription-badge active">Active</span>
                  </div>
                  <p className="subscription-subtitle">{getSubscriptionSubtitle(subscription)}</p>
                  <div className="subscription-meta">
                    <span className="meta-item">
                      <span className="meta-icon">📅</span>
                      <span>{new Date(subscription.startDate).toLocaleDateString()} - {new Date(subscription.expiryDate).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Breadcrumb Navigation */}
      {selectedSubscription && renderBreadcrumb().length > 0 && (
        <div className="breadcrumb-nav">
          <div className="breadcrumb">
            {renderBreadcrumb().map((crumb, index) => (
              <span key={index} className="breadcrumb-item">
                {index > 0 && <span className="breadcrumb-separator">›</span>}
                {crumb.onClick ? (
                  <button className="breadcrumb-link" onClick={crumb.onClick}>
                    {crumb.label}
                  </button>
                ) : (
                  <span className="breadcrumb-current">{crumb.label}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Content Navigation */}
      {selectedSubscription && (
        <div className="content-navigation">
          
          {/* Subjects */}
          <div className="content-section">
            <div className="section-header">
              <h4>
                <span className="section-icon">{getContentIcon('subject')}</span>
                Subjects ({contentData.subjects.length})
              </h4>
              {contentData.subjects.length > 0 && (
                <button 
                  className="collapse-btn"
                  onClick={() => toggleSection('subjects')}
                  title={collapsedSections.subjects ? 'Expand' : 'Collapse'}
                >
                  {collapsedSections.subjects ? '▼' : '▲'}
                </button>
              )}
            </div>
            {contentData.subjects.length === 0 ? (
              <div className="empty-message">No subjects available for this subscription.</div>
            ) : !collapsedSections.subjects && (
              <div className="content-grid">
                {contentData.subjects.map(subject => {
                  const statusBadge = getStatusBadge(subject.status);
                  return (
                  <div 
                    key={subject.linkageId || subject.id}
                      className={`content-card subject-card ${selectedPath.subjectId === subject.linkageId ? 'selected' : ''}`}
                    onClick={() => loadTopicsForSubject(subject.linkageId || subject.id, subject.linkageId)}
                  >
                      <div className="card-header-row">
                        <span className="card-icon">{getContentIcon('subject')}</span>
                        <h5 className="card-title">{getSubjectDisplayText(subject)}</h5>
                  </div>
                      <p className="card-description">{subject.description || 'No description available'}</p>
                      
                      <div className="card-stats">
                        {subject.topicCount > 0 && (
                          <span className="stat-item">
                            <span className="stat-icon">📖</span>
                            <span>{subject.topicCount} Topics</span>
                          </span>
                        )}
                        {subject.moduleCount > 0 && (
                          <span className="stat-item">
                            <span className="stat-icon">📦</span>
                            <span>{subject.moduleCount} Modules</span>
                          </span>
                        )}
                        {subject.chapterCount > 0 && (
                          <span className="stat-item">
                            <span className="stat-icon">📃</span>
                            <span>{subject.chapterCount} Chapters</span>
                          </span>
                        )}
                      </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Topics */}
          {selectedPath.subjectId && (
            <div className="content-section" ref={topicsSectionRef}>
              <div className="section-header">
                <h4>
                  <span className="section-icon">{getContentIcon('topic')}</span>
                  Topics ({contentData.topics.length})
                </h4>
                {contentData.topics.length > 0 && (
                  <button 
                    className="collapse-btn"
                    onClick={() => toggleSection('topics')}
                    title={collapsedSections.topics ? 'Expand' : 'Collapse'}
                  >
                    {collapsedSections.topics ? '▼' : '▲'}
                  </button>
                )}
              </div>
              {contentData.topics.length === 0 ? (
                <div className="empty-message">No topics available for this subject.</div>
              ) : !collapsedSections.topics && (
                <div className="content-grid">
                  {contentData.topics.map(topic => (
                    <div 
                      key={topic.id}
                      className={`content-card topic-card ${selectedPath.topicId === topic.id ? 'selected' : ''}`}
                      onClick={() => loadModulesForTopic(topic.id)}
                    >
                      <div className="card-header-row">
                        <span className="card-icon">{getContentIcon('topic')}</span>
                        <h5 className="card-title">{topic.name}</h5>
                      </div>
                      <p className="card-description">{topic.description || 'No description available'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Modules */}
          {selectedPath.topicId && (
            <div className="content-section" ref={modulesSectionRef}>
              <div className="section-header">
                <h4>
                  <span className="section-icon">{getContentIcon('module')}</span>
                  Modules ({contentData.modules.length})
                </h4>
                {contentData.modules.length > 0 && (
                  <button 
                    className="collapse-btn"
                    onClick={() => toggleSection('modules')}
                    title={collapsedSections.modules ? 'Expand' : 'Collapse'}
                  >
                    {collapsedSections.modules ? '▼' : '▲'}
                  </button>
                )}
              </div>
              {contentData.modules.length === 0 ? (
                <div className="empty-message">No modules available for this topic.</div>
              ) : !collapsedSections.modules && (
                <div className="content-grid">
                  {contentData.modules.map(module => (
                    <div 
                      key={module.id}
                      className={`content-card module-card ${selectedPath.moduleId === module.id ? 'selected' : ''}`}
                      onClick={() => loadChaptersForModule(module.id)}
                    >
                      <div className="card-header-row">
                        <span className="card-icon">{getContentIcon('module')}</span>
                        <h5 className="card-title">{module.name}</h5>
                      </div>
                      <p className="card-description">{module.description || 'No description available'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Chapters */}
          {selectedPath.moduleId && (
            <div className="content-section" ref={chaptersSectionRef}>
              <div className="section-header">
                <h4>
                  <span className="section-icon">{getContentIcon('chapter')}</span>
                  Chapters ({contentData.chapters.length})
                </h4>
                {contentData.chapters.length > 0 && (
                  <button 
                    className="collapse-btn"
                    onClick={() => toggleSection('chapters')}
                    title={collapsedSections.chapters ? 'Expand' : 'Collapse'}
                  >
                    {collapsedSections.chapters ? '▼' : '▲'}
                  </button>
                )}
              </div>
              {contentData.chapters.length === 0 ? (
                <div className="empty-message">No chapters available for this module.</div>
              ) : !collapsedSections.chapters && (
                <div className="content-grid">
                  {contentData.chapters.map(chapter => {
                    const statusBadge = getStatusBadge(chapter.status);
                    return (
                    <div 
                      key={chapter.id}
                        className={`content-card chapter-card ${selectedPath.chapterId === chapter.id ? 'selected' : ''}`}
                      >
                        <div className="card-header-row">
                          <span className="card-icon">{getContentIcon('chapter')}</span>
                          <span className={`status-badge ${statusBadge.class}`}>{statusBadge.text}</span>
                        </div>
                        <h5 className="card-title">{chapter.name}</h5>
                        <p className="card-description">{chapter.description || 'No description available'}</p>
                        
                        <div className="chapter-meta">
                          {chapter.duration && (
                            <span className="meta-tag">
                              <span className="meta-icon">⏱️</span>
                              {chapter.duration}
                            </span>
                          )}
                          {chapter.questionCount > 0 && (
                            <span className="meta-tag">
                              <span className="meta-icon">❓</span>
                              {chapter.questionCount} Questions
                            </span>
                          )}
                        </div>

                        {chapter.progress !== undefined && (
                          <div className="progress-container">
                            <div className="progress-bar-wrapper">
                              <div className="progress-bar-fill" style={{ width: `${chapter.progress}%` }}></div>
                            </div>
                            <span className="progress-text">{chapter.progress}% Complete</span>
                          </div>
                        )}

                        <div className="chapter-resources">
                          <div className="resource-icons">
                            {chapter.hasVideo && (
                              <span className="resource-badge video">
                                <span>🎥</span>
                                Video
                              </span>
                            )}
                            {chapter.hasPdf && (
                              <span className="resource-badge pdf">
                                <span>📄</span>
                                PDF
                              </span>
                            )}
                            {chapter.hasQuestions && (
                              <span className="resource-badge quiz">
                                <span>❓</span>
                                Quiz
                              </span>
                            )}
                          </div>
                        </div>
                        
                      <div className="content-actions">
                          <button 
                            className="btn btn-primary btn-block"
                            onClick={() => openChapterModal(chapter)}
                          >
                            🚀 Start Learning
                        </button>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Chapter Viewer Modal */}
      {showChapterModal && selectedChapter && (
        <div className="modal-overlay chapter-modal-overlay" onClick={closeChapterModal}>
          <div className="modal-content chapter-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header chapter-modal-header">
              <div className="modal-title-section">
                <h3>{selectedChapter.name}</h3>
                <div className="chapter-modal-meta">
                  {selectedChapter.duration && <span>⏱️ {selectedChapter.duration}</span>}
                  {selectedChapter.questionCount && <span>❓ {selectedChapter.questionCount} Questions</span>}
                </div>
              </div>
              <div className="modal-actions">
                <div className="chapter-nav-buttons">
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={goToPreviousChapter}
                    disabled={!hasPreviousChapter()}
                    title="Previous Chapter"
                  >
                    ← Prev
                  </button>
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={goToNextChapter}
                    disabled={!hasNextChapter()}
                    title="Next Chapter"
                  >
                    Next →
                        </button>
                      </div>
                <button className="btn-close" onClick={closeChapterModal}>×</button>
                    </div>
            </div>

            {/* Chapter Description */}
            {selectedChapter.description && (
              <div className="chapter-info">
                <p>{selectedChapter.description}</p>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="chapter-tabs">
              <button 
                className={`tab-btn ${activeTab === 'video' ? 'active' : ''}`}
                onClick={() => setActiveTab('video')}
                disabled={!selectedChapter.hasVideo}
              >
                <span className="tab-icon">🎥</span>
                <span>Video</span>
              </button>
              <button 
                className={`tab-btn ${activeTab === 'pdf' ? 'active' : ''}`}
                onClick={() => setActiveTab('pdf')}
                disabled={!selectedChapter.hasPdf}
              >
                <span className="tab-icon">📄</span>
                <span>PDF</span>
              </button>
              <button 
                className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
                onClick={() => setActiveTab('questions')}
                disabled={!selectedChapter.hasQuestions}
              >
                <span className="tab-icon">❓</span>
                <span>Practice ({selectedChapter.questionCount})</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="modal-body chapter-modal-body">
              {/* Video Tab */}
              {activeTab === 'video' && selectedChapter.hasVideo && (
                <div className="video-container" ref={videoContainerRef}>
                  {/* Video Selector if multiple videos */}
                  {selectedChapter.videos && selectedChapter.videos.length > 1 && (
                    <div className="media-selector">
                      <label>Select Video:</label>
                      <select 
                        value={currentVideoIndex}
                        onChange={(e) => setCurrentVideoIndex(parseInt(e.target.value))}
                        className="form-select"
                      >
                        {selectedChapter.videos.map((video, index) => (
                          <option key={index} value={index}>
                            {index + 1}. {video.videoTitle}
                          </option>
                        ))}
                      </select>
                </div>
              )}
                  
                  <div className="video-player-wrapper">
                    {selectedChapter.videos && selectedChapter.videos[currentVideoIndex] && selectedChapter.videos[currentVideoIndex].youtubeLink.includes('youtube') ? (
                      <iframe
                        className="video-player youtube-player"
                        src={getYouTubeEmbedUrl(selectedChapter.videos[currentVideoIndex].youtubeLink)}
                        title={selectedChapter.videos[currentVideoIndex].videoTitle || "Chapter Video"}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                        allowFullScreen
                      />
                    ) : (
                      <video 
                        ref={videoRef}
                        controls
                        controlsList="nodownload"
                        className="video-player"
                        key={`${selectedChapter.id}-${currentVideoIndex}`}
                      >
                        <source src={selectedChapter.videos?.[currentVideoIndex]?.youtubeLink || selectedChapter.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                    <button 
                      className="fullscreen-btn"
                      onClick={toggleVideoFullscreen}
                      title="Toggle Fullscreen"
                    >
                      {isVideoFullscreen ? '🗗' : '⛶'}
                    </button>
                  </div>
            </div>
          )}

              {/* PDF Tab */}
              {activeTab === 'pdf' && selectedChapter.hasPdf && (
                <div className="pdf-container" ref={pdfContainerRef}>
                  {/* Document Selector if multiple documents */}
                  {selectedChapter.documents && selectedChapter.documents.length > 1 && (
                    <div className="media-selector">
                      <label>Select Document:</label>
                      <select 
                        value={currentDocumentIndex}
                        onChange={(e) => setCurrentDocumentIndex(parseInt(e.target.value))}
                        className="form-select"
                      >
                        {selectedChapter.documents.map((doc, index) => (
                          <option key={index} value={index}>
                            {index + 1}. {doc.documentTitle || doc.fileName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div className="pdf-controls">
                    <div className="pdf-page-controls">
                      <span>📄 {selectedChapter.documents[currentDocumentIndex]?.documentTitle || selectedChapter.documents[currentDocumentIndex]?.fileName || 'PDF Document'}</span>
                    </div>
                    <div className="pdf-actions">
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={togglePdfFullscreen}
                        title="Toggle Fullscreen"
                      >
                        {isPdfFullscreen ? '🗗 Exit Fullscreen' : '⛶ Fullscreen'}
                      </button>
                      <a 
                        href={pdfBlobUrl || `${API_BASE}${selectedChapter.documents[currentDocumentIndex]?.filePath}`}
                        download={selectedChapter.documents[currentDocumentIndex]?.fileName || 'document.pdf'}
                        className="btn btn-sm btn-primary"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        📥 Download
                      </a>
                    </div>
                  </div>
                  <div className="pdf-viewer-wrapper">
                    {pdfLoading ? (
                      <div className="pdf-loading">
                        <div className="spinner"></div>
                        <p>Loading PDF...</p>
                      </div>
                    ) : pdfBlobUrl ? (
                      <iframe
                        src={`${pdfBlobUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                        title="PDF Viewer"
                        className="pdf-viewer"
                        frameBorder="0"
                        onLoad={() => console.log('✅ PDF iframe loaded successfully')}
                        onError={(e) => console.error('❌ PDF iframe error:', e)}
                      />
                    ) : (
                      <div className="pdf-error">
                        <p>❌ Failed to load PDF</p>
                        <p>Please try downloading the file instead.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Questions Tab */}
              {activeTab === 'questions' && selectedChapter.hasQuestions && (
                <div className="questions-container">
                  <div className="questions-header">
                    <h4>Practice Questions</h4>
                    <p>Test your understanding of this chapter</p>
                  </div>
                  <div className="questions-list">
                    {getMockQuestions(selectedChapter.id).map((question, index) => (
                      <div key={question.id} className="question-item">
                        <div className="question-header">
                          <h5>Question {index + 1}</h5>
                        </div>
                        <p className="question-text">{question.question}</p>
                        <div className="question-options">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="option-item">
                              <input 
                                type="radio" 
                                id={`q${question.id}-opt${optIndex}`}
                                name={`question-${question.id}`}
                              />
                              <label htmlFor={`q${question.id}-opt${optIndex}`}>
                                {option}
                              </label>
                            </div>
                          ))}
                        </div>
                        <div className="question-actions">
                          <button className="btn btn-sm btn-primary">Check Answer</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentContentBrowser;
