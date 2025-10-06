import React, { useEffect, useState } from 'react';

const SafeRedirect = ({ to, replace = true }) => {
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    // Use requestAnimationFrame to ensure we're outside the render cycle
    requestAnimationFrame(() => {
      setTimeout(() => {
        setShouldRedirect(true);
      }, 100);
    });
  }, []);

  useEffect(() => {
    if (shouldRedirect) {
      try {
        if (replace) {
          window.location.replace(to);
        } else {
          window.location.href = to;
        }
      } catch (error) {
        console.error('Redirect error:', error);
        window.location.href = to;
      }
    }
  }, [shouldRedirect, to, replace]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px'
    }}>
      Redirecting...
    </div>
  );
};

export default SafeRedirect;



