import React from 'react';

const ErrorPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-6">
          <span className="text-6xl">&#9888;&#65039;</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Error</h1>
        <p className="text-slate-400 mb-8">
          Oops! Something went wrong. Please try again later.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-200"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;
