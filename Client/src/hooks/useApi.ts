import { useState, useEffect, useCallback, useRef } from 'react';
import authService from '../services/authService';
import type { UseApiOptions, UseApiResult, UseMutationResult, FetchCallbacks } from '../types';

const API_URL = process.env.REACT_APP_API_URL;
const DEFAULT_RETRY_DELAY = 3000;
const MAX_RETRIES = 20;

interface FetchOptions extends RequestInit {
  signal?: AbortSignal;
}

/**
 * Shared helper for fetch requests with 202 polling support
 */
const fetchWithPolling = async <T>(
  url: string,
  fetchOptions: FetchOptions = {},
  callbacks: FetchCallbacks = {}
): Promise<T | null> => {
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

      await new Promise<void>((resolve, reject) => {
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
        (errorData as { message?: string }).message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  }

  throw new Error('Request timeout. Please try again later.');
};

/**
 * Build headers with optional auth token
 */
const buildHeaders = (authenticated: boolean, contentType: string | null = null): Record<string, string> => {
  const headers: Record<string, string> = {};
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
 */
export const useApi = <T = unknown>(
  endpoint: string | null,
  options: UseApiOptions = {}
): UseApiResult<T> => {
  const { enabled = true, authenticated = false, initialData = null } = options;

  const [data, setData] = useState<T | null>(initialData as T | null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const fetchData = useCallback(
    async (signal: AbortSignal): Promise<T | null> => {
      if (!endpoint) return null;

      setLoading(true);
      setError(null);

      try {
        const result = await fetchWithPolling<T>(
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
        if ((err as Error).name === 'AbortError') {
          return null;
        }
        if (isMountedRef.current) {
          setError(err as Error);
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

  const refetch = useCallback((): Promise<T> => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    return fetchData(abortControllerRef.current.signal) as Promise<T>;
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
export const useAuthApi = <T = unknown>(
  endpoint: string | null,
  options: Omit<UseApiOptions, 'authenticated'> = {}
): UseApiResult<T> => {
  return useApi<T>(endpoint, { ...options, authenticated: true });
};

/**
 * Hook for mutations (POST, DELETE) with 202 handling
 */
export const useApiMutation = <T = unknown>(
  options: { authenticated?: boolean } = {}
): UseMutationResult<T> => {
  const { authenticated = false } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const mutate = useCallback(
    async (
      endpoint: string,
      method = 'POST',
      body: unknown = null
    ): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchWithPolling<T>(
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
        setError(err as Error);
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
    post: (endpoint: string, body?: unknown) => mutate(endpoint, 'POST', body),
    delete: (endpoint: string) => mutate(endpoint, 'DELETE'),
  };
};

/**
 * Hook for authenticated mutations
 */
export const useAuthMutation = <T = unknown>(
  options: Omit<{ authenticated?: boolean }, 'authenticated'> = {}
): UseMutationResult<T> => {
  return useApiMutation<T>({ ...options, authenticated: true });
};

export default useApi;
