import { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import api from '../utils/api';
import { API_ENDPOINTS } from '../constants';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken'));
    const [loading, setLoading] = useState(true);

    const saveToken = useCallback((token) => {
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
        setAuthToken(token);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('authToken');
        setAuthToken(null);
        setUser(null);
    }, []);

    useEffect(() => {
        const abortController = new AbortController();

        const fetchUserDetails = async () => {
            try {
                if (authToken) {
                    const response = await api.get(API_ENDPOINTS.AUTH_BY_TOKEN, {
                        signal: abortController.signal,
                    });
                    setUser(response.data);
                } else {
                    setUser(null);
                }
            } catch (error) {
                if (error.name === 'AbortError' || error.name === 'CanceledError') {
                    return;
                }
                console.error('Failed to fetch user details:', error);
                logout();
            } finally {
                if (!abortController.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchUserDetails();

        return () => {
            abortController.abort();
        };
    }, [authToken, logout]);

    const contextValue = useMemo(() => ({
        user, setUser, authToken, saveToken, logout, loading,
    }), [user, authToken, saveToken, logout, loading]);



    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
