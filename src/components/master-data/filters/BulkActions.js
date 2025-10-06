import React from 'react';
import './BulkActions.css';

const BulkActions = ({ 
  selectedCount, 
  totalCount, 
  onSelectAll, 
  onBulkAction, 
  onClearSelection 
}) => {
  const isAllSelected = selectedCount === totalCount;

  const handleBulkAction = (action) => {
    onBulkAction(action);
  };

  return (
    <div className="bulk-actions-bar">
      <div className="bulk-actions-content">
        <div className="selection-info">
          <span className="selection-count">
            {selectedCount} of {totalCount} questions selected
          </span>
          <button
            type="button"
            className="select-all-btn"
            onClick={onSelectAll}
          >
            {isAllSelected ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        <div className="bulk-actions-buttons">
          <div className="action-group">
            <span className="action-label">Status:</span>
            <button
              type="button"
              className="bulk-action-btn status-btn"
              onClick={() => handleBulkAction('activate')}
              title="Activate selected questions"
            >
              ✅ Activate
            </button>
            <button
              type="button"
              className="bulk-action-btn status-btn"
              onClick={() => handleBulkAction('deactivate')}
              title="Deactivate selected questions"
            >
              ❌ Deactivate
            </button>
          </div>

          <div className="action-group">
            <span className="action-label">Organization:</span>
            <button
              type="button"
              className="bulk-action-btn organization-btn"
              onClick={() => handleBulkAction('addTags')}
              title="Add tags to selected questions"
            >
              🏷️ Add Tags
            </button>
            <button
              type="button"
              className="bulk-action-btn organization-btn"
              onClick={() => handleBulkAction('moveToTopic')}
              title="Move to different topic"
            >
              📁 Move to Topic
            </button>
          </div>

          <div className="action-group">
            <span className="action-label">Export:</span>
            <button
              type="button"
              className="bulk-action-btn export-btn"
              onClick={() => handleBulkAction('exportCSV')}
              title="Export selected questions as CSV"
            >
              📊 Export CSV
            </button>
            <button
              type="button"
              className="bulk-action-btn export-btn"
              onClick={() => handleBulkAction('exportPDF')}
              title="Export selected questions as PDF"
            >
              📄 Export PDF
            </button>
          </div>

          <div className="action-group">
            <span className="action-label">Actions:</span>
            <button
              type="button"
              className="bulk-action-btn action-btn"
              onClick={() => handleBulkAction('duplicate')}
              title="Duplicate selected questions"
            >
              📋 Duplicate
            </button>
            <button
              type="button"
              className="bulk-action-btn danger-btn"
              onClick={() => handleBulkAction('delete')}
              title="Delete selected questions"
            >
              🗑️ Delete
            </button>
          </div>
        </div>

        <div className="bulk-actions-close">
          <button
            type="button"
            className="close-btn"
            onClick={onClearSelection}
            title="Clear selection"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkActions;
