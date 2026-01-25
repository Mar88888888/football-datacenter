import { useState, useEffect, useCallback, useRef } from 'react';
import authService from '../services/authService';

const API_URL = process.env.REACT_APP_API_URL;
const DEFAULT_RETRY_DELAY = 3000;
const MAX_RETRIES = 20;

/**
 * Shared helper for fetch requests with 202 polling support
 * @param {string} url - Full URL to fetch
 * @param {Object} fetchOptions - Options for fetch (method, headers, body, signal)
 * @param {Object} callbacks - Optional callbacks { onProcessing }
 * @returns {Promise<any>} Response data
 */
const fetchWithPolling = async (url, fetchOptions = {}, callbacks = {}) => {
  const { signal } = fetchOptions;
  const { onProcessing } = callbacks;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    const response = await fetch(url, fetchOptions);

    // Success - return data
    if (response.status === 200) {
      return await response.json();
    }

    // No content - return null
    if (response.status === 204) {
      return null;
    }

    // Processing - poll with retry
    if (response.status === 202) {
      retries++;
      onProcessing?.(true);

      const retryAfter = response.headers.get('Retry-After');
      const delay = retryAfter
        ? parseInt(retryAfter, 10) * 1000
        : DEFAULT_RETRY_DELAY;

      await new Promise((resolve, reject) => {
        const timeout = setTimeout(resolve, delay);
        signal?.addEventListener('abort', () => {
          clearTimeout(timeout);
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });
      continue;
    }

    // Unauthorized - clear token and redirect
    if (response.status === 401) {
      authService.clearToken();
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    // Error responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  }

  throw new Error('Request timeout. Please try again later.');
};

/**
 * Build headers with optional auth token
 */
const buildHeaders = (authenticated, contentType = null) => {
  const headers = {};
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  if (authenticated) {
    const token = authService.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

/**
 * Custom hook for fetching data with automatic 202 polling
 *
 * @param {string} endpoint - API endpoint (e.g., '/competitions/2021')
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether to fetch immediately (default: true)
 * @param {boolean} options.authenticated - Include auth token (default: false)
 * @param {any} options.initialData - Initial data value (default: null)
 * @returns {Object} { data, loading, error, refetch, isProcessing }
 */
export const useApi = (endpoint, options = {}) => {
  const { enabled = true, authenticated = false, initialData = null } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  const fetchData = useCallback(
    async (signal) => {
      if (!endpoint) return;

      setLoading(true);
      setError(null);

      try {
        const result = await fetchWithPolling(
          `${API_URL}${endpoint}`,
          {
            headers: buildHeaders(authenticated),
            signal,
          },
          {
            onProcessing: (processing) => {
              if (isMountedRef.current) setIsProcessing(processing);
            },
          }
        );

        if (isMountedRef.current) {
          setData(result);
          setIsProcessing(false);
          setLoading(false);
        }
        return result;
      } catch (err) {
        if (err.name === 'AbortError') {
          return;
        }
        if (isMountedRef.current) {
          setError(err);
          setLoading(false);
          setIsProcessing(false);
        }
        throw err;
      }
    },
    [endpoint, authenticated]
  );

  // Initial fetch with cleanup
  useEffect(() => {
    isMountedRef.current = true;

    if (enabled && endpoint) {
      // Cancel any previous fetch
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this fetch
      abortControllerRef.current = new AbortController();
      fetchData(abortControllerRef.current.signal).catch(() => {});
    }

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [enabled, endpoint, fetchData]);

  const refetch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    return fetchData(abortControllerRef.current.signal);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    isProcessing,
    refetch,
  };
};

/**
 * Hook for authenticated API calls (includes auth token)
 */
export const useAuthApi = (endpoint, options = {}) => {
  return useApi(endpoint, { ...options, authenticated: true });
};

/**
 * Hook for mutations (POST, DELETE) with 202 handling
 * Returns a function to trigger the mutation
 */
export const useApiMutation = (options = {}) => {
  const { authenticated = false } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const mutate = useCallback(
    async (endpoint, method = 'POST', body = null) => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchWithPolling(
          `${API_URL}${endpoint}`,
          {
            method,
            headers: buildHeaders(authenticated, body ? 'application/json' : null),
            body: body ? JSON.stringify(body) : null,
          },
          {
            onProcessing: setIsProcessing,
          }
        );

        setLoading(false);
        setIsProcessing(false);
        return result;
      } catch (err) {
        setError(err);
        setLoading(false);
        setIsProcessing(false);
        throw err;
      }
    },
    [authenticated]
  );

  return {
    mutate,
    loading,
    error,
    isProcessing,
    post: (endpoint, body) => mutate(endpoint, 'POST', body),
    delete: (endpoint) => mutate(endpoint, 'DELETE'),
  };
};

/**
 * Hook for authenticated mutations
 */
export const useAuthMutation = (options = {}) => {
  return useApiMutation({ ...options, authenticated: true });
};

export default useApi;
