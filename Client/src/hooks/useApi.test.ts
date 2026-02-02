import { renderHook, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { useApi, useAuthApi, useApiMutation, useAuthMutation } from './useApi';
import authService from '../services/authService';

// Mock authService
vi.mock('../services/authService', () => ({
  default: {
    getToken: vi.fn(),
    clearToken: vi.fn(),
  },
}));

const mockAuthService = authService as { getToken: ReturnType<typeof vi.fn>; clearToken: ReturnType<typeof vi.fn> };

// Store original window.location
const originalLocation = window.location;

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

const API_BASE = 'http://localhost:3000/fdc-api';

describe('useApi', () => {
  beforeAll(() => {
    // Mock window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    });
  });

  afterAll(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    window.location.href = '';
  });

  describe('initial state', () => {
    it('should start with loading=true when enabled', async () => {
      mockFetch.mockResolvedValue({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ data: 'test' }),
      });

      const { result } = renderHook(() => useApi('/test'));

      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();

      await waitFor(() => expect(result.current.loading).toBe(false));
    });

    it('should start with loading=false when disabled', () => {
      const { result } = renderHook(() => useApi('/test', { enabled: false }));

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
    });

    it('should use initialData when provided', () => {
      const initialData = { id: 1, name: 'test' };
      const { result } = renderHook(() =>
        useApi('/test', { enabled: false, initialData })
      );

      expect(result.current.data).toEqual(initialData);
    });

    it('should not fetch when endpoint is null', () => {
      const { result } = renderHook(() => useApi(null));

      // Loading is initially true (based on enabled=true default), but fetch is not called
      expect(result.current.loading).toBe(true);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('successful fetch', () => {
    it('should fetch data and set loading=false on success', async () => {
      const responseData = { id: 1, name: 'test' };
      mockFetch.mockResolvedValue({
        status: 200,
        ok: true,
        json: () => Promise.resolve(responseData),
      });

      const { result } = renderHook(() => useApi<typeof responseData>('/test'));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.data).toEqual(responseData);
      expect(result.current.error).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE}/test`,
        expect.objectContaining({
          headers: {},
          signal: expect.any(AbortSignal),
        })
      );
    });

    it('should handle 204 No Content response', async () => {
      mockFetch.mockResolvedValue({
        status: 204,
        ok: true,
      });

      const { result } = renderHook(() => useApi('/test'));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should set error on fetch failure', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useApi('/test'));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Network error');
      expect(result.current.data).toBeNull();
    });

    it('should set error on non-ok response', async () => {
      mockFetch.mockResolvedValue({
        status: 500,
        ok: false,
        json: () => Promise.resolve({ message: 'Internal server error' }),
      });

      const { result } = renderHook(() => useApi('/test'));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error?.message).toBe('Internal server error');
    });

    it('should handle non-JSON error response', async () => {
      mockFetch.mockResolvedValue({
        status: 500,
        ok: false,
        json: () => Promise.reject(new Error('Not JSON')),
      });

      const { result } = renderHook(() => useApi('/test'));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error?.message).toBe('HTTP error! status: 500');
    });
  });

  describe('401 unauthorized handling', () => {
    it('should clear token and redirect on 401', async () => {
      mockFetch.mockResolvedValue({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => useApi('/test'));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(mockAuthService.clearToken).toHaveBeenCalled();
      expect(window.location.href).toBe('/login');
    });
  });

  describe('202 polling', () => {
    it('should poll on 202 and eventually complete', async () => {
      vi.useFakeTimers();

      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            status: 202,
            ok: true,
            headers: new Headers({ 'Retry-After': '1' }),
          });
        }
        return Promise.resolve({
          status: 200,
          ok: true,
          json: () => Promise.resolve({ data: 'done' }),
        });
      });

      const { result } = renderHook(() => useApi('/test'));

      // First call made
      await waitFor(() => expect(callCount).toBe(1));

      // Advance timer to trigger retry
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      // Wait for completion
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.data).toEqual({ data: 'done' });
      expect(result.current.isProcessing).toBe(false);
      expect(callCount).toBe(2);

      vi.useRealTimers();
    });

    it('should use Retry-After header for delay', async () => {
      vi.useFakeTimers();

      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            status: 202,
            ok: true,
            headers: new Headers({ 'Retry-After': '2' }),
          });
        }
        return Promise.resolve({
          status: 200,
          ok: true,
          json: () => Promise.resolve({ data: 'done' }),
        });
      });

      const { result } = renderHook(() => useApi('/test'));

      // First call made immediately
      await waitFor(() => expect(callCount).toBe(1));

      // Advance timers by 2 seconds (Retry-After value)
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(callCount).toBe(2);

      vi.useRealTimers();
    });
  });

  describe('refetch', () => {
    it('should refetch data when refetch is called', async () => {
      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          status: 200,
          ok: true,
          json: () => Promise.resolve({ count: callCount }),
        });
      });

      const { result } = renderHook(() => useApi('/test'));

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.data).toEqual({ count: 1 });

      await act(async () => {
        await result.current.refetch();
      });

      expect(result.current.data).toEqual({ count: 2 });
    });
  });

  describe('abort handling', () => {
    it('should abort previous fetch when endpoint changes', async () => {
      const abortSpy = vi.spyOn(AbortController.prototype, 'abort');

      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  status: 200,
                  ok: true,
                  json: () => Promise.resolve({ data: 'test' }),
                }),
              100
            )
          )
      );

      const { rerender } = renderHook(({ endpoint }) => useApi(endpoint), {
        initialProps: { endpoint: '/test1' },
      });

      // Change endpoint before first request completes
      rerender({ endpoint: '/test2' });

      expect(abortSpy).toHaveBeenCalled();
      abortSpy.mockRestore();
    });

    it('should abort on unmount', async () => {
      const abortSpy = vi.spyOn(AbortController.prototype, 'abort');

      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  status: 200,
                  ok: true,
                  json: () => Promise.resolve({ data: 'test' }),
                }),
              1000
            )
          )
      );

      const { unmount } = renderHook(() => useApi('/test'));

      unmount();

      expect(abortSpy).toHaveBeenCalled();
      abortSpy.mockRestore();
    });
  });
});

describe('useAuthApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  it('should include Authorization header when token exists', async () => {
    mockAuthService.getToken.mockReturnValue('test-token');
    mockFetch.mockResolvedValue({
      status: 200,
      ok: true,
      json: () => Promise.resolve({ data: 'test' }),
    });

    const { result } = renderHook(() => useAuthApi('/test'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockFetch).toHaveBeenCalledWith(
      `${API_BASE}/test`,
      expect.objectContaining({
        headers: { Authorization: 'Bearer test-token' },
      })
    );
  });

  it('should not include Authorization header when no token', async () => {
    mockAuthService.getToken.mockReturnValue(null);
    mockFetch.mockResolvedValue({
      status: 200,
      ok: true,
      json: () => Promise.resolve({ data: 'test' }),
    });

    const { result } = renderHook(() => useAuthApi('/test'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockFetch).toHaveBeenCalledWith(
      `${API_BASE}/test`,
      expect.objectContaining({
        headers: {},
      })
    );
  });
});

describe('useApiMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  it('should start with loading=false', () => {
    const { result } = renderHook(() => useApiMutation());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isProcessing).toBe(false);
  });

  describe('mutate', () => {
    it('should set loading during mutation', async () => {
      // Use a delayed response to ensure we can observe loading state
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  status: 200,
                  ok: true,
                  json: () => Promise.resolve({ success: true }),
                }),
              10
            )
          )
      );

      const { result } = renderHook(() => useApiMutation());

      expect(result.current.loading).toBe(false);

      // Start mutation but don't await
      act(() => {
        result.current.mutate('/test', 'POST', { data: 'test' });
      });

      // Loading should be true during mutation
      expect(result.current.loading).toBe(true);

      // Wait for completion
      await waitFor(() => expect(result.current.loading).toBe(false));
    });

    it('should call fetch with correct method and body', async () => {
      mockFetch.mockResolvedValue({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const { result } = renderHook(() => useApiMutation());

      await act(async () => {
        await result.current.mutate('/test', 'POST', { data: 'test' });
      });

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE}/test`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: 'test' }),
        })
      );
    });

    it('should handle DELETE without body', async () => {
      mockFetch.mockResolvedValue({
        status: 204,
        ok: true,
      });

      const { result } = renderHook(() => useApiMutation());

      await act(async () => {
        await result.current.delete('/test/1');
      });

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE}/test/1`,
        expect.objectContaining({
          method: 'DELETE',
          headers: {},
          body: null,
        })
      );
    });

    it('should set error on failure', async () => {
      mockFetch.mockRejectedValue(new Error('Mutation failed'));

      const { result } = renderHook(() => useApiMutation());

      await act(async () => {
        try {
          await result.current.mutate('/test', 'POST');
        } catch {
          // Expected
        }
      });

      expect(result.current.error?.message).toBe('Mutation failed');
      expect(result.current.loading).toBe(false);
    });
  });

  describe('post helper', () => {
    it('should call mutate with POST method', async () => {
      mockFetch.mockResolvedValue({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ id: 1 }),
      });

      const { result } = renderHook(() => useApiMutation());

      await act(async () => {
        await result.current.post('/test', { name: 'test' });
      });

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE}/test`,
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('delete helper', () => {
    it('should call mutate with DELETE method', async () => {
      mockFetch.mockResolvedValue({
        status: 204,
        ok: true,
      });

      const { result } = renderHook(() => useApiMutation());

      await act(async () => {
        await result.current.delete('/test/1');
      });

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE}/test/1`,
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });
});

describe('useAuthMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  it('should include Authorization header', async () => {
    mockAuthService.getToken.mockReturnValue('auth-token');
    mockFetch.mockResolvedValue({
      status: 200,
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const { result } = renderHook(() => useAuthMutation());

    await act(async () => {
      await result.current.post('/test', { data: 'test' });
    });

    expect(mockFetch).toHaveBeenCalledWith(
      `${API_BASE}/test`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer auth-token',
        }),
      })
    );
  });
});
