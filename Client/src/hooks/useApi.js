import { useState, useEffect, useCallback, useRef } from 'react';

const API_URL = process.env.REACT_APP_API_URL;
const DEFAULT_RETRY_DELAY = 3000;
const MAX_RETRIES = 20; // Increased: 20 retries × 3s = 60 seconds max wait

/**
 * Custom hook for fetching data with automatic 202 polling
 *
 * @param {string} endpoint - API endpoint (e.g., '/competitions/2021')
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether to fetch immediately (default: true)
 * @param {boolean} options.withCredentials - Include cookies (default: false)
 * @param {any} options.initialData - Initial data value (default: null)
 * @returns {Object} { data, loading, error, refetch, isProcessing }
 */
export const useApi = (endpoint, options = {}) => {
  const {
    enabled = true,
    withCredentials = false,
    initialData = null,
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Track if component is mounted and current fetch
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  const fetchData = useCallback(async (signal) => {
    if (!endpoint) return;

    setLoading(true);
    setError(null);
    let retries = 0;

    try {
      while (retries < MAX_RETRIES) {
        // Check if aborted
        if (signal?.aborted) {
          return;
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
          credentials: withCredentials ? 'include' : 'same-origin',
          signal,
        });

        // Data is ready
        if (response.status === 200) {
          const result = await response.json();
          if (isMountedRef.current) {
            setData(result);
            setIsProcessing(false);
            setLoading(false);
          }
          return result;
        }

        // Data is being processed - retry
        if (response.status === 202) {
          retries++;
          if (isMountedRef.current) {
            setIsProcessing(true);
          }

          const retryAfter = response.headers.get('Retry-After');
          const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : DEFAULT_RETRY_DELAY;

          // Wait but check for abort
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(resolve, delay);
            signal?.addEventListener('abort', () => {
              clearTimeout(timeout);
              reject(new DOMException('Aborted', 'AbortError'));
            });
          });
          continue;
        }

        // Error responses
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Other success responses
        const result = await response.json();
        if (isMountedRef.current) {
          setData(result);
          setLoading(false);
        }
        return result;
      }

      // Max retries reached
      throw new Error('Data is still loading. Please try again later.');
    } catch (err) {
      // Ignore abort errors
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
  }, [endpoint, withCredentials]);

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
 * Hook for authenticated API calls (includes credentials)
 */
export const useAuthApi = (endpoint, options = {}) => {
  return useApi(endpoint, { ...options, withCredentials: true });
};

/**
 * Hook for mutations (POST, DELETE) with 202 handling
 * Returns a function to trigger the mutation
 */
export const useApiMutation = (options = {}) => {
  const { withCredentials = false } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (endpoint, method = 'POST', body = null) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        credentials: withCredentials ? 'include' : 'same-origin',
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body: body ? JSON.stringify(body) : null,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = response.status !== 204 ? await response.json() : null;
      setLoading(false);
      return data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, [withCredentials]);

  return {
    mutate,
    loading,
    error,
    post: (endpoint, body) => mutate(endpoint, 'POST', body),
    delete: (endpoint) => mutate(endpoint, 'DELETE'),
  };
};

/**
 * Hook for authenticated mutations
 */
export const useAuthMutation = (options = {}) => {
  return useApiMutation({ ...options, withCredentials: true });
};

export default useApi;
