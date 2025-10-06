import React, { useState } from 'react';
import './FilterPresets.css';

const FilterPresets = ({ 
  savedPresets, 
  onLoadPreset, 
  onSavePreset, 
  currentFilters, 
  isLoading 
}) => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [showPresets, setShowPresets] = useState(false);

  const handleSavePreset = () => {
    if (!presetName.trim()) return;
    
    onSavePreset(presetName.trim());
    setPresetName('');
    setShowSaveModal(false);
  };

  const handleLoadPreset = (presetId) => {
    onLoadPreset(presetId);
    setShowPresets(false);
  };

  const handleDeletePreset = (presetId) => {
    // This would need to be implemented in the parent component
    console.log('Delete preset:', presetId);
  };

  const hasActiveFilters = () => {
    return Object.values(currentFilters).some(section => {
      if (typeof section === 'object' && section !== null) {
        return Object.values(section).some(value => {
          if (Array.isArray(value)) return value.length > 0;
          if (typeof value === 'string') return value.trim() !== '';
          return value !== null && value !== undefined;
        });
      }
      return false;
    });
  };

  return (
    <div className="filter-presets">
      <div className="presets-header">
        <h4>
          <span className="section-icon">💾</span>
          Filter Presets
        </h4>
        <button
          type="button"
          className="btn btn-outline btn-xs"
          onClick={() => setShowPresets(!showPresets)}
          disabled={isLoading}
        >
          {showPresets ? 'Hide' : 'Show'} Presets
        </button>
      </div>

      {showPresets && (
        <div className="presets-content">
          {/* Save Current Filters */}
          <div className="save-preset-section">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setShowSaveModal(true)}
              disabled={isLoading || !hasActiveFilters()}
              title={hasActiveFilters() ? 'Save current filters as preset' : 'No active filters to save'}
            >
              💾 Save Current Filters
            </button>
          </div>

          {/* Saved Presets */}
          {savedPresets.length > 0 ? (
            <div className="saved-presets">
              <h5>Saved Presets:</h5>
              <div className="preset-list">
                {savedPresets.map(preset => (
                  <div key={preset.id} className="preset-item">
                    <div className="preset-info">
                      <span className="preset-name">{preset.name}</span>
                      <span className="preset-date">
                        Saved: {new Date(preset.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="preset-actions">
                      <button
                        type="button"
                        className="btn btn-outline btn-xs"
                        onClick={() => handleLoadPreset(preset.id)}
                        disabled={isLoading}
                        title="Load this preset"
                      >
                        Load
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-xs text-red-600"
                        onClick={() => handleDeletePreset(preset.id)}
                        disabled={isLoading}
                        title="Delete this preset"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-presets">
              <p>No saved presets yet.</p>
              <p className="help-text">Save your current filters to create reusable presets.</p>
            </div>
          )}
        </div>
      )}

      {/* Save Preset Modal */}
      {showSaveModal && (
        <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Save Filter Preset</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowSaveModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="presetName">Preset Name</label>
                <input
                  type="text"
                  id="presetName"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="Enter preset name..."
                  className="form-input"
                  maxLength={50}
                />
              </div>
              <div className="form-help">
                Choose a descriptive name for your filter preset (max 50 characters).
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowSaveModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSavePreset}
                disabled={!presetName.trim()}
              >
                Save Preset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPresets;
