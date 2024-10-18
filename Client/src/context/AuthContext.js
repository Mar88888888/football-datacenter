import { createContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';

export const AuthContext = createContext(); 

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authToken, setAuthToken] = useState(null);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const token = getCookie('authToken');
                if (token) {
                    const response = await axios.get(`${process.env.REACT_APP_API_URL}/user/auth/bytoken`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                        withCredentials: true,
                    });
                    setUser(response.data);
                    setAuthToken(token);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Failed to fetch user details:', error);
                setUser(null);
            }
        };

        fetchUserDetails();
    }, []);

    const contextValue = useMemo(() => ({
        user, setUser, authToken, setAuthToken,
    }), [user, authToken]);



    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
