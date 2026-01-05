import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
      {/* Football Field */}
      <div className="relative w-48 h-32 bg-green-800 rounded-lg border-2 border-white/50 overflow-hidden shadow-xl">
        {/* Field markings */}
        {/* Center line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/40 -translate-x-1/2"></div>
        {/* Center circle */}
        <div className="absolute left-1/2 top-1/2 w-12 h-12 border-2 border-white/40 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        {/* Center dot */}
        <div className="absolute left-1/2 top-1/2 w-2 h-2 bg-white/40 rounded-full -translate-x-1/2 -translate-y-1/2"></div>

        {/* Left penalty area */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-16 border-2 border-l-0 border-white/40"></div>
        {/* Right penalty area */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-16 border-2 border-r-0 border-white/40"></div>

        {/* Animated football */}
        <div className="absolute animate-bounce" style={{
          animation: 'ballMove 2s ease-in-out infinite',
          top: '50%',
          left: '20%',
        }}>
          <div className="w-5 h-5 bg-white rounded-full shadow-lg relative" style={{
            animation: 'spin 1s linear infinite',
          }}>
            {/* Ball pattern */}
            <div className="absolute inset-0.5 border border-slate-800/30 rounded-full"></div>
            <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-800/30 -translate-y-1/2"></div>
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-800/30 -translate-x-1/2"></div>
          </div>
        </div>
      </div>

      {/* CSS Keyframes */}
      <style>{`
        @keyframes ballMove {
          0%, 100% { left: 20%; top: 40%; }
          25% { left: 45%; top: 60%; }
          50% { left: 70%; top: 35%; }
          75% { left: 45%; top: 55%; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Message */}
      <p className="mt-6 text-slate-400 text-lg font-medium animate-pulse">
        {message}
      </p>

      {/* Subtle hint for longer waits */}
      <p className="mt-2 text-slate-600 text-sm">
        Please wait a moment...
      </p>
    </div>
  );
};

export default LoadingSpinner;
