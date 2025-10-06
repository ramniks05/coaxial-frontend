import React from 'react';
import QuestionFilters from './QuestionFilters';
import './QuestionFilters.css';

const DemoPage = () => {
  const handleBackToDashboard = () => {
    // In a real app, this would navigate back to the dashboard
    console.log('Navigate back to dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <QuestionFilters onBackToDashboard={handleBackToDashboard} />
    </div>
  );
};

export default DemoPage;
