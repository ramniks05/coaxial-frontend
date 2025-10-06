// Razorpay utility functions for payment integration
import { useApp } from '../context/AppContext';

// Razorpay configuration
const RAZORPAY_CONFIG = {
  key_id: 'rzp_test_ROysXhPNhStyyy', // Updated with new working credentials
  key_secret: 'j4FqnJ70kNbXhfbrxAtygshF'
};

// Create a Razorpay order (this would typically be done on your backend)
export const createRazorpayOrder = async (subscriptionData) => {
  try {
    // In a real implementation, this would call your backend API
    // For now, we'll simulate the order creation
    const orderData = {
      amount: subscriptionData.amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `subscription_${Date.now()}`,
      notes: {
        courseTypeId: subscriptionData.courseTypeId,
        courseId: subscriptionData.courseId,
        classId: subscriptionData.classId,
        examId: subscriptionData.examId,
        subscriptionType: subscriptionData.subscriptionType,
        duration: subscriptionData.duration,
        price: subscriptionData.amount
      }
    };

    // Simulate API call to create order
    console.log('Creating Razorpay order:', orderData);
    
    // Return mock order data (in real implementation, this comes from Razorpay API)
    return {
      id: `order_${Date.now()}`,
      amount: orderData.amount,
      currency: orderData.currency,
      receipt: orderData.receipt,
      status: 'created'
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

// Verify payment signature (this would typically be done on your backend)
export const verifyPayment = async (paymentData) => {
  try {
    // In a real implementation, this would call your backend API
    // to verify the payment signature using your key_secret
    console.log('Verifying payment:', paymentData);
    
    // Simulate verification (in real implementation, verify signature)
    const isValid = paymentData.razorpay_payment_id && paymentData.razorpay_order_id;
    
    return {
      verified: isValid,
      paymentId: paymentData.razorpay_payment_id,
      orderId: paymentData.razorpay_order_id,
      signature: paymentData.razorpay_signature
    };
  } catch (error) {
    console.error('Error verifying payment:', error);
    return { verified: false, error: error.message };
  }
};

// Create subscription after successful payment
export const createSubscriptionAfterPayment = async (subscriptionData, paymentData) => {
  try {
    // In a real implementation, this would call your backend API
    console.log('Creating subscription after payment:', { subscriptionData, paymentData });
    
    // Simulate API call
    const subscription = {
      id: Date.now(),
      ...subscriptionData,
      paymentId: paymentData.paymentId,
      orderId: paymentData.orderId,
      paymentStatus: 'completed',
      startDate: new Date().toISOString().split('T')[0],
      isActive: true
    };
    
    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

// Load Razorpay script dynamically
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      console.log('Razorpay already loaded');
      resolve(true);
      return;
    }

    console.log('Loading Razorpay script...');
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      console.log('Razorpay script loaded successfully');
      resolve(true);
    };
    script.onerror = (error) => {
      console.error('Failed to load Razorpay script:', error);
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Initialize Razorpay checkout
export const initializeRazorpayCheckout = async (orderData, subscriptionData) => {
  try {
    console.log('Initializing Razorpay checkout with:', {
      key: RAZORPAY_CONFIG.key_id,
      amount: orderData.amount,
      currency: orderData.currency,
      order_id: orderData.id
    });

    const options = {
      key: RAZORPAY_CONFIG.key_id,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'Education Platform',
      description: `Subscription for ${subscriptionData.courseTypeName}`,
      order_id: orderData.id,
      prefill: {
        name: subscriptionData.studentName || 'Student',
        email: subscriptionData.studentEmail || 'student@example.com',
        contact: subscriptionData.studentPhone || '9999999999'
      },
      theme: {
        color: '#3399cc'
      },
      handler: async (response) => {
        console.log('Payment successful:', response);
        return response;
      },
      modal: {
        ondismiss: () => {
          console.log('Payment modal dismissed');
          return false;
        }
      }
    };

    console.log('Razorpay options created:', options);
    return options;
  } catch (error) {
    console.error('Error initializing Razorpay checkout:', error);
    throw error;
  }
};

export { RAZORPAY_CONFIG };
