import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const authToken = document.cookie.split('; ').find(row => row.startsWith('authToken='));

                if (authToken) {
                    const token = authToken.split('=')[1]; 
                    const response = await axios.get(`${process.env.REACT_APP_API_URL}/user/auth/bytoken`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                        withCredentials: true,
                    });

                    const userData = response.data;
                    setUser(userData.user);
                    console.log(userData);
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
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};
