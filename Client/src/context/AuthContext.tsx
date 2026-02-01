import React, { createContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import api from '../utils/api';
import authService from '../services/authService';
import { API_ENDPOINTS } from '../constants';
import type { User, AuthContextValue } from '../types';

const defaultContextValue: AuthContextValue = {
  user: null,
  setUser: () => {},
  authToken: null,
  saveToken: () => {},
  logout: () => {},
  loading: true,
};

export const AuthContext = createContext<AuthContextValue>(defaultContextValue);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(() => authService.getToken());
  const [loading, setLoading] = useState(true);

  const saveToken = useCallback((token: string): void => {
    authService.setToken(token);
    setAuthToken(token);
  }, []);

  const logout = useCallback((): void => {
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

    const fetchUserDetails = async (): Promise<void> => {
      if (authToken) {
        try {
          const response = await api.get<User>(API_ENDPOINTS.AUTH_BY_TOKEN, {
            signal: abortController.signal,
          });
          setUser(response.data);
        } catch (error) {
          if ((error as Error).name === 'AbortError' || (error as Error).name === 'CanceledError') {
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

  const contextValue = useMemo<AuthContextValue>(
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
