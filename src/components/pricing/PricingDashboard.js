import React, { useState, useMemo } from 'react';
import CoursePlansTab from './CoursePlansTab';
import ClassExamPlansTab from './ClassExamPlansTab';
import PlansIndex from './PlansIndex';
import './pricing.css';

const PricingDashboard = ({ onBackToDashboard }) => {
  const [activeTab, setActiveTab] = useState('course'); // course | class-exam | index

  const tabs = useMemo(() => ([
    { id: 'course', label: 'Course Plans', icon: '🎓' },
    { id: 'class-exam', label: 'Class/Exam Overrides', icon: '🏷️' },
    { id: 'index', label: 'All Plans', icon: '📋' },
  ]), []);

  return (
    <div className="pricing-dashboard">
      <div className="pricing-header">
        <div className="header-left">
          <h2>Pricing Management</h2>
          <p>Set base plans at course level and override at class/exam level</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={onBackToDashboard}>← Back to Dashboard</button>
        </div>
      </div>

      <div className="pricing-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`tab-button ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            <span className="tab-icon">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="pricing-content">
        {activeTab === 'course' && <CoursePlansTab />}
        {activeTab === 'class-exam' && <ClassExamPlansTab />}
        {activeTab === 'index' && <PlansIndex />}
      </div>
    </div>
  );
};

export default PricingDashboard;


