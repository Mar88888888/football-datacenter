import React from 'react';
import { Link } from 'react-router-dom';

interface ErrorPageProps {
  notFound?: boolean;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ notFound = false }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-6">
          <span className="text-6xl">{notFound ? '🔍' : '⚠️'}</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">
          {notFound ? 'Not Found' : 'Error'}
        </h1>
        <p className="text-slate-400 mb-8">
          {notFound
            ? "The page you're looking for doesn't exist or has been removed."
            : 'Oops! Something went wrong. Please try again later.'}
        </p>
        {notFound ? (
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Go to Home
          </Link>
        ) : (
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Reload Page
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorPage;
