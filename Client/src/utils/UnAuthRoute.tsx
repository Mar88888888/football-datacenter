import React, { useContext, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

interface UnAuthRouteProps {
  children: ReactNode;
}

const UnAuthRoute: React.FC<UnAuthRouteProps> = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

export default UnAuthRoute;
