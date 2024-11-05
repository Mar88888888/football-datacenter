import React from 'react';

const ErrorPage = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Error</h1>
      <p>Oops! Something went wrong. Please try again later.</p>
      <button onClick={() => window.location.reload()}>Reload Page</button>
    </div>
  );
};

export default ErrorPage;
