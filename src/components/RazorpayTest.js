import React, { useEffect } from 'react';

const RazorpayTest = () => {
  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      console.log('Razorpay script loaded successfully');
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleTestPayment = () => {
    if (!window.Razorpay) {
      alert('Razorpay not loaded');
      return;
    }

    const options = {
      key: 'rzp_test_ROysXhPNhStyyy', // Updated with new working credentials
      amount: 10000, // ₹100 in paise
      currency: 'INR',
      name: 'Test Payment',
      description: 'Test payment for Razorpay integration',
      handler: function (response) {
        console.log('Payment successful:', response);
        alert('Payment successful! Check console for details.');
      },
      modal: {
        ondismiss: function() {
          console.log('Payment modal dismissed');
          alert('Payment cancelled');
        }
      }
    };

    console.log('Opening Razorpay with options:', options);
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Razorpay Test Page</h2>
      <p>This is a simple test to check if Razorpay integration is working.</p>
      <button 
        onClick={handleTestPayment}
        style={{
          padding: '10px 20px',
          backgroundColor: '#3399cc',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Test Payment (₹100)
      </button>
      <div style={{ marginTop: '20px' }}>
        <p><strong>Key ID:</strong> rzp_test_ROysXhPNhStyyy</p>
        <p><strong>Amount:</strong> ₹100 (10000 paise)</p>
        <p><strong>Currency:</strong> INR</p>
      </div>
    </div>
  );
};

export default RazorpayTest;
