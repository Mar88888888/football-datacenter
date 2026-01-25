import { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import api from '../utils/api';
import authService from '../services/authService';
import { API_ENDPOINTS } from '../constants';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(() => authService.getToken());
  const [loading, setLoading] = useState(true);

  const saveToken = useCallback((token) => {
    authService.setToken(token);
    setAuthToken(token);
  }, []);

  const logout = useCallback(() => {
    authService.clearToken();
    setAuthToken(null);
    setUser(null);
  }, []);

  // Listen for token changes from other sources (e.g., 401 interceptor, other tabs)
  useEffect(() => {
    const unsubscribe = authService.onTokenChange((token) => {
      setAuthToken(token);
      if (!token) {
        setUser(null);
      }
    });

    return unsubscribe;
  }, []);

  // Fetch user details when token is available
  useEffect(() => {
    const abortController = new AbortController();

    const fetchUserDetails = async () => {
      if (authToken) {
        try {
          const response = await api.get(API_ENDPOINTS.AUTH_BY_TOKEN, {
            signal: abortController.signal,
          });
          setUser(response.data);
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
      } else {
        setUser(null);
        setLoading(false);
      }
    };

    fetchUserDetails();

    return () => {
      abortController.abort();
    };
  }, [authToken, logout]);

  const contextValue = useMemo(
    () => ({
      user,
      setUser,
      authToken,
      saveToken,
      logout,
      loading,
    }),
    [user, authToken, saveToken, logout, loading]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
