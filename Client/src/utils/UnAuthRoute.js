import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const UnAuthRoute = ({ children }) => {
    const { user } = useContext(AuthContext);

    if (user && user.isEmailVerified) {
        return <Navigate to="/dashboard" />;
    }

    if (user && !user.isEmailVerified) {
        return <Navigate to="/email-verification-required" />;
    }

    return children;
};

export default UnAuthRoute;
