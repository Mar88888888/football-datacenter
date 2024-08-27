import React, { useContext  } from 'react';
import axios from 'axios';
import '../styles/global.css';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const EmailVerificationRequired = () => {
    const { setUser } = useContext(AuthContext);

    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
        await axios.post(`${process.env.REACT_APP_API_URL}/user/auth/signout`, {}, { withCredentials: true });
        setUser(null);
        navigate('/login');
        } catch (error) {
        console.error('Error during logout:', error);
        }
    };

    return (
        <div className="verification-required-container container">
            <div className="logout-container">
                <button onClick={handleLogout} className="logout-button">
                Logout
                </button>
            </div>

            <h2>Email Verification Required</h2>
            <p>You need to verify your email to access this page.</p>
            <p>Please check your email for the verification link.</p>
            <Link to="/">Go to Home</Link>
        </div>
    );
};

export default EmailVerificationRequired;
