import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { user } = useContext(AuthContext);
    
    if (!user) {
        return <Navigate to="/login" />;
    }

    if (!user.isEmailVerified) {
        return <Navigate to="/email-verification-required" />;
    }


    return children;
};

export default PrivateRoute;
