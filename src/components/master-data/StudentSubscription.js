import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getMySubscriptions, cancelSubscription, renewSubscription, getExpiringSoonSubscriptions, createSubscription, verifyPayment } from '../../services/subscriptionService';
import { loadRazorpayScript } from '../../utils/razorpay';
import './StudentSubscription.css';

const StudentSubscription = () => {
  const { token, addNotification, user, isAuthenticated } = useApp();
  const [subscriptions, setSubscriptions] = useState([]);
  const [expiringSubscriptions, setExpiringSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [renewPlanType, setRenewPlanType] = useState('MONTHLY');
  
  // Load subscriptions on mount
  useEffect(() => {
    loadSubscriptions();
    loadExpiringSubscriptions();
  }, [token]);

  const loadSubscriptions = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      console.log('📥 Loading subscriptions from API...');
      
      const response = await getMySubscriptions(token);
      console.log('📥 Subscriptions loaded:', response);
      
      // Backend returns array directly
      const subscriptionsData = Array.isArray(response) ? response : (response.subscriptions || []);
      setSubscriptions(subscriptionsData);
      
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      addNotification({ type: 'error', message: 'Failed to load subscriptions: ' + error.message, duration: 5000 });
    } finally {
      setLoading(false);
    }
  };
  
  const loadExpiringSubscriptions = async () => {
    if (!token) return;
    
    try {
      console.log('📥 Loading expiring subscriptions from API...');
      
      const response = await getExpiringSoonSubscriptions(token);
      console.log('📥 Expiring subscriptions loaded:', response);
      
      // Backend returns array directly or wrapped object
      const expiringData = Array.isArray(response) ? response : (response.expiringSubscriptions || []);
      setExpiringSubscriptions(expiringData);
      
    } catch (error) {
      console.error('Error loading expiring subscriptions:', error);
      // Don't show error notification - this is a background operation
    }
  };
  
  const calculateDaysRemaining = (subscription) => {
    // Use backend-calculated remainingDays if available, otherwise calculate
    if (subscription.remainingDays !== undefined) {
      return subscription.remainingDays;
    }
    
    // Fallback calculation for compatibility
    const now = new Date();
    const expiry = new Date(subscription.expiryDate);
    const diff = expiry - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };
  
  const getStatusBadgeClass = (subscription) => {
    const daysRemaining = calculateDaysRemaining(subscription);
    
    if (!subscription.isActive || subscription.status === 'CANCELLED') {
      return 'status-cancelled';
    }
    if (daysRemaining <= 0 || subscription.status === 'EXPIRED') {
      return 'status-expired';
    }
    if (daysRemaining <= 7) {
      return 'status-expiring';
    }
    return 'status-active';
  };
  
  const getStatusText = (subscription) => {
    const daysRemaining = calculateDaysRemaining(subscription);
    
    if (!subscription.isActive || subscription.status === 'CANCELLED') {
      return 'Cancelled';
    }
    if (daysRemaining <= 0 || subscription.status === 'EXPIRED') {
      return 'Expired';
    }
    if (daysRemaining <= 7) {
      return `Expiring in ${daysRemaining} days`;
    }
    return 'Active';
  };
  
  const handleCancelSubscription = async (subscriptionId) => {
    if (!window.confirm('Are you sure you want to cancel this subscription? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      console.log('🚫 Cancelling subscription:', subscriptionId);
      
      const response = await cancelSubscription(token, subscriptionId);
      console.log('🚫 Cancel response:', response);
      
      addNotification({ type: 'success', message: response.message || 'Subscription cancelled successfully', duration: 5000 });
      
      // Reload subscriptions to get updated data
      await loadSubscriptions();
      setShowDetailsModal(false);
      
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      addNotification({ type: 'error', message: 'Failed to cancel subscription: ' + error.message, duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const handleRenewClick = (subscription) => {
    setSelectedSubscription(subscription);
    setShowRenewModal(true);
  };
  
  const handleRenewSubscription = async (e) => {
    // Prevent any form submission or default behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!selectedSubscription) return;
    
    // Capture ALL auth data in closure to ensure it persists
    const currentToken = token;
    const currentUser = user;
    const currentIsAuthenticated = isAuthenticated;
    
    console.log('🔵 RENEWAL INITIATED - Starting renewal flow');
    console.log('🔵 Auth state captured:', { 
      hasToken: !!currentToken, 
      hasUser: !!currentUser, 
      isAuthenticated: currentIsAuthenticated,
      username: currentUser?.username 
    });
    
    if (!currentToken) {
      addNotification({ type: 'error', message: 'Authentication required', duration: 5000 });
      return;
    }
    
    // Save to localStorage as backup BEFORE starting payment
    if (currentToken) localStorage.setItem('token', currentToken);
    if (currentUser) localStorage.setItem('user', JSON.stringify(currentUser));
    console.log('🔵 Auth data backed up to localStorage');

    try {
      setLoading(true);
      console.log('🔵 Renewing subscription:', selectedSubscription.id, 'Plan:', renewPlanType);
      
      addNotification({ type: 'info', message: 'Creating renewal order...', duration: 3000 });
      
      // Call backend to create renewal Razorpay order
      const response = await renewSubscription(currentToken, selectedSubscription.id, renewPlanType);
      console.log('🔵 Renewal order created:', response.order?.id);
      console.log('🔵 Full renewal response:', response);
      
      // Check if response contains any redirect URLs
      if (response.callback_url || response.redirect_url || response.return_url) {
        console.warn('⚠️ Backend response contains redirect URL:', {
          callback_url: response.callback_url,
          redirect_url: response.redirect_url,
          return_url: response.return_url
        });
      }
      
      if (!response.order || !response.order.id) {
        throw new Error('Failed to create renewal order');
      }
      
      console.log('🔵 Order notes (raw):', response.order.notes);
      console.log('🔵 Note: subscriptionId not needed - backend creates new subscription after payment verification');
      
      // Load Razorpay and process payment
      console.log('🔵 Loading Razorpay script...');
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error('Failed to load Razorpay script');
      if (!window.Razorpay) throw new Error('Razorpay not available');
      console.log('🔵 Opening Razorpay modal for renewal...');
      
      // Store auth data globally to survive any context loss
      window.__COAXIAL_AUTH__ = {
        token: currentToken,
        user: currentUser,
        isAuthenticated: currentIsAuthenticated
      };
      console.log('🔵 Auth saved to window global:', !!window.__COAXIAL_AUTH__);
      
      const options = {
        key: response.keyId || process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: response.order.amount,
        currency: 'INR',
        order_id: response.order.id,
        name: 'Coaxial LMS',
        description: `Renewal: ${selectedSubscription.entityName}`,
        redirect: false,
        callback_url: null,
        handler: async function (paymentResponse) {
          console.log('🔵 HANDLER CALLED - Renewal payment response received from Razorpay');
          
          // Restore auth from global if needed
          const authToken = currentToken || window.__COAXIAL_AUTH__?.token;
          console.log('🔵 Handler - Token available:', !!authToken);
          
          try {
            console.log('🔵 Renewal payment successful from Razorpay!', paymentResponse);
            console.log('🔵 Using token:', !!authToken);
            
            const verificationData = {
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature
              // NO subscriptionId - backend creates new subscription after verification
            };
            
            console.log('🔵 Sending verification data (NO subscriptionId):', verificationData);
            console.log('🔵 About to call verifyPayment API for renewal...');
            
            const verifyResult = await verifyPayment(authToken, verificationData);
            
            console.log('✅ Renewal verification API returned!');
            console.log('✅ Renewal verification result:', verifyResult);
            console.log('✅ Renewal verification success?:', verifyResult?.success);
            console.log('✅ New subscription created:', verifyResult?.subscription);
            
            if (verifyResult.success && verifyResult.subscription) {
              const newSubscription = verifyResult.subscription;
              console.log('✅ New subscription ID from renewal:', newSubscription.id);
              // Ensure localStorage is still intact
              const storedToken = localStorage.getItem('token');
              const storedUser = localStorage.getItem('user');
              console.log('✅ RENEWAL SUCCESS - Token exists:', !!storedToken, 'User exists:', !!storedUser);
              
              // Backup to sessionStorage
              if (storedToken) sessionStorage.setItem('token_backup', storedToken);
              if (storedUser) sessionStorage.setItem('user_backup', storedUser);
              
              // Force stay on current path
              if (window.location.pathname !== '/dashboard/student') {
                console.warn('⚠️ Navigation detected! Forcing back to student dashboard');
                window.history.pushState(null, '', '/dashboard/student');
              }
              
              addNotification({ 
                type: 'success', 
                message: '🎉 Subscription renewed successfully!', 
                duration: 5000 
              });
              
              // Small delay to ensure state is updated
              setTimeout(() => {
                setShowRenewModal(false);
                setSelectedSubscription(null);
                setLoading(false);
              }, 100);
              
              // Reload subscriptions after modal closes
      setTimeout(() => {
                loadSubscriptions();
              }, 200);
            } else {
              throw new Error('Renewal verification failed');
            }
          } catch (error) {
            console.error('❌ RENEWAL VERIFICATION ERROR CAUGHT:', error);
            console.error('❌ Error type:', error.constructor.name);
            console.error('❌ Error message:', error.message);
            console.error('❌ Error stack:', error.stack);
            console.error('❌ Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
            
            addNotification({ 
              type: 'warning', 
              message: 'Payment received! Renewal activation in progress...', 
              duration: 6000 
            });
            setShowRenewModal(false);
            setLoading(false);
          }
        },
        prefill: { 
          name: user?.name || '', 
          email: user?.email || '', 
          contact: '' 
        },
        theme: { color: '#3399cc' },
        modal: {
          ondismiss: function() {
            addNotification({ type: 'warning', message: 'Renewal cancelled', duration: 4000 });
            setLoading(false);
          },
          escape: false,
          backdrop_close: false
        },
        notes: {
          stay_on_page: 'true'
        }
      };
      
      console.log('🔵 Creating Razorpay instance for renewal with options:', { 
        hasKey: !!options.key, 
        hasOrderId: !!options.order_id, 
        hasHandler: !!options.handler 
      });
      
      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        console.error('❌ Renewal payment failed:', response.error);
        addNotification({ 
          type: 'error', 
          message: 'Renewal payment failed: ' + response.error.description, 
          duration: 6000 
        });
        setLoading(false);
      });
      
      console.log('🔵 Opening Razorpay checkout for renewal...');
      rzp.open();
      console.log('🔵 Razorpay renewal checkout opened successfully');
      
    } catch (error) {
      console.error('Error renewing subscription:', error);
      addNotification({ type: 'error', message: 'Failed to renew subscription: ' + error.message, duration: 5000 });
      setLoading(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'ACTIVE') return sub.isActive && sub.status === 'ACTIVE';
    if (filterStatus === 'EXPIRED') {
      return sub.status === 'EXPIRED' || calculateDaysRemaining(sub) <= 0;
    }
    if (filterStatus === 'CANCELLED') return sub.status === 'CANCELLED';
    return true;
  });
  
  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.isActive && s.status === 'ACTIVE' && calculateDaysRemaining(s) > 0).length,
    expiring: expiringSubscriptions.length,
    totalSpent: subscriptions.reduce((sum, s) => sum + s.amount, 0)
  };

  return (
    <div className="student-subscription-dashboard">
      {/* Page Header */}
      <div className="page-header">
        <div>
        <h2>My Subscriptions</h2>
          <p>Manage all your course subscriptions</p>
        </div>
      </div>
      
      {/* Expiring Soon Banner */}
      {expiringSubscriptions.length > 0 && (
        <div className="expiring-banner">
          <div className="banner-icon">⚠️</div>
          <div className="banner-content">
            <strong>Renewal Reminder:</strong> You have {expiringSubscriptions.length} subscription(s) expiring soon!
            <button className="btn-link" onClick={() => setFilterStatus('EXPIRED')}>View Details</button>
          </div>
        </div>
      )}
      
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Subscriptions</div>
          </div>
        </div>
        
        <div className="stat-card active">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>
        
        <div className="stat-card warning">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <div className="stat-value">{stats.expiring}</div>
            <div className="stat-label">Expiring Soon</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">₹{stats.totalSpent.toFixed(2)}</div>
            <div className="stat-label">Total Spent</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filterStatus === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterStatus('ALL')}
          >
            All ({subscriptions.length})
          </button>
          <button 
            className={`filter-tab ${filterStatus === 'ACTIVE' ? 'active' : ''}`}
            onClick={() => setFilterStatus('ACTIVE')}
          >
            Active ({stats.active})
          </button>
          <button 
            className={`filter-tab ${filterStatus === 'EXPIRED' ? 'active' : ''}`}
            onClick={() => setFilterStatus('EXPIRED')}
          >
            Expired
          </button>
              <button 
            className={`filter-tab ${filterStatus === 'CANCELLED' ? 'active' : ''}`}
            onClick={() => setFilterStatus('CANCELLED')}
          >
            Cancelled
              </button>
        </div>
            </div>
            
      {/* Subscriptions List */}
      {loading && subscriptions.length === 0 ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading subscriptions...</p>
        </div>
      ) : filteredSubscriptions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No Subscriptions Found</h3>
          <p>You don't have any subscriptions yet. Browse our catalog to get started!</p>
          <button className="btn btn-primary">Browse Catalog</button>
        </div>
      ) : (
        <div className="subscriptions-grid">
          {filteredSubscriptions.map(subscription => (
            <div key={subscription.id} className="subscription-card">
              <div className="card-header">
                <div className="card-title">
                  <h4>{subscription.entityName}</h4>
                  <span className={`status-badge ${getStatusBadgeClass(subscription)}`}>
                    {getStatusText(subscription)}
                  </span>
                </div>
                <div className="card-meta">
                  <span className="course-type">{subscription.courseTypeName}</span>
                </div>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <span className="label">Course:</span>
                  <span className="value">{subscription.courseName}</span>
                </div>
                <div className="info-row">
                  <span className="label">Plan:</span>
                  <span className="value">{subscription.planType}</span>
                </div>
                <div className="info-row">
                  <span className="label">Started:</span>
                  <span className="value">{formatDate(subscription.startDate)}</span>
                </div>
                <div className="info-row">
                  <span className="label">Expires:</span>
                  <span className="value">{formatDate(subscription.expiryDate)}</span>
                </div>
                <div className="info-row">
                  <span className="label">Days Remaining:</span>
                  <span className={`value ${calculateDaysRemaining(subscription) <= 7 ? 'text-warning' : ''}`}>
                    {Math.max(0, calculateDaysRemaining(subscription))} days
                  </span>
                </div>
                </div>

              <div className="card-footer">
                <div className="amount">₹{subscription.amount.toFixed(2)}</div>
                <div className="actions">
                  {subscription.isActive && calculateDaysRemaining(subscription) > 0 && (
                    <button 
                      className="btn btn-sm btn-outline"
                      onClick={() => {
                        setSelectedSubscription(subscription);
                        setShowDetailsModal(true);
                      }}
                    >
                      View Details
                    </button>
                  )}
                  {(calculateDaysRemaining(subscription) <= 7 || !subscription.isActive) && (
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => handleRenewClick(subscription)}
                    >
                      Renew Now
                    </button>
                  )}
                  </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Subscription Details Modal */}
      {showDetailsModal && selectedSubscription && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content subscription-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Subscription Details</h3>
              <button className="btn-close" onClick={() => setShowDetailsModal(false)}>×</button>
                </div>

            <div className="modal-body">
              <div className="details-section">
                <h4>{selectedSubscription.entityName}</h4>
                <p className="course-info">{selectedSubscription.courseTypeName} • {selectedSubscription.courseName}</p>
                
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Plan Type</span>
                    <span className="detail-value">{selectedSubscription.planType}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Amount Paid</span>
                    <span className="detail-value">₹{selectedSubscription.amount.toFixed(2)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Duration</span>
                    <span className="detail-value">{selectedSubscription.durationDays} days</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status</span>
                    <span className={`status-badge ${getStatusBadgeClass(selectedSubscription)}`}>
                      {getStatusText(selectedSubscription)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Start Date</span>
                    <span className="detail-value">{formatDate(selectedSubscription.startDate)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Expiry Date</span>
                    <span className="detail-value">{formatDate(selectedSubscription.expiryDate)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Payment ID</span>
                    <span className="detail-value small">{selectedSubscription.razorpay_payment_id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Order ID</span>
                    <span className="detail-value small">{selectedSubscription.razorpay_order_id}</span>
                  </div>
                </div>
                </div>
              </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>
                Close
                </button>
              {selectedSubscription.isActive && (
                <button 
                  className="btn btn-danger"
                  onClick={() => handleCancelSubscription(selectedSubscription.id)}
                  disabled={loading}
                >
                  {loading ? 'Cancelling...' : 'Cancel Subscription'}
                </button>
              )}
              </div>
          </div>
        </div>
      )}

      {/* Renew Modal */}
      {showRenewModal && selectedSubscription && (
        <div className="modal-overlay" onClick={() => setShowRenewModal(false)}>
          <div className="modal-content renew-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Renew Subscription</h3>
              <button className="btn-close" onClick={() => setShowRenewModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="renew-info">
                <h4>{selectedSubscription.entityName}</h4>
                <p>{selectedSubscription.courseTypeName} • {selectedSubscription.courseName}</p>
              </div>
              
              <div className="plan-selection">
                <h5>Select Renewal Plan</h5>
                <div className="plan-options">
                  <label className={`plan-option ${renewPlanType === 'MONTHLY' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="renewPlan"
                      value="MONTHLY"
                      checked={renewPlanType === 'MONTHLY'}
                      onChange={(e) => setRenewPlanType(e.target.value)}
                    />
                    <div className="plan-details">
                      <span className="plan-name">Monthly</span>
                      <span className="plan-price">
                        ₹{selectedSubscription.monthlyPrice?.toFixed(2) || '0.00'}/month
                      </span>
          </div>
                  </label>
                  
                  <label className={`plan-option ${renewPlanType === 'QUARTERLY' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="renewPlan"
                      value="QUARTERLY"
                      checked={renewPlanType === 'QUARTERLY'}
                      onChange={(e) => setRenewPlanType(e.target.value)}
                    />
                    <div className="plan-details">
                      <span className="plan-name">Quarterly</span>
                      <span className="plan-price">
                        ₹{selectedSubscription.quarterlyPrice?.toFixed(2) || '0.00'}/3 months
                      </span>
                      {selectedSubscription.quarterlyPrice && selectedSubscription.monthlyPrice && selectedSubscription.quarterlyPrice < selectedSubscription.monthlyPrice * 3 && (
                        <span className="plan-badge">
                          Save {Math.round((1 - selectedSubscription.quarterlyPrice / (selectedSubscription.monthlyPrice * 3)) * 100)}%
                        </span>
                      )}
                    </div>
                  </label>
                  
                  <label className={`plan-option ${renewPlanType === 'YEARLY' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="renewPlan"
                      value="YEARLY"
                      checked={renewPlanType === 'YEARLY'}
                      onChange={(e) => setRenewPlanType(e.target.value)}
                    />
                    <div className="plan-details">
                      <span className="plan-name">Yearly</span>
                      <span className="plan-price">
                        ₹{selectedSubscription.yearlyPrice?.toFixed(2) || '0.00'}/year
                      </span>
                      {selectedSubscription.yearlyPrice && selectedSubscription.monthlyPrice && selectedSubscription.yearlyPrice < selectedSubscription.monthlyPrice * 12 && (
                        <span className="plan-badge">
                          Save {Math.round((1 - selectedSubscription.yearlyPrice / (selectedSubscription.monthlyPrice * 12)) * 100)}%
                    </span>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowRenewModal(false)}>
                Cancel
              </button>
                  <button 
                type="button"
                className="btn btn-primary"
                onClick={(e) => handleRenewSubscription(e)}
                    disabled={loading}
                  >
                {loading ? 'Processing...' : 'Proceed to Payment'}
                  </button>
                </div>
              </div>
          </div>
        )}
    </div>
  );
};

export default StudentSubscription;
