import React from 'react';
import { Link } from 'react-router-dom';

const EmailVerificationRequired = () => {
    return (
        <div className="verification-required-container container">
            <h2>Email Verification Required</h2>
            <p>You need to verify your email to access this page.</p>
            <p>Please check your email for the verification link.</p>
            <Link to="/">Go to Home</Link>
        </div>
    );
};

export default EmailVerificationRequired;
