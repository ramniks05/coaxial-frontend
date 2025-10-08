import { API_BASE } from '../utils/apiUtils';

// Create Subscription and Get Razorpay Order
export const createSubscription = async (token, subscriptionData) => {
  const endpoint = `${API_BASE}/api/student/subscriptions`;
  
  console.log('Creating subscription:', subscriptionData);
  
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
    body: JSON.stringify(subscriptionData)
  });
  
  console.log('Create subscription response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create subscription error:', errorText);
    throw new Error(`Failed to create subscription: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('Subscription created successfully:', data);
  return data;
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
    const errorText = await response.text();
    console.error('Verify payment error:', errorText);
    throw new Error(`Failed to verify payment: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('Payment verified successfully:', data);
  return data;
};

// Get User Subscriptions
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
