import React, { useState } from 'react';
import AdminPageHeader from '../common/AdminPageHeader';
import GlobalOfferForm from './GlobalOfferForm';
import './pricing.css';
import UnifiedPricingForm from './UnifiedPricingForm';

const PricingDashboard = ({ onBackToDashboard }) => {
  const [activeTab, setActiveTab] = useState('pricing'); // pricing | offers
  return (
    <div className="pricing-dashboard">
      <AdminPageHeader
        title="Pricing Management"
        subtitle="Configure subscription plans and global offers"
        onBackToDashboard={onBackToDashboard}
      />

      <div className="pricing-tabs">
        <button className={`tab-button ${activeTab === 'pricing' ? 'active' : ''}`} onClick={() => setActiveTab('pricing')}>Pricing</button>
        <button className={`tab-button ${activeTab === 'offers' ? 'active' : ''}`} onClick={() => setActiveTab('offers')}>Global Offers</button>
      </div>

      <div className="pricing-content">
        {activeTab === 'pricing' && <UnifiedPricingForm />}
        {activeTab === 'offers' && <GlobalOfferForm />}
      </div>
    </div>
  );
};

export default PricingDashboard;
