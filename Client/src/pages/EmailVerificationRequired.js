import React, { useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const EmailVerificationRequired = () => {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/user/auth/signout`,
        {},
        { withCredentials: true }
      );
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Logout Button */}
        <div className="flex justify-end mb-8">
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all duration-200 font-medium"
          >
            Logout
          </button>
        </div>

        {/* Content */}
        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 shadow-xl text-center">
          <div className="mb-6">
            <span className="text-6xl">📧</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Email Verification Required
          </h2>
          <div className="space-y-3 text-slate-400 mb-8">
            <p>You need to verify your email to access this page.</p>
            <p>Please check your email for the verification link.</p>
            <p>If you have verified your email, try to log in again.</p>
          </div>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationRequired;
