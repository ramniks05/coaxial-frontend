import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { createTopic, deleteTopic, getChapters, getTopics, updateTopic } from '../../services/masterDataService';
import './MasterDataComponent.css';

const TopicManagement = () => {
  const { token, addNotification } = useApp();
  const [topics, setTopics] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    chapterId: '',
    order: '',
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedChapter) {
      fetchTopics(selectedChapter);
    } else {
      fetchTopics();
    }
  }, [selectedChapter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [topicsData, chaptersData] = await Promise.all([
        getTopics(token),
        getChapters(token)
      ]);
      setTopics(topicsData);
      setChapters(chaptersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      addNotification({
        type: 'error',
        message: 'Failed to fetch data',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async (chapterId = null) => {
    try {
      setLoading(true);
      const data = await getTopics(token, chapterId);
      setTopics(data);
    } catch (error) {
      console.error('Error fetching topics:', error);
      addNotification({
        type: 'error',
        message: 'Failed to fetch topics',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (editingId) {
        await updateTopic(token, editingId, formData);
        addNotification({
          type: 'success',
          message: 'Topic updated successfully',
          duration: 3000
        });
      } else {
        await createTopic(token, formData);
        addNotification({
          type: 'success',
          message: 'Topic created successfully',
          duration: 3000
        });
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', description: '', chapterId: '', order: '', isActive: true });
      fetchTopics(selectedChapter);
    } catch (error) {
      console.error('Error saving topic:', error);
      addNotification({
        type: 'error',
        message: 'Failed to save topic',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (topic) => {
    setFormData({
      name: topic.name,
      description: topic.description || '',
      chapterId: topic.chapterId || '',
      order: topic.order || '',
      isActive: topic.isActive
    });
    setEditingId(topic.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this topic?')) {
      try {
        setLoading(true);
        await deleteTopic(token, id);
        addNotification({
          type: 'success',
          message: 'Topic deleted successfully',
          duration: 3000
        });
        fetchTopics(selectedChapter);
      } catch (error) {
        console.error('Error deleting topic:', error);
        addNotification({
          type: 'error',
          message: 'Failed to delete topic',
          duration: 5000
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', chapterId: '', order: '', isActive: true });
    setEditingId(null);
    setShowForm(false);
  };

  const getChapterName = (chapterId) => {
    const chapter = chapters.find(c => c.id === chapterId);
    return chapter ? chapter.name : 'Unknown';
  };

  return (
    <div className="master-data-component">
      <div className="component-header">
        <div className="header-info">
          <h2>Topic Management</h2>
          <p>Manage topics within chapters (e.g., Variables, Equations, Functions)</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          <span className="btn-icon">➕</span>
          Add Topic
        </button>
      </div>

      {/* Chapter Filter */}
      <div className="filter-section">
        <div className="filter-group">
          <label htmlFor="chapter-filter">Filter by Chapter:</label>
          <select
            id="chapter-filter"
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Chapters</option>
            {chapters.map(chapter => (
              <option key={chapter.id} value={chapter.id}>
                {chapter.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showForm && (
        <div className="form-section">
          <div className="form-header">
            <h3>{editingId ? 'Edit Topic' : 'Add New Topic'}</h3>
            <button className="btn btn-outline btn-sm" onClick={resetForm}>
              Cancel
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="master-data-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Topic Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Variables and Constants, Linear Equations"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="chapterId">Chapter *</label>
                <select
                  id="chapterId"
                  value={formData.chapterId}
                  onChange={(e) => setFormData({ ...formData, chapterId: e.target.value })}
                  required
                >
                  <option value="">Select Chapter</option>
                  {chapters.map(chapter => (
                    <option key={chapter.id} value={chapter.id}>
                      {chapter.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="order">Topic Order</label>
                <input
                  type="number"
                  id="order"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  placeholder="e.g., 1, 2, 3"
                  min="1"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="isActive">Status</label>
                <select
                  id="isActive"
                  value={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this topic"
                rows={3}
              />
            </div>
            
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : (editingId ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="data-section">
        <div className="data-header">
          <h3>Topics ({topics.length})</h3>
          <div className="data-actions">
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => fetchTopics(selectedChapter)}
              disabled={loading}
            >
              <span className="btn-icon">🔄</span>
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading topics...</p>
          </div>
        ) : topics.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h4>No Topics Found</h4>
            <p>Create your first topic to get started</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              Add Topic
            </button>
          </div>
        ) : (
          <div className="data-grid">
            {topics.map((topic) => (
              <div key={topic.id} className="data-card">
                <div className="card-header">
                  <div className="card-title">
                    <h4>{topic.name}</h4>
                    <span className={`status-badge ${topic.isActive ? 'active' : 'inactive'}`}>
                      {topic.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="card-actions">
                    <button 
                      className="btn btn-outline btn-xs"
                      onClick={() => handleEdit(topic)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger btn-xs"
                      onClick={() => handleDelete(topic.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="card-content">
                  <p><strong>Chapter:</strong> {getChapterName(topic.chapterId)}</p>
                  {topic.order && (
                    <p><strong>Order:</strong> {topic.order}</p>
                  )}
                  {topic.description && (
                    <p>{topic.description}</p>
                  )}
                </div>
                
                <div className="card-footer">
                  <small className="text-muted">
                    Created: {new Date(topic.createdAt).toLocaleDateString()}
                  </small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicManagement;
