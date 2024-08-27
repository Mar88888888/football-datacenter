import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authToken, setAuthToken] = useState(null);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const token = document.cookie.split('; ').find(row => row.startsWith('authToken='));
                if (token) {
                    const authToken = token.split('=')[1];
                    const response = await axios.get(`${process.env.REACT_APP_API_URL}/user/auth/bytoken`, {
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                        },
                        withCredentials: true,
                    });

                    setUser(response.data);
                    setAuthToken(authToken);
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

    return (
        <AuthContext.Provider value={{ user, setUser, authToken, setAuthToken }}>
            {children}
        </AuthContext.Provider>
    );
};
