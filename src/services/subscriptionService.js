import { API_BASE } from '../utils/apiUtils';

// Create Subscription and Get Razorpay Order
export const createSubscription = async (token, subscriptionData) => {
  const endpoint = `${API_BASE}/api/student/subscriptions`;
  
  console.log('🔵 Creating subscription...');
  console.log('📍 Endpoint:', endpoint);
  console.log('📦 Subscription data:', subscriptionData);
  console.log('🔑 Has token:', !!token);
  
  const headers = {
    'Content-Type': 'application/json',
    'accept': '*/*'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(subscriptionData)
    });
    
    console.log('📊 Response status:', response.status, response.statusText);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      // Handle 503 Service Unavailable specifically
      if (response.status === 503) {
        console.error('❌ Backend service unavailable (503)');
        throw new Error('Backend service is currently unavailable. Please try again later or contact support.');
      }
      
      // Clone response to allow multiple reads
      const clonedResponse = response.clone();
      
      // Try to parse JSON error first
      try {
        const errorData = await response.json();
        const errorMessage = errorData.error || errorData.message || 'Failed to create subscription';
        console.error('❌ Subscription error (JSON):', errorData);
        throw new Error(errorMessage);
      } catch (jsonError) {
        // If JSON parsing fails, use cloned response for text
        try {
          const errorText = await clonedResponse.text();
          console.error('❌ Subscription error (text):', errorText);
          throw new Error(errorText || `Failed to create subscription: ${response.status} ${response.statusText}`);
        } catch (textError) {
          console.error('❌ Subscription error (unknown):', textError);
          throw new Error(`Failed to create subscription: ${response.status} ${response.statusText}`);
        }
      }
    }
    
    const data = await response.json();
    console.log('✅ Subscription created successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Create subscription failed:', error);
    console.error('❌ Error stack:', error.stack);
    throw error;
  }
};

// Verify Payment after Razorpay completion
export const verifyPayment = async (token, paymentData) => {
  const endpoint = `${API_BASE}/api/student/subscriptions/verify-payment`;
  
  console.log('Verifying payment:', paymentData);
  
  const headers = {
    'Content-Type': 'application/json',
    'accept': '*/*'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(paymentData)
  });
  
  console.log('Verify payment response status:', response.status);
  
  if (!response.ok) {
    // Clone response to allow multiple reads
    const clonedResponse = response.clone();
    
    // Try to parse JSON error first
    try {
      const errorData = await response.json();
      const errorMessage = errorData.error || errorData.message || 'Failed to verify payment';
      console.error('Verify payment error (JSON):', errorData);
      throw new Error(errorMessage);
    } catch (jsonError) {
      // If JSON parsing fails, use cloned response for text
      try {
        const errorText = await clonedResponse.text();
        console.error('Verify payment error (text):', errorText);
        throw new Error(errorText || `Failed to verify payment: ${response.status} ${response.statusText}`);
      } catch (textError) {
        throw new Error(`Failed to verify payment: ${response.status} ${response.statusText}`);
      }
    }
  }
  
  const data = await response.json();
  console.log('Payment verified successfully:', data);
  return data;
};

// Get User Subscriptions (All)
export const getUserSubscriptions = async (token) => {
  const endpoint = `${API_BASE}/api/student/subscriptions`;
  
  const headers = {
    'accept': '*/*'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(endpoint, { headers });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch subscriptions: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
};

// Get My Subscriptions with Full Details
export const getMySubscriptions = async (token) => {
  const endpoint = `${API_BASE}/api/student/subscriptions/my-subscriptions`;
  
  const headers = {
    'accept': '*/*',
    'Authorization': `Bearer ${token}`
  };
  
  const response = await fetch(endpoint, { headers });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch subscriptions: ${response.status}`);
  }
  
  return await response.json();
};

// Get Active Subscriptions for Content Browser
export const getActiveSubscriptions = async (token) => {
  const endpoint = `${API_BASE}/api/student/subscriptions/active`;
  
  const headers = {
    'accept': '*/*',
    'Authorization': `Bearer ${token}`
  };
  
  const response = await fetch(endpoint, { headers });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch active subscriptions: ${response.status}`);
  }
  
  return await response.json();
};

// Get Subjects for Entity (Class/Exam/Course)
export const getEntitySubjects = async (token, entityId, courseTypeId) => {
  const endpoint = `${API_BASE}/api/student/course-content/subjects?entityId=${entityId}&courseTypeId=${courseTypeId}`;
  
  const headers = {
    'accept': '*/*',
    'Authorization': `Bearer ${token}`
  };
  
  const response = await fetch(endpoint, { headers });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch subjects: ${response.status}`);
  }
  
  return await response.json();
};

// Get Topics for Subject
export const getTopicsForSubject = async (token, courseTypeId, linkageId) => {
  const endpoint = `${API_BASE}/api/student/course-content/topics?courseTypeId=${courseTypeId}&linkageId=${linkageId}`;
  
  const headers = {
    'accept': '*/*',
    'Authorization': `Bearer ${token}`
  };
  
  const response = await fetch(endpoint, { headers });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch topics: ${response.status}`);
  }
  
  return await response.json();
};

// Get Modules for Topic
export const getModulesForTopic = async (token, topicId) => {
  const endpoint = `${API_BASE}/api/student/course-content/modules?topicId=${topicId}`;
  
  const headers = {
    'accept': '*/*',
    'Authorization': `Bearer ${token}`
  };
  
  const response = await fetch(endpoint, { headers });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch modules: ${response.status}`);
  }
  
  return await response.json();
};

// Get Chapters for Module
export const getChaptersForModule = async (token, moduleId) => {
  const endpoint = `${API_BASE}/api/student/course-content/chapters?moduleId=${moduleId}`;
  
  const headers = {
    'accept': '*/*',
    'Authorization': `Bearer ${token}`
  };
  
  const response = await fetch(endpoint, { headers });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch chapters: ${response.status}`);
  }
  
  return await response.json();
};

// Get Single Subscription Details
export const getSubscriptionDetails = async (token, subscriptionId) => {
  const endpoint = `${API_BASE}/api/student/subscriptions/${subscriptionId}`;
  
  const headers = {
    'accept': '*/*',
    'Authorization': `Bearer ${token}`
  };
  
  const response = await fetch(endpoint, { headers });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch subscription details: ${response.status}`);
  }
  
  return await response.json();
};

// Cancel Subscription
export const cancelSubscription = async (token, subscriptionId) => {
  const endpoint = `${API_BASE}/api/student/subscriptions/${subscriptionId}/cancel`;
  
  const headers = {
    'Authorization': `Bearer ${token}`
  };
  
  const response = await fetch(endpoint, {
    method: 'PUT',
    headers
  });
  
  if (!response.ok) {
    throw new Error(`Failed to cancel subscription: ${response.status}`);
  }
  
  return await response.json();
};

// Check Content Access
export const checkContentAccess = async (token, entityType, entityId) => {
  const endpoint = `${API_BASE}/api/student/subscriptions/check-access?entityType=${entityType}&entityId=${entityId}`;
  
  const headers = {
    'accept': '*/*',
    'Authorization': `Bearer ${token}`
  };
  
  const response = await fetch(endpoint, { headers });
  
  if (!response.ok) {
    throw new Error(`Failed to check access: ${response.status}`);
  }
  
  return await response.json();
};

// Get Expiring Soon Subscriptions
export const getExpiringSoonSubscriptions = async (token) => {
  const endpoint = `${API_BASE}/api/student/subscriptions/expiring-soon`;
  
  const headers = {
    'accept': '*/*',
    'Authorization': `Bearer ${token}`
  };
  
  const response = await fetch(endpoint, { headers });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch expiring subscriptions: ${response.status}`);
  }
  
  return await response.json();
};

// Renew Subscription
export const renewSubscription = async (token, subscriptionId, planType) => {
  const endpoint = `${API_BASE}/api/student/subscriptions/${subscriptionId}/renew`;
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ planType })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to renew subscription: ${response.status}`);
  }
  
  return await response.json();
};
