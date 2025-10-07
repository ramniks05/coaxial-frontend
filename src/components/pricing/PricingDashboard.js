import React, { useState } from 'react';
import AdminPageHeader from '../common/AdminPageHeader';
import GlobalOfferForm from './GlobalOfferForm';
import PricingListView from './PricingListView';
import './pricing.css';
import UnifiedPricingForm from './UnifiedPricingForm';

const PricingDashboard = ({ onBackToDashboard }) => {
  const [activeTab, setActiveTab] = useState('pricing');
  return (
    <div className='pricing-dashboard'>
      <AdminPageHeader
        title='Pricing Management'
        subtitle='Configure subscription plans and global offers'
        onBackToDashboard={onBackToDashboard}
      />

      <div className='pricing-tabs'>
        <button className={'tab-button ' + (activeTab === 'pricing' ? 'active' : '')} onClick={() => setActiveTab('pricing')}>Set Pricing</button>
        <button className={'tab-button ' + (activeTab === 'offers' ? 'active' : '')} onClick={() => setActiveTab('offers')}>Global Offers</button>
        <button className={'tab-button ' + (activeTab === 'view' ? 'active' : '')} onClick={() => setActiveTab('view')}>View Pricing</button>
      </div>

      <div className='pricing-content'>
        {activeTab === 'pricing' && <UnifiedPricingForm />}
        {activeTab === 'offers' && <GlobalOfferForm />}
        {activeTab === 'view' && <PricingListView />}
      </div>
    </div>
  );
};

export default PricingDashboard;
